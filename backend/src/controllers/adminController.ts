import { Response } from "express";
import * as AdminModel from "../models/adminModel.js";
import { sendApprovalEmail, sendRejectionEmail } from "../services/emailService.js";
import { AuthRequest } from "../types/index.js";

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await AdminModel.getStats();
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get Pending Approvals List
// @route   GET /api/admin/approvals
export const getPendingApprovals = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await AdminModel.getPendingApprovals();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get Pending Approvals Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Approve a Sitter
// @route   PUT /api/admin/approve/:id
export const approveSitter = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await AdminModel.approveUser(req.params.id as string);

    try { await sendApprovalEmail(user); }
    catch (emailError) { console.error("Failed to send approval email:", emailError); }

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
    const { reason } = req.body as { reason?: string };
    const user = await AdminModel.findUserById(req.params.id as string);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }

    try { await sendRejectionEmail(user, reason); }
    catch (emailError) { console.error("Failed to send rejection email:", emailError); }

    res.status(200).json({ success: true, message: "User rejection email sent successfully!" });
  } catch (error) {
    console.error("Reject Sitter Error:", error);
    res.status(500).json({ message: "Failed to reject user" });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await AdminModel.getAllUsers();
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
      await AdminModel.deleteUser(id);
      res.status(200).json({ success: true, message: "User deleted permanently." }); return;
    }
    if (action === "ban") {
      await AdminModel.setUserBanned(id, true);
      res.status(200).json({ success: true, message: "User has been banned." }); return;
    }
    if (action === "unban") {
      await AdminModel.setUserBanned(id, false);
      res.status(200).json({ success: true, message: "User unbanned successfully." }); return;
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
    const user = await AdminModel.findUserByIdWithProfiles(req.params.id as string);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
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
    const bookings = await AdminModel.getAllBookings();
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
      res.status(400).json({ message: "Invalid status" }); return;
    }

    const booking = await AdminModel.findBookingById(id);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const updatedBooking = await AdminModel.updateBookingStatus(
      id,
      status as "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "LIVE" | "COMPLETED"
    );

    try {
      await AdminModel.createAdminLog(
        req.user!.id,
        `Updated booking #${id} status to ${status}${reason ? ` - Reason: ${reason}` : ""}`
      );
    } catch (logError) { console.error("Failed to log admin action:", logError); }

    res.status(200).json({ success: true, message: `Booking status updated to ${status}`, booking: updatedBooking });
  } catch (error) {
    console.error("Update Booking Status Error:", error);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};
