"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  MessageCircle,
  Send,
  Bot,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Message {
  id: number;
  content: string;
  type: "USER" | "BOT";
  createdAt: string;
}

export default function ChatbotPage() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      initializeChatbot();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChatbot = async () => {
    try {
      const response = await proxy.post("/chatbot/conversation");
      if (response.data.success) {
        setConversationId(response.data.conversation.id);
        const botMessages = response.data.conversation.messages || [];
        setMessages(
          botMessages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            type: msg.type,
            createdAt: msg.createdAt,
          }))
        );
      }
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.error("Error initializing chatbot:", error);
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      content: input,
      type: "USER",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await proxy.post("/chatbot/chat", {
        message: input,
        conversationId: conversationId,
      });

      if (response.data.success) {
        const botMessage: Message = {
          id: Date.now() + 1,
          content: response.data.response,
          type: "BOT",
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Please login to use the chatbot</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-black text-slate-900">AI Chatbot</h1>
        </div>
        <p className="text-slate-600">
          Ask me anything about bookings, payments, profiles, or finding sitters!
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <Bot className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Start a conversation with me!</p>
                <p className="text-sm text-slate-400 mt-2">
                  I can help you with bookings, payments, profiles, and more.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                {message.type === "BOT" && (
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.type === "USER"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === "USER"
                        ? "text-purple-50"
                        : "text-slate-400"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {message.type === "USER" && (
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-slate-600">You</span>
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5 text-purple-600" />
              </div>
              <div className="bg-slate-100 rounded-2xl px-4 py-3">
                <Loader2 className="animate-spin h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={sendMessage}
          className="p-4 border-t border-slate-200 bg-slate-50"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Suggestions */}
      <div className="bg-slate-50 rounded-2xl p-4">
        <p className="text-xs font-bold text-slate-700 mb-2 uppercase">
          Quick Questions:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "How do I book a sitter?",
            "How to make payment?",
            "Update my profile",
            "Find a babysitter",
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 hover:bg-purple-50 hover:border-purple-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

