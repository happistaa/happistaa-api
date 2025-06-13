'use client'

import { useState } from 'react'

interface MatchingPreferences {
  experience: string[]
  availability: string
  preferredTopics: string[]
}

export default function PeerMatching() {
  const [preferences, setPreferences] = useState<MatchingPreferences>({
    experience: [],
    availability: 'anytime',
    preferredTopics: []
  })

  const experienceOptions = [
    'Anxiety & Stress',
    'Depression',
    'Work-Life Balance',
    'Relationships',
    'Mindfulness',
    'Personal Growth'
  ]

  const topicOptions = [
    'Coping Strategies',
    'Daily Routines',
    'Self-Care',
    'Goal Setting',
    'Emotional Support',
    'Professional Development'
  ]

  const handleExperienceToggle = (exp: string) => {
    setPreferences(prev => ({
      ...prev,
      experience: prev.experience.includes(exp)
        ? prev.experience.filter(e => e !== exp)
        : [...prev.experience, exp]
    }))
  }

  const handleTopicToggle = (topic: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter(t => t !== topic)
        : [...prev.preferredTopics, topic]
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-blue-800 mb-6">Find Your Peer Match</h2>
      
      {/* Experience Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Your Experience</h3>
        <div className="flex flex-wrap gap-2">
          {experienceOptions.map(exp => (
            <button
              key={exp}
              onClick={() => handleExperienceToggle(exp)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                preferences.experience.includes(exp)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>
      </div>

      {/* Availability Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Preferred Availability</h3>
        <select
          value={preferences.availability}
          onChange={(e) => setPreferences(prev => ({ ...prev, availability: e.target.value }))}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="anytime">Anytime</option>
          <option value="morning">Morning (6AM - 12PM)</option>
          <option value="afternoon">Afternoon (12PM - 6PM)</option>
          <option value="evening">Evening (6PM - 12AM)</option>
        </select>
      </div>

      {/* Topics Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Topics of Interest</h3>
        <div className="flex flex-wrap gap-2">
          {topicOptions.map(topic => (
            <button
              key={topic}
              onClick={() => handleTopicToggle(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                preferences.preferredTopics.includes(topic)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          // In a real app, this would trigger the matching algorithm
          console.log('Matching preferences:', preferences)
        }}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Find Matches
      </button>
    </div>
  )
} 