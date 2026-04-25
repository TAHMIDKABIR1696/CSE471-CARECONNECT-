"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SessionLocationMap from "@/components/location/session-location-map";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Navigation,
  PauseCircle,
  PlayCircle,
  StopCircle,
} from "lucide-react";

interface ILocation {
  lat: number;
  lng: number;
}

interface ILiveSession {
  status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  startTime: string;
  endTime: string | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastUpdate?: string;
}

interface ISession {
  id: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "LIVE" | "COMPLETED";
  startTime: string;
  endTime: string;
  actualStart: string | null;
  actualEnd: string | null;
  gpsLogs: Array<{ lat: number | null; lng: number | null; time: string }> | null;
  liveSession?: ILiveSession | null;
  parent?: { user: { name: string; email: string } };
  babysitter?: { user: { name: string; email: string } };
}

const hasValidCoordinates = (
  point: { lat: number | null; lng: number | null } | null
): point is { lat: number; lng: number } => {
  return point !== null && typeof point.lat === "number" && typeof point.lng === "number";
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error as { response?: { data?: { message?: string } } };
    return response.response?.data?.message || fallback;
  }

  return fallback;
};

const SESSION_STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PAUSED: "bg-amber-100 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function SessionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [liveSessions, setLiveSessions] = useState<ISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<ILocation | null>(null);
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchLiveSessions();
    fetchSessionHistory();

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [user, authLoading, router]);

  const fetchLiveSessions = async () => {
    try {
      const response = await proxy.get("/sessions/live");
      if (response.data.success && response.data.sessions) {
        setLiveSessions(Array.isArray(response.data.sessions) ? response.data.sessions : []);
      }
    } catch (error) {
      console.error("Fetch Live Sessions Error:", error);
    }
  };

  const fetchSessionHistory = async () => {
    try {
      setLoading(true);
      const response = await proxy.get("/bookings");
      if (response.data.success && response.data.bookings) {
        const allBookings = Array.isArray(response.data.bookings) ? response.data.bookings : [];
        const sessionHistory = allBookings.filter((booking: ISession) =>
          ["CONFIRMED", "LIVE", "COMPLETED", "CANCELLED"].includes(booking.status)
        );
        setSessions(sessionHistory);
      }
    } catch (error) {
      console.error("Fetch Sessions Error:", error);
      toast.error("Failed to load session history");
    } finally {
      setLoading(false);
    }
  };

  const refreshSessionData = async () => {
    await Promise.all([fetchLiveSessions(), fetchSessionHistory()]);
  };

  const requestCurrentLocation = async () => {
    if (!navigator.geolocation) {
      return null;
    }

    return new Promise<ILocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(nextLocation);
          resolve(nextLocation);
        },
        () => {
          // Location permission can be denied by user; fail silently.
          resolve(null);
        }
      );
    });
  };

  const updateSessionStatus = async (bookingId: string, status: "PAUSE" | "RESUME" | "COMPLETE" | "CANCEL") => {
    setActionLoading(bookingId);
    try {
      const response = await proxy.patch(`/sessions/${bookingId}/status`, {
        status,
        latitude: currentLocation?.lat,
        longitude: currentLocation?.lng,
      });

      if (response.data.success) {
        const messageMap: Record<string, string> = {
          PAUSE: "Session paused successfully!",
          RESUME: "Session resumed successfully!",
          COMPLETE: "Session completed successfully!",
          CANCEL: "Session cancelled successfully!",
        };
        toast.success(messageMap[status]);

        if (status === "PAUSE" || status === "COMPLETE" || status === "CANCEL") {
          if (trackingIntervalRef.current) {
            clearInterval(trackingIntervalRef.current);
            trackingIntervalRef.current = null;
          }
        }

        if (status === "RESUME") {
          startLocationTracking(bookingId);
        }

        await refreshSessionData();
      }
    } catch (error: unknown) {
      console.error("Update Session Status Error:", error);
      toast.error(getErrorMessage(error, "Failed to update session status"));
    } finally {
      setActionLoading(null);
    }
  };

  const startSession = async (bookingId: string) => {
    const location = currentLocation || (await requestCurrentLocation());

    setActionLoading(bookingId);
    try {
      const response = await proxy.post("/sessions/start", {
        bookingId,
        latitude: location?.lat,
        longitude: location?.lng,
      });

      if (response.data.success) {
        toast.success("Session started successfully!");
        await refreshSessionData();
        startLocationTracking(bookingId);
      }
    } catch (error: unknown) {
      console.error("Start Session Error:", error);
      toast.error(getErrorMessage(error, "Failed to start session"));
    } finally {
      setActionLoading(null);
    }
  };

  const updateLocation = async (bookingId: string) => {
    const location = currentLocation || (await requestCurrentLocation());

    if (!location) return;

    try {
      await proxy.post("/sessions/location", {
        bookingId,
        latitude: location.lat,
        longitude: location.lng,
      });
    } catch (error) {
      console.error("Update Location Error:", error);
    }
  };

  const startLocationTracking = (bookingId: string) => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCurrentLocation(location);
            updateLocation(bookingId);
          },
          () => {
            // Tracking may fail when permission is revoked; keep session running.
          }
        );
      }
    }, 30000);

    trackingIntervalRef.current = interval;
  };

  const calculateDuration = (session: ISession) => {
    const referenceStart = session.actualStart || session.startTime;
    if (!referenceStart) return "N/A";

    const start = new Date(referenceStart);
    const referenceEnd =
      session.actualEnd
        ? new Date(session.actualEnd)
        : session.liveSession?.status === "PAUSED" && session.liveSession.lastUpdate
          ? new Date(session.liveSession.lastUpdate)
          : new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(referenceEnd.getTime())) {
      return "N/A";
    }

    const durationMs = referenceEnd.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getProgressPercent = (session: ISession) => {
    const plannedStart = new Date(session.startTime).getTime();
    const plannedEnd = new Date(session.endTime).getTime();
    const plannedDuration = plannedEnd - plannedStart;

    if (plannedDuration <= 0) return 0;

    const actualStart = new Date(session.actualStart || session.startTime).getTime();
    const referenceTime =
      session.liveSession?.status === "PAUSED" && session.liveSession.lastUpdate
        ? new Date(session.liveSession.lastUpdate).getTime()
        : session.actualEnd
          ? new Date(session.actualEnd).getTime()
          : Date.now();

    const elapsed = Math.max(0, referenceTime - actualStart);
    return Math.min(100, Math.round((elapsed / plannedDuration) * 100));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isParent = user?.role === "PARENT";
  const isBabysitter = user?.role === "BABYSITTER";

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-purple-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-slate-800 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Live Session Tracking
        </h1>
        <p className="text-purple-100 mt-2">
          {isParent
            ? "Track your babysitter's location and session status in real time"
            : "Manage live sessions with pause, resume, complete, and cancel controls"}
        </p>
      </div>

      {liveSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500 animate-pulse" />
            Active Sessions
          </h2>

          {liveSessions.map((session) => {
            const otherParty = isParent ? session.babysitter?.user : session.parent?.user;
            const liveStatus = session.liveSession?.status || "ACTIVE";
            const liveStatusClass = SESSION_STATUS_STYLES[liveStatus] || "bg-slate-100 text-slate-600 border-slate-200";
            const latestLocation = session.gpsLogs && session.gpsLogs.length > 0 ? session.gpsLogs[session.gpsLogs.length - 1] : null;
            const hasLatestCoordinates = hasValidCoordinates(latestLocation);
            const progress = getProgressPercent(session);

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl shadow-sm border-2 border-red-200 p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Activity className="h-5 w-5 text-red-600 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          Session #{session.id}
                        </h3>
                        {otherParty && (
                          <p className="text-sm text-slate-600">
                            {isParent ? "Babysitter" : "Parent"}: {otherParty.name}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${liveStatusClass}`}>
                        {liveStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{formatDate(session.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">{calculateDuration(session)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Navigation className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">Progress: {progress}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">
                          {session.gpsLogs?.length || 0} location updates
                        </span>
                      </div>
                    </div>

                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {latestLocation && (
                      <div className="mt-4 space-y-3">
                        <SessionLocationMap
                          title="Last Known Location"
                          subtitle="OpenStreetMap preview of the newest session route point."
                          points={session.gpsLogs ?? []}
                        />

                        {hasLatestCoordinates ? (
                          <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 md:flex-row md:items-center">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-purple-600" />
                              <span className="text-sm text-slate-700">
                                {latestLocation.lat.toFixed(6)}, {latestLocation.lng.toFixed(6)}
                              </span>
                            </div>
                            <a
                              href={`https://www.google.com/maps?q=${latestLocation.lat},${latestLocation.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-600 hover:underline md:ml-auto"
                            >
                              View on Map
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            <span>Location unavailable for this update</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {isBabysitter && (
                    <div className="flex flex-col gap-2 lg:min-w-[220px]">
                      {liveStatus === "ACTIVE" && (
                        <>
                          <button
                            onClick={() => updateSessionStatus(session.id, "PAUSE")}
                            disabled={actionLoading === session.id}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                          >
                            {actionLoading === session.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <PauseCircle className="h-5 w-5" />
                            )}
                            Pause Session
                          </button>
                          <button
                            onClick={() => updateSessionStatus(session.id, "COMPLETE")}
                            disabled={actionLoading === session.id}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            Complete Session
                          </button>
                        </>
                      )}

                      {liveStatus === "PAUSED" && (
                        <>
                          <button
                            onClick={() => updateSessionStatus(session.id, "RESUME")}
                            disabled={actionLoading === session.id}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                          >
                            {actionLoading === session.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <PlayCircle className="h-5 w-5" />
                            )}
                            Resume Session
                          </button>
                          <button
                            onClick={() => updateSessionStatus(session.id, "COMPLETE")}
                            disabled={actionLoading === session.id}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-5 w-5" />
                            Complete Session
                          </button>
                        </>
                      )}

                      {(liveStatus === "ACTIVE" || liveStatus === "PAUSED") && (
                        <button
                          onClick={() => updateSessionStatus(session.id, "CANCEL")}
                          disabled={actionLoading === session.id}
                          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2 justify-center disabled:opacity-50"
                        >
                          <StopCircle className="h-5 w-5" />
                          Cancel Session
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isBabysitter && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Ready to Start</h2>
          {sessions.filter((session) => session.status === "CONFIRMED").length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
              <p className="text-slate-500">No confirmed bookings available to start right now.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions
                .filter((session) => session.status === "CONFIRMED")
                .map((session) => {
                  const parent = session.parent?.user;
                  return (
                    <div
                      key={session.id}
                      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-slate-900">Session #{session.id}</h3>
                            {parent && <span className="text-sm text-slate-600">with {parent.name}</span>}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(session.startTime)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>to {formatDate(session.endTime)}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => startSession(session.id)}
                          disabled={actionLoading === session.id}
                          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
                        >
                          {actionLoading === session.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <PlayCircle className="h-5 w-5" />
                          )}
                          Start Session
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Session History</h2>
        {sessions.filter((session) => session.status === "COMPLETED" || session.status === "CANCELLED").length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No session history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions
              .filter((session) => session.status === "COMPLETED" || session.status === "CANCELLED")
              .map((session) => {
                const otherParty = isParent ? session.babysitter?.user : session.parent?.user;
                const liveStatus = session.liveSession?.status || session.status;
                const liveStatusClass = SESSION_STATUS_STYLES[liveStatus] || "bg-slate-100 text-slate-600 border-slate-200";
                const latestLocation = session.gpsLogs && session.gpsLogs.length > 0 ? session.gpsLogs[session.gpsLogs.length - 1] : null;
                const hasLatestCoordinates = hasValidCoordinates(latestLocation);

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h3 className="font-bold text-lg text-slate-900">Session #{session.id}</h3>
                          {otherParty && <span className="text-sm text-slate-600">with {otherParty.name}</span>}
                          <span className={`px-3 py-1 text-xs font-bold rounded-full border ${liveStatusClass}`}>
                            {liveStatus}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{formatDate(session.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>Duration: {calculateDuration(session)}</span>
                          </div>
                          {session.actualStart && (
                            <div className="flex items-center gap-2">
                              <PlayCircle className="h-4 w-4 text-slate-400" />
                              <span>Started: {formatDate(session.actualStart)}</span>
                            </div>
                          )}
                          {session.actualEnd && (
                            <div className="flex items-center gap-2">
                              <StopCircle className="h-4 w-4 text-slate-400" />
                              <span>Ended: {formatDate(session.actualEnd)}</span>
                            </div>
                          )}
                        </div>

                        {latestLocation && (
                          <div className="mt-4 space-y-3">
                            <SessionLocationMap
                              title="Last Known Location"
                              subtitle="OpenStreetMap preview of the newest session route point."
                              points={session.gpsLogs ?? []}
                            />

                            {hasLatestCoordinates ? (
                              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4">
                                <MapPin className="h-4 w-4 text-purple-600" />
                                <span className="text-sm text-slate-700">
                                  {latestLocation.lat.toFixed(6)}, {latestLocation.lng.toFixed(6)}
                                </span>
                                <a
                                  href={`https://www.google.com/maps?q=${latestLocation.lat},${latestLocation.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-purple-600 hover:underline ml-auto"
                                >
                                  View on Map
                                </a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <span>Location unavailable for this update</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
