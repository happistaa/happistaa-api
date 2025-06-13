'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import BookingModal from './BookingModal'

interface Therapist {
  id: string
  name: string
  specialization: string[]
  experience: string
  rating: number
  availability: string
  image: string
  bio: string
  languages: string[]
  price: string
}

interface BookingData {
  date: string
  time: string
  type: 'video' | 'in-person'
  notes: string
}

export default function FindTherapist() {
  const [selectedSpecialization, setSelectedSpecialization] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState('any')
  const [availability, setAvailability] = useState('any')
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // Mock data for demonstration
  const therapists: Therapist[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialization: ['Anxiety', 'Depression', 'Trauma'],
      experience: '15 years',
      rating: 4.9,
      availability: 'Mon-Fri, 9AM-5PM',
      image: '/therapists/therapist1.jpg',
      bio: 'Licensed psychologist specializing in anxiety and depression. Using evidence-based approaches to help clients achieve their mental health goals.',
      languages: ['English', 'Spanish'],
      price: '$150/session'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      specialization: ['Relationship Issues', 'Family Therapy', 'Stress Management'],
      experience: '12 years',
      rating: 4.8,
      availability: 'Mon-Sat, 10AM-7PM',
      image: '/therapists/therapist2.jpg',
      bio: 'Experienced family therapist helping individuals and families navigate through challenging times and build stronger relationships.',
      languages: ['English', 'Mandarin'],
      price: '$140/session'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      specialization: ['Mindfulness', 'CBT', 'Life Transitions'],
      experience: '8 years',
      rating: 4.7,
      availability: 'Tue-Sat, 11AM-8PM',
      image: '/therapists/therapist3.jpg',
      bio: 'Dedicated to helping clients develop mindfulness practices and cognitive behavioral techniques for better mental health.',
      languages: ['English', 'Spanish', 'Portuguese'],
      price: '$130/session'
    }
  ]

  const specializations = [
    'Anxiety',
    'Depression',
    'Trauma',
    'Relationship Issues',
    'Family Therapy',
    'Stress Management',
    'Mindfulness',
    'CBT',
    'Life Transitions'
  ]

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSpecialization = selectedSpecialization.length === 0 ||
      selectedSpecialization.some(spec => therapist.specialization.includes(spec))
    const matchesPrice = priceRange === 'any' ||
      (priceRange === 'low' && parseInt(therapist.price) < 140) ||
      (priceRange === 'medium' && parseInt(therapist.price) >= 140 && parseInt(therapist.price) <= 160) ||
      (priceRange === 'high' && parseInt(therapist.price) > 160)
    return matchesSpecialization && matchesPrice
  })

  const handleBookSession = (bookingData: BookingData) => {
    // Here you would typically make an API call to save the booking
    console.log('Booking data:', {
      therapist: selectedTherapist,
      ...bookingData
    })
    // Show success message or redirect to confirmation page
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Find Your Therapist</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Filters</h2>
            
            {/* Specialization Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Specialization</h3>
              <div className="space-y-2">
                {specializations.map(spec => (
                  <label key={spec} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedSpecialization.includes(spec)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSpecialization([...selectedSpecialization, spec])
                        } else {
                          setSelectedSpecialization(selectedSpecialization.filter(s => s !== spec))
                        }
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{spec}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Price Range</h3>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any Price</option>
                <option value="low">Under $140</option>
                <option value="medium">$140 - $160</option>
                <option value="high">Over $160</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Availability</h3>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any Time</option>
                <option value="morning">Morning (9AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 9PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Therapist Listings */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 gap-6">
            {filteredTherapists.map(therapist => (
              <div key={therapist.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                      {/* Add actual image here */}
                      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500">
                        {therapist.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{therapist.name}</h3>
                          <p className="text-gray-600">{therapist.experience} experience</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <span className="text-yellow-400">★</span>
                            <span className="font-medium">{therapist.rating}</span>
                          </div>
                          <p className="text-blue-600 font-medium">{therapist.price}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {therapist.specialization.map(spec => (
                          <span
                            key={spec}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-gray-600">{therapist.bio}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {therapist.languages.map(lang => (
                            <span
                              key={lang}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedTherapist(therapist)
                            setIsBookingModalOpen(true)
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Book Session
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedTherapist && (
        <BookingModal
          therapist={selectedTherapist}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false)
            setSelectedTherapist(null)
          }}
          onBook={handleBookSession}
        />
      )}
    </div>
  )
} 