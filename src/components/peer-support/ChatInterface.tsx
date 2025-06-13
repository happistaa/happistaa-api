'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import usePeerSupport, { PeerMatch, ChatMessage } from '@/hooks/usePeerSupport';

interface ChatInterfaceProps {
  peerId?: string;
  peer?: PeerMatch;
  onClose: () => void;
  initialIsAnonymous?: boolean;
}

export default function ChatInterface({ 
  peerId, 
  peer: initialPeer,
  onClose, 
  initialIsAnonymous = false 
}: ChatInterfaceProps) {
  const { 
    isLoading, 
    error, 
    messages, 
    selectedPeer, 
    setSelectedPeer,
    fetchMessages, 
    sendMessage 
  } = usePeerSupport();
  
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(initialIsAnonymous);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when component mounts
  useEffect(() => {
    if (peerId) {
      fetchMessages(peerId);
    } else if (initialPeer) {
      setSelectedPeer(initialPeer);
      fetchMessages(initialPeer.id);
    }
  }, [peerId, initialPeer, fetchMessages, setSelectedPeer]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedPeer) return;
    
    await sendMessage(selectedPeer.id, message, isAnonymous);
    setMessage('');
  };

  if (!selectedPeer) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No peer selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="mr-4 text-gray-600 hover:text-blue-500"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <div className="flex items-center">
              <div className="relative mr-2">
                <span className="text-2xl">{selectedPeer.avatar}</span>
                {selectedPeer.isActive && (
                  <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{selectedPeer.name}</h2>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">{selectedPeer.isActive ? 'Active now' : 'Offline'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Anonymous toggle */}
          <div className="flex items-center">
            <label className="text-sm text-gray-600 mr-2">Anonymous:</label>
            <div 
              className={`w-10 h-5 rounded-full flex items-center cursor-pointer transition-colors ${
                isAnonymous ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              onClick={() => setIsAnonymous(!isAnonymous)}
            >
              <div 
                className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                  isAnonymous ? 'translate-x-5' : 'translate-x-1'
                }`} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.sender === 'you' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  {msg.sender !== 'you' && (
                    <div className="text-xs text-gray-500 mb-1">
                      {msg.isAnonymous ? 'Anonymous' : msg.sender}
                    </div>
                  )}
                  <p>{msg.message}</p>
                  <div className={`text-xs mt-1 ${msg.sender === 'you' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isAnonymous ? "Type anonymously..." : "Type your message..."}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className={`ml-2 ${!message.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="material-icons">send</span>
          </Button>
        </div>
      </div>
    </div>
  );
} 