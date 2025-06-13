'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/profile/ProfileSetup';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import usePeerSupport, { PeerMatch } from '@/hooks/usePeerSupport';

export default function PeerDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [peer, setPeer] = useState<PeerMatch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, message: string, timestamp: Date, isAnonymous?: boolean}>>([]);
  const [myChatsList, setMyChatsList] = useState<PeerMatch[]>([]);
  
  // Use the peer support hook
  const { fetchPeers, peers, isLoading: peersLoading } = usePeerSupport();

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = !!localStorage.getItem('isAuthenticated');
    setIsAuthenticated(isAuth);

    // Get user profile if available
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      const profile = JSON.parse(profileData);
      setUserProfile(profile);
      
      // Only consider profile complete if the user has fully completed setup
      setIsProfileComplete(profile.completedSetup !== false);
      
      // Set anonymous mode by default for support seekers
      if (profile.supportType === 'support-seeker') {
        setIsAnonymous(true);
      }
      
      // Get my chats list if available
      const myChatsData = localStorage.getItem('myChats');
      if (myChatsData) {
        setMyChatsList(JSON.parse(myChatsData));
      }
    }
    
    // Fetch peer data from API
    const fetchPeerData = async () => {
      try {
        setIsLoading(true);
        
        // First try to find the peer in the existing peers list
        if (peers && peers.length > 0) {
          const foundPeer = peers.find(p => p.id === params.id);
          if (foundPeer) {
            setPeer(foundPeer);
            setIsLoading(false);
            return;
          }
        }
        
        // If not found in existing peers, fetch all peers and then find the one we need
        await fetchPeers();
      } catch (error) {
        console.error("Error fetching peer data:", error);
      }
    };
    
    fetchPeerData();
  }, [params.id, fetchPeers, peers]);
  
  // Update peer when peers list changes
  useEffect(() => {
    if (peers && peers.length > 0) {
      const foundPeer = peers.find(p => p.id === params.id);
      if (foundPeer) {
        setPeer(foundPeer);
      }
      setIsLoading(false);
    }
  }, [peers, params.id]);

  const handleConnect = () => {
    if (!peer) return;
    
    // Check if user is authenticated first
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=peer-support');
      return;
    }
    
    // Then check if profile is complete
    if (!isProfileComplete) {
      router.push('/onboarding/profile-setup');
      return;
    }
    
    // Get the user's support type
    const supportType = userProfile?.supportType;
    
    // Check if the user is a support seeker and the peer is a support provider
    if (supportType === 'support-seeker' && peer.supportType === 'support-giver') {
      // For support seekers connecting with providers, send a request and open chat immediately
      
      // Set anonymous mode to true by default for support seekers
      const isAnonymousMode = true;
      
      // Add system welcome message
      const initialMessages = [
        {
          sender: 'system',
          message: `You are now connected with ${peer.name}. Your request has been sent and you can start chatting anonymously.`,
          timestamp: new Date()
        }
      ];
      
      // Add to my chats list if not already there
      const updatedChatsList = [...myChatsList];
      if (!updatedChatsList.some(chat => chat.id === peer.id)) {
        updatedChatsList.push(peer);
        setMyChatsList(updatedChatsList);
        localStorage.setItem('myChats', JSON.stringify(updatedChatsList));
      }
      
      // Store the selected peer and chat state in localStorage
      localStorage.setItem('selectedPeer', JSON.stringify(peer));
      localStorage.setItem('isAnonymous', JSON.stringify(isAnonymousMode));
      localStorage.setItem('chatMessages', JSON.stringify(initialMessages));
      
      // Redirect to peer support page with chat open
      router.push('/peer-support?chat=open');
    } else {
      // For support providers or regular connections
      
      // Add system welcome message
      const initialMessages = [
        {
          sender: 'system',
          message: `You are now connected with ${peer.name}. This conversation is private and secure.`,
          timestamp: new Date()
        }
      ];
      
      // Add to my chats list if not already there
      const updatedChatsList = [...myChatsList];
      if (!updatedChatsList.some(chat => chat.id === peer.id)) {
        updatedChatsList.push(peer);
        setMyChatsList(updatedChatsList);
        localStorage.setItem('myChats', JSON.stringify(updatedChatsList));
      }
      
      // Store the selected peer and chat state in localStorage
      localStorage.setItem('selectedPeer', JSON.stringify(peer));
      localStorage.setItem('isAnonymous', JSON.stringify(isAnonymous));
      localStorage.setItem('chatMessages', JSON.stringify(initialMessages));
      
      // Redirect to peer support page with chat open
      router.push('/peer-support?chat=open');
    }
  };

  if (isLoading || peersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!peer) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Friend not found</h1>
          <p className="text-gray-600 mb-6">The friend you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => router.push('/peer-support')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Back to Peer Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Button
            onClick={() => router.push('/peer-support')}
            variant="outline"
            className="flex items-center"
          >
            <span className="material-icons mr-1">arrow_back</span>
            Back
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="flex items-center"
          >
            <span className="material-icons">home</span>
          </Button>
        </div>

        {/* Friend Profile Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
            <div className="flex items-start space-x-4">
              <div className="relative">
                <div className="text-6xl">{peer.avatar}</div>
                {peer.isActive && (
                  <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">{peer.name}</h1>
                  {peer.certifiedMentor && (
                    <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                      Certified
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-yellow-500 material-icons text-sm">star</span>
                  <span className="text-sm text-gray-700 ml-1">{peer.rating}</span>
                  <span className="text-xs text-gray-500 ml-1">({peer.totalRatings} ratings)</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-sm text-gray-600">{peer.location}</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    {peer.supportType === 'support-giver' ? 'Provides support' : 
                     peer.supportType === 'support-seeker' ? 'Needs support' : 
                     'Both needs and provides support'}
                  </span>
                  {peer.peopleSupported && (
                    <span className="ml-2 text-sm text-gray-600">
                      • Supported {peer.peopleSupported} people
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Journey Note */}
            {peer.journeyNote && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Journey Note</h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <p className="text-gray-700">{peer.journeyNote}</p>
                </div>
              </div>
            )}

            {/* Experience Areas */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Experience Areas</h2>
              <div className="flex flex-wrap gap-2">
                {peer.experienceAreas.map((area, i) => {
                  const isShared = userProfile?.supportPreferences?.includes(area);
                  return (
                    <span 
                      key={i}
                      className={`px-3 py-1 rounded-full ${
                        isShared
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {isShared && <span className="mr-1">✓</span>}
                      {area}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Match Score */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Match Score</h2>
              <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#5F9FFF] to-[#8D72E6]" 
                  style={{ width: `${peer.matchScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">0%</span>
                <span className="text-xs font-medium text-blue-600">{peer.matchScore}%</span>
                <span className="text-xs text-gray-500">100%</span>
              </div>
            </div>

            {/* Connect Button */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleConnect}
                className="bg-blue-500 hover:bg-blue-600 px-8 py-6 text-lg rounded-full"
              >
                Connect with {peer.name}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}