import prisma from "../config/db.js";

// ── Dashboard stats ──
export const getStats = async () => {
  const totalUsers = await prisma.user.count();
  const pendingSitters = await prisma.user.count({
    where: { role: "BABYSITTER", isApproved: false },
  });
  const activeBookings = await prisma.booking.count({
    where: { status: "CONFIRMED" },
  });
  const revenueAgg = await prisma.booking.aggregate({
    _sum: { totalAmount: true },
    where: { status: "COMPLETED" },
  });
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      parent: { include: { user: { select: { name: true } } } },
      babysitter: { include: { user: { select: { name: true } } } },
    },
  });

  return {
    stats: {
      totalUsers,
      pendingSitters,
      activeBookings,
      totalRevenue: revenueAgg._sum.totalAmount || 0,
    },
    recentActivity: recentBookings,
  };
};

// ── Pending babysitter approvals ──
export const getPendingApprovals = () =>
  prisma.user.findMany({
    where: { role: "BABYSITTER", isApproved: false },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      babysitter: { select: { experienceYears: true, locationAddress: true } },
    },
  });

// ── Approve a user ──
export const approveUser = (userId: string) =>
  prisma.user.update({ where: { id: userId }, data: { isApproved: true } });

// ── Find user by ID ──
export const findUserById = (id: string) =>
  prisma.user.findUnique({ where: { id } });

// ── Find user by ID with profiles ──
export const findUserByIdWithProfiles = (id: string) =>
  prisma.user.findUnique({
    where: { id },
    include: {
      babysitter: { include: { availabilities: true } },
      parentProfile: true,
    },
  });

// ── Get all users ──
export const getAllUsers = () =>
  prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      isBanned: true,
      createdAt: true,
      parentProfile: { select: { id: true } },
      babysitter: { select: { id: true } },
    },
  });

// ── Delete user ──
export const deleteUser = (id: string) =>
  prisma.user.delete({ where: { id } });

// ── Ban / unban user ──
export const setUserBanned = (id: string, isBanned: boolean) =>
  prisma.user.update({ where: { id }, data: { isBanned } });

// ── Get all bookings (admin) ──
export const getAllBookings = () =>
  prisma.booking.findMany({
    include: {
      parent: { include: { user: { select: { name: true, email: true } } } },
      babysitter: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

// ── Find booking by ID with users ──
export const findBookingById = (id: string) =>
  prisma.booking.findUnique({
    where: { id },
    include: {
      parent: { include: { user: true } },
      babysitter: { include: { user: true } },
    },
  });

// ── Update booking status (admin) ──
export const updateBookingStatus = (
  id: string,
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "LIVE" | "COMPLETED"
) =>
  prisma.booking.update({
    where: { id },
    data: { status },
    include: {
      parent: { include: { user: { select: { name: true, email: true } } } },
      babysitter: { include: { user: { select: { name: true, email: true } } } },
    },
  });

// ── Create admin action log ──
export const createAdminLog = (adminId: string, action: string) =>
  prisma.adminLog.create({ data: { adminId, action } });
