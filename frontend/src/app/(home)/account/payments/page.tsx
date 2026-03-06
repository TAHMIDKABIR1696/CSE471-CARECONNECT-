"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Download,
  Calendar,
  User,
  DollarSign,
  Hash,
} from "lucide-react";

interface IPayment {
  id: number;
  transactionId: string;
  amount: number;
  currency: string;
  method: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentDate: string | null;
  createdAt: string;
  booking: {
    id: number;
    startTime: string;
    endTime: string;
    babysitter?: {
      user: {
        name: string;
        email: string;
      };
    };
    parent?: {
      user: {
        name: string;
        email: string;
      };
    };
  };
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<IPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "COMPLETED" | "PENDING" | "FAILED">("ALL");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await proxy.get("/payments");
      if (response.data.success && response.data.payments) {
        setPayments(Array.isArray(response.data.payments) ? response.data.payments : []);
      } else {
        setPayments([]);
      }
    } catch (error: any) {
      console.error("Fetch Payments Error:", error);
      toast.error(error.response?.data?.message || "Failed to load payment history");
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === "ALL") return true;
    return payment.status === filter;
  });

  const totalCompleted = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "FAILED":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-bold";
    switch (status) {
      case "COMPLETED":
        return `${baseClasses} bg-green-100 text-green-700`;
      case "FAILED":
        return `${baseClasses} bg-red-100 text-red-700`;
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case "REFUNDED":
        return `${baseClasses} bg-blue-100 text-blue-700`;
      default:
        return `${baseClasses} bg-slate-100 text-slate-700`;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBookingDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
          <CreditCard className="h-8 w-8" />
          Payment History
        </h1>
        <p className="text-purple-100 mt-2">
          Track all your payment transactions and receipts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-xl">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{payments.length}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Total Payments
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {payments.filter((p) => p.status === "COMPLETED").length}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                Completed
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                ৳{totalCompleted.toFixed(2)}
              </p>
              <p className="text-xs font-semibold text-slate-400 uppercase">
                {isParent ? "Total Paid" : "Total Earned"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {(["ALL", "COMPLETED", "PENDING", "FAILED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                filter === status
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No payments found</p>
            <p className="text-slate-400 text-sm mt-1">
              {filter === "ALL"
                ? "You haven't made any payments yet."
                : `No ${filter.toLowerCase()} payments.`}
            </p>
          </div>
        ) : (
          filteredPayments.map((payment) => {
            const otherParty = isParent
              ? payment.booking.babysitter?.user
              : payment.booking.parent?.user;

            return (
              <div
                key={payment.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Payment Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getStatusIcon(payment.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-900">
                            ৳{payment.amount.toFixed(2)}
                          </h3>
                          <span className={getStatusBadge(payment.status)}>
                            {payment.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">{payment.transactionId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-slate-400" />
                            <span>{payment.method}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>Booking: {formatBookingDate(payment.booking.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>
                              {payment.status === "COMPLETED"
                                ? `Paid: ${formatDate(payment.paymentDate)}`
                                : `Created: ${formatDate(payment.createdAt)}`}
                            </span>
                          </div>
                        </div>

                        {otherParty && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {isParent ? "Babysitter" : "Parent"}:{" "}
                              <span className="font-medium">{otherParty.name}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2">
                    {payment.status === "COMPLETED" && (
                      <button
                        onClick={() => {
                          // TODO: Generate and download receipt
                          toast.success("Receipt download feature coming soon!");
                        }}
                        className="px-4 py-2 text-sm font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

