"use client";

import React, { useEffect, useState } from "react";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  Calendar,
  Clock,
  DollarSign,
  Search,
  Filter,
  Loader2,
  MoreHorizontal,
  XCircle,
  CheckCircle2,
  Edit,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await proxy.get("/admin/bookings");
      if (res.data.success) {
        setBookings(res.data.bookings || []);
        setFiltered(res.data.bookings || []);
      }
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (statusFilter === "ALL") {
      setFiltered(bookings);
    } else {
      setFiltered(bookings.filter((b) => b.status === statusFilter));
    }
  }, [statusFilter, bookings]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200";
      case "PENDING":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "LIVE":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "REJECTED":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const handleStatusUpdate = (booking: any, status: string) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setReason("");
    setShowStatusDialog(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;

    try {
      setUpdating(true);
      const response = await proxy.patch(
        `/admin/bookings/${selectedBooking.id}/status`,
        {
          status: newStatus,
          reason: reason || undefined,
        }
      );

      if (response.data.success) {
        toast.success(`Booking status updated to ${newStatus}`);
        setShowStatusDialog(false);
        setSelectedBooking(null);
        setNewStatus("");
        setReason("");
        // Refresh bookings
        fetchBookings();
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setUpdating(false);
    }
  };

  const getAvailableStatuses = (currentStatus: string) => {
    const allStatuses = [
      "PENDING",
      "CONFIRMED",
      "REJECTED",
      "CANCELLED",
      "LIVE",
      "COMPLETED",
    ];
    return allStatuses.filter((s) => s !== currentStatus);
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-purple-600 h-8 w-8" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Booking Management
          </h1>
          <p className="text-slate-500 text-sm">
            Monitor and manage all service requests.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-3 px-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-bold uppercase">
              Total Volume
            </p>
            <p className="text-xl font-bold text-slate-800">
              ৳
              {bookings.reduce(
                (acc, curr) => acc + Number(curr.totalAmount),
                0
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Parent or Sitter name..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none cursor-pointer w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Bookings</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Parent / Sitter</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filtered.map((booking) => (
                <tr
                  key={booking.id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <span className="text-purple-600 text-[10px] uppercase">
                          P:
                        </span>{" "}
                        {booking.parent.user.name}
                      </span>
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <span className="text-orange-600 text-[10px] uppercase">
                          S:
                        </span>{" "}
                        {booking.babysitter.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600 text-xs space-y-1">
                      <p className="flex items-center gap-1 font-medium text-slate-800">
                        <Calendar className="h-3 w-3" />{" "}
                        {new Date(booking.startTime).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />{" "}
                        {new Date(booking.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900">
                      ৳{Number(booking.totalAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="p-2 hover:bg-slate-100 rounded-lg outline-none transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(booking, "CONFIRMED")}
                          disabled={booking.status === "CONFIRMED"}
                          className="text-xs font-bold text-green-600 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-2" />
                          Confirm Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(booking, "CANCELLED")}
                          disabled={booking.status === "CANCELLED"}
                          className="text-xs font-bold text-red-600 cursor-pointer"
                        >
                          <XCircle className="h-3 w-3 mr-2" />
                          Cancel Booking
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(booking, "COMPLETED")}
                          disabled={booking.status === "COMPLETED"}
                          className="text-xs font-bold text-blue-600 cursor-pointer"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-2" />
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(booking, "PENDING")}
                          disabled={booking.status === "PENDING"}
                          className="text-xs font-bold text-orange-600 cursor-pointer"
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Reset to Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(booking, "REJECTED")}
                          disabled={booking.status === "REJECTED"}
                          className="text-xs font-bold text-red-600 cursor-pointer"
                        >
                          <AlertCircle className="h-3 w-3 mr-2" />
                          Reject Booking
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Booking Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the booking status from{" "}
              <strong>{selectedBooking?.status}</strong> to{" "}
              <strong>{newStatus}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for status change..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
              />
            </div>
            {selectedBooking && (
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="font-bold text-slate-700 mb-1">Booking Details:</p>
                <p className="text-slate-600">
                  Parent: {selectedBooking.parent?.user?.name}
                </p>
                <p className="text-slate-600">
                  Sitter: {selectedBooking.babysitter?.user?.name}
                </p>
                <p className="text-slate-600">
                  Amount: ৳{Number(selectedBooking.totalAmount)}
                </p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusUpdate}
              disabled={updating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {updating ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
