import { Response } from "express";
import prisma from "../config/db.js";
import { createNotificationsBulk } from "../services/notificationService.js";
import { AuthRequest } from "../types/index.js";

// Create subscription payment
export const createSubscriptionPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { planName, amount, senderNumber, txId, currency = "BDT" } = req.body;
    const userId = req.user!.id;

    if (!planName || !amount || !senderNumber || !txId) {
      res.status(400).json({ message: "planName, amount, senderNumber, and txId are required" });
      return;
    }

    const payment = await prisma.subscriptionPayment.create({
      data: {
        userId,
        planName,
        transactionId: String(txId).trim(),
        amount: parseFloat(amount),
        currency,
        method: `BKASH:${String(senderNumber).trim()}`,
        status: "PENDING",
      },
      include: { user: { select: { name: true, email: true } } },
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
          title: "New Subscription Payment",
          body: `New bKash payment request for ${planName} plan needs review.`,
          link: "/admin/subscription-payments",
        }))
      );
    } catch (notificationError) {
      console.error("Create subscription payment admin notification error:", notificationError);
    }

    res.status(201).json({
      success: true,
      message: "bKash payment submitted. Waiting for admin approval.",
      payment,
    });
  } catch (error) {
    console.error("Create Subscription Payment Error:", error);
    res.status(500).json({ message: "Failed to create subscription payment" });
  }
};

// Confirm subscription payment
export const confirmSubscriptionPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.paymentId as string;
    if (req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Admin only" });
      return;
    }

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    if (payment.status === "COMPLETED") {
      res.status(400).json({ message: "Payment already approved" });
      return;
    }

    // Update payment status
    const updatedPayment = await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED" },
    });

    // Upgrade user subscription plan
    await prisma.user.update({
      where: { id: payment.userId },
      data: { subscriptionPlan: payment.planName },
    });

    try {
      await createNotificationsBulk([
        {
          userId: payment.userId,
          type: "PAYMENT",
          title: "Subscription Approved",
          body: `Your bKash payment for the ${payment.planName} plan is approved. You are now upgraded!`,
          link: "/pricing",
        },
      ]);
    } catch (notificationError) {
      console.error("Approve subscription payment notification error:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Subscription payment approved",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Confirm Subscription Payment Error:", error);
    res.status(500).json({ message: "Failed to confirm subscription payment" });
  }
};

// Reject subscription payment
export const rejectSubscriptionPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const paymentId = req.params.paymentId as string;

    if (req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Admin only" });
      return;
    }

    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: { user: true },
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

    const updatedPayment = await prisma.subscriptionPayment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    });

    try {
      await createNotificationsBulk([
        {
          userId: payment.userId,
          type: "PAYMENT",
          title: "Subscription Payment Rejected",
          body: `Your bKash payment for the ${payment.planName} plan was rejected. Please contact support.`,
          link: "/pricing",
        },
      ]);
    } catch (notificationError) {
      console.error("Reject subscription payment notification error:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Subscription payment rejected",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Reject Subscription Payment Error:", error);
    res.status(500).json({ message: "Failed to reject subscription payment" });
  }
};

// Get all subscription payments (Admin)
export const getSubscriptionPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Admin only" });
      return;
    }

    const payments = await prisma.subscriptionPayment.findMany({
      include: { user: { select: { name: true, email: true, subscriptionPlan: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      payments,
      total: payments.length,
    });
  } catch (error) {
    console.error("Get Subscription Payments Error:", error);
    res.status(500).json({ message: "Failed to get subscription payments" });
  }
};
