import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { theme } from '@/styles/theme'
import { supabase } from '@/lib/supabase'

interface ProfileSetupProps {
  onComplete: (profileData: UserProfile) => void
}

export interface UserProfile {
  id: string
  name: string
  dob: string
  location: string
  gender: string
  workplace: string
  jobTitle: string
  education: string
  religiousBeliefs: string
  interests: string[]
  languages: string[]
  availability: string
  preferredTime: string
  communicationStyle: string
  supportType: string
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

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({})

  const handleInputChange = (field: keyof UserProfile, value: string | string[]) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 9) {
      setCurrentStep(prev => prev + 1)
    } else {
      onComplete(profileData as UserProfile)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const renderStep = () => {
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
            <h2 className="text-2xl font-semibold text-[#2D3436]">Workplace</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Where do you work?
              </label>
              <input
                type="text"
                value={profileData.workplace || ''}
                onChange={(e) => handleInputChange('workplace', e.target.value)}
                placeholder="Enter your workplace"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Job Title</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                What's your job title?
              </label>
              <input
                type="text"
                value={profileData.jobTitle || ''}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                placeholder="Enter your job title"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Education</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Where did you study?
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

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Religious Beliefs</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                What are your religious beliefs?
              </label>
              <input
                type="text"
                value={profileData.religiousBeliefs || ''}
                onChange={(e) => handleInputChange('religiousBeliefs', e.target.value)}
                placeholder="Share your religious beliefs (optional)"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Communication Preferences</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Communication Style
              </label>
              <select
                value={profileData.communicationStyle || ''}
                onChange={(e) => handleInputChange('communicationStyle', e.target.value)}
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
                value={profileData.supportType || ''}
                onChange={(e) => handleInputChange('supportType', e.target.value)}
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

      case 9:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2D3436]">Availability</h2>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                When are you available?
              </label>
              <select
                value={profileData.availability || ''}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              >
                <option value="">Select your availability</option>
                <option value="Weekday evenings">Weekday evenings</option>
                <option value="Weekends">Weekends</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#636E72] mb-2">
                Preferred Time
              </label>
              <input
                type="text"
                value={profileData.preferredTime || ''}
                onChange={(e) => handleInputChange('preferredTime', e.target.value)}
                placeholder="e.g., 7 PM - 9 PM"
                className="w-full p-3 border border-[#E0F7F5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F9] to-[#FFE3E3] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-[#2D3436]">
                Step {currentStep} of 9
              </h1>
              <div className="w-32 h-2 bg-[#E0F7F5] rounded-full">
                <div
                  className="h-2 bg-[#4ECDC4] rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 9) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {renderStep()}

          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBack}
                className="px-6 py-3 rounded-full text-[#636E72] hover:bg-[#F5F5F5] transition-colors"
              >
                Back
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              className="ml-auto bg-[#4ECDC4] text-white px-6 py-3 rounded-full hover:bg-[#2E8B84] transition-colors"
            >
              {currentStep === 9 ? 'Complete' : 'Next'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ProfileSetup