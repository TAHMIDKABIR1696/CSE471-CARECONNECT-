import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as PaymentModel from "../models/paymentModel.js";
import * as BookingModel from "../models/bookingModel.js";
import { AuthRequest } from "../types/index.js";

/**
 * Payment System
 */

// Create payment
export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, amount, method, currency = "BDT" } = req.body;
    const userId = req.user!.id;

    if (!bookingId || !amount) { res.status(400).json({ message: "Missing required fields" }); return; }

    const booking = await PaymentModel.findBookingForPayment(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }
    if (booking.parent.userId !== userId) { res.status(403).json({ message: "Not authorized to pay for this booking" }); return; }
    if (booking.payment) { res.status(400).json({ message: "Payment already exists for this booking" }); return; }

    const transactionId = `TXN-${uuidv4().substring(0, 8).toUpperCase()}-${Date.now()}`;
    const payment = await PaymentModel.create({
      bookingId: booking.id, transactionId,
      amount: parseFloat(amount), currency,
      method: method || "Cash", status: "PENDING",
    });

    res.status(201).json({ success: true, message: "Payment created successfully", payment });
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

    const payment = await PaymentModel.findByIdWithBooking(paymentId);
    if (!payment) { res.status(404).json({ message: "Payment not found" }); return; }
    if (payment.booking.parent.userId !== userId && req.user!.role !== "ADMIN") {
      res.status(403).json({ message: "Not authorized" }); return;
    }

    const updatedPayment = await PaymentModel.confirm(payment.id);
    res.status(200).json({ success: true, message: "Payment confirmed", payment: updatedPayment });
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
      const parent = await BookingModel.getParent(userId);
      if (!parent) { res.status(200).json({ success: true, payments: [] }); return; }
      payments = await PaymentModel.findByParent(parent.id);
    } else if (role === "BABYSITTER") {
      const sitter = await BookingModel.findSitter(userId);
      if (!sitter) { res.status(200).json({ success: true, payments: [] }); return; }
      payments = await PaymentModel.findBySitter(sitter.id);
    } else if (role === "ADMIN") {
      payments = await PaymentModel.findAllPayments();
    } else {
      res.status(403).json({ message: "Unauthorized" }); return;
    }

    res.status(200).json({ success: true, payments, total: payments.length });
  } catch (error) {
    console.error("Get Payment History Error:", error);
    res.status(500).json({ message: "Failed to get payment history" });
  }
};

// Get single payment details
export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payment = await PaymentModel.findByIdFull(req.params.id as string);
    if (!payment) { res.status(404).json({ message: "Payment not found" }); return; }

    const isAuthorized =
      payment.booking.parent.userId === req.user!.id ||
      payment.booking.babysitter.userId === req.user!.id ||
      req.user!.role === "ADMIN";
    if (!isAuthorized) { res.status(403).json({ message: "Not authorized" }); return; }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error("Get Payment Error:", error);
    res.status(500).json({ message: "Failed to get payment" });
  }
};
