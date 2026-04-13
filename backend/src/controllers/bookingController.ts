import { Response } from "express";
import prisma from "../config/db.js";
import { sendBookingRequestEmail } from "../services/emailService.js";
import { createNotification } from "../services/notificationService.js";
import { AuthRequest } from "../types/index.js";

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private (Parent Only)
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { babysitterId, startTime, endTime } = req.body;

    if (!babysitterId || !startTime || !endTime) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const parent = await prisma.parent.findUnique({
      where: { userId },
    });

    if (!parent) {
      res.status(404).json({
        message: "Please complete your Parent Profile first in Settings.",
      });
      return;
    }

    // Try to find by babysitter profile ID first
    let sitter = await prisma.babysitter.findUnique({
      where: { id: babysitterId },
    });

    // If not found, try to find by user ID
    if (!sitter) {
      sitter = await prisma.babysitter.findUnique({
        where: { userId: babysitterId },
      });
    }

    if (!sitter) {
      res.status(404).json({ message: "Babysitter not found." });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ message: "Invalid date format" });
      return;
    }

    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

    if (durationHours <= 0) {
      res.status(400).json({ message: "End time must be after start time." });
      return;
    }

    const rate = parseFloat(sitter.hourlyRate.toString());
    const totalCost = durationHours * rate;

    const booking = await prisma.booking.create({
      data: {
        parentId: parent.id,
        babysitterId: sitter.id,
        startTime: start,
        endTime: end,
        totalAmount: totalCost,
        status: "PENDING",
      },
    });

    try {
      await createNotification({
        userId: sitter.userId,
        type: "BOOKING",
        title: "New booking request",
        body: `You have a new booking request from ${req.user?.name || "a parent"}.`,
        link: "/account/bookings",
      });
    } catch (notificationError) {
      console.error("Failed to create booking notification:", notificationError);
    }

    // Send booking request email to babysitter
    try {
      const sitterUser = await prisma.user.findUnique({
        where: { id: sitter.userId },
      });
      if (sitterUser) {
        await sendBookingRequestEmail(booking, sitterUser);
      }
    } catch (emailError) {
      console.error("Failed to send booking email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: "Booking request sent successfully!",
      booking,
    });
  } catch (error) {
    console.error("CRITICAL BOOKING ERROR:", error);
    res.status(500).json({
      message: "Failed to create booking. Check server logs.",
      error: process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message
        : undefined,
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

    let bookings: unknown[] = [];

    if (role === "PARENT") {
      const parent = await prisma.parent.findUnique({ where: { userId } });
      if (!parent) {
        res.status(200).json({ success: true, bookings: [] });
        return;
      }

      bookings = await prisma.booking.findMany({
        where: { parentId: parent.id },
        include: {
          babysitter: {
            include: { user: { select: { name: true, email: true } } },
          },
          payment: {
            select: { id: true, status: true, transactionId: true },
          },
          review: {
            select: { id: true, rating: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "BABYSITTER") {
      const sitter = await prisma.babysitter.findUnique({ where: { userId } });
      if (!sitter) {
        res.status(200).json({ success: true, bookings: [] });
        return;
      }

      bookings = await prisma.booking.findMany({
        where: { babysitterId: sitter.id },
        include: {
          parent: {
            include: {
              user: { select: { name: true, email: true, phoneNumber: true } },
            },
          },
          payment: {
            select: { id: true, status: true, transactionId: true },
          },
          review: {
            select: { id: true, rating: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "ADMIN") {
      bookings = await prisma.booking.findMany({
        include: {
          parent: {
            include: { user: { select: { name: true, email: true } } },
          },
          babysitter: {
            include: { user: { select: { name: true, email: true } } },
          },
          payment: {
            select: { id: true, status: true, transactionId: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    res.status(200).json({ success: true, bookings: bookings || [] });
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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { babysitter: true, parent: true },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const isSitter = booking.babysitter.userId === userId;
    const isParent = booking.parent.userId === userId;

    if (!isSitter && !isParent) {
      res.status(403).json({ message: "Not authorized to update this booking." });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status as "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "LIVE" | "COMPLETED" },
      include: {
        parent: { include: { user: true } },
        babysitter: { include: { user: true } },
      },
    });

    try {
      const recipientUserId = isSitter ? booking.parent.userId : booking.babysitter.userId;
      await createNotification({
        userId: recipientUserId,
        type: "BOOKING",
        title: "Booking status updated",
        body: `A booking was ${status.toLowerCase()}.`,
        link: "/account/bookings",
      });
    } catch (notificationError) {
      console.error("Failed to create status notification:", notificationError);
    }

    try {
      if (status === "CONFIRMED") {
        await sendBookingRequestEmail(updatedBooking, updatedBooking.parent.user);
      }
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
    }

    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()}`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update Booking Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};
