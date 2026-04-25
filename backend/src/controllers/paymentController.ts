import { Response } from "express";
import prisma from "../config/db.js";
import { createNotificationsBulk } from "../services/notificationService.js";
import { AuthRequest } from "../types/index.js";

/**
 * Payment System
 */

// Create payment
export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, senderNumber, txId, currency = "BDT" } = req.body;
    const userId = req.user!.id;

    if (!bookingId || !amount || !senderNumber || !txId) {
      res.status(400).json({ message: "bookingId, amount, senderNumber, and txId are required" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parent: { include: { user: true } },
        payment: true,
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.parent.userId !== userId) {
      res.status(403).json({ message: "Not authorized to pay for this booking" });
      return;
    }

    if (booking.status !== "CONFIRMED") {
      res.status(400).json({ message: "Booking must be confirmed before payment" });
      return;
    }

    if (booking.payment) {
      res.status(400).json({ message: "Payment already exists for this booking" });
      return;
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionId: String(txId).trim(),
        amount: parseFloat(amount),
        currency,
        method: `BKASH:${String(senderNumber).trim()}`,
        status: "PENDING",
      },
      include: {
        booking: {
          include: {
            parent: { include: { user: { select: { name: true } } } },
            babysitter: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      await createNotificationsBulk(
        admins.map((admin) => ({
          userId: admin.id,
          type: "PAYMENT",
          title: "Manual payment submitted",
          body: `New bKash payment request for booking ${booking.id} needs review.`,
          link: "/admin/payments",
        }))
      );
    } catch (notificationError) {
      console.error("Create payment admin notification error:", notificationError);
    }

    res.status(201).json({
      success: true,
      message: "bKash payment submitted. Waiting for admin approval.",
      payment,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);
    res.status(500).json({ message: "Failed to create payment" });
  }
};

// Confirm payment
export const confirmPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.paymentId as string;
    if (req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Admin only" });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            parent: { include: { user: true } },
            babysitter: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    if (payment.status === "COMPLETED") {
      res.status(400).json({ message: "Payment already approved" });
      return;
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        paymentDate: new Date(),
      },
      include: { booking: true },
    });

    try {
      await createNotificationsBulk([
        {
          userId: payment.booking.parent.userId,
          type: "PAYMENT",
          title: "Payment approved",
          body: `Your bKash payment for booking ${payment.booking.id} is approved.`,
          link: "/account/payments",
        },
        {
          userId: payment.booking.babysitter.userId,
          type: "PAYMENT",
          title: "Payment approved",
          body: `Payment for booking ${payment.booking.id} is approved by admin.`,
          link: "/account/payments",
        },
      ]);
    } catch (notificationError) {
      console.error("Approve payment notification error:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Payment approved",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
  }
};

// Reject payment (Admin)
export const rejectPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.paymentId as string;

    if (req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Admin only" });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            parent: { include: { user: true } },
            babysitter: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    if (payment.status === "FAILED") {
      res.status(400).json({ message: "Payment already rejected" });
      return;
    }

    if (payment.status === "COMPLETED") {
      res.status(400).json({ message: "Approved payment cannot be rejected" });
      return;
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
      },
      include: { booking: true },
    });

    try {
      await createNotificationsBulk([
        {
          userId: payment.booking.parent.userId,
          type: "PAYMENT",
          title: "Payment rejected",
          body: `Your bKash payment for booking ${payment.booking.id} was rejected. Please resubmit.`,
          link: "/account/bookings",
        },
        {
          userId: payment.booking.babysitter.userId,
          type: "PAYMENT",
          title: "Payment rejected",
          body: `Payment for booking ${payment.booking.id} was rejected by admin.`,
          link: "/account/payments",
        },
      ]);
    } catch (notificationError) {
      console.error("Reject payment notification error:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Payment rejected",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Reject Payment Error:", error);
    res.status(500).json({ message: "Failed to reject payment" });
  }
};

// Get payment history
export const getPaymentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let payments: unknown[] = [];

    if (role === "PARENT") {
      const parent = await prisma.parent.findUnique({ where: { userId } });
      if (!parent) {
        res.status(200).json({ success: true, payments: [] });
        return;
      }

      payments = await prisma.payment.findMany({
        where: { booking: { parentId: parent.id } },
        include: {
          booking: {
            include: {
              babysitter: { include: { user: { select: { name: true, email: true } } } },
            },
          },
        },
        orderBy: { paymentDate: "desc" },
      });
    } else if (role === "BABYSITTER") {
      const sitter = await prisma.babysitter.findUnique({ where: { userId } });
      if (!sitter) {
        res.status(200).json({ success: true, payments: [] });
        return;
      }

      payments = await prisma.payment.findMany({
        where: { booking: { babysitterId: sitter.id } },
        include: {
          booking: {
            include: {
              parent: { include: { user: { select: { name: true, email: true } } } },
            },
          },
        },
        orderBy: { paymentDate: "desc" },
      });
    } else if (role === "ADMIN") {
      payments = await prisma.payment.findMany({
        include: {
          booking: {
            include: {
              parent: { include: { user: { select: { name: true, email: true } } } },
              babysitter: { include: { user: { select: { name: true, email: true } } } },
            },
          },
        },
        orderBy: { paymentDate: "desc" },
      });
    } else {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      success: true,
      payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({ message: "Failed to get payment history" });
  }
};

// Get single payment details
export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            parent: {
              include: { user: { select: { name: true, email: true, phoneNumber: true } } },
            },
            babysitter: {
              include: { user: { select: { name: true, email: true, phoneNumber: true } } },
            },
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    const isAuthorized =
      payment.booking.parent.userId === userId ||
      payment.booking.babysitter.userId === userId ||
      req.user!.role === "ADMIN";

    if (!isAuthorized) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error("Get Payment Error:", error);
    res.status(500).json({ message: "Failed to get payment" });
  }
};
