import prisma from "../config/db.js";

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
      parent: { include: { user: { select: { name: true } } } },
      babysitter: { include: { user: { select: { name: true } } } },
    },
  },
};

// ── Find existing conversation by booking or participants ──
export const findConversation = (bookingId: string | undefined, userId: string, otherUserId: string) =>
  prisma.conversation.findFirst({
    where: {
      OR: [
        { bookingId: bookingId || undefined },
        {
          messages: {
            some: {
              OR: [{ senderId: userId }, { senderId: otherUserId }],
            },
          },
        },
      ],
    },
    include: conversationIncludes,
  });

// ── Create a new conversation for a booking ──
export const createConversation = (bookingId: string) =>
  prisma.conversation.create({
    data: { bookingId },
    include: conversationIncludes,
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
      messages: {
        some: {
          OR: [
            { senderId: userId },
            {
              conversation: {
                booking: {
                  OR: [
                    { parent: { userId } },
                    { babysitter: { userId } },
                  ],
                },
              },
            },
          ],
        },
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        ...messageWithSender,
      },
      booking: {
        include: {
          parent: { include: { user: { select: { name: true, profilePicture: true } } } },
          babysitter: { include: { user: { select: { name: true, profilePicture: true } } } },
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
