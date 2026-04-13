"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  Video,
  Copy,
  ExternalLink,
  Loader2,
  Calendar,
  Clock,
  User,
} from "lucide-react";

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  status: string;
  meetingLink: string | null;
  parent?: {
    user: {
      name: string;
      email: string;
    };
  };
  babysitter?: {
    user: {
      name: string;
      email: string;
    };
  };
}

export default function VideoCallPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingLink, setCreatingLink] = useState<number | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await proxy.get("/bookings");
      if (response.data.success && response.data.bookings) {
        // Filter only confirmed bookings
        const bookingsArray = Array.isArray(response.data.bookings) 
          ? response.data.bookings 
          : [];
        const confirmedBookings = bookingsArray.filter(
          (b: Booking) =>
            b.status === "CONFIRMED" || b.status === "LIVE" || b.status === "COMPLETED"
        );
        setBookings(confirmedBookings);
      } else {
        setBookings([]);
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const createMeetingLink = async (bookingId: number) => {
    try {
      setCreatingLink(bookingId);
      const response = await proxy.post("/video/meeting", {
        bookingId: bookingId,
      });

      if (response.data.success) {
        toast.success("Meeting link created!");
        // Update the booking in the list
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, meetingLink: response.data.meetingLink }
              : b
          )
        );
      }
    } catch (error: any) {
      console.error("Error creating meeting link:", error);
      toast.error(
        error.response?.data?.message || "Failed to create meeting link"
      );
    } finally {
      setCreatingLink(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard!");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-purple-600 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Video className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-black text-slate-900">Video Calls</h1>
        </div>
        <p className="text-slate-600">
          Manage video meeting links for your confirmed bookings
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
          <Video className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">
            No confirmed bookings
          </h3>
          <p className="text-slate-400 mt-1">
            You need confirmed bookings to create video meeting links.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const otherParty =
              user?.role === "PARENT"
                ? booking.babysitter?.user
                : booking.parent?.user;

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Booking Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {otherParty?.name || "Unknown"}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {otherParty?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-purple-600" />
                        <span>{formatDate(booking.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span>
                          {Math.round(
                            (new Date(booking.endTime).getTime() -
                              new Date(booking.startTime).getTime()) /
                              3600000
                          )}{" "}
                          hours
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : booking.status === "LIVE"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Meeting Link Display */}
                    {booking.meetingLink && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Video className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-bold text-slate-700 uppercase">
                            Meeting Link
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={booking.meetingLink}
                            readOnly
                            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700"
                          />
                          <button
                            onClick={() => copyToClipboard(booking.meetingLink!)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Copy link"
                          >
                            <Copy className="h-4 w-4 text-slate-600" />
                          </button>
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                            title="Open meeting"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2">
                    {!booking.meetingLink ? (
                      <button
                        onClick={() => createMeetingLink(booking.id)}
                        disabled={creatingLink === booking.id}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {creatingLink === booking.id ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Video className="h-4 w-4" />
                            Create Meeting Link
                          </>
                        )}
                      </button>
                    ) : (
                      <a
                        href={booking.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Join Meeting
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Video meeting links are automatically shared via
          email to both parties. You can use these links to join video calls
          during your scheduled booking time.
        </p>
      </div>
    </div>
  );
}

