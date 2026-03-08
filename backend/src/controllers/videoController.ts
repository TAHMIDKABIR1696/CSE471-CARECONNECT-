import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import * as VideoModel from "../models/videoModel.js";
import { sendMeetingLinkEmail } from "../services/emailService.js";
import { AuthRequest } from "../types/index.js";

/**
 * Live Video Conferencing System
 */

const generateMeetingLink = (bookingId: string): string => {
  const meetingId = `meeting-${uuidv4()}`;
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${baseUrl}/meeting/${meetingId}?bookingId=${bookingId}`;
};

// Create or get meeting link for booking
export const createMeetingLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;
    const userId = req.user!.id;

    if (!bookingId) { res.status(400).json({ message: "Booking ID is required" }); return; }

    const booking = await VideoModel.findBookingWithUsers(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const isAuthorized =
      booking.parent.userId === userId || booking.babysitter.userId === userId || req.user!.role === "ADMIN";
    if (!isAuthorized) { res.status(403).json({ message: "Not authorized" }); return; }

    let meetingLink = booking.meetingLink;
    if (!meetingLink) {
      meetingLink = generateMeetingLink(booking.id);
      await VideoModel.saveMeetingLink(booking.id, meetingLink);
    }

    try {
      await sendMeetingLinkEmail(booking, meetingLink, booking.parent.user);
      await sendMeetingLinkEmail(booking, meetingLink, booking.babysitter.user);
    } catch (emailError) { console.error("Failed to send meeting link email:", emailError); }

    res.status(200).json({ success: true, message: "Meeting link created successfully", meetingLink, bookingId: booking.id });
  } catch (error) {
    console.error("Create Meeting Link Error:", error);
    res.status(500).json({ message: "Failed to create meeting link" });
  }
};

// Get meeting link for booking
export const getMeetingLink = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.bookingId as string;
    const userId = req.user!.id;

    const booking = await VideoModel.findBookingWithUsers(bookingId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const isAuthorized =
      booking.parent.userId === userId || booking.babysitter.userId === userId || req.user!.role === "ADMIN";
    if (!isAuthorized) { res.status(403).json({ message: "Not authorized" }); return; }

    let meetingLink = booking.meetingLink;
    if (!meetingLink) {
      meetingLink = generateMeetingLink(booking.id);
      await VideoModel.saveMeetingLink(booking.id, meetingLink);
    }

    res.status(200).json({
      success: true, meetingLink,
      booking: { id: booking.id, startTime: booking.startTime, endTime: booking.endTime, status: booking.status },
    });
  } catch (error) {
    console.error("Get Meeting Link Error:", error);
    res.status(500).json({ message: "Failed to get meeting link" });
  }
};

// Get Stream Video token
export const getStreamToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const token = `stream-token-${uuidv4()}`;

    res.status(200).json({
      success: true, token, userId: userId.toString(),
      apiKey: process.env.STREAM_API_KEY || "",
    });
  } catch (error) {
    console.error("Get Stream Token Error:", error);
    res.status(500).json({ message: "Failed to get stream token" });
  }
};
