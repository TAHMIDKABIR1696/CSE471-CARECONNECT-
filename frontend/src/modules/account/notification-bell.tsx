"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import proxy from "@/lib/proxy";

interface NotificationItem {
  id: string;
  type: "BOOKING" | "SESSION" | "PAYMENT" | "SOS" | "MESSAGE" | "SYSTEM";
  title: string;
  body: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

const formatTimeAgo = (dateValue: string): string => {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadText = useMemo(() => {
    if (unreadCount > 99) return "99+";
    return `${unreadCount}`;
  }, [unreadCount]);

  const fetchUnreadCount = async () => {
    const response = await proxy.get("/notifications/unread-count");
    setUnreadCount(response.data.unreadCount || 0);
  };

  const fetchNotifications = async () => {
    const response = await proxy.get("/notifications?limit=8");
    setNotifications(response.data.notifications || []);
  };

  const refreshNotifications = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchUnreadCount(), fetchNotifications()]);
    } catch (error) {
      console.error("Notification fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotifications();

    const interval = setInterval(() => {
      refreshNotifications();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const markOneRead = async (id: string) => {
    try {
      await proxy.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark notification error:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await proxy.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notification error:", error);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
      >
        <Bell className="h-5 w-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadText}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">Notifications</h4>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-purple-700 hover:text-purple-800 inline-flex items-center gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark all
            </button>
          </div>

          <div className="max-h-96 overflow-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-slate-500">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.link || "/account/notifications"}
                  onClick={() => {
                    markOneRead(item.id);
                    setOpen(false);
                  }}
                  className={`block px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${
                    item.isRead ? "bg-white" : "bg-purple-50/40"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.body}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{formatTimeAgo(item.createdAt)}</p>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/account/notifications"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-center text-sm font-medium text-purple-700 hover:bg-purple-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
