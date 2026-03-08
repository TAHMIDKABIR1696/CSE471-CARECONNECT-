import { Response } from "express";
import * as SessionModel from "../models/sessionModel.js";
import { AuthRequest, GpsLog } from "../types/index.js";

/**
 * Live Session Tracking System
 */

// Start session
export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, latitude, longitude } = req.body;
    const userId = req.user!.id;

    if (!bookingId) { res.status(400).json({ message: "Booking ID is required" }); return; }

    const booking = await SessionModel.findBookingWithUsers(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }
    if (booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Only babysitter can start the session" }); return;
    }
    if (booking.status !== "CONFIRMED") {
      res.status(400).json({ message: "Booking must be confirmed to start session" }); return;
    }

    const gpsLogs: GpsLog[] = [{
      lat: latitude ? parseFloat(latitude) : null,
      lng: longitude ? parseFloat(longitude) : null,
      time: new Date().toISOString(),
    }];

    const updatedBooking = await SessionModel.startSession(booking.id, gpsLogs);
    res.status(200).json({ success: true, message: "Session started successfully", booking: updatedBooking });
  } catch (error) {
    console.error("Start Session Error:", error);
    res.status(500).json({ message: "Failed to start session" });
  }
};

// Update GPS location during session
export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, latitude, longitude } = req.body;
    const userId = req.user!.id;

    if (!bookingId || !latitude || !longitude) {
      res.status(400).json({ message: "Booking ID, latitude, and longitude are required" }); return;
    }

    const booking = await SessionModel.findBookingForLocation(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }
    if (booking.babysitter.userId !== userId) { res.status(403).json({ message: "Not authorized" }); return; }
    if (booking.status !== "LIVE") { res.status(400).json({ message: "Session is not live" }); return; }

    const existingLogs = Array.isArray(booking.gpsLogs) ? (booking.gpsLogs as unknown as GpsLog[]) : [];
    const newLog: GpsLog = { lat: parseFloat(latitude), lng: parseFloat(longitude), time: new Date().toISOString() };

    await SessionModel.appendGpsLog(booking.id, [...existingLogs, newLog]);
    res.status(200).json({ success: true, message: "Location updated", location: newLog });
  } catch (error) {
    console.error("Update Location Error:", error);
    res.status(500).json({ message: "Failed to update location" });
  }
};

// End session
export const endSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    const userId = req.user!.id;

    if (!bookingId) { res.status(400).json({ message: "Booking ID is required" }); return; }

    const booking = await SessionModel.findBookingForLocation(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }
    if (booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Only babysitter can end the session" }); return;
    }
    if (booking.status !== "LIVE") { res.status(400).json({ message: "Session is not live" }); return; }

    const actualStart = booking.actualStart || booking.startTime;
    const actualEnd = new Date();
    const durationHours = (actualEnd.getTime() - actualStart.getTime()) / (1000 * 60 * 60);

    const updatedBooking = await SessionModel.endSession(booking.id);

    res.status(200).json({
      success: true, message: "Session ended successfully", booking: updatedBooking,
      duration: {
        hours: Math.round(durationHours * 100) / 100,
        minutes: Math.round(durationHours * 60 * 100) / 100,
      },
    });
  } catch (error) {
    console.error("End Session Error:", error);
    res.status(500).json({ message: "Failed to end session" });
  }
};

// Get session details
export const getSessionDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.bookingId as string;
    const userId = req.user!.id;

    const booking = await SessionModel.getSessionDetails(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const isAuthorized =
      booking.parent.userId === userId || booking.babysitter.userId === userId || req.user!.role === "ADMIN";
    if (!isAuthorized) { res.status(403).json({ message: "Not authorized" }); return; }

    let duration: { hours: number; minutes: number } | null = null;
    if (booking.actualStart) {
      const endTime = booking.actualEnd || new Date();
      const durationHours = (endTime.getTime() - booking.actualStart.getTime()) / (1000 * 60 * 60);
      duration = {
        hours: Math.round(durationHours * 100) / 100,
        minutes: Math.round(durationHours * 60 * 100) / 100,
      };
    }

    res.status(200).json({ success: true, booking, duration, gpsLogs: booking.gpsLogs || [] });
  } catch (error) {
    console.error("Get Session Error:", error);
    res.status(500).json({ message: "Failed to get session details" });
  }
};

// Get live sessions
export const getLiveSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;
    let liveBookings: unknown[] = [];

    if (role === "PARENT") {
      const parent = await SessionModel.getParent(userId);
      if (!parent) { res.status(404).json({ message: "Parent profile not found" }); return; }
      liveBookings = await SessionModel.getLiveByParent(parent.id);
    } else if (role === "BABYSITTER") {
      const sitter = await SessionModel.getSitter(userId);
      if (!sitter) { res.status(404).json({ message: "Sitter profile not found" }); return; }
      liveBookings = await SessionModel.getLiveBySitter(sitter.id);
    } else {
      res.status(403).json({ message: "Unauthorized" }); return;
    }

    res.status(200).json({ success: true, sessions: liveBookings, count: liveBookings.length });
  } catch (error) {
    console.error("Get Live Sessions Error:", error);
    res.status(500).json({ message: "Failed to get live sessions" });
  }
};
