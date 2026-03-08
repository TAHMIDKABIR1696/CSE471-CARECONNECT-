import OpenAI from "openai";

/**
 * Chatbot Service — OpenAI integration + simple fallback
 */

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// ── Simple regex-based fallback responses ──
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

// ── Get chatbot response (OpenAI or fallback) ──
export const getBotResponse = async (message: string): Promise<string> => {
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
      return completion.choices[0].message.content || getSimpleResponse(message);
    } catch (error) {
      console.error("OpenAI Error:", error);
      return getSimpleResponse(message);
    }
  }
  return getSimpleResponse(message);
};
