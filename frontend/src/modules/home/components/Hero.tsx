"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import ImageWithFallback from "@/components/image-with-fallback";

const Hero = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    router.push(isAuthenticated ? "/account/find-sitter" : "/signup");
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 lg:pt-28 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[100px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Find Trusted{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Childcare
              </span>{" "}
              in Your Neighborhood
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect with verified, experienced caregivers who will love your
              children as much as you do.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/account/find-sitter"
                className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 font-semibold"
              >
                <Search size={20} />
                <span>Find a Sitter</span>
              </Link>
              <Link
                href="/apply"
                className="bg-white text-gray-800 px-8 py-4 rounded-lg border-2 border-gray-200 hover:border-purple-600 transition-all flex items-center justify-center font-semibold"
              >
                Become a Sitter
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1600563093202-337471bde37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZGNhcmUlMjBiYWJ5c2l0dGVyJTIwY2hpbGRyZW4lMjBoYXBweXxlbnwxfHx8fDE3NzI3MzA5MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Happy children with caregiver"
                width={1080}
                height={720}
                className="w-full h-auto"
                priority
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl">
              <div className="flex items-center space-x-2">
                <div className="text-3xl font-bold text-purple-600">4.9</div>
                <div>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">10k+ Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
