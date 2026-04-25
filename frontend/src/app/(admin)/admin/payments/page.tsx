"use client";

import React, { useEffect, useMemo, useState } from "react";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import { CheckCircle2, Loader2, Search, XCircle } from "lucide-react";

interface IAdminPayment {
  id: string;
  transactionId: string;
  amount: number;
  method: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentDate: string | null;
  booking: {
    id: string;
    parent: { user: { name: string; email: string } };
    babysitter: { user: { name: string; email: string } };
  };
}

const getSenderNumber = (method: string) => {
  if (!method) return "N/A";
  if (!method.startsWith("BKASH:")) return method;
  return method.replace("BKASH:", "");
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error as { response?: { data?: { message?: string } } };
    return response.response?.data?.message || fallback;
  }

  return fallback;
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<IAdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await proxy.get("/payments");
      if (response.data.success) {
        setPayments(Array.isArray(response.data.payments) ? response.data.payments : []);
      }
    } catch (error: unknown) {
      console.error("Admin payments fetch error:", error);
      toast.error(getErrorMessage(error, "Failed to load payments"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const base = payments.filter((payment) => payment.method?.startsWith("BKASH:"));
    if (!query.trim()) return base;

    const needle = query.trim().toLowerCase();
    return base.filter((payment) => {
      return (
        payment.transactionId.toLowerCase().includes(needle) ||
        getSenderNumber(payment.method).toLowerCase().includes(needle) ||
        payment.booking.parent.user.name.toLowerCase().includes(needle) ||
        payment.booking.babysitter.user.name.toLowerCase().includes(needle)
      );
    });
  }, [payments, query]);

  const pendingCount = filteredPayments.filter((payment) => payment.status === "PENDING").length;

  const handleDecision = async (paymentId: string, action: "approve" | "reject") => {
    try {
      setActionLoadingId(paymentId);
      const endpoint = action === "approve" ? "approve" : "reject";
      const response = await proxy.put(`/payments/${paymentId}/${endpoint}`);

      if (response.data.success) {
        toast.success(action === "approve" ? "Payment approved" : "Payment rejected");
        await fetchPayments();
      }
    } catch (error: unknown) {
      console.error(`Payment ${action} error:`, error);
      toast.error(getErrorMessage(error, `Failed to ${action} payment`));
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manual bKash Payments</h1>
          <p className="text-sm text-slate-500">Review submitted sender numbers and Tx IDs, then approve or reject.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
          Pending: <span className="text-purple-600">{pendingCount}</span>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Tx ID, sender number, parent, babysitter"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Booking</th>
                <th className="px-6 py-4">Parent</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Sender Number</th>
                <th className="px-6 py-4">Tx ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No manual payment submissions found.
                  </td>
                </tr>
              )}

              {filteredPayments.map((payment) => {
                const statusStyle =
                  payment.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : payment.status === "FAILED"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700";

                const isPending = payment.status === "PENDING";
                return (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 font-semibold text-slate-800">#{payment.booking.id}</td>
                    <td className="px-6 py-4 text-slate-600">{payment.booking.parent.user.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">৳{Number(payment.amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-700">{getSenderNumber(payment.method)}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{payment.transactionId}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyle}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDecision(payment.id, "approve")}
                          disabled={!isPending || actionLoadingId === payment.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {actionLoadingId === payment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(payment.id, "reject")}
                          disabled={!isPending || actionLoadingId === payment.id}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {actionLoadingId === payment.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}