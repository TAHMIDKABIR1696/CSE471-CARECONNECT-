import { Link } from 'react-router';
import { Search, Shield, Clock, Heart, Star, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Home() {
  const features = [
    {
      icon: Shield,
      title: 'Verified Caregivers',
      description: 'All sitters undergo thorough background checks and verification',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book care on your schedule, from one-time to recurring',
    },
    {
      icon: Heart,
      title: 'Trusted by Families',
      description: 'Join thousands of families who trust us with their children',
    },
    {
      icon: Star,
      title: 'Highly Rated',
      description: 'Top-rated caregivers with verified reviews and ratings',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Create Your Profile',
      description: 'Tell us about your family and childcare needs',
    },
    {
      step: '2',
      title: 'Browse & Match',
      description: 'Search for qualified sitters in your area',
    },
    {
      step: '3',
      title: 'Book with Confidence',
      description: 'Schedule care and enjoy peace of mind',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Mother of 2',
      text: 'CareConnect made finding a reliable babysitter so easy. We found our perfect match within days!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Father of 1',
      text: 'The background check process gave us complete peace of mind. Highly recommend!',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Mother of 3',
      text: 'Flexible scheduling and amazing caregivers. This service has been a lifesaver for our family.',
      rating: 5,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-24 lg:pt-28 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Find Trusted{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Childcare
                </span>{' '}
                in Your Neighborhood
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect with verified, experienced caregivers who will love your children as much as you do.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/find-sitter"
                  className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 font-semibold"
                >
                  <Search size={20} />
                  <span>Find a Sitter</span>
                </Link>
                <Link
                  to="/apply"
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
                  className="w-full h-auto"
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

      {/* Features Section */}
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

      {/* How It Works */}
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

      {/* Testimonials */}
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
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 to-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of families finding trusted childcare every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/find-sitter"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg hover:shadow-xl transition-all font-semibold"
            >
              Find a Sitter Now
            </Link>
            <Link
              to="/apply"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-purple-600 transition-all font-semibold"
            >
              Apply as a Sitter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
