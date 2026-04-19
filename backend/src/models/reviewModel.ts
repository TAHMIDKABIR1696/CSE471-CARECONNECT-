import prisma from "../config/db.js";

// ── Find booking by ID with parent/sitter user IDs ──
export const findBookingById = (id: string) =>
  prisma.booking.findUnique({
    where: { id },
    include: {
      parent: { select: { userId: true } },
      babysitter: { select: { userId: true } },
    },
  });

// ── Find existing review for a booking by reviewer ──
export const findByBookingAndReviewer = (bookingId: string, reviewerId: string) =>
  prisma.review.findFirst({
    where: { bookingId, reviewerId },
    select: { id: true },
  });

// ── Create a review ──
export const create = (data: {
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  punctuality?: number | null;
  professionalism?: number | null;
  communication?: number | null;
}) =>
  prisma.review.create({ data });

// ── Get reviewee user with babysitter profile ──
export const findRevieweeWithSitter = (revieweeId: string) =>
  prisma.user.findUnique({
    where: { id: revieweeId },
    include: { babysitter: true },
  });

// ── Get all reviews for a reviewee (to compute averages) ──
export const findAllByReviewee = (revieweeId: string) =>
  prisma.review.findMany({ where: { revieweeId } });

// ── Get sitter reviews with reviewer info ──
export const findBySitterId = (sitterUserId: string) =>
  prisma.review.findMany({
    where: { revieweeId: sitterUserId },
    include: {
      reviewer: { select: { id: true, name: true, profilePicture: true } },
      booking: { select: { id: true, startTime: true } },
    },
    orderBy: { createdAt: "desc" },
  });

// ── Get reviews given by a user ──
export const findByReviewerId = (reviewerId: string) =>
  prisma.review.findMany({
    where: { reviewerId },
    include: {
      reviewee: { select: { id: true, name: true } },
      booking: { select: { id: true, startTime: true } },
    },
    orderBy: { createdAt: "desc" },
  });

// ── Get reviews received by a user (with reviewer info) ──
export const findReceivedByUserId = (userId: string) =>
  prisma.review.findMany({
    where: { revieweeId: userId },
    include: {
      reviewer: { select: { id: true, name: true, profilePicture: true } },
      booking: { select: { id: true, startTime: true } },
    },
    orderBy: { createdAt: "desc" },
  });
