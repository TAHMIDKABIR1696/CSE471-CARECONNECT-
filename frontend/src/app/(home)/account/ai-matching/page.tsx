"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Sparkles,
  MapPin,
  DollarSign,
  Star,
  Clock,
  TrendingUp,
  Loader2,
  ArrowRight,
  Navigation,
} from "lucide-react";
import proxy from "@/lib/proxy";

interface MatchFactor {
  location: number;
  availability: number;
  budget: number;
  personality: number;
  experience: number;
  rating: number;
}

interface Match {
  sitter: {
    id: number;
    userId: number;
    name: string;
    email: string;
    profilePicture: string | null;
    phoneNumber: string | null;
    bio: string | null;
    experienceYears: number;
    hourlyRate: number;
    locationAddress: string | null;
    latitude: number | null;
    longitude: number | null;
    averageRating: number;
    totalRatings: number;
    badges: string | null;
    availabilities: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
    }>;
    certifications: Array<{
      id: number;
      title: string;
      documentUrl: string;
    }>;
  };
  matchScore: number;
  factorScores: MatchFactor;
}

export default function AIMatchingPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await proxy.get("/matching/sitters");
      if (response.data.success) {
        setMatches(response.data.matches);
        toast.success(`Found ${response.data.matches.length} perfect matches!`);
      }
    } catch (error: any) {
      console.error("Error fetching matches:", error);
      toast.error(error.response?.data?.message || "Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-purple-600 h-12 w-12 mx-auto mb-4" />
          <p className="text-slate-600">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-black text-slate-900">
            AI-Powered Matching
          </h1>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Our intelligent 7-factor matching algorithm analyzes location,
          availability, budget, personality, experience, and ratings to find
          your perfect babysitter match.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-purple-600 font-bold">
          <TrendingUp className="h-4 w-4" />
          <span>{matches.length} Matches Found</span>
        </div>
      </div>

      {/* Matches Grid */}
      {matches.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
          <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700">
            No matches found
          </h3>
          <p className="text-slate-400 mt-1">
            Complete your profile to get better matches.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {matches.map((match, index) => {
            const { sitter, matchScore, factorScores } = match;
            const matchPercentage = Math.round(matchScore * 100);

            return (
              <div
                key={sitter.id}
                className="bg-white rounded-3xl border-2 border-slate-100 p-6 hover:shadow-xl hover:border-purple-200 transition-all relative overflow-hidden"
              >
                {/* Match Score Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-purple-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-black flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {matchPercentage}% Match
                  </div>
                </div>

                {/* Sitter Info */}
                <div className="flex gap-5 items-start mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-emerald-100 rounded-3xl flex items-center justify-center text-3xl font-black text-purple-600 shrink-0">
                    {sitter.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-black text-xl text-slate-900">
                        {sitter.name}
                      </h3>
                      {sitter.latitude && sitter.longitude && (
                        <Navigation className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {sitter.locationAddress || "Location not set"}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.floor(sitter.averageRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-500 ml-1">
                        {sitter.averageRating
                          ? Number(sitter.averageRating).toFixed(1)
                          : "New"}{" "}
                        ({sitter.totalRatings} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                  {sitter.bio ||
                    "Experienced childcare provider dedicated to your child's safety and happiness."}
                </p>

                {/* Match Factors */}
                <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                  <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wide">
                    Match Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Location</span>
                        <span className="font-bold text-slate-900">
                          {Math.round(factorScores.location * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${factorScores.location * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Availability</span>
                        <span className="font-bold text-slate-900">
                          {Math.round(factorScores.availability * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${factorScores.availability * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Budget</span>
                        <span className="font-bold text-slate-900">
                          {Math.round(factorScores.budget * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${factorScores.budget * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Personality</span>
                        <span className="font-bold text-slate-900">
                          {Math.round(factorScores.personality * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: `${factorScores.personality * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Experience</span>
                        <span className="font-bold text-slate-900">
                          {Math.round(factorScores.experience * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{
                            width: `${factorScores.experience * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Rating</span>
                        <span className="font-bold text-slate-900">
                          {Math.round(factorScores.rating * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{
                            width: `${factorScores.rating * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center justify-between mb-6 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span className="font-bold">
                        {sitter.experienceYears} Years Experience
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-bold">৳{sitter.hourlyRate}/hr</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/sitter/${sitter.id}`}
                    className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-600 transition-all"
                  >
                    View Profile <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

