import { Response } from "express";
import { BookingStatus, LiveSessionStatus, Prisma } from "@prisma/client";
import prisma from "../config/db.js";
import { createNotification } from "../services/notificationService.js";
import { AuthRequest, GpsLog } from "../types/index.js";

/**
 * Live Session Tracking System
 */

type SessionAction = "START" | "PAUSE" | "RESUME" | "COMPLETE" | "CANCEL";

const sessionActionConfig: Record<
  SessionAction,
  {
    liveStatus: LiveSessionStatus;
    bookingStatus?: BookingStatus;
    title: string;
    body: string;
  }
> = {
  START: {
    liveStatus: LiveSessionStatus.ACTIVE,
    bookingStatus: BookingStatus.LIVE,
    title: "Session started",
    body: "A babysitting session is now live.",
  },
  PAUSE: {
    liveStatus: LiveSessionStatus.PAUSED,
    title: "Session paused",
    body: "The babysitter paused the session.",
  },
  RESUME: {
    liveStatus: LiveSessionStatus.ACTIVE,
    title: "Session resumed",
    body: "The babysitter resumed the session.",
  },
  COMPLETE: {
    liveStatus: LiveSessionStatus.COMPLETED,
    bookingStatus: BookingStatus.COMPLETED,
    title: "Session completed",
    body: "A babysitting session has been completed.",
  },
  CANCEL: {
    liveStatus: LiveSessionStatus.CANCELLED,
    bookingStatus: BookingStatus.CANCELLED,
    title: "Session cancelled",
    body: "A babysitting session has been cancelled.",
  },
};

const getSessionDuration = (actualStart: Date | null, actualEnd: Date | null) => {
  if (!actualStart) {
    return null;
  }

  const endTime = actualEnd || new Date();
  const durationMs = endTime.getTime() - actualStart.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  return {
    hours: Math.round(durationHours * 100) / 100,
    minutes: Math.round(durationHours * 60 * 100) / 100,
  };
};

