import Stripe from "stripe";
import { Request, Response } from "express";
import prisma from "../config/db.js";
import { sendPaymentConfirmationEmail } from "../services/emailService.js";
import { AuthRequest } from "../types/index.js";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "⚠️  STRIPE_SECRET_KEY not found in environment variables. Stripe payments will not work."
  );
}

/**
 * Stripe Payment Integration
 */

// Create Stripe Payment Intent
export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    const userId = req.user!.id;

    if (!stripe) {
      res.status(500).json({
        message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to backend/.env file.",
        code: "STRIPE_NOT_CONFIGURED",
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parent: { include: { user: true } },
        babysitter: { include: { user: true } },
        payment: true,
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const isAuthorized = booking.parent?.userId === userId || req.user!.role === "ADMIN";

    if (!isAuthorized) {
      res.status(403).json({ message: "Not authorized to pay for this booking" });
      return;
    }

    if (booking.status !== "CONFIRMED") {
      res.status(400).json({
        message: "Booking must be confirmed before payment",
        currentStatus: booking.status,
      });
      return;
    }

    if (booking.payment && booking.payment.status === "COMPLETED") {
      res.status(400).json({ message: "Payment already completed for this booking" });
      return;
    }

    const totalAmount = parseFloat(booking.totalAmount?.toString() || "0");
    if (!totalAmount || totalAmount <= 0) {
      res.status(400).json({ message: "Invalid booking amount" });
      return;
    }

    const amountInCents = Math.round(totalAmount * 100);

    let payment = booking.payment;
    if (!payment) {
      try {
        payment = await prisma.payment.create({
          data: {
            bookingId: booking.id,
            transactionId: `TXN-${Date.now()}`,
            amount: totalAmount,
            currency: "BDT",
            method: "Stripe",
            status: "PENDING",
          },
        });
      } catch (paymentError) {
        console.error("Error creating payment record:", paymentError);
        res.status(500).json({
          message: "Failed to create payment record",
          error: paymentError instanceof Error ? paymentError.message : "Unknown error",
        });
        return;
      }
    }

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "bdt",
        metadata: {
          bookingId: booking.id.toString(),
          paymentId: payment.id.toString(),
          userId: userId.toString(),
        },
        description: `Payment for booking #${booking.id}`,
      });

      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
        bookingId: booking.id,
      });
    } catch (stripeError) {
      console.error("Stripe API Error:", stripeError);
      res.status(500).json({
        message: "Failed to create payment intent with Stripe",
        error: stripeError instanceof Error ? stripeError.message : "Unknown error",
        code: "STRIPE_ERROR",
      });
    }
  } catch (error) {
    console.error("Create Payment Intent Error:", error);
    res.status(500).json({
      message: "Failed to create payment intent",
      error: error instanceof Error ? error.message : "Unknown error",
      code: "UNKNOWN_ERROR",
    });
  }
};

// Confirm Payment (Webhook handler)
export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  if (!stripe) {
    res.status(500).json({ message: "Stripe not configured" });
    return;
  }

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err instanceof Error ? err.message : err);
    res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    return;
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentSuccess(paymentIntent);
      break;
    }
    case "payment_intent.payment_failed": {
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(failedPayment);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  try {
    const { bookingId, paymentId } = paymentIntent.metadata;

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        paymentDate: new Date(),
        transactionId: paymentIntent.id,
      },
      include: {
        booking: {
          include: {
            parent: { include: { user: true } },
            babysitter: { include: { user: true } },
          },
        },
      },
    });

    try {
      await sendPaymentConfirmationEmail(payment, payment.booking.parent.user);
    } catch (emailError) {
      console.error("Failed to send payment email:", emailError);
    }

    console.log(`Payment successful for booking ${bookingId}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
};

const handlePaymentFailure = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  try {
    const { paymentId } = paymentIntent.metadata;

    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "FAILED" },
    });

    console.log(`Payment failed for payment ${paymentId}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
};

// Verify payment status
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!stripe) {
      res.status(500).json({ message: "Stripe not configured" });
      return;
    }

    const { paymentIntentId } = req.body;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      const { bookingId, paymentId } = paymentIntent.metadata;

      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          paymentDate: new Date(),
          transactionId: paymentIntent.id,
        },
        include: {
          booking: {
            include: {
              parent: { include: { user: true } },
              babysitter: { include: { user: true } },
            },
          },
        },
      });

      try {
        await sendPaymentConfirmationEmail(payment, payment.booking.parent.user);
      } catch (emailError) {
        console.error("Failed to send payment email:", emailError);
      }

      res.status(200).json({
        success: true,
        payment,
        message: "Payment successful",
      });
      return;
    }

    res.status(200).json({
      success: false,
      status: paymentIntent.status,
      message: "Payment not completed yet",
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
};
