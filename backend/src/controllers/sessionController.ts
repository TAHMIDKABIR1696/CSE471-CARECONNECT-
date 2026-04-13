import { Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../config/db.js";
import { createNotification } from "../services/notificationService.js";
import { AuthRequest, GpsLog } from "../types/index.js";

/**
 * Live Session Tracking System
 */

// Start session
export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, latitude, longitude } = req.body;
    const userId = req.user!.id;

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID is required" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parent: { include: { user: true } },
        babysitter: { include: { user: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Only babysitter can start the session" });
      return;
    }

    if (booking.status !== "CONFIRMED") {
      res.status(400).json({ message: "Booking must be confirmed to start session" });
      return;
    }

    const gpsLogs: GpsLog[] = [
      {
        lat: latitude ? parseFloat(latitude) : null,
        lng: longitude ? parseFloat(longitude) : null,
        time: new Date().toISOString(),
      },
    ];

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
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

    try {
      await createNotification({
        userId: booking.parent.userId,
        type: "SESSION",
        title: "Session started",
        body: "A babysitting session is now live.",
        link: "/account/sessions",
      });
    } catch (notificationError) {
      console.error("Failed to create session-start notification:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Session started successfully",
      booking: updatedBooking,
    });
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
      res.status(400).json({ message: "Booking ID, latitude, and longitude are required" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        babysitter: { include: { user: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    if (booking.status !== "LIVE") {
      res.status(400).json({ message: "Session is not live" });
      return;
    }

    const existingLogs = Array.isArray(booking.gpsLogs) ? (booking.gpsLogs as unknown as GpsLog[]) : [];

    const newLog: GpsLog = {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      time: new Date().toISOString(),
    };

    const updatedLogs = [...existingLogs, newLog];

    await prisma.booking.update({
      where: { id: booking.id },
      data: { gpsLogs: updatedLogs as unknown as Prisma.InputJsonValue },
    });

    res.status(200).json({
      success: true,
      message: "Location updated",
      location: newLog,
    });
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

    if (!bookingId) {
      res.status(400).json({ message: "Booking ID is required" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        babysitter: { include: { user: true } },
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Only babysitter can end the session" });
      return;
    }

    if (booking.status !== "LIVE") {
      res.status(400).json({ message: "Session is not live" });
      return;
    }

    const actualStart = booking.actualStart || booking.startTime;
    const actualEnd = new Date();
    const durationMs = actualEnd.getTime() - actualStart.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "COMPLETED",
        actualEnd,
      },
      include: {
        parent: {
          include: { user: { select: { name: true, email: true } } },
        },
        babysitter: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    try {
      await createNotification({
        userId: booking.parent.userId,
        type: "SESSION",
        title: "Session completed",
        body: "A babysitting session has been completed.",
        link: "/account/sessions",
      });
    } catch (notificationError) {
      console.error("Failed to create session-end notification:", notificationError);
    }

    res.status(200).json({
      success: true,
      message: "Session ended successfully",
      booking: updatedBooking,
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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parent: {
          include: { user: { select: { name: true, email: true } } },
        },
        babysitter: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const isAuthorized =
      booking.parent.userId === userId ||
      booking.babysitter.userId === userId ||
      req.user!.role === "ADMIN";

    if (!isAuthorized) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    let duration: { hours: number; minutes: number } | null = null;
    if (booking.actualStart) {
      const endTime = booking.actualEnd || new Date();
      const durationMs = endTime.getTime() - booking.actualStart.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      duration = {
        hours: Math.round(durationHours * 100) / 100,
        minutes: Math.round(durationHours * 60 * 100) / 100,
      };
    }

    res.status(200).json({
      success: true,
      booking,
      duration,
      gpsLogs: booking.gpsLogs || [],
    });
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
      const parent = await prisma.parent.findUnique({ where: { userId } });
      if (!parent) {
        res.status(404).json({ message: "Parent profile not found" });
        return;
      }

      liveBookings = await prisma.booking.findMany({
        where: { parentId: parent.id, status: "LIVE" },
        include: {
          babysitter: {
            include: {
              user: {
                select: { name: true, email: true, phoneNumber: true, profilePicture: true },
              },
            },
          },
        },
        orderBy: { actualStart: "desc" },
      });
    } else if (role === "BABYSITTER") {
      const sitter = await prisma.babysitter.findUnique({ where: { userId } });
      if (!sitter) {
        res.status(404).json({ message: "Sitter profile not found" });
        return;
      }

      liveBookings = await prisma.booking.findMany({
        where: { babysitterId: sitter.id, status: "LIVE" },
        include: {
          parent: {
            include: {
              user: {
                select: { name: true, email: true, phoneNumber: true, profilePicture: true },
              },
            },
          },
        },
        orderBy: { actualStart: "desc" },
      });
    } else {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      success: true,
      sessions: liveBookings,
      count: liveBookings.length,
    });
  } catch (error) {
    console.error("Get Live Sessions Error:", error);
    res.status(500).json({ message: "Failed to get live sessions" });
  }
};
