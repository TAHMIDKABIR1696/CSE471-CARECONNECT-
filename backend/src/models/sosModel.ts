import prisma from "../config/db.js";

// ── Create SOS alert ──
export const create = (userId: string, latitude: number, longitude: number) =>
  prisma.sOSAlert.create({
    data: { userId, latitude, longitude, status: "ACTIVE" },
    include: {
      user: { select: { id: true, name: true, email: true, phoneNumber: true } },
    },
  });

// ── Get all active alerts (admin) ──
export const findAllActive = () =>
  prisma.sOSAlert.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { id: true, name: true, email: true, phoneNumber: true, profilePicture: true } },
    },
    orderBy: { createdAt: "desc" },
  });

// ── Get alerts by user ──
export const findByUserId = (userId: string) =>
  prisma.sOSAlert.findMany({
    where: { userId },
    include: {
      user: { select: { id: true, name: true, email: true, phoneNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

// ── Find alert by ID ──
export const findById = (id: string) =>
  prisma.sOSAlert.findUnique({ where: { id } });

// ── Find alert by ID with user info ──
export const findByIdWithUser = (id: string) =>
  prisma.sOSAlert.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phoneNumber: true, profilePicture: true } },
    },
  });

// ── Resolve an alert ──
export const resolve = (alertId: string) =>
  prisma.sOSAlert.update({
    where: { id: alertId },
    data: { status: "RESOLVED", resolvedAt: new Date() },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
