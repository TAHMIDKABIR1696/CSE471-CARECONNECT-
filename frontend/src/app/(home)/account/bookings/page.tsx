"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import StripePaymentModal from "@/components/payment/stripe-payment-modal";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  Loader2,
  CreditCard,
  MessageCircle,
} from "lucide-react";

// Types (একটু বড় হবে কারণ রিলেশন ডাটা আছে)
interface IBooking {
  id: number;
  startTime: string;
  endTime: string;
  totalAmount?: number | string; // Backend uses totalAmount
  totalCost?: number | string; // Legacy field
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED" | "LIVE";
  note?: string;
  payment?: {
    id: number;
    status: string;
    transactionId: string;
  };
  // Parent এর জন্য Sitter ডাটা
  babysitter?: {
    id: number;
    user: { name: string; email: string };
  };
  // Sitter এর জন্য Parent ডাটা
  parent?: {
    id: number;
    user: { name: string; email: string; phoneNumber: string };
  };
}

export default function BookingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  // Fetch Bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await proxy.get("/bookings");
      console.log("Bookings response:", response.data); // Debug log
      if (response.data.success && response.data.bookings) {
        const bookingsArray = Array.isArray(response.data.bookings) 
          ? response.data.bookings 
          : [];
        console.log("Bookings array:", bookingsArray); // Debug log
        setBookings(bookingsArray);
      } else {
        console.log("No bookings found or invalid response");
        setBookings([]);
      }
    } catch (error: unknown) {
      console.error("Fetch Error", error);
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data); // Debug log
        toast.error(error.response?.data?.message || "Failed to load bookings");
      } else {
        toast.error("Failed to load bookings");
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePaymentSuccess = () => {
    // Refresh bookings after successful payment
    fetchBookings();
    toast.success("Payment completed successfully!");
  };

  const openPaymentModal = (booking: IBooking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  // Handle Status Change (Accept/Reject/Cancel)
  const handleStatusUpdate = async (id: number, newStatus: IBooking["status"]) => {
    if (
      !confirm(
        `Are you sure you want to ${newStatus.toLowerCase()} this booking?`
      )
    )
      return;

    setActionLoading(id);
    try {
      await proxy.patch(`/bookings/${id}`, { status: newStatus });
      toast.success(`Booking ${newStatus.toLowerCase()} successfully!`);

      // UI আপডেট (Reload না করে)
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (error: unknown) {
      console.error("Update error:", error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Action failed");
      } else {
        toast.error("Action failed");
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Helper: Status Badge Color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "REJECTED":
        return "bg-red-50 text-red-600 border-red-100";
      case "CANCELLED":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // Helper: Format Date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-purple-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-purple-600" />
            {user?.role === "PARENT" ? "My Bookings" : "Job Requests"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your upcoming schedules and history.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {bookings.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No bookings found.</p>
          </div>
        )}

        {bookings.map((booking) => {
          const isParent = user?.role === "PARENT";
          const otherParty = isParent
            ? booking.babysitter?.user
            : booking.parent?.user;

          return (
            <div
              key={booking.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* Left: Info */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                    isParent
                      ? "bg-purple-50 text-purple-600"
                      : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  {otherParty?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    {otherParty?.name}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(booking.startTime)}
                  </p>
                  <div className="text-xs text-slate-400 mt-1">
                    Price: ৳{Number(booking.totalAmount || booking.totalCost || 0)} • Duration:{" "}
                    {Math.round(
                      (new Date(booking.endTime).getTime() -
                        new Date(booking.startTime).getTime()) /
                        3600000
                    )}{" "}
                    hrs
                  </div>
                </div>
              </div>

              {/* Right: Status & Actions */}
              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>

                <div className="flex gap-2">
                  {/* বাবysitter Actions: Accept / Reject */}
                  {!isParent && booking.status === "PENDING" && (
                    <>
                      <button
                        disabled={actionLoading === booking.id}
                        onClick={() =>
                          handleStatusUpdate(booking.id, "REJECTED")
                        }
                        className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        disabled={actionLoading === booking.id}
                        onClick={() =>
                          handleStatusUpdate(booking.id, "CONFIRMED")
                        }
                        className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {actionLoading === booking.id ? (
                          <Loader2 className="animate-spin h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        Accept Job
                      </button>
                    </>
                  )}

                  {/* Parent Actions: Cancel */}
                  {isParent && booking.status === "PENDING" && (
                    <button
                      disabled={actionLoading === booking.id}
                      onClick={() =>
                        handleStatusUpdate(booking.id, "CANCELLED")
                      }
                      className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Cancel Request
                    </button>
                  )}

                  {/* Contact Info (Only if Confirmed) */}
                  {booking.status === "CONFIRMED" && otherParty && (
                    <div className="text-sm text-right">
                      <p className="text-slate-900 font-bold">
                        {otherParty.email}
                      </p>
                      {!isParent && booking.parent?.user?.phoneNumber && (
                        <p className="text-purple-600">
                          {booking.parent.user.phoneNumber}
                        </p>
                      )}
                    </div>
                  )}

                  {["CONFIRMED", "LIVE", "COMPLETED"].includes(booking.status) && (
                    <button
                      onClick={() => router.push(`/account/messages?bookingId=${booking.id}`)}
                      className="px-4 py-2 text-xs font-bold text-white bg-slate-700 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <MessageCircle className="h-3 w-3" />
                      Message {isParent ? "Babysitter" : "Parent"}
                    </button>
                  )}
                   
                  {/* Payment Button for Confirmed Bookings (Parent Only) */}
                  {isParent &&
                    booking.status === "CONFIRMED" &&
                    !booking.payment && (
                      <button
                        onClick={() => openPaymentModal(booking)}
                        className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CreditCard className="h-3 w-3" />
                        Pay Now
                      </button>
                    )}

                  {/* Payment Status */}
                  {booking.payment && (
                    <div className="text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.payment.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : booking.payment.status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        Payment: {booking.payment.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stripe Payment Modal */}
      {selectedBooking && (
        <StripePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          amount={Number(selectedBooking.totalAmount || selectedBooking.totalCost || 0)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
