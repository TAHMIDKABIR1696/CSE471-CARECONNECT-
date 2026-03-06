"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  MessageSquare,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search & Match",
    description:
      "Enter your needs and let Smart Match™ find the perfect caregiver based on availability, personality, and proximity.",
    color: "bg-purple-100 text-purple-700",
  },
  {
    icon: MessageSquare,
    step: "02",
    title: "Chat & Interview",
    description:
      "Message sitters directly, ask questions, and schedule live video interviews before committing.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: ShieldCheck,
    step: "03",
    title: "Verify & Trust",
    description:
      "Every sitter is background-checked and verified. Read reviews from other families for full transparency.",
    color: "bg-orange-100 text-orange-700",
  },
  {
    icon: CalendarCheck,
    step: "04",
    title: "Book & Relax",
    description:
      "Confirm your booking with secure payments. Track your session in real-time and enjoy peace of mind.",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="pt-32 pb-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-semibold border border-purple-100 mb-4">
            Simple &amp; Easy
          </span>
          <h1 className="text-3xl lg:text-5xl font-bold text-slate-900 tracking-tight">
            How CareConnect Works
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
            Finding trusted childcare has never been easier. Four simple steps to
            peace of mind.
          </p>
        </div>
      </div>

      {/* Steps */}
      <div className="pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[calc(100%-20%)] h-0.5 bg-gradient-to-r from-slate-200 to-transparent" />
                )}

                <div className="relative bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl border border-transparent hover:border-slate-100 transition-all duration-500 group-hover:-translate-y-2">
                  {/* Step number */}
                  <div className="absolute -top-3 -right-2 bg-white border border-slate-200 rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold text-slate-400 shadow-sm">
                    {step.step}
                  </div>

                  <div
                    className={`inline-flex p-4 rounded-2xl ${step.color} mb-6`}
                  >
                    <step.icon className="h-7 w-7" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="pb-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-emerald-700 rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Ready to Find the Perfect Care?
              </h2>
              <p className="text-purple-100 text-lg mb-8 leading-relaxed">
                Join thousands of families who trust CareConnect to connect them
                with verified, caring babysitters.
              </p>
              <Link
                href="/signup"
                className="inline-flex px-8 py-4 bg-white text-purple-700 font-bold rounded-lg hover:bg-purple-50 shadow-lg transition-all duration-300"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
