"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import proxy from "@/lib/proxy";
import toast from "react-hot-toast";
import {
  PlayCircle,
  PauseCircle,
  StopCircle,
  MapPin,
  Clock,
  Calendar,
  Navigation,
  Loader2,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ISession {
  id: number;
  status: string;
  startTime: string;
  endTime: string;
  actualStart: string | null;
  actualEnd: string | null;
  gpsLogs: Array<{ lat: number; lng: number; time: string }> | null;
  parent?: { user: { name: string; email: string } };
  babysitter?: { user: { name: string; email: string } };
}

interface ILocation {
  lat: number;
  lng: number;
}

export default function SessionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<ISession[]>([]);
  const [liveSessions, setLiveSessions] = useState<ISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingInterval, setTrackingInterval] = useState<NodeJS.Timeout | null>(null);
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

    // Prevent re-fetching on every render
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchLiveSessions();
    fetchSessionHistory();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Location error:", error);
          toast.error("Location access denied. Please enable location services.");
        }
      );
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchLiveSessions = async () => {
    try {
      const response = await proxy.get("/sessions/live");
      if (response.data.success && response.data.sessions) {
        setLiveSessions(
          Array.isArray(response.data.sessions) ? response.data.sessions : []
        );
      }
    } catch (error: any) {
      console.error("Fetch Live Sessions Error:", error);
    }
  };

  const fetchSessionHistory = async () => {
    try {
      setLoading(true);
      const response = await proxy.get("/bookings");
      if (response.data.success && response.data.bookings) {
        const allBookings = Array.isArray(response.data.bookings)
          ? response.data.bookings
          : [];
        // Filter sessions that have been started (LIVE or COMPLETED)
        const sessionHistory = allBookings.filter(
          (b: any) => b.status === "LIVE" || b.status === "COMPLETED"
        );
        setSessions(sessionHistory);
      }
    } catch (error: any) {
      console.error("Fetch Sessions Error:", error);
      toast.error("Failed to load session history");
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (bookingId: number) => {
    if (!currentLocation) {
      toast.error("Please enable location services to start session");
      return;
    }

    try {
      const response = await proxy.post("/sessions/start", {
        bookingId,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      });

      if (response.data.success) {
        toast.success("Session started successfully!");
        fetchLiveSessions();
        fetchSessionHistory();
        startLocationTracking(bookingId);
      }
    } catch (error: any) {
      console.error("Start Session Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to start session"
      );
    }
  };

  const endSession = async (bookingId: number) => {
    try {
      const response = await proxy.post("/sessions/end", {
        bookingId,
      });

      if (response.data.success) {
        toast.success("Session ended successfully!");
        if (trackingInterval) {
          clearInterval(trackingInterval);
          setTrackingInterval(null);
        }
        fetchLiveSessions();
        fetchSessionHistory();
      }
    } catch (error: any) {
      console.error("End Session Error:", error);
      toast.error(error.response?.data?.message || "Failed to end session");
    }
  };

  const updateLocation = async (bookingId: number) => {
    if (!currentLocation) return;

    try {
      await proxy.post("/sessions/location", {
        bookingId,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      });
    } catch (error: any) {
      console.error("Update Location Error:", error);
    }
  };

  const startLocationTracking = (bookingId: number) => {
    // Clear any existing interval before starting a new one
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }

    // Update location every 30 seconds
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            updateLocation(bookingId);
          },
          (error) => {
            console.error("Location tracking error:", error);
          }
        );
      }
    }, 30000); // 30 seconds

    trackingIntervalRef.current = interval;
    setTrackingInterval(interval);
  };

  const calculateDuration = (session: ISession) => {
    if (!session.actualStart) return "N/A";
    const start = new Date(session.actualStart);
    const end = session.actualEnd ? new Date(session.actualEnd) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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

  // Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-teal-600" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-slate-800 rounded-3xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Live Session Tracking
        </h1>
        <p className="text-teal-100 mt-2">
          {isParent
            ? "Track your babysitter's location in real-time"
            : "Manage your active babysitting sessions"}
        </p>
      </div>

      {/* Live Sessions */}
      {liveSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-500 animate-pulse" />
            Active Sessions
          </h2>
          {liveSessions.map((session) => {
            const otherParty = isParent
              ? session.babysitter?.user
              : session.parent?.user;

            return (
              <div
                key={session.id}
                className="bg-white rounded-2xl shadow-sm border-2 border-red-200 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
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
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                        LIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">
                          {formatDate(session.startTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-600">
                          {calculateDuration(session)}
                        </span>
                      </div>
                      {session.gpsLogs && session.gpsLogs.length > 0 && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">
                            {session.gpsLogs.length} locations
                          </span>
                        </div>
                      )}
                      {session.actualStart && (
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-slate-400" />
                          <span className="text-slate-600">
                            Started: {formatDate(session.actualStart)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* GPS Logs for Parents */}
                    {isParent &&
                      session.gpsLogs &&
                      session.gpsLogs.length > 0 && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                          <p className="text-xs font-bold text-slate-500 mb-2 uppercase">
                            Last Known Location
                          </p>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-teal-600" />
                            <span className="text-sm text-slate-700">
                              {session.gpsLogs[session.gpsLogs.length - 1].lat.toFixed(6)},{" "}
                              {session.gpsLogs[session.gpsLogs.length - 1].lng.toFixed(6)}
                            </span>
                            <a
                              href={`https://www.google.com/maps?q=${session.gpsLogs[session.gpsLogs.length - 1].lat},${session.gpsLogs[session.gpsLogs.length - 1].lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-teal-600 hover:underline ml-auto"
                            >
                              View on Map
                            </a>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Actions for Babysitter */}
                  {isBabysitter && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => endSession(session.id)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                      >
                        <StopCircle className="h-5 w-5" />
                        End Session
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmed Bookings (for Babysitter to start) */}
      {isBabysitter && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Ready to Start</h2>
          <div className="grid gap-4">
            {sessions
              .filter((s) => s.status === "CONFIRMED")
              .map((session) => {
                const parent = session.parent?.user;
                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-900">
                            Session #{session.id}
                          </h3>
                          {parent && (
                            <span className="text-sm text-slate-600">
                              with {parent.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(session.startTime)}</span>
                          <Clock className="h-4 w-4 ml-4" />
                          <span>to {formatDate(session.endTime)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => startSession(session.id)}
                        disabled={!currentLocation}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <PlayCircle className="h-5 w-5" />
                        Start Session
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Session History */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Session History</h2>
        {sessions.filter((s) => s.status === "COMPLETED").length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
            <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No session history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions
              .filter((s) => s.status === "COMPLETED")
              .map((session) => {
                const otherParty = isParent
                  ? session.babysitter?.user
                  : session.parent?.user;

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h3 className="font-bold text-lg text-slate-900">
                            Session #{session.id}
                          </h3>
                          {otherParty && (
                            <span className="text-sm text-slate-600">
                              with {otherParty.name}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
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

                        {session.gpsLogs && session.gpsLogs.length > 0 && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs font-bold text-slate-500 mb-2 uppercase">
                              GPS Tracking Log ({session.gpsLogs.length} points)
                            </p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {session.gpsLogs.slice(-5).map((log, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-slate-600"
                                >
                                  <MapPin className="h-3 w-3 text-teal-600" />
                                  <span>
                                    {log.lat.toFixed(6)}, {log.lng.toFixed(6)}
                                  </span>
                                  <span className="text-slate-400 ml-auto">
                                    {new Date(log.time).toLocaleTimeString()}
                                  </span>
                                </div>
                              ))}
                            </div>
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

