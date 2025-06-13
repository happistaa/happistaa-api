import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export interface PeerMatch {
  id: string;
  name: string;
  avatar: string;
  matchScore: number;
  experienceAreas: string[];
  supportType: 'support-giver' | 'support-seeker';
  location: string;
  isActive: boolean;
  rating: number;
  totalRatings: number;
  certifiedMentor: boolean;
  peopleSupported?: number;
  journeyNote?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
  isAnonymous: boolean;
  senderId?: string;
  receiverId?: string;
}

export interface SupportRequest {
  id: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  is_anonymous: boolean;
  sender?: {
    name: string;
    avatar_url: string;
    support_preferences: string[];
    location: string;
    journey_note: string;
  };
}

export default function usePeerSupport() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [peers, setPeers] = useState<PeerMatch[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<PeerMatch | null>(null);
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Check authentication status and get user profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        if (session?.user?.id) {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (!error && profile) {
            setUserProfile(profile);
          } else {
            console.error('Error fetching user profile:', error);
          }
        }
      } catch (err) {
        console.error('Error checking auth status:', err);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setIsAuthenticated(!!session);
      
      if (session?.user?.id) {
        // Fetch user profile on auth state change
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profile) {
          setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch peer matches
  const fetchPeers = useCallback(async (filters?: Record<string, string>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // If user is authenticated and we have their profile, set default filters
      // based on their support type if no filters are provided
      const finalFilters = { ...filters };
      
      console.log("User profile in fetchPeers:", userProfile);
      
     /* if (!finalFilters.supportType && userProfile) {
        if (userProfile.support_type === 'support-seeker' || userProfile.supportType === 'support-seeker') {
          // Support seekers see support givers by default
          finalFilters.supportType = 'support-giver';
          console.log("User is a support seeker, showing support givers");
        } else if (userProfile.support_type === 'support-giver' || userProfile.supportType === 'support-giver') {
          // Support givers see support seekers by default
          finalFilters.supportType = 'support-seeker';
          console.log("User is a support giver, showing support seekers");
        }
      } */
      
      // Build query params
      const params = new URLSearchParams();
      if (finalFilters) {
        Object.entries(finalFilters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }
      
      console.log(`Fetching peers with params: ${params.toString()}`);
      const response = await fetch(`/api/peer-support?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch peers');
      }
      
      const data = await response.json();
      console.log("API response data:", data);
      
      if (data.peers && Array.isArray(data.peers)) {
        console.log(`Setting ${data.peers.length} peers from API response`);
        data.peers.forEach((peer: PeerMatch) => {
          console.log(`- Peer ${peer.id}: name=${peer.name}, supportType=${peer.supportType}`);
        });
        setPeers(data.peers);
      } else {
        console.warn("No peers data returned from API");
        setPeers([]);
      }
    } catch (err) {
      console.error('Error fetching peers:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Don't clear the peers array on error to maintain any existing data
    } finally {
      setIsLoading(false);
    }
  }, [userProfile]);

  // Fetch support requests
  const fetchSupportRequests = useCallback(async (type: 'sent' | 'received' | 'all' = 'all') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/peer-support/requests?type=${type}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch support requests');
      }
      
      const data = await response.json();
      setSupportRequests(data.requests || []);
    } catch (err) {
      console.error('Error fetching support requests:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a support request
  const createSupportRequest = useCallback(async (receiverId: string, message: string, isAnonymous: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/peer-support');
        return null;
      }
      
      const response = await fetch('/api/peer-support/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          message,
          is_anonymous: isAnonymous
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create support request');
      }
      
      const data = await response.json();
      
      // Refresh the support requests list
      await fetchSupportRequests();
      
      return data.request;
    } catch (err) {
      console.error('Error creating support request:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router, fetchSupportRequests]);

  // Update a support request (accept/reject)
  const updateSupportRequest = useCallback(async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/peer-support/requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: requestId,
          status
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update support request');
      }
      
      const data = await response.json();
      
      // Refresh the support requests list
      await fetchSupportRequests();
      
      return data.request;
    } catch (err) {
      console.error('Error updating support request:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchSupportRequests]);

  // Fetch chat messages
  const fetchMessages = useCallback(async (peerId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/peer-support/chats?peer_id=${peerId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      const data = await response.json();
      setMessages(data.messages || []);
      
      // If there's peer data, update the selected peer
      if (data.peer) {
        setSelectedPeer(prevPeer => {
          if (!prevPeer || prevPeer.id !== data.peer.id) {
            return {
              id: data.peer.id,
              name: data.peer.name,
              avatar: data.peer.avatar,
              matchScore: 0,
              experienceAreas: [],
              supportType: 'support-giver',
              location: '',
              isActive: true,
              rating: 0,
              totalRatings: 0,
              certifiedMentor: false
            };
          }
          return prevPeer;
        });
      }
      
      return data.messages;
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send a chat message
  const sendMessage = useCallback(async (receiverId: string, message: string, isAnonymous: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/peer-support');
        return null;
      }
      
      const response = await fetch('/api/peer-support/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver_id: receiverId,
          message,
          is_anonymous: isAnonymous
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      const data = await response.json();
      
      // Add the new message to the list
      setMessages(prev => [...prev, data.chat]);
      
      return data.chat;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  // Connect with a peer (this combines creating a request and opening the chat)
  const connectWithPeer = useCallback(async (peer: PeerMatch, message: string = 'I would like to connect with you.', isAnonymous: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!isAuthenticated) {
        router.push('/auth/login?redirect=/peer-support');
        return false;
      }
      
      // Create a support request
      await createSupportRequest(peer.id, message, isAnonymous);
      
      // Set the selected peer
      setSelectedPeer(peer);
      
      // Fetch messages (this might be empty initially)
      await fetchMessages(peer.id);
      
      return true;
    } catch (err) {
      console.error('Error connecting with peer:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, router, createSupportRequest, fetchMessages]);

  // Setup real-time subscriptions for new messages and request updates
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Subscribe to new messages
    const messageSubscription = supabase
      .channel('peer_support_chats')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'peer_support_chats' 
      }, (payload) => {
        // Only add messages to/from the currently selected peer
        if (selectedPeer && 
            (payload.new.sender_id === selectedPeer.id || 
             payload.new.receiver_id === selectedPeer.id)) {
          fetchMessages(selectedPeer.id);
        }
      })
      .subscribe();
    
    // Subscribe to support request updates
    const requestSubscription = supabase
      .channel('support_requests')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'support_requests' 
      }, () => {
        // Refresh support requests when there's any change
        fetchSupportRequests();
      })
      .subscribe();
    
    return () => {
      messageSubscription.unsubscribe();
      requestSubscription.unsubscribe();
    };
  }, [isAuthenticated, selectedPeer, fetchMessages, fetchSupportRequests]);

  return {
    isLoading,
    error,
    peers,
    supportRequests,
    messages,
    selectedPeer,
    isAuthenticated,
    userProfile,
    fetchPeers,
    fetchSupportRequests,
    createSupportRequest,
    updateSupportRequest,
    fetchMessages,
    sendMessage,
    connectWithPeer,
    setSelectedPeer
  };
}
 