const notifyParentAboutSession = async (userId: string, action: SessionAction) => {
  const config = sessionActionConfig[action];

  try {
    await createNotification({
      userId,
      type: "SESSION",
      title: config.title,
      body: config.body,
      link: "/account/sessions",
    });
  } catch (notificationError) {
    console.error(`Failed to create ${action.toLowerCase()} notification:`, notificationError);
  }
};

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

    const hasLatitude = latitude !== undefined && latitude !== null && latitude !== "";
    const hasLongitude = longitude !== undefined && longitude !== null && longitude !== "";

    const gpsLogs: GpsLog[] = [
      {
        lat: hasLatitude ? parseFloat(latitude) : null,
        lng: hasLongitude ? parseFloat(longitude) : null,
        time: new Date().toISOString(),
      },
    ];

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.LIVE,
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

    await prisma.liveSession.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        babysitterId: booking.babysitterId,
        parentId: booking.parentId,
        startTime: new Date(),
        status: LiveSessionStatus.ACTIVE,
        homeLatitude: hasLatitude ? parseFloat(latitude) : undefined,
        homeLongitude: hasLongitude ? parseFloat(longitude) : undefined,
        currentLatitude: hasLatitude ? parseFloat(latitude) : undefined,
        currentLongitude: hasLongitude ? parseFloat(longitude) : undefined,
        locationUpdates: gpsLogs as unknown as Prisma.InputJsonValue,
      },
      update: {
        status: LiveSessionStatus.ACTIVE,
        endTime: null,
        currentLatitude: hasLatitude ? parseFloat(latitude) : null,
        currentLongitude: hasLongitude ? parseFloat(longitude) : null,
        locationUpdates: gpsLogs as unknown as Prisma.InputJsonValue,
      },
    });

    await notifyParentAboutSession(booking.parent.userId, "START");

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

    if (!bookingId || latitude === undefined || longitude === undefined || latitude === null || longitude === null) {
      res.status(400).json({ message: "Booking ID, latitude, and longitude are required" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parent: true,
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

export const updateSessionStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookingId = req.params.bookingId as string;
    const { status, latitude, longitude } = req.body as {
      status?: SessionAction;
      latitude?: number | string;
      longitude?: number | string;
    };
    const userId = req.user!.id;

    if (!bookingId || !status) {
      res.status(400).json({ message: "Booking ID and status are required" });
      return;
    }

    const normalizedStatus = status.toUpperCase() as SessionAction;
    const config = sessionActionConfig[normalizedStatus];

    if (!config || normalizedStatus === "START") {
      res.status(400).json({ message: "Invalid session status" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        parent: { include: { user: true } },
        babysitter: { include: { user: true } },
        liveSession: true,
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.babysitter.userId !== userId) {
      res.status(403).json({ message: "Only babysitter can update the session status" });
      return;
    }

    if (booking.status !== BookingStatus.LIVE) {
      res.status(400).json({ message: "Only live bookings can be updated" });
      return;
    }

    if (!booking.liveSession) {
      res.status(400).json({ message: "Session must be started before updating its status" });
      return;
    }

    if (normalizedStatus === "PAUSE" && booking.liveSession.status !== LiveSessionStatus.ACTIVE) {
      res.status(400).json({ message: "Only active sessions can be paused" });
      return;
    }

    if (normalizedStatus === "RESUME" && booking.liveSession.status !== LiveSessionStatus.PAUSED) {
      res.status(400).json({ message: "Only paused sessions can be resumed" });
      return;
    }

    const locationPoint =
      latitude !== undefined && longitude !== undefined
        ? {
            lat: parseFloat(String(latitude)),
            lng: parseFloat(String(longitude)),
            time: new Date().toISOString(),
          }
        : null;

    const existingLogs = Array.isArray(booking.gpsLogs) ? (booking.gpsLogs as unknown as GpsLog[]) : [];
    const updatedLogs = locationPoint ? [...existingLogs, locationPoint] : existingLogs;

    const liveSessionData: {
      status: LiveSessionStatus;
      endTime?: Date | null;
      currentLatitude?: number | null;
      currentLongitude?: number | null;
      locationUpdates?: Prisma.InputJsonValue;
    } = {
      status: config.liveStatus,
      currentLatitude: locationPoint?.lat ?? undefined,
      currentLongitude: locationPoint?.lng ?? undefined,
    };

    if (normalizedStatus === "COMPLETE" || normalizedStatus === "CANCEL") {
      const actualEnd = new Date();

      liveSessionData.endTime = actualEnd;

      const updatedBooking = await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: config.bookingStatus,
          actualEnd,
          gpsLogs: updatedLogs as unknown as Prisma.InputJsonValue,
        },
        include: {
          parent: { include: { user: { select: { name: true, email: true } } } },
          babysitter: { include: { user: { select: { name: true, email: true } } } },
        },
      });

      await prisma.liveSession.update({
        where: { bookingId: booking.id },
        data: liveSessionData,
      });

      await notifyParentAboutSession(booking.parent.userId, normalizedStatus);

      res.status(200).json({
        success: true,
        message: `Session ${normalizedStatus.toLowerCase()} successfully`,
        booking: updatedBooking,
        duration: getSessionDuration(updatedBooking.actualStart, updatedBooking.actualEnd),
      });
      return;
    }

    const updatedLiveSession = await prisma.liveSession.update({
      where: { bookingId: booking.id },
      data: {
        ...liveSessionData,
        locationUpdates: updatedLogs as unknown as Prisma.InputJsonValue,
      },
      include: {
        booking: {
          include: {
            parent: { include: { user: true } },
            babysitter: { include: { user: true } },
          },
        },
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { gpsLogs: updatedLogs as unknown as Prisma.InputJsonValue },
    });

    await notifyParentAboutSession(booking.parent.userId, normalizedStatus);

    res.status(200).json({
      success: true,
      message: `Session ${normalizedStatus.toLowerCase()} successfully`,
      liveSession: updatedLiveSession,
    });
  } catch (error) {
    console.error("Update Session Status Error:", error);
    res.status(500).json({ message: "Failed to update session status" });
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
        status: BookingStatus.COMPLETED,
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

    await prisma.liveSession.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        babysitterId: booking.babysitterId,
        parentId: booking.parentId,
        startTime: actualStart,
        endTime: actualEnd,
        status: LiveSessionStatus.COMPLETED,
      },
      update: {
        status: LiveSessionStatus.COMPLETED,
        endTime: actualEnd,
      },
    });

    await notifyParentAboutSession(updatedBooking.parent.userId, "COMPLETE");

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
        liveSession: true,
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
          liveSession: true,
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
          liveSession: true,
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
