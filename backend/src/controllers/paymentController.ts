import { Response } from "express";
import prisma from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import { AuthRequest } from "../types/index.js";

/**
 * Payment System
 */

// Create payment
export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, method, currency = "BDT" } = req.body;
    const userId = req.user!.id;

    if (!bookingId || !amount) {
      res.status(400).json({ message: "Missing required fields" });
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

    if (booking.payment) {
      res.status(400).json({ message: "Payment already exists for this booking" });
      return;
    }

    const transactionId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}-${Date.now()}`;

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        transactionId,
        amount: parseFloat(amount),
        currency,
        method: method || "Cash",
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

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
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
    const userId = req.user!.id;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            parent: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    if (payment.booking.parent.userId !== userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Not authorized" });
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

    res.status(200).json({
      success: true,
      message: "Payment confirmed",
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Confirm Payment Error:", error);
    res.status(500).json({ message: "Failed to confirm payment" });
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
