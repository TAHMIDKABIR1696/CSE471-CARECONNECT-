"use client";

import React from "react";

const howItWorks = [
  {
    step: "1",
    title: "Create Your Profile",
    description: "Tell us about your family and childcare needs",
  },
  {
    step: "2",
    title: "Browse & Match",
    description: "Search for qualified sitters in your area",
  },
  {
    step: "3",
    title: "Book with Confidence",
    description: "Schedule care and enjoy peace of mind",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">
            Getting started is simple and secure
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {howItWorks.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
