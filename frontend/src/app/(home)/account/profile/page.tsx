"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/hooks/use-auth";
import {
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit3,
  Briefcase,
  DollarSign,
  Star,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface IParentProfile {
  locationAddress?: string | null;
  situation?: string | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  requiredDays?: string | null;
  children?: Array<{ id: string }>;
}

interface ISitterProfile {
  locationAddress?: string | null;
  bio?: string | null;
  experienceYears?: number | null;
  hourlyRate?: number | null;
  averageRating?: number | null;
  totalRatings?: number | null;
}

interface IUserProfile {
  name: string;
  email: string;
  role: "PARENT" | "BABYSITTER" | "ADMIN";
  phoneNumber?: string | null;
  createdAt: string;
  isApproved: boolean;
  parentProfile?: IParentProfile | null;
  babysitter?: ISitterProfile | null;
}

export default function ProfileViewPage() {
  const { isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(
          "http://localhost:5000/api/user/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProfileData(response.data.user as IUserProfile);
      } catch (error) {
        console.error("Error", error);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-purple-600" />
      </div>
    );
  if (!profileData) return <div>Failed to load profile.</div>;

  const isParent = profileData.role === "PARENT";
  const details = isParent ? profileData.parentProfile : profileData.babysitter;
  const profileRating = !isParent
    ? Number(details?.averageRating || 0).toFixed(1)
    : "N/A";
  const profileRatingMeta = !isParent
    ? `Based on ${details?.totalRatings || 0} reviews`
    : `${details?.children?.length || 0} child profile(s) linked`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Hero / Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-slate-800"></div>
        <div className="px-8 pb-8">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-lg">
                <div className="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-slate-400">
                  {profileData.name?.charAt(0)}
                </div>
              </div>
              {profileData.isApproved && (
                <div
                  className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white"
                  title="Verified"
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
              )}
            </div>
            <Link
              href="/account/settings"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </Link>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {profileData.name}
            </h1>
            <p className="text-purple-600 font-medium flex items-center gap-2 mt-1">
              {profileData.role} Account
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-slate-500 text-sm font-normal flex items-center gap-1">
                <MapPin className="h-3 w-3" />{" "}
                {details?.locationAddress || "Location not set"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Contact Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-900 border-b pb-2">
              Contact Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="h-4 w-4 text-purple-500" />
                <span className="truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-purple-500" />
                <span>{profileData.phoneNumber || "Not provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span>
                  Joined {new Date(profileData.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats (Optional) */}
          <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-purple-600" />
              <span className="font-bold text-purple-800">
                {isParent ? "Family Profile" : "Rating"}
              </span>
            </div>
            <div className="text-3xl font-bold text-purple-900">
              {profileRating}
              {!isParent && (
                <span className="text-sm font-normal text-purple-600">/ 5</span>
              )}
            </div>
            <p className="text-xs text-purple-600 mt-1">{profileRatingMeta}</p>
          </div>
        </div>

        {/* Right Column: Role Specific Details */}
        <div className="md:col-span-2 space-y-6">
          {/* About / Bio Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              {isParent ? "Family Requirements & Situation" : "About Me & Bio"}
            </h3>
            {isParent ? (
              <p className="text-slate-600 leading-relaxed text-sm">
                {details?.situation ||
                  "No family description added yet. Please go to settings to update your requirements."}
              </p>
            ) : (
              <p className="text-slate-600 leading-relaxed text-sm">
                {details?.bio ||
                  "No bio added yet. Tell parents about yourself in settings."}
              </p>
            )}
          </div>

          {/* Specific Attributes */}
          <div className="grid grid-cols-2 gap-4">
            {isParent ? (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Min Budget
                  </span>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    {details?.minBudget ? `৳${details.minBudget}` : "N/A"}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Max Budget
                  </span>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    {details?.maxBudget ? `৳${details.maxBudget}` : "N/A"}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 col-span-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    Required Days
                  </span>
                  <div className="text-sm font-semibold text-slate-700 mt-1">
                    {details?.requiredDays || "Not set"}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Briefcase className="h-3 w-3" /> Experience
                  </span>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    {details?.experienceYears || 0} Years
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <DollarSign className="h-3 w-3" /> Hourly Rate
                  </span>
                  <div className="text-xl font-bold text-slate-800 mt-1">
                    {details?.hourlyRate ? `৳${details.hourlyRate}/hr` : "N/A"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
