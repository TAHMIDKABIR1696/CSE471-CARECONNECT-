import prisma from "../config/db.js";

export const chatEnabledStatuses = ["CONFIRMED", "LIVE", "COMPLETED"] as const;

const messageWithSender = {
  include: {
    sender: { select: { id: true, name: true, profilePicture: true } },
  },
} as const;

const conversationIncludes = {
  messages: {
    ...messageWithSender,
    orderBy: { createdAt: "asc" as const },
  },
  booking: {
    include: {
      parent: { include: { user: { select: { id: true, name: true, profilePicture: true } } } },
      babysitter: { include: { user: { select: { id: true, name: true, profilePicture: true } } } },
    },
  },
};

// ── Get conversation by ID ──
export const findConversationById = (conversationId: string) =>
  prisma.conversation.findUnique({
    where: { id: conversationId },
    include: conversationIncludes,
  });

// ── Get conversation by booking ──
export const findConversationByBooking = (bookingId: string) =>
  prisma.conversation.findUnique({
    where: { bookingId },
    include: conversationIncludes,
  });

// ── Create conversation for an accepted booking (idempotent) ──
export const ensureConversationForBooking = (bookingId: string) =>
  prisma.conversation.upsert({
    where: { bookingId },
    update: { updatedAt: new Date() },
    create: { bookingId },
    include: conversationIncludes,
  });

// ── Find booking and participants ──
export const findBookingWithParticipants = (bookingId: string) =>
  prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      parent: { include: { user: { select: { id: true, name: true, profilePicture: true } } } },
      babysitter: { include: { user: { select: { id: true, name: true, profilePicture: true } } } },
    },
  });

// ── Find latest chat-eligible booking between two users ──
export const findLatestEligibleBookingBetweenUsers = (userId: string, otherUserId: string) =>
  prisma.booking.findFirst({
    where: {
      status: { in: [...chatEnabledStatuses] },
      OR: [
        {
          parent: { userId },
          babysitter: { userId: otherUserId },
        },
        {
          parent: { userId: otherUserId },
          babysitter: { userId },
        },
      ],
    },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

// ── Create a message ──
export const createMessage = (data: {
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
}) =>
  prisma.message.create({
    data: {
      conversationId: data.conversationId,
      senderId: data.senderId,
      content: data.content,
      type: data.type as "USER" | "BOT",
    },
    ...messageWithSender,
  });

// ── Touch conversation timestamp ──
export const touchConversation = (conversationId: string) =>
  prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

// ── Get all conversations for a user ──
export const findUserConversations = (userId: string) =>
  prisma.conversation.findMany({
    where: {
      OR: [
        {
          booking: {
            status: { in: [...chatEnabledStatuses] },
            OR: [{ parent: { userId } }, { babysitter: { userId } }],
          },
        },
        {
          AND: [
            {
              bookingId: null,
            },
            {
              messages: {
                some: { senderId: userId },
              },
            },
          ],
        },
      ],
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        ...messageWithSender,
      },
      booking: {
        include: {
          parent: { include: { user: { select: { id: true, name: true, profilePicture: true } } } },
          babysitter: { include: { user: { select: { id: true, name: true, profilePicture: true } } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

// ── Count unread messages in a conversation ──
export const countUnread = (conversationId: string, userId: string) =>
  prisma.message.count({
    where: { conversationId, senderId: { not: userId }, isRead: false },
  });

// ── Mark messages as read ──
export const markAsRead = (conversationId: string, userId: string) =>
  prisma.message.updateMany({
    where: { conversationId, senderId: { not: userId }, isRead: false },
    data: { isRead: true },
  });

// ── Get conversation with booking users (for authorization) ──
export const findConversationWithBooking = (conversationId: string) =>
  prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      booking: {
        include: {
          parent: { include: { user: true } },
          babysitter: { include: { user: true } },
        },
      },
    },
  });

// ── Get paginated messages ──
export const getMessages = (conversationId: string, limit: number, offset: number) =>
  prisma.message.findMany({
    where: { conversationId },
    ...messageWithSender,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

// ── Count total messages in a conversation ──
export const countMessages = (conversationId: string) =>
  prisma.message.count({ where: { conversationId } });
