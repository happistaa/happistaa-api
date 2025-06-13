'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface MindfulnessTool {
  id: string
  title: string
  description: string
  type: 'journal' | 'meditation' | 'affirmation'
  url?: string
  icon: string
}

export default function MindfulnessTools() {
  const [activeTab, setActiveTab] = useState<'all' | 'journal' | 'meditation' | 'affirmation'>('all')

  const mindfulnessTools: MindfulnessTool[] = [
    {
      id: '1',
      title: 'Daily Journal',
      description: 'Express your thoughts and feelings in a safe space. Practice self-reflection and track your emotional journey.',
      type: 'journal',
      icon: '📝'
    },
    {
      id: '2',
      title: 'Guided Meditation',
      description: '10-minute calming meditation session to help you find peace and clarity.',
      type: 'meditation',
      url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
      icon: '🧘‍♀️'
    },
    {
      id: '3',
      title: 'Positive Affirmations',
      description: 'Daily affirmations to boost your mood and cultivate a positive mindset.',
      type: 'affirmation',
      icon: '✨'
    },
    {
      id: '4',
      title: 'Breathing Exercise',
      description: '4-7-8 breathing technique for stress relief and anxiety management.',
      type: 'meditation',
      icon: '🫁'
    },
    {
      id: '5',
      title: 'Gratitude Journal',
      description: 'Focus on the positive aspects of your life and cultivate gratitude.',
      type: 'journal',
      icon: '🙏'
    },
    {
      id: '6',
      title: 'Body Scan Meditation',
      description: 'Progressive relaxation technique to release physical tension.',
      type: 'meditation',
      url: 'https://www.youtube.com/watch?v=ihO02wIDzgU',
      icon: '👣'
    },
    {
      id: '7',
      title: 'Morning Affirmations',
      description: 'Start your day with positive energy and intention.',
      type: 'affirmation',
      icon: '🌅'
    },
    {
      id: '8',
      title: 'Mindful Walking',
      description: 'Combine physical activity with mindfulness practice.',
      type: 'meditation',
      icon: '🚶‍♀️'
    }
  ]

  const filteredTools = activeTab === 'all' 
    ? mindfulnessTools 
    : mindfulnessTools.filter(tool => tool.type === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">Mindfulness Tools</h1>
          <p className="text-lg text-blue-600 max-w-2xl mx-auto">
            Discover a variety of tools to support your mental wellness journey. Practice mindfulness, meditation, and self-reflection at your own pace.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mb-8">
          {(['all', 'journal', 'meditation', 'affirmation'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{tool.icon}</div>
                <h3 className="text-xl font-semibold text-blue-800 mb-2">{tool.title}</h3>
                <p className="text-blue-600 mb-4">{tool.description}</p>
                {tool.url ? (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-500 hover:text-blue-700"
                  >
                    Try Now
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      // Handle tool-specific action
                      if (tool.type === 'journal') {
                        // Open journal interface
                        window.location.href = `/mindfulness/journal/${tool.id}`
                      } else if (tool.type === 'affirmation') {
                        // Show affirmations
                        window.location.href = `/mindfulness/affirmations/${tool.id}`
                      }
                    }}
                    className="inline-flex items-center text-blue-500 hover:text-blue-700"
                  >
                    Start Practice
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* AI Companion Link */}
        <div className="mt-12 text-center">
          <Link
            href="/ai-companion"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition-colors"
          >
            Chat with AI Companion
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
} 