import prisma from "../config/db.js";

// ── Find booking for Stripe payment ──
export const findBookingForPayment = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: true } },
      babysitter: { include: { user: true } },
      payment: true,
    },
  });

// ── Create a pending payment record ──
export const createPayment = (data: {
  bookingId: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: string;
}) =>
  prisma.payment.create({
    data: { ...data, status: "PENDING" },
  });

// ── Mark payment as completed ──
export const completePayment = (paymentId: string, transactionId: string) =>
  prisma.payment.update({
    where: { id: paymentId },
    data: { status: "COMPLETED", paymentDate: new Date(), transactionId },
    include: {
      booking: {
        include: {
          parent: { include: { user: true } },
          babysitter: { include: { user: true } },
        },
      },
    },
  });

// ── Mark payment as failed ──
export const failPayment = (paymentId: string) =>
  prisma.payment.update({
    where: { id: paymentId },
    data: { status: "FAILED" },
  });
