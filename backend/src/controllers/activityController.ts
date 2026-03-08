import { Response } from "express";
import * as ActivityModel from "../models/activityModel.js";
import { AuthRequest } from "../types/index.js";

/**
 * Activity Logging & Daily Reports System
 */

// Create or update daily report
export const createDailyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, notes, moodRating } = req.body;
    const userId = req.user!.id;

    if (!bookingId) { res.status(400).json({ message: "Booking ID is required" }); return; }

    const booking = await ActivityModel.findBookingWithReport(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }
    if (booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Only babysitter can create daily reports" }); return;
    }

    let dailyReport;
    if (booking.dailyReport) {
      dailyReport = await ActivityModel.updateReport(booking.dailyReport.id, {
        notes: notes || booking.dailyReport.notes,
        moodRating: moodRating ? parseInt(moodRating) : booking.dailyReport.moodRating,
      });
    } else {
      dailyReport = await ActivityModel.createReport(
        booking.id,
        notes || null,
        moodRating ? parseInt(moodRating) : null
      );
    }

    res.status(201).json({ success: true, message: "Daily report created/updated successfully", report: dailyReport });
  } catch (error) {
    console.error("Create Daily Report Error:", error);
    res.status(500).json({ message: "Failed to create daily report" });
  }
};

// Add activity log
export const addActivityLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, type, description, photoUrl } = req.body;
    const userId = req.user!.id;

    if (!bookingId || !type) {
      res.status(400).json({ message: "Booking ID and activity type are required" }); return;
    }

    const booking = await ActivityModel.findBookingWithReport(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }
    if (booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Only babysitter can add activity logs" }); return;
    }

    let reportId = booking.dailyReport?.id;
    if (!reportId) {
      const newReport = await ActivityModel.createReport(booking.id);
      reportId = newReport.id;
    }

    const activity = await ActivityModel.createActivityLog({
      reportId,
      type,
      description: description || null,
      photoUrl: photoUrl || null,
    });

    res.status(201).json({ success: true, message: "Activity logged successfully", activity });
  } catch (error) {
    console.error("Add Activity Log Error:", error);
    res.status(500).json({ message: "Failed to add activity log" });
  }
};

// Get daily report
export const getDailyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.bookingId as string;
    const userId = req.user!.id;

    const booking = await ActivityModel.getBookingWithFullReport(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const isAuthorized =
      booking.parent.userId === userId || booking.babysitter.userId === userId || req.user!.role === "ADMIN";
    if (!isAuthorized) { res.status(403).json({ message: "Not authorized" }); return; }

    res.status(200).json({
      success: true,
      report: booking.dailyReport || null,
      booking: { id: booking.id, startTime: booking.startTime, endTime: booking.endTime, status: booking.status },
    });
  } catch (error) {
    console.error("Get Daily Report Error:", error);
    res.status(500).json({ message: "Failed to get daily report" });
  }
};

// Get all activities for a report
export const getActivities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.bookingId as string;
    const userId = req.user!.id;

    const booking = await ActivityModel.getBookingWithFullReport(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const isAuthorized =
      booking.parent.userId === userId || booking.babysitter.userId === userId || req.user!.role === "ADMIN";
    if (!isAuthorized) { res.status(403).json({ message: "Not authorized" }); return; }

    res.status(200).json({ success: true, activities: booking.dailyReport?.activities || [] });
  } catch (error) {
    console.error("Get Activities Error:", error);
    res.status(500).json({ message: "Failed to get activities" });
  }
};

// Delete activity log
export const deleteActivityLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const activityId = req.params.activityId as string;
    const userId = req.user!.id;

    const activity = await ActivityModel.findActivityWithBooking(activityId);
    if (!activity) { res.status(404).json({ message: "Activity not found" }); return; }
    if (activity.report.booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Not authorized" }); return;
    }

    await ActivityModel.deleteActivity(activity.id);
    res.status(200).json({ success: true, message: "Activity deleted successfully" });
  } catch (error) {
    console.error("Delete Activity Error:", error);
    res.status(500).json({ message: "Failed to delete activity" });
  }
};
