"use client";

import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { Send, Loader2, MessageCircle } from "lucide-react";
import proxy from "@/lib/proxy";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id: string;
  content: string;
  senderId: string;
  isRead: boolean;
  type: "USER" | "BOT";
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}

interface Conversation {
  id: string;
  messages: Message[];
  booking?: {
    id: string;
    startTime: string;
    endTime: string;
  };
}

interface ChatWindowProps {
  conversationId?: string;
  bookingId?: string;
  otherUserId?: string;
}

export default function ChatWindow({
  conversationId,
  bookingId,
  otherUserId,
}: ChatWindowProps) {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId || bookingId || otherUserId) {
      fetchConversation();
    }
  }, [conversationId, bookingId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as { response?: { data?: { message?: string } } }).response?.data
        ?.message === "string"
    ) {
      return (
        error as { response?: { data?: { message?: string } } }
      ).response?.data?.message as string;
    }
    return fallback;
  };

  const fetchConversation = async () => {
    try {
      setLoading(true);
      const response = await proxy.post("/messaging/conversation", {
        conversationId,
        bookingId,
        otherUserId,
      });

      if (response.data.success) {
        const conv = response.data.conversation;
        setConversation(conv);
        setMessages(conv?.messages || []);
      }
    } catch (error: unknown) {
      console.error("Error fetching conversation:", error);
      toast.error(getApiErrorMessage(error, "Failed to load conversation"));
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const currentConvId = conversation?.id;

      if (!currentConvId) {
        toast.error("Conversation not loaded");
        return;
      }

      const response = await proxy.post("/messaging/send", {
        conversationId: currentConvId,
        content: newMessage,
      });

      if (response.data.success) {
        const sentMessage = response.data.data;
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage("");
        scrollToBottom();
      }
    } catch (error: unknown) {
      console.error("Error sending message:", error);
      toast.error(getApiErrorMessage(error, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-purple-600 h-8 w-8" />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <MessageCircle className="h-12 w-12 text-slate-300 mb-4" />
        <p className="text-slate-500">No conversation found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-900">Messages</h3>
        {conversation.booking && (
          <p className="text-xs text-slate-500 mt-1">
            Booking #{conversation.booking.id}
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <MessageCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No messages yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Start the conversation!
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isBot = message.type === "BOT";
            const isOwnMessage =
              user?.id !== undefined && String(message.senderId) === String(user.id);

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                {!isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600 shrink-0">
                    {message.sender.name.charAt(0)}
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? "bg-purple-600 text-white"
                      : isBot
                        ? "bg-slate-100 text-slate-900"
                        : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-purple-50" : "text-slate-400"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {isOwnMessage && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                    You
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t border-slate-200 bg-slate-50"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {sending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
