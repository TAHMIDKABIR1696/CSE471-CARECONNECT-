import { useState } from 'react';
import { CheckCircle, Upload, Shield, DollarSign, Calendar, Users } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Apply() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    zipCode: '',
    experience: '',
    rate: '',
    availability: [],
    specialties: [],
  });

  const benefits = [
    {
      icon: DollarSign,
      title: 'Competitive Pay',
      description: 'Set your own rates and earn $15-30+ per hour',
    },
    {
      icon: Calendar,
      title: 'Flexible Schedule',
      description: 'Work when you want, choose your own hours',
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Background checks and insurance coverage included',
    },
    {
      icon: Users,
      title: 'Great Families',
      description: 'Connect with caring families in your area',
    },
  ];

  const requirements = [
    'At least 18 years old',
    'Reliable transportation',
    'Childcare experience (professional or personal)',
    'Pass background check',
    'Valid ID and social security number',
    'CPR certification (or willingness to obtain)',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Application submitted! We will review and contact you soon.');
  };

  return (
    <div className="min-h-screen bg-[#F0F4FB]">
      {/* Hero Section */}
      <div className="pt-32 pb-16 bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-6">
                Start Your Babysitting Career
              </h1>
              <p className="text-xl mb-8 opacity-90">
                Join our community of trusted caregivers and make a difference in families' lives while earning great pay.
              </p>
              <div className="flex items-center space-x-8 text-lg">
                <div>
                  <div className="text-3xl font-bold">$15-30+</div>
                  <div className="opacity-90">Per Hour</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">10k+</div>
                  <div className="opacity-90">Active Sitters</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.9★</div>
                  <div className="opacity-90">Avg Rating</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758874961117-e40e35b67331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5c2l0dGVyJTIwbmFubnklMjBjaGlsZGNhcmUlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyNzMwOTAzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Professional caregiver"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Join CareConnect?</h2>
            <p className="text-xl text-gray-600">
              Benefits that make a difference
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold mb-8">Application Form</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zip Code *
                </label>
                <input
                  type="text"
                  required
                  className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData({ ...formData, zipCode: e.target.value })
                  }
                />
              </div>

              {/* Experience */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Experience & Qualifications</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience *
                    </label>
                    <select
                      required
                      className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                    >
                      <option value="">Select experience</option>
                      <option value="less-1">Less than 1 year</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desired Hourly Rate *
                    </label>
                    <select
                      required
                      className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      value={formData.rate}
                      onChange={(e) =>
                        setFormData({ ...formData, rate: e.target.value })
                      }
                    >
                      <option value="">Select rate</option>
                      <option value="15-18">$15-18/hr</option>
                      <option value="18-22">$18-22/hr</option>
                      <option value="22-26">$22-26/hr</option>
                      <option value="26-30">$26-30/hr</option>
                      <option value="30+">$30+/hr</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us about your experience
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Share your childcare experience, skills, and what makes you a great caregiver..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Documents</h3>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">
                      Upload Resume (Optional)
                    </p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-600">
                      Upload Certifications (CPR, First Aid, etc.)
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Requirements:</h4>
                <ul className="space-y-2">
                  {requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-sm text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label className="text-sm text-gray-700">
                  I agree to undergo a background check and confirm that all information provided is accurate. I have read and accept the Terms of Service and Privacy Policy.
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-4 rounded-lg hover:shadow-xl transition-all font-semibold text-lg"
              >
                Submit Application
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Happens Next?</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Application Review</h3>
              <p className="text-sm text-gray-600">We review your application within 24-48 hours</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Background Check</h3>
              <p className="text-sm text-gray-600">Complete verification process and background screening</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Profile Setup</h3>
              <p className="text-sm text-gray-600">Create your detailed caregiver profile</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Start Working</h3>
              <p className="text-sm text-gray-600">Connect with families and begin earning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
