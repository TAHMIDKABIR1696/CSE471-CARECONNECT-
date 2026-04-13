import { Response } from "express";
import prisma from "../config/db.js";
import OpenAI from "openai";
import { AuthRequest } from "../types/index.js";

/**
 * Chatbot System
 */

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const getSimpleResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! How can I help you today?";
  }
  if (lowerMessage.includes("booking") || lowerMessage.includes("book")) {
    return "To create a booking, go to the Find Sitter page and select a babysitter. Then click 'Book Now' and fill in the details.";
  }
  if (lowerMessage.includes("payment") || lowerMessage.includes("pay")) {
    return "Payments can be made after a booking is confirmed. Go to your Bookings page and click on a confirmed booking to make payment.";
  }
  if (lowerMessage.includes("profile") || lowerMessage.includes("update")) {
    return "You can update your profile by going to Account > Profile. Make sure to complete all required fields.";
  }
  if (lowerMessage.includes("sitter") || lowerMessage.includes("babysitter")) {
    return "To find a babysitter, use the Find Sitter page. You can filter by location, price, and availability. Our AI matching system will show you the best matches.";
  }
  if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
    return "I'm here to help! You can ask me about bookings, payments, profiles, finding sitters, or any other questions about the platform.";
  }
  return "I understand you need help. Could you please provide more details? For specific issues, you can also contact our support team.";
};

// Chat with bot
export const chatWithBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, conversationId } = req.body;
    const userId = req.user!.id;

    if (!message) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    let botResponse: string;

    if (openai) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant for CareConnect, a premium babysitting and childcare platform. Help users with bookings, payments, profiles, finding sitters, and general questions. Be friendly and concise.",
            },
            { role: "user", content: message },
          ],
          max_tokens: 150,
        });

        botResponse = completion.choices[0].message.content || getSimpleResponse(message);
      } catch (error) {
        console.error("OpenAI Error:", error);
        botResponse = getSimpleResponse(message);
      }
    } else {
      botResponse = getSimpleResponse(message);
    }

    if (conversationId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (conversation) {
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: userId,
            content: message,
            type: "USER",
          },
        });

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: userId,
            content: botResponse,
            type: "BOT",
          },
        });
      }
    }

    res.status(200).json({
      success: true,
      response: botResponse,
      conversationId: conversationId || null,
    });
  } catch (error) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ message: "Failed to process chat message" });
  }
};

// Create chatbot conversation
export const createChatbotConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const conversation = await prisma.conversation.create({
      data: {},
      include: {
        messages: {
          include: {
            sender: {
              select: { id: true, name: true, profilePicture: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content: "Hello! I'm your virtual assistant. How can I help you today?",
        type: "BOT",
      },
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Create Chatbot Conversation Error:", error);
    res.status(500).json({ message: "Failed to create conversation" });
  }
};
