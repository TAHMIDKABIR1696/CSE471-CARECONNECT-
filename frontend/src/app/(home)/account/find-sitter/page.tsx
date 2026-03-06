"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Search,
  MapPin,
  DollarSign,
  Briefcase,
  Star,
  Filter,
  Loader2,
  ArrowRight,
  Navigation,
  X,
} from "lucide-react";
import { Slider } from "@/components/ui/slider"; // Shadcn Slider (npm install @radix-ui/react-slider)

// Types
interface ISitter {
  id: number;
  name: string;
  babysitter: {
    id: number;
    locationAddress: string | null;
    hourlyRate: number;
    experienceYears: number;
    bio: string | null;
    averageRating: number;
    latitude?: number;
    longitude?: number;
    availabilities: { dayOfWeek: string; startTime: string; endTime: string }[];
  } | null;
}

export default function FindSitterPage() {
  const [sitters, setSitters] = useState<ISitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  // 🛠️ Advanced Filters State
  const [filters, setFilters] = useState({
    location: "",
    maxPrice: 1500, // Default Max
    minExp: 0,
    minRating: 0,
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch Function
  const fetchSitters = async () => {
    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (filters.location) params.append("location", filters.location);
      if (filters.maxPrice)
        params.append("maxPrice", filters.maxPrice.toString());
      if (filters.minExp > 0)
        params.append("minExp", filters.minExp.toString());
      if (filters.minRating > 0)
        params.append("minRating", filters.minRating.toString());

      const response = await axios.get(
        `http://localhost:5000/api/sitters?${params.toString()}`
      );

      if (response.data.success) {
        setSitters(response.data.sitters);
      }
    } catch (error) {
      console.error("Error fetching sitters", error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    fetchSitters();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSitters();
  };

  if (loading && !isSearching)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-purple-600 h-10 w-10" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-700 min-h-screen bg-[#FDF4F8]">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Find Your Perfect Sitter
          </h1>
          <p className="text-slate-500 mt-1">
            Discover trusted babysitters near your area.
          </p>
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="md:hidden flex items-center justify-center gap-2 bg-white border border-slate-200 p-3 rounded-xl font-bold text-slate-700"
        >
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. Side Filter Panel (Desktop) */}
        <aside
          className={`lg:block ${
            showMobileFilters ? "block" : "hidden"
          } space-y-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-fit sticky top-24`}
        >
          <div className="flex justify-between items-center lg:hidden">
            <h3 className="font-bold">Filters</h3>
            <X
              onClick={() => setShowMobileFilters(false)}
              className="h-5 w-5 cursor-pointer"
            />
          </div>

          {/* Location Search */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" /> Location
            </label>
            <input
              type="text"
              placeholder="City or Area..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            />
          </div>

          {/* Price Range Slider */}
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">
                Max Price: ৳{filters.maxPrice}
              </label>
            </div>
            <Slider
              defaultValue={[filters.maxPrice]}
              max={2000}
              step={50}
              onValueChange={(val) =>
                setFilters({ ...filters, maxPrice: val[0] })
              }
            />
          </div>

          {/* Experience Select */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">
              Min. Experience
            </label>
            <select
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              value={filters.minExp}
              onChange={(e) =>
                setFilters({ ...filters, minExp: Number(e.target.value) })
              }
            >
              <option value="0">Any Experience</option>
              <option value="1">1+ Year</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">
              Minimum Rating
            </label>
            <div className="flex flex-col gap-2">
              {[4, 3, 2].map((star) => (
                <label
                  key={star}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="rating"
                    className="accent-purple-600 h-4 w-4"
                    onChange={() => setFilters({ ...filters, minRating: star })}
                  />
                  <span className="text-sm text-slate-600 flex items-center gap-1 group-hover:text-purple-600">
                    {star} Stars & Up
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={fetchSitters}
            className="w-full py-4 bg-slate-900 hover:bg-purple-600 text-white font-bold rounded-2xl transition-all shadow-lg"
          >
            Apply Filters
          </button>
        </aside>

        {/* 3. Results Grid */}
        <div className="lg:col-span-3">
          {isSearching ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-purple-600 h-10 w-10" />
            </div>
          ) : sitters.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
              <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-700">
                No sitters match your criteria
              </h3>
              <p className="text-slate-400 mt-1">
                Try widening your search or budget.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sitters.map((user) => {
                const profile = user.babysitter;
                if (!profile) return null;

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
                  >
                    {/* GPS Badge */}
                    {profile.latitude && (
                      <div
                        className="absolute top-4 right-4 bg-purple-50 text-purple-600 p-1.5 rounded-full"
                        title="GPS Verified"
                      >
                        <Navigation className="h-3.5 w-3.5 fill-purple-600" />
                      </div>
                    )}

                    <div className="flex gap-5 items-start mb-6">
                      <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-3xl font-black text-slate-300 shrink-0 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-xl text-slate-900 leading-tight">
                            {user.name}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin className="h-3.5 w-3.5" />{" "}
                          {profile.locationAddress || "Dhaka, BD"}
                        </p>

                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(profile.averageRating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-500 ml-1">
                            {profile.averageRating
                              ? Number(profile.averageRating).toFixed(1)
                              : "New"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10 leading-relaxed">
                      {profile.bio ||
                        "Experience childcare provider dedicated to ensuring a safe and nurturing environment for your little ones."}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div>
                        <span className="text-2xl font-black text-slate-900">
                          ৳{profile.hourlyRate}
                        </span>
                        <span className="text-slate-400 text-xs font-bold">
                          {" "}
                          / hr
                        </span>
                      </div>
                      <Link
                        href={`/sitter/${user.id}`}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-purple-600 transition-all shadow-lg shadow-slate-200 group-hover:shadow-purple-100"
                      >
                        View <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
