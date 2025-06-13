'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { Database } from '@/lib/supabase'

interface UserProfile {
  // Basic Info
  id: string
  name: string
  email: string
  dob: string
  location: string
  gender: string
  joinDate: string
  
  // Professional Info
  workplace: string
  job_title: string
  education: string
  
  // Personal Info
  religious_beliefs: string
  interests: string[]
  languages: string[]
  
  // Preferences
  availability: string
  preferred_time: string
  communication_style: string
  support_type: string
  
  // Stats
  completed_exercises: number
  total_minutes: number
  streak: number
  
  // Sessions
  upcomingSessions: Booking[]
  pastSessions: Booking[]
  
  // Additional fields from Supabase
  created_at: string
  updated_at: string
  completed_setup: boolean
  support_seeker: boolean
  support_giver: boolean
  support_preferences: string[]
  journey_note: string
  guidelines_accepted: boolean
}

interface Booking {
  id: string
  therapistName: string
  date: string
  time: string
  status: 'upcoming' | 'completed' | 'cancelled'
  type: 'video' | 'in-person'
}

const genderOptions = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
  'Other'
]

const communicationStyles = [
  'Active listener, empathetic',
  'Direct, solution-oriented',
  'Gentle, encouraging',
  'Structured, goal-focused',
  'Casual, friendly'
]

const supportTypes = [
  'One-on-one chat',
  'Group support',
  'Both one-on-one and group',
  'Video calls',
  'Voice calls'
]

