import { Response } from "express";
import prisma from "../config/db.js";
import { AuthRequest } from "../types/index.js";

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = Math.min(parseInt((req.query.limit as string) || "20", 10), 100);
    const unreadOnly = (req.query.unreadOnly as string) === "true";

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: Number.isNaN(limit) ? 20 : limit,
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const getUnreadNotificationCount = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Get Notification Count Error:", error);
    res.status(500).json({ message: "Failed to get unread notification count" });
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id as string;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }

    if (notification.userId !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.status(200).json({
      success: true,
      notification: updated,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);
    res.status(500).json({ message: "Failed to mark notification as read" });
  }
};

export const markAllNotificationsRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.status(200).json({
      success: true,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Mark All Notifications Read Error:", error);
    res.status(500).json({ message: "Failed to mark all notifications as read" });
  }
};
