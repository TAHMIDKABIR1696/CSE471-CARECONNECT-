import { Response } from "express";
import * as BookingModel from "../models/bookingModel.js";
import { sendBookingConfirmedEmail, sendBookingRequestEmail } from "../services/emailService.js";
import { AuthRequest } from "../types/index.js";

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Parent Only)
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { babysitterId, startTime, endTime } = req.body;

    if (!babysitterId || !startTime || !endTime) {
      res.status(400).json({ message: "Missing required fields" }); return;
    }

    const parent = await BookingModel.getParent(userId);
    if (!parent) {
      res.status(404).json({ message: "Please complete your Parent Profile first in Settings." }); return;
    }

    const sitter = await BookingModel.findSitter(babysitterId);
    if (!sitter) { res.status(404).json({ message: "Babysitter not found." }); return; }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: "Invalid date format" }); return;
    }

    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours <= 0) { res.status(400).json({ message: "End time must be after start time." }); return; }

    const totalCost = durationHours * parseFloat(sitter.hourlyRate.toString());

    const booking = await BookingModel.create({
      parentId: parent.id, babysitterId: sitter.id,
      startTime: start, endTime: end, totalAmount: totalCost, status: "PENDING",
    });

    try {
      const sitterUser = await BookingModel.getSitterUser(sitter.userId);
      if (sitterUser) await sendBookingRequestEmail(booking, sitterUser);
    } catch (emailError) { console.error("Failed to send booking email:", emailError); }

    res.status(201).json({ success: true, message: "Booking request sent successfully!", booking });
  } catch (error) {
    console.error("CRITICAL BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to create booking. Check server logs.",
      error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
    });
  }
};

// @desc    Get My Bookings
// @route   GET /api/bookings
// @access  Private
export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    let bookings: Array<Record<string, unknown>> = [];

    if (role === "PARENT") {
      const parent = await BookingModel.getParent(userId);
      if (!parent) { res.status(200).json({ success: true, bookings: [] }); return; }
      bookings = await BookingModel.findByParent(parent.id, userId) as Array<Record<string, unknown>>;
    } else if (role === "BABYSITTER") {
      const sitter = await BookingModel.findSitter(userId);
      if (!sitter) { res.status(200).json({ success: true, bookings: [] }); return; }
      bookings = await BookingModel.findBySitter(sitter.id, userId) as Array<Record<string, unknown>>;
    } else if (role === "ADMIN") {
      bookings = await BookingModel.findAll() as Array<Record<string, unknown>>;
    }

    const bookingsWithReviewFlag = bookings.map((booking) => {
      const bookingReviews = Array.isArray(booking.reviews)
        ? booking.reviews as Array<Record<string, unknown>>
        : [];

      return {
        ...booking,
        review: bookingReviews[0] || null,
      };
    });

    res.status(200).json({ success: true, bookings: bookingsWithReviewFlag || [] });
  } catch (error) {
    console.error("Get Bookings Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update Booking Status (Accept/Reject/Cancel)
// @route   PATCH /api/bookings/:id
export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.id as string;
    const { status } = req.body as { status: string };
    const userId = req.user!.id;

    const booking = await BookingModel.findByIdWithUsers(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const isSitter = booking.babysitter.userId === userId;
    const isParent = booking.parent.userId === userId;
    if (!isSitter && !isParent) {
      res.status(403).json({ message: "Not authorized to update this booking." }); return;
    }

    const updatedBooking = await BookingModel.updateStatus(
      bookingId,
      status as "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "LIVE" | "COMPLETED"
    );

    try {
      if (status === "CONFIRMED") {
        await sendBookingConfirmedEmail(
          updatedBooking,
          updatedBooking.parent.user,
          updatedBooking.babysitter.user.name
        );
      }
    } catch (emailError) { console.error("Failed to send status update email:", emailError); }

    res.status(200).json({ success: true, message: `Booking ${status.toLowerCase()}`, booking: updatedBooking });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};
