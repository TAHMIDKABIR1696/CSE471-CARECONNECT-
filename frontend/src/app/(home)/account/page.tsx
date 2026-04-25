"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import {
  Activity,
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
  Navigation,
} from "lucide-react";

interface ILiveSession {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  actualStart: string | null;
  actualEnd: string | null;
  gpsLogs?: Array<{ lat: number | null; lng: number | null; time: string }> | null;
  liveSession?: {
    status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
    lastUpdate?: string;
  } | null;
  parent?: { user: { name: string; email: string } };
  babysitter?: { user: { name: string; email: string } };
}

const hasValidCoordinates = (
  point: { lat: number | null; lng: number | null } | null
): point is { lat: number; lng: number } => {
  return point !== null && typeof point.lat === "number" && typeof point.lng === "number";
};

export default function AccountOverviewPage() {
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [liveSessions, setLiveSessions] = useState<ILiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch fresh user data to ensure we have the correct role
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isLoading && isAuthenticated) {
        try {
          const [profileResponse, liveSessionsResponse] = await Promise.all([
            proxy.get("/user/profile"),
            proxy.get("/sessions/live").catch(() => null),
          ]);

          if (profileResponse.data.success) {
            const userData = profileResponse.data.user;
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

          const liveSessionsData = liveSessionsResponse?.data?.sessions;
          setLiveSessions(Array.isArray(liveSessionsData) ? liveSessionsData : []);
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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getSessionProgress = (session: ILiveSession) => {
    const start = new Date(session.actualStart || session.startTime).getTime();
    const end = new Date(session.endTime).getTime();
    const plannedDuration = end - new Date(session.startTime).getTime();
    if (plannedDuration <= 0) return 0;

    const referenceTime =
      session.liveSession?.status === "PAUSED" && session.liveSession.lastUpdate
        ? new Date(session.liveSession.lastUpdate).getTime()
        : Date.now();

    return Math.min(100, Math.max(0, Math.round(((referenceTime - start) / plannedDuration) * 100)));
  };

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

      {(user?.role === "BABYSITTER" || user?.role === "PARENT") && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Quick Access
              </p>
              <h3 className="mt-2 text-lg font-bold text-slate-900">
                {user?.role === "BABYSITTER"
                  ? "Manage live sessions"
                  : "Track live sessions"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {user?.role === "BABYSITTER"
                  ? "Open the page where you can start, pause, resume, complete, or cancel sessions."
                  : "Open the page where you can monitor babysitting progress and location updates."}
              </p>
            </div>
            <a
              href="/account/sessions"
              className="shrink-0 inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
            >
              Open Sessions
            </a>
          </div>

          {user?.role === "BABYSITTER" && (
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Work Queue
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  Review job requests
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Check confirmed bookings and start a session when the visit begins.
                </p>
              </div>
              <a
                href="/account/bookings"
                className="shrink-0 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition"
              >
                Open Bookings
              </a>
            </div>
          )}
        </div>
      )}

      {liveSessions.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-500 animate-pulse" />
                Active Session Progress
              </h3>
              <p className="text-sm text-slate-500">
                Real-time updates for your current babysitting session.
              </p>
            </div>
            <a
              href="/account/sessions"
              className="text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              Open session board
            </a>
          </div>

          <div className="grid gap-4">
            {liveSessions.map((session) => {
              const otherParty = user?.role === "PARENT"
                ? session.babysitter?.user
                : session.parent?.user;
              const liveStatus = session.liveSession?.status || "ACTIVE";
              const progress = getSessionProgress(session);
              const lastKnownLocation = session.gpsLogs?.length
                ? session.gpsLogs[session.gpsLogs.length - 1]
                : null;
              const hasLatestCoordinates = hasValidCoordinates(lastKnownLocation);

              return (
                <div key={session.id} className="rounded-2xl border border-slate-100 p-4 md:p-5 bg-slate-50/80 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900">Session #{session.id}</h4>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          {liveStatus}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        {otherParty ? `With ${otherParty.name}` : "In progress"}
                      </p>
                    </div>
                    <div className="text-sm text-slate-600 flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      {progress}% complete
                    </div>
                  </div>

                  <div className="h-2 w-full rounded-full bg-white overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-emerald-500" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>Started {formatDate(session.actualStart || session.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>
                        {session.liveSession?.status === "PAUSED"
                          ? "Paused"
                          : "Running"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>
                        {hasLatestCoordinates
                          ? `${lastKnownLocation.lat.toFixed(5)}, ${lastKnownLocation.lng.toFixed(5)}`
                          : "Waiting for location"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                    Received payment approved via bKash.
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
