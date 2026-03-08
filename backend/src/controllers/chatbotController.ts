import { Response } from "express";
import * as ChatbotModel from "../models/chatbotModel.js";
import { getBotResponse } from "../services/chatbotService.js";
import { AuthRequest } from "../types/index.js";

/**
 * Chatbot System
 */

// Chat with bot
export const chatWithBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user!.id;

    if (!message) { res.status(400).json({ message: "Message is required" }); return; }

    const botResponse = await getBotResponse(message);

    if (conversationId) {
      const conversation = await ChatbotModel.findConversation(conversationId);
      if (conversation) {
        await ChatbotModel.saveMessage(conversation.id, userId, message, "USER");
        await ChatbotModel.saveMessage(conversation.id, userId, botResponse, "BOT");
      }
    }

    res.status(200).json({ success: true, response: botResponse, conversationId: conversationId || null });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ message: "Failed to process chat message" });
  }
};

// Create chatbot conversation
export const createChatbotConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversation = await ChatbotModel.createConversation();

    await ChatbotModel.saveMessage(
      conversation.id, userId,
      "Hello! I'm your virtual assistant. How can I help you today?", "BOT"
    );

    res.status(201).json({ success: true, conversation });
  } catch (error) {
    console.error("Create Chatbot Conversation Error:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
};
