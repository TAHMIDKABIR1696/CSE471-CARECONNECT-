import prisma from "../config/db.js";

// ── Find booking with parent and sitter users ──
export const findBookingWithUsers = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: true } },
      babysitter: { include: { user: true } },
    },
  });

// ── Save meeting link to booking ──
export const saveMeetingLink = (bookingId: string, meetingLink: string) =>
  prisma.booking.update({
    where: { id: bookingId },
    data: { meetingLink },
  });
