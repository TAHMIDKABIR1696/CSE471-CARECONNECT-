import prisma from "../config/db.js";

// ── Find booking with parent and existing payment ──
export const findBookingForPayment = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: true } },
      payment: true,
    },
  });

// ── Create a payment record ──
export const create = (data: {
  bookingId: string;
  transactionId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
}) =>
  prisma.payment.create({
    data: {
      bookingId: data.bookingId,
      transactionId: data.transactionId,
      amount: data.amount,
      currency: data.currency,
      method: data.method,
      status: data.status as "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED",
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

// ── Find payment by ID with booking details ──
export const findByIdWithBooking = (id: string) =>
  prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          parent: { include: { user: true } },
        },
      },
    },
  });

// ── Confirm a payment ──
export const confirm = (paymentId: string) =>
  prisma.payment.update({
    where: { id: paymentId },
    data: { status: "COMPLETED", paymentDate: new Date() },
    include: { booking: true },
  });

// ── Get payment history by role ──
export const findByParent = (parentId: string) =>
  prisma.payment.findMany({
    where: { booking: { parentId } },
    include: {
      booking: {
        include: {
          babysitter: { include: { user: { select: { name: true, email: true } } } },
        },
      },
    },
    orderBy: { paymentDate: "desc" },
  });

export const findBySitter = (babysitterId: string) =>
  prisma.payment.findMany({
    where: { booking: { babysitterId } },
    include: {
      booking: {
        include: {
          parent: { include: { user: { select: { name: true, email: true } } } },
        },
      },
    },
    orderBy: { paymentDate: "desc" },
  });

export const findAllPayments = () =>
  prisma.payment.findMany({
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

// ── Get payment by ID with full booking details ──
export const findByIdFull = (id: string) =>
  prisma.payment.findUnique({
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

// ── Update payment status ──
export const updateStatus = (
  paymentId: string,
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED",
  transactionId?: string
) =>
  prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      ...(status === "COMPLETED" && { paymentDate: new Date() }),
      ...(transactionId && { transactionId }),
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
