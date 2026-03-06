"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Clock, Save, Loader2, CheckCircle2, CalendarDays } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

// Type Definition
interface IScheduleItem {
  active: boolean;
  start: string;
  end: string;
}

export default function AvailabilityPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // State
  const [schedule, setSchedule] = useState<Record<string, IScheduleItem>>({
    MONDAY: { active: false, start: "09:00", end: "17:00" },
    TUESDAY: { active: false, start: "09:00", end: "17:00" },
    WEDNESDAY: { active: false, start: "09:00", end: "17:00" },
    THURSDAY: { active: false, start: "09:00", end: "17:00" },
    FRIDAY: { active: false, start: "09:00", end: "17:00" },
    SATURDAY: { active: false, start: "09:00", end: "17:00" },
    SUNDAY: { active: false, start: "09:00", end: "17:00" },
  });

  // 1. Load Saved Data from Database
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/sitters/availability",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          const dbData = response.data.schedule;

          // Merge DB data into State
          setSchedule((prev) => {
            const newSchedule = { ...prev };
            dbData.forEach((item: any) => {
              if (DAYS.includes(item.dayOfWeek)) {
                newSchedule[item.dayOfWeek] = {
                  active: true,
                  start: item.startTime,
                  end: item.endTime,
                };
              }
            });
            return newSchedule;
          });
        }
      } catch (error) {
        console.error("Failed to load availability");
      } finally {
        setFetching(false);
      }
    };

    if (isAuthenticated) fetchAvailability();
  }, [isAuthenticated]);

  const toggleDay = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active },
    }));
  };

  const handleTimeChange = (
    day: string,
    field: "start" | "end",
    value: string
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const saveAvailability = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const activeSchedule = Object.entries(schedule)
        .filter(([_, val]) => val.active)
        .map(([day, val]) => ({
          dayOfWeek: day,
          startTime: val.start,
          endTime: val.end,
        }));

      await axios.post(
        "http://localhost:5000/api/sitters/availability",
        { schedule: activeSchedule },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Schedule updated successfully!");
    } catch (error) {
      toast.error("Failed to update availability.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-purple-600" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-7 w-7 text-purple-600" /> Weekly
            Availability
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Define your standard weekly schedule so parents know when to book
            you.
          </p>
        </div>
        <button
          onClick={saveAvailability}
          disabled={loading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-70 shadow-lg shadow-purple-200"
        >
          {loading ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          Save Changes
        </button>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {DAYS.map((day) => {
            const isActive = schedule[day].active;

            return (
              <div
                key={day}
                className={`p-5 transition-colors ${
                  isActive ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* 1. Toggle Switch & Label */}
                  <div className="flex items-center gap-4 w-40 shrink-0">
                    <button
                      onClick={() => toggleDay(day)}
                      className={`w-12 h-7 rounded-full transition-colors relative ${
                        isActive ? "bg-purple-500" : "bg-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-transform ${
                          isActive ? "left-6" : "left-1"
                        }`}
                      ></div>
                    </button>
                    <span
                      className={`font-bold text-sm ${
                        isActive ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {/* 2. Time Inputs (Conditional) */}
                  <div className="flex-1">
                    {isActive ? (
                      <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="relative">
                          <input
                            type="time"
                            value={schedule[day].start}
                            onChange={(e) =>
                              handleTimeChange(day, "start", e.target.value)
                            }
                            className="pl-3 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm cursor-pointer"
                          />
                        </div>
                        <span className="text-slate-400 font-medium">to</span>
                        <div className="relative">
                          <input
                            type="time"
                            value={schedule[day].end}
                            onChange={(e) =>
                              handleTimeChange(day, "end", e.target.value)
                            }
                            className="pl-3 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none shadow-sm cursor-pointer"
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-slate-400 italic flex items-center gap-2">
                        Unavailable
                      </span>
                    )}
                  </div>

                  {/* 3. Status Badge */}
                  <div className="md:w-24 flex justify-end">
                    {isActive && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Open
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
