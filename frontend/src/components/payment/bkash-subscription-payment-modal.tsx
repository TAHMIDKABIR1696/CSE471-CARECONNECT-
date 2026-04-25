"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import proxy from "@/lib/proxy";
import { X, Smartphone, Loader2 } from "lucide-react";

interface BkashSubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  amount: number;
  onSuccess: () => void;
}

const BKASH_RECEIVER_NUMBER = "01XXXXXXXXX";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error as { response?: { data?: { message?: string } } };
    return response.response?.data?.message || fallback;
  }

  return fallback;
};

export default function BkashSubscriptionPaymentModal({
  isOpen,
  onClose,
  planName,
  amount,
  onSuccess,
}: BkashSubscriptionPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [senderNumber, setSenderNumber] = useState("");
  const [txId, setTxId] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!senderNumber.trim() || !txId.trim()) {
      toast.error("Sender number and Tx ID are required");
      return;
    }

    try {
      setLoading(true);
      const response = await proxy.post("/subscription-payments", {
        planName,
        amount,
        senderNumber: senderNumber.trim(),
        txId: txId.trim(),
      });

      if (response.data.success) {
        toast.success(`bKash payment for ${planName} submitted. Awaiting admin approval.`);
        setSenderNumber("");
        setTxId("");
        onSuccess();
        onClose();
      }
    } catch (error: unknown) {
      console.error("Subscription payment submit error:", error);
      toast.error(getErrorMessage(error, "Failed to submit subscription payment"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Smartphone className="h-5 w-5 text-pink-600" />
              bKash Subscription Payment
            </h2>
            <p className="mt-1 text-sm text-slate-500">Upgrade to {planName} plan.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            disabled={loading}
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="rounded-xl border border-pink-100 bg-pink-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-pink-700">Pay To bKash Number</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{BKASH_RECEIVER_NUMBER}</p>
            <p className="mt-2 text-sm text-slate-600">Amount: ৳{amount.toFixed(2)}</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Your Sender Number</label>
            <input
              type="text"
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">bKash Tx ID</label>
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value.toUpperCase())}
              placeholder="Transaction ID"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-3 font-bold text-white transition-colors hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit For Approval"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
