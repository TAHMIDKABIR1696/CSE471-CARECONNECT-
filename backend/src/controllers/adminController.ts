import { Response } from "express";
import prisma from "../config/db.js";
import {
  sendApprovalEmail,
  sendRejectionEmail,
} from "../services/emailService.js";
import { AuthRequest } from "../types/index.js";

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
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

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        pendingSitters,
        activeBookings,
        totalRevenue: revenueAgg._sum.totalAmount || 0,
      },
      recentActivity: recentBookings,
    });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Pending Approvals List
// @route   GET /api/admin/approvals
export const getPendingApprovals = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pendingUsers = await prisma.user.findMany({
      where: { role: "BABYSITTER", isApproved: false },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        babysitter: {
          select: { experienceYears: true, locationAddress: true },
        },
      },
    });

    res.status(200).json({ success: true, users: pendingUsers });
  } catch (error) {
    console.error("Get Pending Approvals Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Approve a Sitter
// @route   PUT /api/admin/approve/:id
export const approveSitter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    try {
      await sendApprovalEmail(user);
    } catch (emailError) {
      console.error("Failed to send approval email:", emailError);
    }

    res.status(200).json({ success: true, message: "User approved successfully!" });
  } catch (error) {
    console.error("Approve Sitter Error:", error);
    res.status(500).json({ message: "Failed to approve user" });
  }
};

// @desc    Reject a Sitter
// @route   PUT /api/admin/reject/:id
export const rejectSitter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.params.id as string;
    const { reason } = req.body as { reason?: string };

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    try {
      await sendRejectionEmail(user, reason);
    } catch (emailError) {
      console.error("Failed to send rejection email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "User rejection email sent successfully!",
    });
  } catch (error) {
    console.error("Reject Sitter Error:", error);
    res.status(500).json({ message: "Failed to reject user" });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
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
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Manage User (Delete or Ban)
// @route   PATCH /api/admin/users/:id
export const manageUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { action } = req.body as { action: string };

    if (action === "delete") {
      await prisma.user.delete({ where: { id } });
      res.status(200).json({ success: true, message: "User deleted permanently." });
      return;
    }

    if (action === "ban") {
      await prisma.user.update({
        where: { id },
        data: { isBanned: true },
      });
      res.status(200).json({ success: true, message: "User has been banned." });
      return;
    }

    if (action === "unban") {
      await prisma.user.update({
        where: { id },
        data: { isBanned: false },
      });
      res.status(200).json({ success: true, message: "User unbanned successfully." });
      return;
    }

    res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("Manage User Error:", error);
    res.status(500).json({ message: "Action failed" });
  }
};

// @desc    Get Single User Details
// @route   GET /api/admin/users/:id
export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        babysitter: { include: { availabilities: true } },
        parentProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get All Bookings for Admin
// @route   GET /api/admin/bookings
export const getAllBookings = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        parent: { include: { user: { select: { name: true, email: true } } } },
        babysitter: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("Get All Bookings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update Booking Status (Admin Only)
// @route   PATCH /api/admin/bookings/:id/status
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, reason } = req.body as { status: string; reason?: string };

    const validStatuses = ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED", "LIVE", "COMPLETED"];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        parent: { include: { user: true } },
        babysitter: { include: { user: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: status as "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "LIVE" | "COMPLETED" },
      include: {
        parent: { include: { user: { select: { name: true, email: true } } } },
        babysitter: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    try {
      await prisma.adminLog.create({
        data: {
          adminId: req.user!.id,
          action: `Updated booking #${id} status to ${status}${reason ? ` - Reason: ${reason}` : ""}`,
        },
      });
    } catch (logError) {
      console.error("Failed to log admin action:", logError);
    }

    res.status(200).json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};
