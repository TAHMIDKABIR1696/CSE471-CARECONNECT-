"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/use-auth";
import { getApiUrl } from "@/lib/api-config";
import {
  User,
  MapPin,
  Briefcase,
  Loader2,
  Save,
  Phone,
  Settings as SettingsIcon,
  Navigation,
  Info,
  CalendarDays,
} from "lucide-react";

// ✅ Type Safety: Input Interface
interface IProfileInput {
  name: string;
  phone: string;
  location: string;
  // Parent fields
  minBudget?: number;
  maxBudget?: number;
  situation?: string;
  requiredDays?: string;
  // Sitter fields
  bio?: string;
  experienceYears?: number;
  hourlyRate?: number;
  // GPS fields
  latitude?: number;
  longitude?: number;
}

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const dayOptions = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ] as const;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm<IProfileInput>();

  const selectedRequiredDays = (watch("requiredDays") || "")
    .split(",")
    .map((day) => day.trim().toUpperCase())
    .filter(Boolean);

  // 🌐 GPS: Get Current Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      return toast.error("Geolocation is not supported by your browser");
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue("latitude", latitude);
        setValue("longitude", longitude);
        toast.success("GPS coordinates captured!");
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        toast.error("Permission denied. Please allow location access.");
        setIsLocating(false);
      }
    );
  };

  const toggleRequiredDay = (day: string) => {
    const selected = new Set(selectedRequiredDays);
    if (selected.has(day)) selected.delete(day);
    else selected.add(day);
    setValue("requiredDays", Array.from(selected).join(","), { shouldDirty: true });
  };

  // 📥 Load Data from Backend
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${getApiUrl()}/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = response.data.user;

        // Basic Info
        setValue("name", data.name);
        setValue("phone", data.phoneNumber || "");

        // Role Based Data
        if (data.role === "PARENT" && data.parentProfile) {
          setValue("location", data.parentProfile.locationAddress || "");
          setValue("minBudget", data.parentProfile.minBudget);
          setValue("maxBudget", data.parentProfile.maxBudget);
          setValue("situation", data.parentProfile.situation || "");
          setValue("requiredDays", data.parentProfile.requiredDays || "");
          setValue("latitude", data.parentProfile.latitude);
          setValue("longitude", data.parentProfile.longitude);
        } else if (data.role === "BABYSITTER" && data.babysitter) {
          // Note: Backend-এ 'babysitter' টেবিল চেক করবেন
          setValue("location", data.babysitter.locationAddress || "");
          setValue("bio", data.babysitter.bio || "");
          setValue("experienceYears", data.babysitter.experienceYears);
          setValue("hourlyRate", data.babysitter.hourlyRate);
          setValue("latitude", data.babysitter.latitude);
          setValue("longitude", data.babysitter.longitude);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        toast.error("Could not load profile data.");
      }
    };

    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated, setValue]);

  // 📤 Update Profile
  const onSubmit: SubmitHandler<IProfileInput> = async (formData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const cleanedRequiredDays = (formData.requiredDays || "")
        .split(",")
        .map((day) => day.trim().toUpperCase())
        .filter(Boolean)
        .join(",");
      const payload = {
        ...formData,
        requiredDays: cleanedRequiredDays,
      };

      const response = await axios.put(
        `${getApiUrl()}/user/update-profile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Settings updated successfully!");
        // Update LocalStorage to reflect new name if changed
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...storedUser, name: formData.name })
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading)
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="animate-spin text-purple-600 h-10 w-10" />
        <p className="text-slate-500 font-medium">Loading settings...</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-purple-600" /> Account Settings
        </h1>
        <p className="text-slate-500 mt-1">
          Update your personal and professional profile details.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-8 py-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Information
          </h3>
          <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
            {user?.role} Mode
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  {...register("name", { required: true })}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  {...register("phone")}
                  placeholder="017xxxxxxxx"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                Primary Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  {...register("location")}
                  placeholder="House, Road, Area, City"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Role Based Inputs */}
          {user?.role === "PARENT" ? (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" /> Parent Preferences
              </h3>
              <input type="hidden" {...register("requiredDays")} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Min Budget (৳)
                  </label>
                  <input
                    type="number"
                    {...register("minBudget")}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Max Budget (৳)
                  </label>
                  <input
                    type="number"
                    {...register("maxBudget")}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Special Situation / Notes
                  </label>
                  <textarea
                    {...register("situation")}
                    rows={3}
                    placeholder="Describe your children or any special needs..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Required Care Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map((day) => {
                      const isSelected = selectedRequiredDays.includes(day);
                      return (
                        <button
                          type="button"
                          key={day}
                          onClick={() => toggleRequiredDay(day)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            isSelected
                              ? "bg-purple-600 border-purple-600 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:border-purple-300"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-400">
                    Selected: {selectedRequiredDays.length > 0 ? selectedRequiredDays.join(", ") : "None"}
                  </p>
                </div>

                <div className="md:col-span-2 bg-purple-50/50 p-6 rounded-2xl border border-purple-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-purple-900 text-sm">Family Location</h4>
                      <p className="text-xs text-purple-600">
                        Use your current GPS location for more accurate distance matching.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-100"
                    >
                      {isLocating ? (
                        <Loader2 className="animate-spin h-3.5 w-3.5" />
                      ) : (
                        <Navigation className="h-3.5 w-3.5" />
                      )}
                      {isLocating ? "Locating..." : "Get Live GPS"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-purple-700 uppercase">Latitude</label>
                      <input
                        {...register("latitude")}
                        readOnly
                        className="w-full bg-white border border-purple-100 p-2 rounded-lg text-xs text-slate-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-purple-700 uppercase">Longitude</label>
                      <input
                        {...register("longitude")}
                        readOnly
                        className="w-full bg-white border border-purple-100 p-2 rounded-lg text-xs text-slate-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-500" /> Professional
                Sitter Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    {...register("experienceYears")}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Hourly Rate (৳)
                  </label>
                  <input
                    type="number"
                    {...register("hourlyRate")}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Bio / About You
                  </label>
                  <textarea
                    {...register("bio")}
                    rows={4}
                    placeholder="Write a short professional bio..."
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                {/* GPS Location Capture Section */}
                <div className="md:col-span-2 bg-purple-50/50 p-6 rounded-2xl border border-purple-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-purple-900 text-sm">
                        GPS Tracking
                      </h4>
                      <p className="text-xs text-purple-600">
                        Ensure parents find you based on your live location.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-100"
                    >
                      {isLocating ? (
                        <Loader2 className="animate-spin h-3.5 w-3.5" />
                      ) : (
                        <Navigation className="h-3.5 w-3.5" />
                      )}
                      {isLocating ? "Locating..." : "Get Live GPS"}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-purple-700 uppercase">
                        Latitude
                      </label>
                      <input
                        {...register("latitude")}
                        readOnly
                        className="w-full bg-white border border-purple-100 p-2 rounded-lg text-xs text-slate-600 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-purple-700 uppercase">
                        Longitude
                      </label>
                      <input
                        {...register("longitude")}
                        readOnly
                        className="w-full bg-white border border-purple-100 p-2 rounded-lg text-xs text-slate-600 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 hidden md:block">
              Last updated: Just now
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 hover:bg-purple-600 text-white px-10 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 disabled:opacity-70"
            >
              {isSaving ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {isSaving ? "Saving..." : "Save All Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
