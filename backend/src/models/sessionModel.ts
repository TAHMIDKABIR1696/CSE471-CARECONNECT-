import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";
import { GpsLog } from "../types/index.js";

// ── Find booking with participants ──
export const findBookingWithUsers = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: true } },
      babysitter: { include: { user: true } },
    },
  });

// ── Start a live session (set status LIVE + initial GPS) ──
export const startSession = (bookingId: string, gpsLogs: GpsLog[]) =>
  prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "LIVE",
      actualStart: new Date(),
      gpsLogs: gpsLogs as unknown as Prisma.InputJsonValue,
    },
    include: {
      parent: {
        include: { user: { select: { name: true, email: true, phoneNumber: true } } },
      },
      babysitter: {
        include: { user: { select: { name: true, email: true, phoneNumber: true } } },
      },
    },
  });

// ── Find booking for location update ──
export const findBookingForLocation = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: { babysitter: { include: { user: true } } },
  });

// ── Append GPS log to booking ──
export const appendGpsLog = (bookingId: string, updatedLogs: GpsLog[]) =>
  prisma.booking.update({
    where: { id: bookingId },
    data: { gpsLogs: updatedLogs as unknown as Prisma.InputJsonValue },
  });

// ── End session (set COMPLETED + actualEnd) ──
export const endSession = (bookingId: string) =>
  prisma.booking.update({
    where: { id: bookingId },
    data: { status: "COMPLETED", actualEnd: new Date() },
    include: {
      parent: { include: { user: { select: { name: true, email: true } } } },
      babysitter: { include: { user: { select: { name: true, email: true } } } },
    },
  });

// ── Get session details ──
export const getSessionDetails = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: { select: { name: true, email: true } } } },
      babysitter: { include: { user: { select: { name: true, email: true } } } },
    },
  });

// ── Get live bookings for parent ──
export const getLiveByParent = (parentId: string) =>
  prisma.booking.findMany({
    where: { parentId, status: "LIVE" },
    include: {
      babysitter: {
        include: {
          user: { select: { name: true, email: true, phoneNumber: true, profilePicture: true } },
        },
      },
    },
    orderBy: { actualStart: "desc" },
  });

// ── Get live bookings for sitter ──
export const getLiveBySitter = (babysitterId: string) =>
  prisma.booking.findMany({
    where: { babysitterId, status: "LIVE" },
    include: {
      parent: {
        include: {
          user: { select: { name: true, email: true, phoneNumber: true, profilePicture: true } },
        },
      },
    },
    orderBy: { actualStart: "desc" },
  });

// ── Get parent / sitter profiles ──
export const getParent = (userId: string) =>
  prisma.parent.findUnique({ where: { userId } });

export const getSitter = (userId: string) =>
  prisma.babysitter.findUnique({ where: { userId } });
