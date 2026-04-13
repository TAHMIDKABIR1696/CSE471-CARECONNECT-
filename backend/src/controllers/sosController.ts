import { Response } from "express";
import prisma from "../config/db.js";
import {
  createNotification,
  createNotificationsBulk,
} from "../services/notificationService.js";
import { AuthRequest } from "../types/index.js";

/**
 * Emergency & SOS Alerts System
 */

// Create SOS Alert
export const createSOSAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user!.id;

    if (!latitude || !longitude) {
      res.status(400).json({ message: "Latitude and longitude are required" });
      return;
    }

    const sosAlert = await prisma.sOSAlert.create({
      data: {
        userId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        status: "ACTIVE",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true },
        },
      },
    });

    try {
      const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      await createNotificationsBulk(
        admins.map((admin) => ({
          userId: admin.id,
          type: "SOS" as const,
          title: "New SOS alert",
          body: `${sosAlert.user.name || "A user"} triggered an SOS alert.`,
          link: "/admin",
        }))
      );
    } catch (notificationError) {
      console.error("Failed to create SOS notifications:", notificationError);
    }

    res.status(201).json({
      success: true,
      message: "SOS alert created successfully",
      alert: sosAlert,
    });
  } catch (error) {
    console.error("Create SOS Alert Error:", error);
    res.status(500).json({ message: "Failed to create SOS alert" });
  }
};

// Get active SOS alerts
export const getActiveAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let alerts;

    if (role === "ADMIN") {
      alerts = await prisma.sOSAlert.findMany({
        where: { status: "ACTIVE" },
        include: {
          user: {
            select: { id: true, name: true, email: true, phoneNumber: true, profilePicture: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      alerts = await prisma.sOSAlert.findMany({
        where: { userId },
        include: {
          user: {
            select: { id: true, name: true, email: true, phoneNumber: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    res.status(200).json({
      success: true,
      alerts,
      activeCount: alerts.filter((a) => a.status === "ACTIVE").length,
    });
  } catch (error) {
    console.error("Get Alerts Error:", error);
    res.status(500).json({ message: "Failed to get alerts" });
  }
};

// Resolve SOS alert
export const resolveAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alertId = req.params.alertId as string;
    const userId = req.user!.id;
    const role = req.user!.role;

    const alert = await prisma.sOSAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      res.status(404).json({ message: "Alert not found" });
      return;
    }

    if (role !== "ADMIN" && alert.userId !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const updatedAlert = await prisma.sOSAlert.update({
      where: { id: alert.id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (role === "ADMIN") {
      try {
        await createNotification({
          userId: updatedAlert.user.id,
          type: "SOS",
          title: "SOS alert resolved",
          body: "Your SOS alert has been marked as resolved.",
          link: "/account/settings",
        });
      } catch (notificationError) {
        console.error("Failed to create resolved SOS notification:", notificationError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Alert resolved successfully",
      alert: updatedAlert,
    });
  } catch (error) {
    console.error("Resolve Alert Error:", error);
    res.status(500).json({ message: "Failed to resolve alert" });
  }
};

// Get alert by ID
export const getAlertById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.id;
    const role = req.user!.role;

    const alert = await prisma.sOSAlert.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phoneNumber: true, profilePicture: true },
        },
      },
    });

    if (!alert) {
      res.status(404).json({ message: "Alert not found" });
      return;
    }

    if (role !== "ADMIN" && alert.userId !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    res.status(200).json({ success: true, alert });
  } catch (error) {
    console.error("Get Alert Error:", error);
    res.status(500).json({ message: "Failed to get alert" });
  }
};
