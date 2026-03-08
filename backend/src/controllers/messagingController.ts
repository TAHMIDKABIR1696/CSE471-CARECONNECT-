import { Response } from "express";
import * as MessagingModel from "../models/messagingModel.js";
import { AuthRequest } from "../types/index.js";

/**
 * Messaging & Communication System
 */

// Create or get conversation
export const getOrCreateConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId, otherUserId } = req.body;
    const userId = req.user!.id;

    let conversation = await MessagingModel.findConversation(bookingId, userId, otherUserId);

    if (!conversation && bookingId) {
      conversation = await MessagingModel.createConversation(bookingId);
    }

    res.status(200).json({ success: true, conversation: conversation || null });
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

    const message = await MessagingModel.createMessage({
      conversationId, senderId,
      content: translatedContent || content,
      type: "USER",
    });

    await MessagingModel.touchConversation(conversationId);
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
    await MessagingModel.markAsRead(req.params.conversationId as string, req.user!.id);
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
