'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface JournalEntry {
  id: string
  date: Date
  content: string
  mood: string
}

// Helper function to get mood numeric value for chart
const getMoodValue = (mood: string): number => {
  const moodMap: { [key: string]: number } = {
    '😊': 5, // Happy
    '😌': 4, // Content
    '😐': 3, // Neutral
    '😔': 2, // Sad
    '😢': 1, // Very sad
  };
  return moodMap[mood] || 3;
};

// Helper function to format dates for the mood tracker
const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function JournalPage({ params }: { params: { id: string } }) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [newEntry, setNewEntry] = useState('')
  const [mood, setMood] = useState('😊')
  const [isSaving, setIsSaving] = useState(false)
  const [showMoodTracker, setShowMoodTracker] = useState(false)

  const moods = ['😊', '😌', '😐', '😔', '😢']

  useEffect(() => {
    // Load journal entries from localStorage
    const savedEntries = localStorage.getItem(`journal_${params.id}`)
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [params.id])

  const saveEntry = () => {
    if (!newEntry.trim()) return

    setIsSaving(true)
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      content: newEntry,
      mood: mood
    }

    const updatedEntries = [entry, ...entries]
    setEntries(updatedEntries)
    localStorage.setItem(`journal_${params.id}`, JSON.stringify(updatedEntries))
    setNewEntry('')
    setIsSaving(false)
  }

  // Get mood tracking data for the chart
  const getMoodChartData = () => {
    // Sort entries by date (oldest to newest) and take last 14 entries
    const sortedEntries = [...entries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14);
    
    return sortedEntries.map(entry => ({
      date: formatDate(entry.date),
      mood: entry.mood,
      value: getMoodValue(entry.mood)
    }));
  };

  const moodChartData = getMoodChartData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-rose-800">Daily Journal</h1>
            <p className="text-rose-600">Express your thoughts and feelings in a safe space</p>
          </div>
          <Link
            href="/mindfulness"
            className="text-rose-600 hover:text-rose-800 transition-colors"
          >
            ← Back to Tools
          </Link>
        </div>

        {/* Mood Tracker Toggle */}
        {entries.length > 1 && (
          <div className="mb-6">
            <button 
              onClick={() => setShowMoodTracker(!showMoodTracker)}
              className="flex items-center text-rose-700 font-medium"
            >
              <span className="mr-2">{showMoodTracker ? 'Hide' : 'Show'} Mood Tracker</span>
              <span className="text-xl">{showMoodTracker ? '↑' : '↓'}</span>
            </button>
          </div>
        )}

        {/* Horizontal Mood Tracker */}
        {showMoodTracker && moodChartData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-rose-700 mb-4">Your Mood Timeline</h2>
            
            <div className="relative pt-5">
              {/* Mood Level Labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                <span>Great</span>
                <span>Good</span>
                <span>Okay</span>
                <span>Low</span>
                <span>Bad</span>
              </div>

              {/* Chart Grid Lines */}
              <div className="ml-12 grid grid-rows-5 gap-0 h-32">
                {[5, 4, 3, 2, 1].map(level => (
                  <div key={level} className="border-b border-gray-200 relative">
                    {level === 3 && <div className="absolute left-0 right-0 border-b border-gray-300 -top-px"></div>}
                  </div>
                ))}
              </div>

              {/* Mood Data Points */}
              <div className="absolute top-0 bottom-0 left-12 right-0 flex items-end">
                <div className="h-32 w-full flex items-end justify-between pt-5">
                  {moodChartData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center">
                      {/* Mood Emoji */}
                      <div 
                        className="z-10 text-xl"
                        style={{ 
                          marginBottom: `${(data.value - 1) * 6}px`,
                          transform: 'translateY(-50%)'
                        }}
                      >
                        {data.mood}
                      </div>
                      
                      {/* Connecting Lines */}
                      {index < moodChartData.length - 1 && (
                        <div 
                          className="absolute h-0.5 bg-rose-300"
                          style={{
                            width: `${100 / (moodChartData.length - 1)}%`,
                            left: `${index * (100 / (moodChartData.length - 1))}%`,
                            bottom: `${(data.value - 1) * 25}%`,
                            transform: `rotate(${Math.atan2(
                              (moodChartData[index + 1].value - data.value) * 25,
                              100 / (moodChartData.length - 1)
                            ) * (180 / Math.PI)}deg)`,
                            transformOrigin: 'left center'
                          }}
                        />
                      )}
                      
                      {/* Date Label */}
                      <div className="text-xs text-gray-500 mt-2 -rotate-45 origin-top-left">
                        {data.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Entry Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="mb-4">
            <label className="block text-rose-700 mb-2">How are you feeling?</label>
            
            {/* Horizontal mood selector */}
            <div className="relative pt-2 pb-6">
              {/* Mood emojis with labels */}
              <div className="grid grid-cols-5 gap-0 w-full">
                {moods.map((m, index) => (
                  <div key={m} className="flex flex-col items-center">
                <button
                  onClick={() => setMood(m)}
                      className={`text-2xl p-3 rounded-full transition-colors ${
                        mood === m ? 'bg-rose-100 scale-110 transform' : 'hover:bg-rose-50'
                  }`}
                >
                  {m}
                </button>
                    <span className="text-xs text-gray-600 mt-1">
                      {index === 0 ? 'Great' : 
                       index === 1 ? 'Good' : 
                       index === 2 ? 'Okay' : 
                       index === 3 ? 'Low' : 'Bad'}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Slider track */}
              <div className="absolute h-1 bg-gray-200 left-[10%] right-[10%] top-[35px] rounded-full">
                <div 
                  className="absolute h-1 bg-gradient-to-r from-green-400 via-yellow-300 to-red-400 left-0 top-0 rounded-full"
                  style={{ width: '100%' }}
                ></div>
                
                {/* Current position indicator */}
                <div 
                  className="absolute w-3 h-3 bg-rose-500 rounded-full -top-1 transform -translate-x-1/2"
                  style={{ 
                    left: `${10 + (moods.indexOf(mood) * 80 / (moods.length - 1))}%`, 
                    transition: 'left 0.3s ease-out' 
                  }}
                ></div>
              </div>
            </div>
          </div>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder="Write your thoughts here..."
            className="w-full h-32 p-4 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none"
          />
          <button
            onClick={saveEntry}
            disabled={isSaving || !newEntry.trim()}
            className={`mt-4 px-6 py-2 bg-rose-500 text-white rounded-lg transition-colors ${
              isSaving || !newEntry.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-rose-600'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>

        {/* Journal Entries */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{entry.mood}</span>
                  <span className="text-rose-600">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-rose-400">
                  {new Date(entry.date).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 