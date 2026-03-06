"use client";

import React from "react";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Mother of 2",
    text: "CareConnect made finding a reliable babysitter so easy. We found our perfect match within days!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Father of 1",
    text: "The background check process gave us complete peace of mind. Highly recommend!",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Mother of 3",
    text: "Flexible scheduling and amazing caregivers. This service has been a lifesaver for our family.",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Families Say</h2>
          <p className="text-xl text-gray-600">
            Trusted by thousands of happy families
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex text-yellow-400 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} fill="currentColor" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <div>
                <div className="font-semibold">{testimonial.name}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
