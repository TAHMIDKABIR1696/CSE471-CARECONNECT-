import prisma from "../config/db.js";

// ── Find conversation by ID ──
export const findConversation = (conversationId: string) =>
  prisma.conversation.findUnique({ where: { id: conversationId } });

// ── Create empty conversation with welcome message ──
export const createConversation = () =>
  prisma.conversation.create({
    data: {},
    include: {
      messages: {
        include: {
          sender: { select: { id: true, name: true, profilePicture: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

// ── Save a message to a conversation ──
export const saveMessage = (conversationId: string, senderId: string, content: string, type: "USER" | "BOT") =>
  prisma.message.create({
    data: { conversationId, senderId, content, type },
  });
