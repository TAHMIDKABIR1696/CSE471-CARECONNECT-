"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import {
  User,
  Calendar,
  ShieldCheck,
  Mail,
  MapPin,
  Phone,
  Star,
  Clock,
  CreditCard,
  Loader2,
} from "lucide-react";

export default function AccountOverviewPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch fresh user data to ensure we have the correct role
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoading && isAuthenticated) {
        try {
          const response = await proxy.get("/user/profile");
          if (response.data.success) {
            const userData = response.data.user;
            // Update localStorage with fresh data
            localStorage.setItem("user", JSON.stringify({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              isApproved: userData.isApproved,
              phoneNumber: userData.phoneNumber,
            }));
            setUser(userData);
          } else {
            setUser(authUser);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUser(authUser);
        } finally {
          setLoading(false);
        }
      } else if (!isLoading && !isAuthenticated) {
        router.push("/login");
      }
    };

    fetchUserData();
  }, [isAuthenticated, isLoading, router]);

  if (loading || isLoading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin text-purple-600 h-8 w-8 mx-auto" />
        <p className="text-slate-500 mt-2">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-slate-800 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Hello, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-purple-100 mt-2">
          Here is what's happening with your account today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Stats & Quick Info */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 p-3 rounded-xl">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">12</p>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Bookings
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-orange-50 p-3 rounded-xl">
                  <Star className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">4.9</p>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Rating
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">$450</p>
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Balance
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-400" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {/* Activity Item 1 */}
              <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                <div className="bg-purple-100 p-2.5 rounded-lg h-fit">
                  <Calendar className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Booking Confirmed
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Booking with Sarah for tomorrow at 10 AM.
                  </p>
                </div>
                <span className="ml-auto text-xs text-slate-400 font-medium">
                  2h ago
                </span>
              </div>
              {/* Activity Item 2 */}
              <div className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                <div className="bg-blue-100 p-2.5 rounded-lg h-fit">
                  <CreditCard className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Payment Received
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Received $50.00 via Stripe.
                  </p>
                </div>
                <span className="ml-auto text-xs text-slate-400 font-medium">
                  1d ago
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile Summary (Condensed) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-block relative">
                <div className="h-24 w-24 rounded-full bg-slate-100 mx-auto flex items-center justify-center border-4 border-white shadow-md">
                  <User className="h-10 w-10 text-slate-400" />
                </div>
                {user?.isApproved && (
                  <div className="absolute bottom-0 right-0 bg-green-500 p-1 rounded-full border-2 border-white">
                    <ShieldCheck className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-slate-900 mt-3">
                {user?.name || "User"}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                {user?.role === "ADMIN" && (
                  <ShieldCheck className="h-4 w-4 text-purple-600" />
                )}
                <p className="text-sm text-slate-500 font-medium capitalize">
                  {user?.role?.toUpperCase() || "USER"}
                </p>
              </div>

              <div className="text-left space-y-3 pt-4 border-t border-slate-50 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-purple-500" />{" "}
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-purple-500" />{" "}
                  <span>{user?.phoneNumber || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-purple-500" />{" "}
                  <span>Dhaka, Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