export default function Profile() {
  const router = useRouter()
  const { user, session, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'progress' | 'edit'>('overview')
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfile() {
      if (authLoading) return
      
      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      setIsLoading(true)
      setError(null)
      
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // Profile doesn't exist, create a new one
            const { error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                completed_setup: false,
                email: session.user.email
              })

            if (createError) throw createError
            
            // Fetch the newly created profile
            const { data: newProfile, error: fetchError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (fetchError) throw fetchError
            setProfileData(newProfile)
          } else {
            throw profileError
          }
        } else {
          setProfileData(profile)
          setIsSetupComplete(profile.completed_setup)
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [session, authLoading, router])

  const handleInputChange = async (field: keyof UserProfile, value: string | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleSetupComplete = async () => {
    if (!session?.user) return

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          completed_setup: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (updateError) throw updateError

    setIsSetupComplete(true)
      setActiveTab('overview')
    } catch (err: any) {
      console.error('Error completing setup:', err)
      setError(err.message)
    }
  }

  const handleSaveChanges = async () => {
    if (!session?.user) return

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id)

      if (updateError) throw updateError

    setActiveTab('overview')
    } catch (err: any) {
      console.error('Error saving changes:', err)
      setError(err.message)
    }
  }

  const renderSetupStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={profileData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Date of Birth
              </label>
              <input
                type="date"
                value={profileData.dob || ''}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Location</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                City
              </label>
              <input
                type="text"
                value={profileData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter your city"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Gender</h2>
            <div className="grid grid-cols-1 gap-3">
              {genderOptions.map((gender) => (
                <label
                  key={gender}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    profileData.gender === gender
                      ? 'bg-[#4ECDC4] text-white'
                      : 'bg-white text-[#2D3436] hover:bg-[#E0F7F5]'
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={profileData.gender === gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="hidden"
                  />
                  {gender}
                </label>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Professional Information</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Workplace
              </label>
              <input
                type="text"
                value={profileData.workplace || ''}
                onChange={(e) => handleInputChange('workplace', e.target.value)}
                placeholder="Enter your workplace"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={profileData.job_title || ''}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="Enter your job title"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Education
              </label>
              <input
                type="text"
                value={profileData.education || ''}
                onChange={(e) => handleInputChange('education', e.target.value)}
                placeholder="Enter your educational institution"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Preferences</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Communication Style
              </label>
              <select
                value={profileData.communication_style || ''}
                onChange={(e) => handleInputChange('communication_style', e.target.value)}
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              >
                <option value="">Select your preferred style</option>
                {communicationStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Support Type
              </label>
              <select
                value={profileData.support_type || ''}
                onChange={(e) => handleInputChange('support_type', e.target.value)}
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              >
                <option value="">Select your preferred support type</option>
                {supportTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!isSetupComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#2D3436] mb-2">Complete Your Profile</h1>
            <p className="text-[#636E72]">Let's get to know you better to provide personalized support.</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep ? 'bg-[#4ECDC4] text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {renderSetupStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-6 py-2 border border-[#4ECDC4] text-[#4ECDC4] rounded-lg hover:bg-[#4ECDC4] hover:text-white transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (currentStep < 5) {
                  setCurrentStep(prev => prev + 1)
                } else {
                  handleSetupComplete()
                }
              }}
              className="px-6 py-2 bg-[#4ECDC4] text-white rounded-lg hover:bg-[#45B7AF] transition-colors ml-auto"
            >
              {currentStep < 5 ? 'Next' : 'Complete'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900">My Profile</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-500 text-3xl">
                {profileData.name?.charAt(0)}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
              <p className="text-gray-600">{profileData.email}</p>
              <p className="text-sm text-gray-500 mt-1">Member since {profileData.joinDate}</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'bookings'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'progress'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'edit'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          {activeTab === 'overview' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-6">Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{profileData.completed_exercises}</div>
                  <div className="text-gray-600">Completed Exercises</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{profileData.total_minutes}</div>
                  <div className="text-gray-600">Total Minutes</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{profileData.streak}</div>
                  <div className="text-gray-600">Day Streak</div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-gray-900">{profileData.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="text-gray-900">{profileData.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Workplace</p>
                    <p className="text-gray-900">{profileData.workplace}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Job Title</p>
                    <p className="text-gray-900">{profileData.job_title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Education</p>
                    <p className="text-gray-900">{profileData.education}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Religious Beliefs</p>
                    <p className="text-gray-900">{profileData.religious_beliefs}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-blue-800 mb-4">Upcoming Sessions</h2>
                <div className="space-y-4">
                  {profileData.upcomingSessions?.map(session => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{session.therapistName}</h3>
                          <p className="text-gray-600">{session.date} at {session.time}</p>
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mt-2">
                            {session.type}
                          </span>
                        </div>
                        <div className="space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                            Join
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors">
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Past Sessions */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-blue-800 mb-4">Past Sessions</h2>
                <div className="space-y-4">
                  {profileData.pastSessions?.map(session => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{session.therapistName}</h3>
                          <p className="text-gray-600">{session.date} at {session.time}</p>
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm mt-2">
                            Completed
                          </span>
                        </div>
                        <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                          View Notes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-6">Progress Tracking</h2>
              <div className="space-y-6">
                {/* Weekly Activity */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Activity</h3>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-around p-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="flex flex-col items-center">
                        <div
                          className="w-8 bg-blue-600 rounded-t"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                        <span className="text-sm text-gray-600 mt-2">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Goals */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Goals</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Complete 20 exercises</h4>
                        <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: '60%' }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-600">12/20</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Attend 4 therapy sessions</h4>
                        <div className="w-48 h-2 bg-gray-200 rounded-full mt-2">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: '75%' }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-600">3/4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-blue-800 mb-6">Edit Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workplace
                  </label>
                  <input
                    type="text"
                    value={profileData.workplace || ''}
                    onChange={(e) => handleInputChange('workplace', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={profileData.job_title || ''}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    value={profileData.education || ''}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Religious Beliefs
                  </label>
                  <input
                    type="text"
                    value={profileData.religious_beliefs || ''}
                    onChange={(e) => handleInputChange('religious_beliefs', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Communication Style
                  </label>
                  <select
                    value={profileData.communication_style || ''}
                    onChange={(e) => handleInputChange('communication_style', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your preferred style</option>
                    {communicationStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Support Type
                  </label>
                  <select
                    value={profileData.support_type || ''}
                    onChange={(e) => handleInputChange('support_type', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your preferred support type</option>
                    {supportTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveChanges}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}