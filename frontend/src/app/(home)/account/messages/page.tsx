"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Loader2,
  Search,
  User,
  Calendar,
  Check,
  CheckCheck,
  Globe,
  ChevronLeft,
} from "lucide-react";

interface IMessage {
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

interface IConversation {
  id: string;
  unreadCount?: number;
  updatedAt: string;
  messages: IMessage[];
  booking?: {
    id: string;
    startTime: string;
    endTime: string;
    parent?: {
      user: { id: string; name: string; profilePicture: string | null };
    };
    babysitter?: {
      user: { id: string; name: string; profilePicture: string | null };
    };
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const bookingIdFromQuery = searchParams.get("bookingId");
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState<string>("en");
  const [translatedMessage, setTranslatedMessage] = useState<string>("");
  const [translating, setTranslating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagePollRef = useRef<NodeJS.Timeout | null>(null);
  const conversationPollRef = useRef<NodeJS.Timeout | null>(null);
  const unreadSnapshotRef = useRef<Record<string, number>>({});
  const autoOpenBookingRef = useRef<string | null>(null);

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

  const getOtherParty = (conversation: IConversation) => {
    if (!conversation.booking) return null;
    const isParent = user?.role === "PARENT";
    return isParent
      ? conversation.booking.babysitter?.user
      : conversation.booking.parent?.user;
  };

  const fetchConversations = async (options?: {
    silent?: boolean;
    showNotifications?: boolean;
  }) => {
    try {
      if (!options?.silent) setLoading(true);
      const response = await proxy.get("/messaging/conversations");
      if (response.data.success && response.data.conversations) {
        const nextConversations: IConversation[] = Array.isArray(
          response.data.conversations
        )
          ? response.data.conversations
          : [];

        if (options?.showNotifications) {
          for (const conversation of nextConversations) {
            const previousUnread = unreadSnapshotRef.current[conversation.id] || 0;
            const currentUnread = conversation.unreadCount || 0;
            if (currentUnread > previousUnread) {
              const senderName = getOtherParty(conversation)?.name || "your contact";
              toast.success(`New message from ${senderName}`);
              if (
                typeof window !== "undefined" &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                new Notification("New message", {
                  body: `You received a new message from ${senderName}`,
                });
              }
            }
          }
        }

        unreadSnapshotRef.current = nextConversations.reduce<Record<string, number>>(
          (acc, conversation) => {
            acc[conversation.id] = conversation.unreadCount || 0;
            return acc;
          },
          {}
        );

        setConversations(nextConversations);
        setSelectedConversation((prev) =>
          prev
            ? nextConversations.find((conversation) => conversation.id === prev.id) || prev
            : prev
        );
      } else {
        setConversations([]);
        unreadSnapshotRef.current = {};
      }
    } catch (error: unknown) {
      console.error("Fetch Conversations Error:", error);
      if (!options?.silent) {
        toast.error("Failed to load conversations");
      }
    } finally {
      if (!options?.silent) setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string, silent = false) => {
    try {
      const response = await proxy.post("/messaging/conversation", {
        conversationId,
      });

      if (response.data.success && response.data.conversation) {
        const conv = response.data.conversation as IConversation;
        setMessages(conv.messages || []);
        if (!silent) {
          setSelectedConversation(conv);
        }
        setConversations((prev) =>
          prev.map((item) =>
            item.id === conv.id ? { ...item, ...conv, unreadCount: item.unreadCount } : item
          )
        );
      }
    } catch (error: unknown) {
      console.error("Fetch Messages Error:", error);
      if (!silent) {
        toast.error(getApiErrorMessage(error, "Failed to load messages"));
      }
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await proxy.put(`/messaging/conversation/${conversationId}/read`);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
      unreadSnapshotRef.current[conversationId] = 0;
    } catch (error: unknown) {
      console.error("Mark Read Error:", error);
    }
  };

  useEffect(() => {
    fetchConversations();

    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission().catch(() => undefined);
    }

    conversationPollRef.current = setInterval(() => {
      fetchConversations({ silent: true, showNotifications: true });
    }, 5000);

    return () => {
      if (messagePollRef.current) clearInterval(messagePollRef.current);
      if (conversationPollRef.current) clearInterval(conversationPollRef.current);
    };
  }, []);

  useEffect(() => {
    const selectedConversationId = selectedConversation?.id;
    if (!selectedConversationId) return;

    fetchMessages(selectedConversationId);
    markAsRead(selectedConversationId);

    if (messagePollRef.current) clearInterval(messagePollRef.current);
    messagePollRef.current = setInterval(() => {
      fetchMessages(selectedConversationId, true);
      markAsRead(selectedConversationId);
    }, 5000);

    return () => {
      if (messagePollRef.current) clearInterval(messagePollRef.current);
    };
  }, [selectedConversation?.id]);

  useEffect(() => {
    if (!bookingIdFromQuery || autoOpenBookingRef.current === bookingIdFromQuery) return;

    const autoOpenConversation = async () => {
      try {
        const response = await proxy.post("/messaging/conversation", {
          bookingId: bookingIdFromQuery,
        });

        if (response.data.success && response.data.conversation) {
          const conversation = response.data.conversation as IConversation;
          autoOpenBookingRef.current = bookingIdFromQuery;
          setSelectedConversation(conversation);
          setMessages(conversation.messages || []);
          setShowMobileChat(true);
          fetchConversations({ silent: true });
        }
      } catch (error: unknown) {
        autoOpenBookingRef.current = bookingIdFromQuery;
        toast.error(getApiErrorMessage(error, "Unable to start chat for this booking"));
      }
    };

    autoOpenConversation();
  }, [bookingIdFromQuery]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedConversation) return;

    try {
      setSending(true);
      const response = await proxy.post("/messaging/send", {
        conversationId: selectedConversation.id,
        content: newMessage,
        translatedContent: translatedMessage || null,
        language: targetLanguage !== "en" ? targetLanguage : null,
      });

      if (response.data.success) {
        const sentMessage = response.data.data as IMessage;
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage("");
        setTranslatedMessage("");
        scrollToBottom();
        fetchConversations({ silent: true });
      }
    } catch (error: unknown) {
      console.error("Send Message Error:", error);
      toast.error(getApiErrorMessage(error, "Failed to send message"));
    } finally {
      setSending(false);
    }
  };

  const translateMessage = async (text: string, targetLang: string) => {
    if (!text.trim() || targetLang === "en") {
      setTranslatedMessage("");
      return;
    }

    try {
      setTranslating(true);
      const response = await proxy.post("/messaging/translate", {
        text,
        targetLanguage: targetLang,
      });

      if (response.data.success) {
        setTranslatedMessage(response.data.translatedText);
      }
    } catch (error: unknown) {
      console.error("Translation Error:", error);
      toast.error("Translation failed. Message will be sent in original language.");
    } finally {
      setTranslating(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
    if (newMessage.trim() && lang !== "en") {
      translateMessage(newMessage, lang);
    } else {
      setTranslatedMessage("");
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const otherParty = getOtherParty(conv);
    const searchLower = searchQuery.toLowerCase();
    return (
      otherParty?.name?.toLowerCase()?.includes(searchLower) ||
      conv.booking?.id.toString().includes(searchLower) ||
      conv.messages?.[0]?.content?.toLowerCase()?.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    );
  }

  const isParent = user?.role === "PARENT";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-slate-800 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <MessageSquare className="h-8 w-8" />
          Messages
        </h1>
        <p className="text-purple-100 mt-2">
          Communicate with {isParent ? "babysitters" : "parents"} about bookings
        </p>
      </div>

      {/* Messages Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[calc(100vh-280px)] flex flex-col">
        <div className="flex h-full">
          {/* Conversations List */}
          <div
            className={`w-full md:w-96 border-r border-slate-200 flex flex-col ${
              showMobileChat ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium">No conversations yet</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Start a conversation from a booking
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const otherParty = getOtherParty(conv);
                  const latestMessage = conv.messages?.[0];
                  const isSelected = selectedConversation?.id === conv.id;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setSelectedConversation(conv);
                        setShowMobileChat(true);
                      }}
                      className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-purple-50 border-l-4 border-l-purple-600" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <User className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-slate-900 truncate">
                              {otherParty?.name || "Unknown User"}
                            </h3>
                            {conv.unreadCount && conv.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          {latestMessage && (
                            <p className="text-sm text-slate-600 truncate mb-1">
                              {latestMessage.content}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {conv.booking && (
                              <>
                                <Calendar className="h-3 w-3" />
                                <span>Booking #{conv.booking.id}</span>
                              </>
                            )}
                            {latestMessage && (
                              <>
                                <span>•</span>
                                <span>{formatTime(latestMessage.createdAt)}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div
            className={`flex-1 flex flex-col ${
              showMobileChat ? "flex" : "hidden md:flex"
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {getOtherParty(selectedConversation)?.name ||
                          "Unknown User"}
                      </h3>
                      {selectedConversation.booking && (
                        <p className="text-xs text-slate-600">
                          Booking #{selectedConversation.booking.id}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={targetLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none flex items-center gap-2"
                    >
                      <option value="en">🇺🇸 English</option>
                      <option value="bn">🇧🇩 বাংলা</option>
                      <option value="hi">🇮🇳 हिंदी</option>
                      <option value="es">🇪🇸 Español</option>
                      <option value="fr">🇫🇷 Français</option>
                      <option value="ar">🇸🇦 العربية</option>
                    </select>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div>
                        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-medium">No messages yet</p>
                        <p className="text-slate-400 text-sm mt-1">
                          Start the conversation!
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage =
                        user?.id !== undefined &&
                        String(message.senderId) === String(user.id);
                      const isBot = message.type === "BOT";

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isOwnMessage && (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                              {message.sender.profilePicture ? (
                                <img
                                  src={message.sender.profilePicture}
                                  alt={message.sender.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-bold text-purple-600">
                                  {message.sender.name.charAt(0)}
                                </span>
                              )}
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
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <div
                              className={`flex items-center gap-2 mt-1 ${
                                isOwnMessage ? "text-purple-50" : "text-slate-400"
                              }`}
                            >
                              <span className="text-xs">
                                {formatTime(message.createdAt)}
                              </span>
                              {isOwnMessage && (
                                <span>
                                  {message.isRead ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                          {isOwnMessage && (
                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold text-slate-600">
                                You
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  {translatedMessage && (
                    <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="h-3 w-3" />
                        <span className="font-bold">Translation:</span>
                      </div>
                      <p>{translatedMessage}</p>
                    </div>
                  )}
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        if (targetLanguage !== "en" && e.target.value.trim()) {
                          translateMessage(e.target.value, targetLanguage);
                        } else {
                          setTranslatedMessage("");
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
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
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-medium text-lg">
                    Select a conversation
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
