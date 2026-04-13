import React from "react";
import { Shield, Clock, Heart, Star } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Caregivers",
    description:
      "All sitters undergo thorough background checks and verification",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description:
      "Book care on your schedule, from one-time to recurring",
  },
  {
    icon: Heart,
    title: "Trusted by Families",
    description:
      "Join thousands of families who trust us with their children",
  },
  {
    icon: Star,
    title: "Highly Rated",
    description:
      "Top-rated caregivers with verified reviews and ratings",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose CareConnect?</h2>
          <p className="text-xl text-gray-600">
            The safest and most reliable childcare platform
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
