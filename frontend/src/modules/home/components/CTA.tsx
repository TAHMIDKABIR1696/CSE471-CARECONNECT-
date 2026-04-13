"use client";

import React from "react";
import Link from "next/link";

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join thousands of families finding trusted childcare every day
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/account/find-sitter"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg hover:shadow-xl transition-all font-semibold"
          >
            Find a Sitter Now
          </Link>
          <Link
            href="/apply"
            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-purple-600 transition-all font-semibold"
          >
            Apply as a Sitter
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
