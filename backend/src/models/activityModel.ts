import prisma from "../config/db.js";

// ── Find booking with babysitter and existing report ──
export const findBookingWithReport = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      babysitter: { include: { user: true } },
      dailyReport: true,
    },
  });

// ── Create a daily report ──
export const createReport = (bookingId: string, notes?: string | null, moodRating?: number | null) =>
  prisma.dailyReport.create({
    data: { bookingId, notes: notes || null, moodRating: moodRating || null },
    include: { activities: { orderBy: { timestamp: "desc" } } },
  });

// ── Update an existing daily report ──
export const updateReport = (
  reportId: string,
  data: { notes?: string | null; moodRating?: number | null }
) =>
  prisma.dailyReport.update({
    where: { id: reportId },
    data,
    include: { activities: { orderBy: { timestamp: "desc" } } },
  });

// ── Create an activity log entry ──
export const createActivityLog = (data: {
  reportId: string;
  type: string;
  description?: string | null;
  photoUrl?: string | null;
}) =>
  prisma.activityLog.create({ data });

// ── Get booking with full report + activities ──
export const getBookingWithFullReport = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: true } },
      babysitter: { include: { user: true } },
      dailyReport: {
        include: { activities: { orderBy: { timestamp: "desc" } } },
      },
    },
  });

// ── Find activity log by ID with authorization chain ──
export const findActivityWithBooking = (activityId: string) =>
  prisma.activityLog.findUnique({
    where: { id: activityId },
    include: {
      report: {
        include: {
          booking: {
            include: { babysitter: { include: { user: true } } },
          },
        },
      },
    },
  });

// ── Delete an activity log ──
export const deleteActivity = (activityId: string) =>
  prisma.activityLog.delete({ where: { id: activityId } });
