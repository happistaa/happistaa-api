'use client'

import { useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  experience: string
  availability: string
}

export default function PeerSupport() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{sender: string, text: string}>>([])

  // Mock data for demonstration
  const availableUsers: User[] = [
    {
      id: '1',
      name: 'Sarah',
      experience: 'Anxiety & Stress Management',
      availability: 'Available Now'
    },
    {
      id: '2',
      name: 'Michael',
      experience: 'Work-Life Balance',
      availability: 'Available Now'
    },
    {
      id: '3',
      name: 'Emma',
      experience: 'Mindfulness & Meditation',
      availability: 'Available in 5 min'
    }
  ]

  const handleSendMessage = () => {
    if (message.trim() && selectedUser) {
      setChatHistory([...chatHistory, { sender: 'You', text: message }])
      setMessage('')
      // In a real app, this would send the message to the backend
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Peer Support</h1>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Available Peers List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Available Peers</h2>
          <div className="space-y-4">
            {availableUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <h3 className="font-medium text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.experience}</p>
                <span className="text-xs text-green-600">{user.availability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
          {selectedUser ? (
            <>
              <div className="border-b pb-4 mb-4">
                <h2 className="text-xl font-semibold text-blue-800">Chat with {selectedUser.name}</h2>
                <p className="text-sm text-gray-600">{selectedUser.experience}</p>
              </div>
              
              <div className="h-96 overflow-y-auto mb-4 space-y-4">
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      chat.sender === 'You'
                        ? 'bg-blue-100 ml-auto'
                        : 'bg-gray-100'
                    } max-w-[80%]`}
                  >
                    <p className="text-sm font-medium text-gray-900">{chat.sender}</p>
                    <p className="text-gray-700">{chat.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a peer to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 