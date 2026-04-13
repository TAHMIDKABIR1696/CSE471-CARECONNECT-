"use client";

import React from "react";
import { Users, HeartHandshake, MapPin, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "2,000+",
    label: "Verified Sitters",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    icon: HeartHandshake,
    value: "15,000+",
    label: "Happy Families",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: MapPin,
    value: "50+",
    label: "Cities Covered",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Average Rating",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
];

const Stats = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-12 lg:p-16 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Trusted by Thousands of Families
            </h2>
            <p className="mt-3 text-slate-400 text-lg max-w-xl mx-auto">
              Join a growing community that puts children first.
            </p>
          </div>

          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center group"
              >
                <div
                  className={`inline-flex p-3 rounded-xl ${stat.bgColor} ${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
