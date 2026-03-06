import { useState } from 'react';
import { Search, MapPin, Clock, DollarSign, Star, Heart, Filter } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function FindSitter() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const sitters = [
    {
      id: 1,
      name: 'Emma Williams',
      age: 28,
      experience: '5 years',
      rate: '$18-25/hr',
      distance: '2.3 miles',
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1758874961117-e40e35b67331?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWJ5c2l0dGVyJTIwbmFubnklMjBjaGlsZGNhcmUlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyNzMwOTAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
      specialties: ['Infant Care', 'CPR Certified', 'Early Education'],
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      age: 32,
      experience: '8 years',
      rate: '$20-28/hr',
      distance: '3.5 miles',
      rating: 5.0,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1600563093202-337471bde37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZGNhcmUlMjBiYWJ5c2l0dGVyJTIwY2hpbGRyZW4lMjBoYXBweXxlbnwxfHx8fDE3NzI3MzA5MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
      specialties: ['Toddler Care', 'Special Needs', 'Pet Friendly'],
    },
    {
      id: 3,
      name: 'Jessica Martinez',
      age: 25,
      experience: '4 years',
      rate: '$16-22/hr',
      distance: '1.8 miles',
      rating: 4.8,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1758687126864-96b61e1b3af0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBjaGlsZHJlbiUyMHBhcmVudCUyMHNtaWxpbmd8ZW58MXx8fHwxNzcyNzMwOTAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
      specialties: ['Homework Help', 'Arts & Crafts', 'Bilingual'],
    },
    {
      id: 4,
      name: 'Lisa Anderson',
      age: 30,
      experience: '6 years',
      rate: '$19-26/hr',
      distance: '4.2 miles',
      rating: 4.9,
      reviews: 187,
      image: 'https://images.unsplash.com/photo-1758687126675-20f581772d7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBjaGlsZCUyMHBsYXlpbmclMjBob21lfGVufDF8fHx8MTc3MjczMDkwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
      specialties: ['Overnight Care', 'Cooking', 'Light Housekeeping'],
    },
    {
      id: 5,
      name: 'Amanda Brown',
      age: 27,
      experience: '5 years',
      rate: '$17-24/hr',
      distance: '2.9 miles',
      rating: 4.9,
      reviews: 142,
      image: 'https://images.unsplash.com/photo-1600563093202-337471bde37e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZGNhcmUlMjBiYWJ5c2l0dGVyJTIwY2hpbGRyZW4lMjBoYXBweXxlbnwxfHx8fDE3NzI3MzA5MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
      specialties: ['Newborn Care', 'Sleep Training', 'First Aid'],
    },
    {
      id: 6,
      name: 'Rachel Green',
      age: 29,
      experience: '7 years',
      rate: '$21-29/hr',
      distance: '3.1 miles',
      rating: 5.0,
      reviews: 201,
      image: 'https://images.unsplash.com/photo-1758687126675-20f581772d7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RoZXIlMjBjaGlsZCUyMHBsYXlpbmclMjBob21lfGVufDF8fHx8MTc3MjczMDkwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
      verified: true,
      specialties: ['Music & Movement', 'Outdoor Activities', 'Multiple Kids'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F0F4FB]">
      {/* Header Section */}
      <div className="pt-32 pb-12 bg-gradient-to-br from-purple-600 to-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            Find Your Perfect Sitter
          </h1>

          {/* Search Bar */}
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Enter your zip code"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="relative">
                <Clock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none">
                  <option>When do you need care?</option>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>Recurring</option>
                </select>
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center space-x-2 font-semibold">
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedFilter('all')}
          >
            All Sitters
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'infant'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedFilter('infant')}
          >
            Infant Care
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'certified'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedFilter('certified')}
          >
            CPR Certified
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all ${
              selectedFilter === 'special'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setSelectedFilter('special')}
          >
            Special Needs
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{sitters.length}</span> available sitters
          </p>
          <button className="flex items-center space-x-2 text-gray-600 hover:text-purple-600">
            <Filter size={20} />
            <span>More Filters</span>
          </button>
        </div>

        {/* Sitters Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sitters.map((sitter) => (
            <div
              key={sitter.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <ImageWithFallback
                  src={sitter.image}
                  alt={sitter.name}
                  className="w-full h-64 object-cover"
                />
                {sitter.verified && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>✓</span>
                    <span>Verified</span>
                  </div>
                )}
                <button className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors">
                  <Heart size={20} className="text-gray-700" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{sitter.name}</h3>
                    <p className="text-gray-600 text-sm">
                      Age {sitter.age} • {sitter.experience} experience
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-400" fill="currentColor" />
                    <span className="font-semibold">{sitter.rating}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {sitter.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <MapPin size={16} />
                    <span>{sitter.distance}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign size={16} />
                    <span>{sitter.rate}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all font-semibold">
                    View Profile
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-all font-semibold">
                    Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
