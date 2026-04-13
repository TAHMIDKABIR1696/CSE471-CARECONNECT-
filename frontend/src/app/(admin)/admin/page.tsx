"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Clock,
  Loader2,
  MoreVertical,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import proxy from "@/lib/proxy";

// Types
interface IDashboardData {
  stats: {
    totalUsers: number;
    pendingSitters: number;
    activeBookings: number;
    totalRevenue: number;
  };
  recentActivity: any[];
}

interface IPendingUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<IDashboardData | null>(null);
  const [pendingUsers, setPendingUsers] = useState<IPendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Real Data Fetching (Parallel Requests)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          proxy.get("/admin/stats"),
          proxy.get("/admin/approvals"),
        ]);

        if (statsRes.data.success) setData(statsRes.data);
        if (pendingRes.data.success)
          setPendingUsers(pendingRes.data.users.slice(0, 5)); // Show top 5
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Loader2 className="animate-spin text-purple-600 h-10 w-10" />
      </div>
    );

  const statsList = [
    {
      title: "Total Users",
      value: data?.stats.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      trend: "Total Registered",
    },
    {
      title: "Pending Approvals",
      value: data?.stats.pendingSitters || 0,
      icon: UserCheck,
      color: "bg-orange-500",
      trend: "Action Needed",
    },
    {
      title: "Active Bookings",
      value: data?.stats.activeBookings || 0,
      icon: Calendar,
      color: "bg-purple-500",
      trend: "Currently Running",
    },
    {
      title: "Total Revenue",
      value: `৳${data?.stats.totalRevenue || 0}`,
      icon: DollarSign,
      color: "bg-purple-500",
      trend: "Lifetime Earnings",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 group-hover:text-purple-600 transition-colors">
                  {stat.title}
                </p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  {stat.value}
                </h3>
              </div>
              <div
                className={`p-3 rounded-xl ${stat.color} text-white shadow-lg shadow-blue-100 bg-opacity-90 group-hover:scale-110 transition-transform`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-400">
              <ArrowUpRight className="h-3 w-3 text-green-500" /> {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Pending Approvals Table (Real Data) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">
                Pending Approvals
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Babysitters waiting for verification
              </p>
            </div>
            <Link
              href="/admin/approvals"
              className="text-sm text-purple-600 font-bold hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Applied Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No pending approvals found.
                    </td>
                  </tr>
                ) : (
                  pendingUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500 uppercase">
                          {user.name.charAt(0)}
                        </div>
                        {user.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">{user.email}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/approvals?id=${user.id}`}
                          className="inline-flex items-center gap-1 text-purple-600 font-bold hover:underline bg-purple-50 px-3 py-1 rounded-md text-xs"
                        >
                          <Eye className="h-3 w-3" /> Review
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Recent Activity (Real Data) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg">Live Activity</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          <div className="space-y-6">
            {data?.recentActivity.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">
                No recent bookings.
              </p>
            ) : (
              data?.recentActivity.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex gap-4 items-start relative pl-4 border-l-2 border-slate-100 pb-1 last:pb-0"
                >
                  {/* Timeline Dot */}
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white"></div>

                  <div>
                    <p className="text-sm text-slate-800 leading-snug">
                      <span className="font-bold">
                        {booking.parent.user.name}
                      </span>{" "}
                      booked{" "}
                      <span className="font-bold text-purple-600">
                        {booking.babysitter.user.name}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                        ৳{booking.totalAmount}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          booking.status === "PENDING"
                            ? "bg-orange-100 text-orange-600"
                            : booking.status === "CONFIRMED"
                            ? "bg-green-100 text-green-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 mt-2 block flex items-center gap-1">
                      <Clock className="h-3 w-3" />{" "}
                      {new Date(booking.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
