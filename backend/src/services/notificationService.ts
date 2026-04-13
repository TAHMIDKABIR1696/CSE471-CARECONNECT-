import { NotificationType } from "@prisma/client";
import prisma from "../config/db.js";

interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
}

export const createNotification = async ({
  userId,
  type,
  title,
  body,
  link,
}: NotificationPayload): Promise<void> => {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      link,
    },
  });
};

export const createNotificationsBulk = async (
  notifications: NotificationPayload[]
): Promise<void> => {
  if (!notifications.length) return;

  await prisma.notification.createMany({
    data: notifications,
  });
};
