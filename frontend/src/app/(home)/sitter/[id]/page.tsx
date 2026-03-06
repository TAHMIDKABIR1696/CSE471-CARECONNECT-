"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import {
  MapPin,
  Star,
  Briefcase,
  Clock,
  ShieldCheck,
  Calendar,
  Loader2,
} from "lucide-react";
import Navbar from "@/modules/home/components/navbar";

// Types
interface ISitterProfile {
  id: number;
  bio: string;
  hourlyRate: string;
  locationAddress: string;
  experienceYears: number;
  user: {
    name: string;
    isApproved: boolean;
  };
  availabilities: { dayOfWeek: string; startTime: string; endTime: string }[];
}

// ✅ Helper: Time Formatter (24h -> 12h AM/PM)
const formatTime = (timeString: string) => {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours));
  date.setMinutes(parseInt(minutes));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// ✅ Helper: Day Sorter Map
const dayOrder: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

export default function SitterDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [sitter, setSitter] = useState<ISitterProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Booking Form State
  const [booking, setBooking] = useState({
    startTime: "",
    endTime: "",
    note: "",
  });
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(0);

  // 1. Fetch Sitter Data
  useEffect(() => {
    const fetchSitter = async () => {
      try {
        setLoading(true);
        const response = await proxy.get(`/sitters/${params.id}`);
        if (response.data.success) {
          setSitter(response.data.sitter);
        } else {
          toast.error("Could not load sitter details.");
        }
      } catch (error: any) {
        console.error("Error fetching sitter:", error);
        toast.error(
          error.response?.data?.message || "Could not load sitter details."
        );
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchSitter();
  }, [params.id]);

  // 2. Calculate Cost
  useEffect(() => {
    if (booking.startTime && booking.endTime && sitter) {
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (hours > 0) {
        setEstimatedCost(Math.round(hours * parseFloat(sitter.hourlyRate)));
      } else {
        setEstimatedCost(0);
      }
    }
  }, [booking.startTime, booking.endTime, sitter]);

  // 3. Handle Booking
  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to book a sitter.");
      router.push("/login");
      return;
    }

    setIsBooking(true);
    try {
      // Convert datetime-local format to ISO string
      const startTimeISO = booking.startTime
        ? new Date(booking.startTime).toISOString()
        : "";
      const endTimeISO = booking.endTime
        ? new Date(booking.endTime).toISOString()
        : "";

      if (!startTimeISO || !endTimeISO) {
        toast.error("Please select both start and end times");
        setIsBooking(false);
        return;
      }

      const response = await proxy.post("/bookings", {
        babysitterId: sitter?.id,
        startTime: startTimeISO,
        endTime: endTimeISO,
        note: booking.note || "",
      });

      if (response.data.success) {
        toast.success("Booking request sent!");
        router.push("/account/bookings");
      }
    } catch (error: unknown) {
      console.error("Booking error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Booking failed. Please ensure you have a parent profile set up in Settings.");
      } else {
        toast.error("Booking failed. Please try again.");
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-purple-600" />
      </div>
    );
  if (!sitter)
    return <div className="text-center py-20">Sitter not found.</div>;

  // ✅ Sort availabilities before rendering
  const sortedAvailability = [...sitter.availabilities].sort(
    (a, b) => (dayOrder[a.dayOfWeek] || 99) - (dayOrder[b.dayOfWeek] || 99)
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex gap-6 items-start">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-slate-400 shrink-0">
                  {sitter.user.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                    {sitter.user.name}
                    {sitter.user.isApproved && (
                      <ShieldCheck className="h-6 w-6 text-purple-500" />
                    )}
                  </h1>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-purple-500" />{" "}
                      {sitter.locationAddress || "No location"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-purple-500" />{" "}
                      {sitter.experienceYears} Years Exp.
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-orange-500" /> New
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 mb-4">
                About Me
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {sitter.bio || "No bio description provided."}
              </p>
            </div>

            {/* Availability Schedule (Updated Display) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" /> Availability
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {sortedAvailability.length > 0 ? (
                  sortedAvailability.map((slot, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-center"
                    >
                      <p className="font-bold text-purple-800 text-sm capitalize">
                        {slot.dayOfWeek.toLowerCase()}
                      </p>
                      <p className="text-xs text-purple-600 mt-1 font-medium">
                        {formatTime(slot.startTime)} -{" "}
                        {formatTime(slot.endTime)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">
                    No specific schedule listed.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 sticky top-28">
              <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-2xl font-bold text-slate-900">
                    ৳{Math.round(parseFloat(sitter.hourlyRate))}
                  </span>
                  <span className="text-slate-500 text-sm"> / hour</span>
                </div>
                <div className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                  Available Now
                </div>
              </div>

              <form onSubmit={handleBookNow} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    onChange={(e) =>
                      setBooking({ ...booking, startTime: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    onChange={(e) =>
                      setBooking({ ...booking, endTime: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Note (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Any special instructions..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    onChange={(e) =>
                      setBooking({ ...booking, note: e.target.value })
                    }
                  />
                </div>

                {/* Cost Summary */}
                {estimatedCost > 0 && (
                  <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-200">
                    <span className="font-medium text-slate-600">
                      Total Est.
                    </span>
                    <span className="font-bold text-lg text-slate-900">
                      ৳{estimatedCost}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    <Calendar className="h-5 w-5" />
                  )}
                  Book Now
                </button>

                <p className="text-xs text-center text-slate-400 mt-2">
                  You won't be charged yet. Ideally wait for confirmation.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
