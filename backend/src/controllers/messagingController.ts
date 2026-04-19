import { Response } from "express";
import * as MessagingModel from "../models/messagingModel.js";
import { AuthRequest } from "../types/index.js";

/**
 * Messaging & Communication System
 */

const canChatForStatus = (status: string) =>
  MessagingModel.chatEnabledStatuses.includes(
    status as (typeof MessagingModel.chatEnabledStatuses)[number]
  );

const isParticipantOrAdmin = (
  req: AuthRequest,
  conversation: Awaited<ReturnType<typeof MessagingModel.findConversationById>>
) => {
  const userId = req.user!.id;
  if (req.user!.role === "ADMIN") return true;
  return (
    conversation?.booking?.parent?.userId === userId ||
    conversation?.booking?.babysitter?.userId === userId
  );
};

// Create or get conversation
export const getOrCreateConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, bookingId, otherUserId } = req.body as {
      conversationId?: string;
      bookingId?: string;
      otherUserId?: string;
    };
    const userId = req.user!.id;

    if (conversationId) {
      const conversation = await MessagingModel.findConversationById(conversationId);
      if (!conversation) {
        res.status(404).json({ message: "Conversation not found" });
        return;
      }

      if (!isParticipantOrAdmin(req, conversation)) {
        res.status(403).json({ message: "Not authorized to access this conversation" });
        return;
      }

      if (
        req.user!.role !== "ADMIN" &&
        conversation.booking &&
        !canChatForStatus(conversation.booking.status)
      ) {
        res.status(403).json({
          message: "Messaging is available only after booking acceptance",
        });
        return;
      }

      res.status(200).json({ success: true, conversation });
      return;
    }

    if (bookingId) {
      const booking = await MessagingModel.findBookingWithParticipants(bookingId);
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }

      const isParticipant =
        booking.parent.userId === userId || booking.babysitter.userId === userId;
      if (!isParticipant && req.user!.role !== "ADMIN") {
        res.status(403).json({ message: "Not authorized to access this booking chat" });
        return;
      }

      if (req.user!.role !== "ADMIN" && !canChatForStatus(booking.status)) {
        res.status(403).json({
          message: "Messaging is available only after booking acceptance",
        });
        return;
      }

      const conversation = await MessagingModel.ensureConversationForBooking(bookingId);
      res.status(200).json({ success: true, conversation });
      return;
    }

    if (otherUserId) {
      const eligibleBooking = await MessagingModel.findLatestEligibleBookingBetweenUsers(
        userId,
        otherUserId
      );
      if (!eligibleBooking) {
        res.status(404).json({
          message: "No accepted booking found with this user",
        });
        return;
      }

      const conversation = await MessagingModel.ensureConversationForBooking(eligibleBooking.id);
      res.status(200).json({ success: true, conversation });
      return;
    }

    res.status(400).json({ message: "Provide conversationId, bookingId, or otherUserId" });
  } catch (error) {
    console.error("Conversation Error:", error);
    res.status(500).json({ message: "Failed to get conversation" });
  }
};

// Send message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, content, translatedContent } = req.body;
    const senderId = req.user!.id;

    if (!conversationId || !content) {
      res.status(400).json({ message: "Missing required fields" }); return;
    }

    const conversation = await MessagingModel.findConversationById(conversationId as string);
    if (!conversation) {
      res.status(404).json({ message: "Conversation not found" }); return;
    }

    if (!isParticipantOrAdmin(req, conversation)) {
      res.status(403).json({ message: "Not authorized to send in this conversation" }); return;
    }

    if (
      req.user!.role !== "ADMIN" &&
      conversation.booking &&
      !canChatForStatus(conversation.booking.status)
    ) {
      res.status(403).json({
        message: "Messaging is available only after booking acceptance",
      });
      return;
    }

    const message = await MessagingModel.createMessage({
      conversationId: conversationId as string,
      senderId,
      content: translatedContent || content,
      type: "USER",
    });

    await MessagingModel.touchConversation(conversationId as string);
    res.status(201).json({ success: true, message: "Message sent successfully", data: message });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Get all conversations for user
export const getMyConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversations = await MessagingModel.findUserConversations(userId);

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await MessagingModel.countUnread(conv.id, userId);
        return { ...conv, unreadCount };
      })
    );

    res.status(200).json({ success: true, conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Get Conversations Error:", error);
    res.status(500).json({ message: "Failed to get conversations" });
  }
};

// Mark messages as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;
    const conversation = await MessagingModel.findConversationById(conversationId);
    if (!conversation) {
      res.status(404).json({ message: "Conversation not found" }); return;
    }

    if (!isParticipantOrAdmin(req, conversation)) {
      res.status(403).json({ message: "Not authorized to access this conversation" }); return;
    }

    await MessagingModel.markAsRead(conversationId, req.user!.id);
    res.status(200).json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark Read Error:", error);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

// Translate message (placeholder)
export const translateMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      res.status(400).json({ message: "Missing required fields" }); return;
    }

    res.status(200).json({
      success: true, translatedText: text, originalText: text, targetLanguage,
      note: "Translation API integration needed for full functionality",
    });
  } catch (error) {
    console.error("Translation Error:", error);
    res.status(500).json({ message: "Failed to translate message" });
  }
};

// Get message history for a conversation
export const getMessageHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const conversationId = req.params.conversationId as string;
    const { limit = "50", offset = "0" } = req.query as { limit?: string; offset?: string };
    const userId = req.user!.id;

    const conversation = await MessagingModel.findConversationWithBooking(conversationId);
    if (!conversation) { res.status(404).json({ message: "Conversation not found" }); return; }

    const isAuthorized =
      conversation.booking?.parent?.userId === userId ||
      conversation.booking?.babysitter?.userId === userId ||
      req.user!.role === "ADMIN";
    if (!isAuthorized) { res.status(403).json({ message: "Not authorized" }); return; }

    if (
      req.user!.role !== "ADMIN" &&
      conversation.booking &&
      !canChatForStatus(conversation.booking.status)
    ) {
      res.status(403).json({
        message: "Messaging is available only after booking acceptance",
      });
      return;
    }

    const limitNum = parseInt(limit) || 50;
    const offsetNum = parseInt(offset) || 0;

    const messages = await MessagingModel.getMessages(conversationId, limitNum, offsetNum);
    const total = await MessagingModel.countMessages(conversationId);

    res.status(200).json({
      success: true, messages: messages.reverse(), total,
      hasMore: total > offsetNum + messages.length,
    });
  } catch (error) {
    console.error("Get Message History Error:", error);
    res.status(500).json({ message: "Failed to get message history" });
  }
};
