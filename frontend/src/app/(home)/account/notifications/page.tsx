"use client";

import { useEffect, useState } from "react";
import proxy from "@/lib/proxy";
import { Bell, CheckCheck } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: "BOOKING" | "SESSION" | "PAYMENT" | "SOS" | "MESSAGE" | "SYSTEM";
  isRead: boolean;
  createdAt: string;
  link?: string | null;
}

const formatTime = (value: string): string => {
  const date = new Date(value);
  return date.toLocaleString();
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    const response = await proxy.get("/notifications?limit=100");
    setNotifications(response.data.notifications || []);
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchNotifications();
      } catch (error) {
        console.error("Fetch notifications failed:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const markOneRead = async (id: string) => {
    try {
      await proxy.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isRead: true } : item))
      );
    } catch (error) {
      console.error("Mark one read failed:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await proxy.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.error("Mark all read failed:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-purple-600" />
          <h1 className="text-lg font-bold text-slate-800">Notifications</h1>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-700 hover:text-purple-800"
        >
          <CheckCheck className="h-4 w-4" /> Mark all as read
        </button>
      </div>

      {loading ? (
        <p className="p-6 text-slate-500">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p className="p-6 text-slate-500">No notifications yet.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => markOneRead(item.id)}
              className={`w-full text-left p-5 hover:bg-slate-50 transition ${
                item.isRead ? "bg-white" : "bg-purple-50/40"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.body}</p>
                  <p className="text-xs text-slate-400 mt-2">{formatTime(item.createdAt)}</p>
                </div>
                {!item.isRead && (
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-purple-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
