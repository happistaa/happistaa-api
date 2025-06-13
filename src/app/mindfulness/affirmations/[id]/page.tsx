'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Affirmation {
  id: string
  text: string
  category: string
}

export default function AffirmationsPage({ params }: { params: { id: string } }) {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const affirmationCategories = {
    '1': 'general',
    '3': 'morning',
    '7': 'evening'
  }

  const allAffirmations: Record<string, Affirmation[]> = {
    general: [
      { id: '1', text: 'I am capable of handling whatever comes my way', category: 'general' },
      { id: '2', text: 'I choose to be confident and self-assured', category: 'general' },
      { id: '3', text: 'I am worthy of love, respect, and happiness', category: 'general' },
      { id: '4', text: 'I trust in my ability to make good decisions', category: 'general' },
      { id: '5', text: 'I am becoming better and stronger every day', category: 'general' }
    ],
    morning: [
      { id: '1', text: 'Today is full of endless possibilities', category: 'morning' },
      { id: '2', text: 'I am ready to embrace the day with positivity', category: 'morning' },
      { id: '3', text: 'I have the power to create a beautiful day', category: 'morning' },
      { id: '4', text: 'I am grateful for this new day and its opportunities', category: 'morning' },
      { id: '5', text: 'I choose to start my day with peace and joy', category: 'morning' }
    ],
    evening: [
      { id: '1', text: 'I am proud of what I accomplished today', category: 'evening' },
      { id: '2', text: 'I release any tension and welcome peace', category: 'evening' },
      { id: '3', text: 'I am grateful for the lessons of today', category: 'evening' },
      { id: '4', text: 'I deserve a restful and peaceful night', category: 'evening' },
      { id: '5', text: 'Tomorrow is a new opportunity for growth', category: 'evening' }
    ]
  }

  useEffect(() => {
    const category = affirmationCategories[params.id as keyof typeof affirmationCategories] || 'general'
    setAffirmations(allAffirmations[category])
    setCurrentAffirmation(allAffirmations[category][0])
  }, [params.id])

  const speakAffirmation = (text: string) => {
    if (!window.speechSynthesis) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const getNextAffirmation = () => {
    if (!currentAffirmation) return
    const currentIndex = affirmations.findIndex(a => a.id === currentAffirmation.id)
    const nextIndex = (currentIndex + 1) % affirmations.length
    setCurrentAffirmation(affirmations[nextIndex])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Daily Affirmations</h1>
            <p className="text-primary">Positive statements to boost your mood and mindset</p>
          </div>
          <Link
            href="/mindfulness"
            className="text-primary hover:text-primary transition-colors"
          >
            ← Back to Tools
          </Link>
        </div>

        {/* Current Affirmation */}
        {currentAffirmation && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center">
            <p className="text-2xl text-primary mb-6">{currentAffirmation.text}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => speakAffirmation(currentAffirmation.text)}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary transition-colors"
              >
                {isSpeaking ? 'Stop' : 'Speak'}
              </button>
              <button
                onClick={getNextAffirmation}
                className="px-6 py-2 bg-primary text-primary rounded-lg hover:bg-primary transition-colors"
              >
                Next Affirmation
              </button>
            </div>
          </div>
        )}

        {/* All Affirmations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-4">All Affirmations</h2>
          <div className="space-y-4">
            {affirmations.map((affirmation) => (
              <div
                key={affirmation.id}
                className={`p-4 rounded-lg transition-colors ${
                  currentAffirmation?.id === affirmation.id
                    ? 'bg-primary'
                    : 'hover:bg-primary'
                }`}
              >
                <p className="text-primary">{affirmation.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 