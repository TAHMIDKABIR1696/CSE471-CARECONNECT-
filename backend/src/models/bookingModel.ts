import prisma from "../config/db.js";

// ── Find sitter by profile ID or user ID ──
export const findSitter = async (babysitterId: string) => {
  let sitter = await prisma.babysitter.findUnique({ where: { id: babysitterId } });
  if (!sitter) {
    sitter = await prisma.babysitter.findUnique({ where: { userId: babysitterId } });
  }
  return sitter;
};

// ── Get parent profile by user ID ──
export const getParent = (userId: string) =>
  prisma.parent.findUnique({ where: { userId } });

// ── Get sitter's user record ──
export const getSitterUser = (userId: string) =>
  prisma.user.findUnique({ where: { id: userId } });

// ── Create a booking ──
export const create = (data: {
  parentId: string;
  babysitterId: string;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  status: string;
}) =>
  prisma.booking.create({
    data: {
      parentId: data.parentId,
      babysitterId: data.babysitterId,
      startTime: data.startTime,
      endTime: data.endTime,
      totalAmount: data.totalAmount,
      status: data.status as "PENDING",
    },
  });

// ── Find booking by ID with participants ──
export const findByIdWithUsers = (id: string) =>
  prisma.booking.findUnique({
    where: { id },
    include: { babysitter: true, parent: true },
  });

// ── Update booking status ──
export const updateStatus = (
  id: string,
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "LIVE" | "COMPLETED"
) =>
  prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      parent: { include: { user: true } },
      babysitter: { include: { user: true } },
    },
  });

// ── Get bookings for a parent ──
export const findByParent = (parentId: string, reviewerId: string) =>
  prisma.booking.findMany({
    where: { parentId },
    include: {
      babysitter: { include: { user: { select: { id: true, name: true, email: true } } } },
      payment: { select: { id: true, status: true, transactionId: true } },
      reviews: {
        where: { reviewerId },
        select: { id: true, rating: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

// ── Get bookings for a sitter ──
export const findBySitter = (babysitterId: string, reviewerId: string) =>
  prisma.booking.findMany({
    where: { babysitterId },
    include: {
      parent: {
        include: { user: { select: { id: true, name: true, email: true, phoneNumber: true } } },
      },
      payment: { select: { id: true, status: true, transactionId: true } },
      reviews: {
        where: { reviewerId },
        select: { id: true, rating: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

// ── Get all bookings (admin) ──
export const findAll = () =>
  prisma.booking.findMany({
    include: {
      parent: { include: { user: { select: { name: true, email: true } } } },
      babysitter: { include: { user: { select: { name: true, email: true } } } },
      payment: { select: { id: true, status: true, transactionId: true } },
    },
    orderBy: { createdAt: "desc" },
  });
