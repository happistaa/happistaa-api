'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/profile/ProfileSetup';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import usePeerSupport, { PeerMatch } from '@/hooks/usePeerSupport';

// Remove mockPeers array since we'll fetch from API

type ExperienceFilter = string;
//type SupportTypeFilter = 'support-seeker' | 'support-giver' | 'both' | 'all';
type ActiveFilter = boolean | null;
type SortOption = 'match' | 'rating' | 'peopleSupported' | 'availability';

interface DashboardProps {
  userProfile?: UserProfile | null;
  onStartProfileSetup?: () => void;
}

export default function PeerSupportPage({ userProfile: propUserProfile, onStartProfileSetup }: DashboardProps) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(propUserProfile || null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [allPeers, setAllPeers] = useState<PeerMatch[]>([]);
  const [filteredPeers, setFilteredPeers] = useState<PeerMatch[]>([]);
  
  // Use the peer support hook
  const { 
    fetchPeers, 
    peers: backendPeers, 
    isLoading: isPeersLoading,
    error: peersError
  } = usePeerSupport();
  
  // Filters
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>('all');
  //const [supportTypeFilter, setSupportTypeFilter] = useState<SupportTypeFilter>('all');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState<ActiveFilter>(null);
  const [sortBy, setSortBy] = useState<SortOption>('match');
  

  
  // Chat state
  const [selectedPeer, setSelectedPeer] = useState<PeerMatch | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{sender: string, message: string, timestamp: Date, isAnonymous?: boolean}>>([]);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'accepted' | 'rejected'>('none');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [myChatsList, setMyChatsList] = useState<PeerMatch[]>([]);
  const [showMyChatsList, setShowMyChatsList] = useState<boolean>(false);
  const [supportRequests, setSupportRequests] = useState<Array<{peer: PeerMatch, message: string, timestamp: Date}>>([]);
  const [showSupportRequests, setShowSupportRequests] = useState<boolean>(false);
  
  // View toggles
  const [activeView, setActiveView] = useState<'need' | 'give' | 'all'>('all');
  const [showJourneySelector, setShowJourneySelector] = useState<boolean>(false);
  const [selectedJourneys, setSelectedJourneys] = useState<string[]>([]);

  // Experience areas for filter options
  const experienceAreas = [
    'Stress','Anxiety', 'Career Change', 'Academic Stress', 'Family Issues', 
    'Relocation', 'Health & Wellness', 'Work-Life Balance', 'Parenthood',
    'Heartbreak', 'Loneliness', 'Mental Health', 
    'Depression', 
    'Relationship Issues',
    'Career Challenges',
    'Academic Pressure'
  ];

  // Use the same array for journey options
  const journeyOptions = experienceAreas;

  // Add state for filter modal
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);

  // Add state for sort options
  const [showSortOptions, setShowSortOptions] = useState<boolean>(false);

  const [isGuest, setIsGuest] = useState(false);
  const { user, loading: authLoading, signOut } = useAuth();

  // Add the usePeerSupport hook
  //const { fetchPeers, peers } = usePeerSupport();

  // Helper function to calculate profile completion percentage
  const calculateProfileCompletionPercentage = (profile: any): number => {
    const fields = [
      'name', 'dob', 'location', 'gender', 'workplace', 'job_title', 
      'education', 'religious_beliefs', 'communication_style', 'availability'
    ];
    
    let filledCount = 0;
    let totalFields = fields.length;
    
    fields.forEach(field => {
      if (profile[field]) filledCount++;
    });
    
    return Math.round((filledCount / totalFields) * 100);
  };

  useEffect(() => {
    // If props are provided, use them instead of fetching from Supabase
    if (propUserProfile) {
      setUserProfile(propUserProfile);
      console.log("Using propUserProfile for profile");

      setIsLoading(false);
      return;
    }
    


    
    const fetchUserProfile = async () => {
      setIsLoading(true);
      
      try {
        // Get user session from Auth hook
        if (user) {
          console.log("User is authenticated, fetching profile from Supabase");
          setIsAuthenticated(true);
          
          // Fetch profile from Supabase
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching profile from Supabase:', error.message);
            // Fallback to localStorage if Supabase fetch fails
            const storedProfile = localStorage.getItem('userProfile');
            if (storedProfile) {
              console.log("Using localStorage fallback for profile");
              const parsedProfile = JSON.parse(storedProfile);
              setUserProfile(parsedProfile);
              setIsGuest(parsedProfile.completedSetup === false);
            }
          } else if (profile) {
            console.log("Profile found in Supabase:", profile);
            
            // Map Supabase profile to our application profile structure
            const mappedProfile: UserProfile = {
              id: profile.id || '',
              name: profile.name || '',
              dateOfBirth: profile.dob || '',
              location: profile.location || '',
              gender: profile.gender || '',
              workplace: profile.workplace || '',
              jobTitle: profile.job_title || '',
              education: profile.education || '',
              religiousBeliefs: profile.religious_beliefs || '',
              communicationPreferences: profile.communication_style || '',
              availability: profile.availability || '',
              completedSetup: profile.completed_setup || false,
              profileCompletionPercentage: calculateProfileCompletionPercentage(profile),
              journey: profile.support_preferences ? profile.support_preferences[0] : '',
              supportPreferences: profile.support_preferences || [],
              supportType: profile.support_type || '',
              journeyNote: profile.journey_note || '',
              certifications: {
                status: 'none'
              }
            };
            
            setUserProfile(mappedProfile);
            setIsGuest(profile.completed_setup === false);
            
            // Save to localStorage for backward compatibility
            localStorage.setItem('userProfile', JSON.stringify(mappedProfile));
            localStorage.setItem('profileSetupCompleted', profile.completed_setup ? 'true' : 'false');
            localStorage.setItem('isAuthenticated', 'true');
          }
        } else {
          // User is not authenticated, check localStorage for guest data
          setIsAuthenticated(false);
          const storedProfile = localStorage.getItem('userProfile');
          const isAuthenticated = localStorage.getItem('isAuthenticated');
          
          if (storedProfile) {
            const profile = JSON.parse(storedProfile);
            setUserProfile(profile);
            setIsGuest(profile.completedSetup === false);
            setIsAuthenticated(!!isAuthenticated);
          }
        }
      } catch (error) {
        console.error("Error in dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch profile if auth is not loading
   if (!authLoading) {
    fetchUserProfile();
    }
  }, [propUserProfile, user, authLoading]);




  // Fetch peers from the backend API
  useEffect(() => {
    if (userProfile) {
      const filters: Record<string, string> = {};
      
      // Add support type filter based on user's role
    /*  if (userProfile.supportType === 'support-seeker') {
        filters.supportType = 'support-giver'; // Support seekers see support givers
        setActiveView('need');
        // Set anonymous mode by default for support seekers
        setIsAnonymous(true);
      } else if (userProfile.supportType === 'support-giver') {
        filters.supportType = 'support-seeker'; // Support givers see support seekers
        setActiveView('give');
      } */
      
      // Add experience filter if user has preferences
 /*     if (userProfile.supportPreferences && userProfile.supportPreferences.length > 0) {
        setSelectedJourneys(userProfile.supportPreferences);
        
        // If there's a specific journey selected, use it as filter
        if (experienceFilter !== 'all') {
          filters.experience = experienceFilter;
        }
      } */
      
      // Fetch peers with the appropriate filters
      fetchPeers(filters);
    } else {
      // If no user profile, fetch all peers
      fetchPeers();
    }
  }, [userProfile, fetchPeers, experienceFilter]);

  // Update allPeers when backend peers change
  useEffect(() => {
    console.log("backendPeers updated:", backendPeers);
    
    if (backendPeers && backendPeers.length > 0) {
      console.log("Setting all peers with", backendPeers.length, "peers from backend");
      console.log("Sample peer data:", backendPeers[0]);
      setAllPeers(backendPeers);
      setFilteredPeers(backendPeers);
    } else {
      console.log("No backend peers available or empty array");
    }
  }, [backendPeers]);

  useEffect(() => {
    // Check if profile is complete
    const profileCompleted = localStorage.getItem('profileSetupCompleted');
    const profileData = localStorage.getItem('userProfile');
    
    if (profileCompleted === 'true' && profileData) {
      const profile = JSON.parse(profileData);
      setUserProfile(profile);
      
      // Only consider profile complete if the user has fully completed setup
      setIsProfileComplete(profile.completedSetup !== false);
      
      // Set initial view based on user's support preferences
    /*  if (profile.supportType === "support-seeker") {
        setActiveView('need');
        // Set anonymous mode by default for support seekers
        setIsAnonymous(true);
      } else if ( profile.supportType === "support-giver") {
        setActiveView('give');
      } 
      
      // Set initial selected journeys from user's preferences
      if (profile.supportPreferences && profile.supportPreferences.length > 0) {
        setSelectedJourneys(profile.supportPreferences);
      } */
    } 
    
    // Always load my chats list from localStorage if available
    const myChatsData = localStorage.getItem('myChats');
    if (myChatsData) {
      setMyChatsList(JSON.parse(myChatsData));
    }
    
    // Check if there's a chat parameter in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const shouldOpenChat = urlParams.get('chat') === 'open';
    
    if (shouldOpenChat) {
      // Get selected peer from localStorage
      const selectedPeerData = localStorage.getItem('selectedPeer');
      if (selectedPeerData) {
        const peer = JSON.parse(selectedPeerData);
        setSelectedPeer(peer);
        setShowChat(true);
        
        // Get anonymous mode from localStorage
        const anonymousData = localStorage.getItem('isAnonymous');
        if (anonymousData) {
          setIsAnonymous(JSON.parse(anonymousData));
        }
        
        // Get chat messages from localStorage
        const chatMessagesData = localStorage.getItem('chatMessages');
        if (chatMessagesData) {
          const messages = JSON.parse(chatMessagesData);
          setChatMessages(messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
        
        // Clean URL parameter
        window.history.replaceState({}, document.title, '/peer-support');
      }
    }
    
    setIsLoading(false);
    
  }, []);

  // Apply filters and sorting with journey consideration
  useEffect(() => {
    console.log("Filtering peers:", {
      allPeers: allPeers.length,
      activeView,
      experienceFilter,
      //supportTypeFilter,
      activeOnlyFilter,
      selectedJourneys: selectedJourneys.length
    });
    
    // Log all peers before filtering
    console.log("All peers before filtering:", allPeers.map(peer => ({
      id: peer.id,
      name: peer.name,
      supportType: peer.supportType,
      experienceAreas: peer.experienceAreas
    })));

    let result = [...allPeers];
    
    // Filter by view
 /* if (activeView === 'need') {
      console.log("Filtering for 'need' view - showing support givers");
      result = result.filter(peer => peer.supportType === 'support-giver');
    } else if (activeView === 'give') {
      console.log("Filtering for 'give' view - showing support seekers");
      result = result.filter(peer => peer.supportType === 'support-seeker');
    } */
    
    console.log("After view filtering:", result.length, "peers remaining");
    
    // Filter by selected journeys if any are selected
    if (selectedJourneys.length > 0) {
      console.log("Filtering by selected journeys:", selectedJourneys);
      result = result.filter(peer => 
        peer.experienceAreas.some(area => selectedJourneys.includes(area))
      );
      console.log("After journey filtering:", result.length, "peers remaining");
    }
    
    // Filter by experience area
    if (experienceFilter !== 'all') {
      console.log("Filtering by experience area:", experienceFilter);
      result = result.filter(peer => 
        peer.experienceAreas.some(area => 
          area.toLowerCase() === experienceFilter.toLowerCase())
      );
      console.log("After experience filtering:", result.length, "peers remaining");
    }
    
    // Filter by support type
    /* if (supportTypeFilter !== 'all') {
      console.log("Filtering by support type:", supportTypeFilter);
      // When "both" is selected, show all peer types
      if (supportTypeFilter === 'both') {
        // No filtering needed for "both" - show all types
        console.log("'both' selected - not applying support type filter");
      } else {
        // Otherwise filter by the specific support type
        result = result.filter(peer => peer.supportType === supportTypeFilter);
        console.log("After support type filtering:", result.length, "peers remaining");
      }
    } */
    
    // Filter by active status
    if (activeOnlyFilter !== null) {
      console.log("Filtering by active status:", activeOnlyFilter);
      result = result.filter(peer => peer.isActive === activeOnlyFilter);
      console.log("After active status filtering:", result.length, "peers remaining");
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'rating':
        console.log("Sorting by rating");
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'peopleSupported':
        console.log("Sorting by people supported");
        result.sort((a, b) => (b.peopleSupported || 0) - (a.peopleSupported || 0));
        break;
      case 'availability':
        console.log("Sorting by availability");
        // Sort active first, then by match score
        result.sort((a, b) => {
          if (a.isActive === b.isActive) {
            return b.matchScore - a.matchScore;
          }
          return a.isActive ? -1 : 1;
        });
        break;
      case 'match':
      default:
        console.log("Sorting by match score");
        result.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }
    
    console.log("Final filtered peers:", result.length);
    
    setFilteredPeers(result);
  }, [allPeers, experienceFilter, /* supportTypeFilter, */ activeOnlyFilter, sortBy, activeView, selectedJourneys]);

  // ... rest of the component remains the same
// ... existing code ...

// Get personalized message based on user's journey
const getPersonalizedMessage = () => {
  if (!userProfile || !userProfile.supportPreferences) return null;
  
  const journey = userProfile.supportPreferences;
  
  // If user is a support seeker, show appropriate message
  if (userProfile.supportType === 'support-seeker') {
  return {
  title: `We've got you with ${journey}`,
  description: `Connect with peers who get you anonymously, without fear of judgment. Our community is here to support you.`
  };
  }
  
  // If user is a support giver, show appropriate message
  if (userProfile.supportType === 'support-giver') {
  return {
  title: `Your impact awaits for ${journey}`,
  description: `People dealing with ${journey} need your support. Share your experience and make a difference today.`
  };
  }
  
  // Default message
  return {
  title: 'Find your peer support match',
  description: "Connect with others who understand what you're going through or help someone on their journey."
  };
  };
  
  const personalizedMessage = getPersonalizedMessage();
  
  // Helper function to get appropriate CSS classes based on user type
  const getMessageStyles = () => {
  if (!userProfile) return {
  container: 'bg-white',
  title: 'text-gray-900',
  text: 'text-gray-600'
  };
  
  if (userProfile.supportType === 'support-seeker') {
  return {
  container: 'bg-blue-50 border border-blue-100',
  title: 'text-blue-800',
  text: 'text-blue-700'
  };}
  
  if (userProfile.supportType === 'support-giver') {
  return {
  container: 'bg-green-50 border border-green-100',
  title: 'text-green-800',
  text: 'text-green-700'
  };}
  
  
  return {
  container: 'bg-white',
  title: 'text-gray-900',
  text: 'text-gray-600'
  };
  }
  
const messageStyles = getMessageStyles();
  
// Apply filters and sorting with journey consideration
  useEffect(() => {
    let result = [...allPeers];
    
    // Filter by view
    if (activeView === 'need') {
      result = result.filter(peer => peer.supportType === 'support-giver' );
    } else if (activeView === 'give') {
      result = result.filter(peer => peer.supportType === 'support-seeker');
    }
    
    // Filter by selected journeys if any are selected
    if (selectedJourneys.length > 0) {
      result = result.filter(peer => 
        peer.experienceAreas.some(area => selectedJourneys.includes(area))
      );
    }
    
    // Filter by experience area
    if (experienceFilter !== 'all') {
      result = result.filter(peer => 
        peer.experienceAreas.some(area => 
          area.toLowerCase() === experienceFilter.toLowerCase())
      );
    }
    
  /*  // Filter by support type
    if (supportTypeFilter !== 'all') {
      // When "both" is selected, show all peer types
      if (supportTypeFilter === 'both') {
        // No filtering needed for "both" - show all types
      } else {
        // Otherwise filter by the specific support type
        result = result.filter(peer => peer.supportType === supportTypeFilter);
      }
    } */
    
    // Filter by active status
    if (activeOnlyFilter !== null) {
      result = result.filter(peer => peer.isActive === activeOnlyFilter);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'peopleSupported':
        result.sort((a, b) => (b.peopleSupported || 0) - (a.peopleSupported || 0));
        break;
      case 'availability':
        // Sort active first, then by match score
        result.sort((a, b) => {
          if (a.isActive === b.isActive) {
            return b.matchScore - a.matchScore;
          }
          return a.isActive ? -1 : 1;
        });
        break;
      case 'match':
      default:
        result.sort((a, b) => b.matchScore - a.matchScore);
        break;
    }
    
    setFilteredPeers(result);
  }, [allPeers, experienceFilter, /*supportTypeFilter, */ activeOnlyFilter, sortBy, activeView, selectedJourneys]);

  // Save anonymous mode to localStorage whenever it changes
  useEffect(() => {
    if (selectedPeer) {
      localStorage.setItem('isAnonymous', JSON.stringify(isAnonymous));
    }
  }, [isAnonymous, selectedPeer]);

  // Save chat messages to localStorage whenever they change
  useEffect(() => {
    if (selectedPeer && chatMessages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    }
  }, [chatMessages, selectedPeer]);

  // Handle adding or removing a journey from selection
  const handleJourneyToggle = (journey: string) => {
    if (selectedJourneys.includes(journey)) {
      setSelectedJourneys(prev => prev.filter(j => j !== journey));
    } else {
      setSelectedJourneys(prev => [...prev, journey]);
    }
  };

  // Save selected journeys to user profile
  const saveJourneyPreferences = async () => {
    if (!userProfile) return;
    
    const updatedProfile = {
      ...userProfile,
      supportPreferences: selectedJourneys
    };
    
    // Save to localStorage for backward compatibility
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
    
    // Save to Supabase if user is authenticated
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Saving journey preferences to Supabase");
        
        const updateData: {
          support_preferences: string[];
          updated_at: string;
          journey_note?: string;
        } = {
          support_preferences: selectedJourneys,
          updated_at: new Date().toISOString()
        };
        
        // Include journey note if available
        if (userProfile.journeyNote) {
          updateData.journey_note = userProfile.journeyNote;
        }
        
        // Update the fields
        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', session.user.id);
          
        if (error) {
          console.error('Error updating journey preferences in Supabase:', error);
        }
      }
    } catch (error) {
      console.error("Error saving journey preferences to Supabase:", error);
    }
    
    setShowJourneySelector(false);
  };

  const handleConnect = (peer: PeerMatch) => {
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
      setSelectedPeer(peer);
      
      // Set anonymous mode to true by default for support seekers
      const isAnonymousMode = true;
      setIsAnonymous(isAnonymousMode);
      
      // Add system welcome message
      const initialMessages = [
        {
          sender: 'system',
          message: `You are now connected with ${peer.name}. Your request has been sent and you can start chatting anonymously.`,
          timestamp: new Date()
        }
      ];
      setChatMessages(initialMessages);
      
      // Show chat view
      setShowChat(true);
      
      // Add to my chats list if not already there
      const updatedChatsList = [...myChatsList];
      if (!updatedChatsList.some(chat => chat.id === peer.id)) {
        updatedChatsList.push(peer);
        setMyChatsList(updatedChatsList);
      }
      
      // Save data to localStorage
      localStorage.setItem('selectedPeer', JSON.stringify(peer));
      localStorage.setItem('isAnonymous', JSON.stringify(isAnonymousMode));
      localStorage.setItem('chatMessages', JSON.stringify(initialMessages));
      localStorage.setItem('myChats', JSON.stringify(updatedChatsList));
      
      // Add to the support provider's request list
      if (peer.supportType === 'support-giver') {
        // In a real app, this would be handled by the backend
        // Here we're just simulating it for demo purposes
        console.log(`Request sent to ${peer.name} for support`);
      }
    } else {
      // For support providers or regular connections
      setSelectedPeer(peer);
      
      // Add system welcome message
      const initialMessages = [
        {
          sender: 'system',
          message: `You are now connected with ${peer.name}. This conversation is private and secure.`,
          timestamp: new Date()
        }
      ];
      setChatMessages(initialMessages);
      
      // Show chat view
      setShowChat(true);
      
      // Add to my chats list if not already there
      const updatedChatsList = [...myChatsList];
      if (!updatedChatsList.some(chat => chat.id === peer.id)) {
        updatedChatsList.push(peer);
        setMyChatsList(updatedChatsList);
      }
      
      // Save data to localStorage
      localStorage.setItem('selectedPeer', JSON.stringify(peer));
      localStorage.setItem('isAnonymous', JSON.stringify(isAnonymous));
      localStorage.setItem('chatMessages', JSON.stringify(initialMessages));
      localStorage.setItem('myChats', JSON.stringify(updatedChatsList));
    }
  };

  const sendMessage = () => {
    if (!chatMessage.trim() || !selectedPeer) return;
    
    // Add user message
    const userMessage = {
      sender: 'you',
      message: chatMessage,
      timestamp: new Date(),
      isAnonymous: isAnonymous
    };
    
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatMessage('');
    
    // Save to localStorage
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    
    // Simulate response after 1-2 seconds
    setTimeout(() => {
      const peerMessage = {
        sender: selectedPeer.name,
        message: `Thanks for reaching out! I'm here to support you with your journey related to ${selectedPeer.experienceAreas[0]}.`,
        timestamp: new Date(),
        isAnonymous: false // Peer response is not anonymous in this example
      };
      
      const updatedWithResponse = [...updatedMessages, peerMessage];
      setChatMessages(updatedWithResponse);
      
      // Save to localStorage
      localStorage.setItem('chatMessages', JSON.stringify(updatedWithResponse));
    }, 1000 + Math.random() * 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Show "Get More Relevant Matches" banner for authenticated users
  const showRelevantMatchesBanner = userProfile && (!userProfile.workplace || !userProfile.jobTitle 
    || !userProfile.education || !userProfile.communicationPreferences || !userProfile.availability);

  // Chat view
  if (showChat && selectedPeer) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-3rem)]">
          {/* Header section - reorganized */}
          <div className="mb-4">
            {/* First line: Back button, Name, End Chat button */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <button 
                  onClick={() => setShowChat(false)}
                  className="mr-4 text-gray-600 hover:text-blue-500"
                >
                  <span className="material-icons">arrow_back</span>
                </button>
                <div className="flex items-center">
                  <div className="relative">
                    <span className="text-2xl mr-2">{selectedPeer.avatar}</span>
                    {selectedPeer.isActive && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>
                  <h2 className="font-semibold text-gray-900">{selectedPeer.name}</h2>
                </div>
              </div>
              <Button
                onClick={() => setShowChat(false)}
                variant="outline"
                size="sm"
              >
                End Chat
              </Button>
            </div>
            
            {/* Second line: Ratings and Anonymous toggle */}
            <div className="flex justify-between items-center ml-10 pl-2">
              <span className="text-sm text-gray-600 flex items-center">
                <span className="material-icons text-yellow-500 text-sm mr-1">star</span>
                {selectedPeer.rating} ({selectedPeer.totalRatings})
              </span>
              
              <div className="flex items-center">
                <label className="text-sm text-gray-600 mr-2">Anonymous:</label>
                <div 
                  className={`w-10 h-5 rounded-full flex items-center cursor-pointer transition-colors ${
                    isAnonymous ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => {
                    const newValue = !isAnonymous;
                    setIsAnonymous(newValue);
                  }}
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
          
          {/* Shared journeys info */}
          {selectedPeer.experienceAreas.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">Areas of experience:</p>
              <div className="flex flex-wrap gap-2">
                {selectedPeer.experienceAreas.map((area, i) => {
                  const isShared = userProfile?.supportPreferences?.includes(area);
                  return (
                    <span 
                      key={i}
                      className={`text-xs px-2 py-1 rounded-full ${
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
          )}
          
          <div className="flex-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto mb-4">
            {chatMessages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-4 ${msg.sender === 'you' ? 'text-right' : ''} ${msg.sender === 'system' ? 'text-center' : ''}`}
              >
                {msg.sender !== 'system' && (
                  <div className="text-xs text-gray-500 mb-1">
                    {msg.sender === 'you' ? (msg.isAnonymous ? 'Anonymous' : 'You') : msg.sender}
                    {msg.isAnonymous && msg.sender !== 'you' && " (Anonymous)"}
                  </div>
                )}
                <div 
                  className={`inline-block rounded-lg px-4 py-2 max-w-[80%] ${
                    msg.sender === 'you' 
                      ? 'bg-blue-500 text-white' 
                      : msg.sender === 'system'
                        ? 'bg-gray-200 text-gray-700 text-sm'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.message}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center bg-white rounded-lg shadow-sm p-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={isAnonymous ? "Type anonymously..." : "Type your message..."}
              className="flex-1 p-2 border-none focus:outline-none focus:ring-0"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button
              onClick={sendMessage}
              disabled={!chatMessage.trim()}
              className={`p-2 rounded-full ${
                !chatMessage.trim() ? 'text-gray-400' : 'text-blue-500 hover:text-blue-600'
              }`}
            >
              <span className="material-icons">send</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Peer Support
          </h1>
          <div className="flex items-center space-x-1">
            {/* My Chats button with notification count */}
            {isAuthenticated && (
              <Button
                onClick={() => setShowMyChatsList(!showMyChatsList)}
                variant={showMyChatsList ? "default" : "outline"}
                className="flex items-center flex-wrap relative"
              >
                <span className="material-icons mr-1">chat</span>
                {myChatsList.length > 0 && (
                  <span className="absolute -top-3 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {myChatsList.length}
                  </span>
                )}
              </Button>
            )}
            
            {/* Sign up button for guests */}
            {!isAuthenticated && (
              <Button
                onClick={() => router.push('/auth/signup?redirect=peer-support')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Sign Up
              </Button>
            )}
            
            {/* Support Requests button with notification count */}
            {isAuthenticated && userProfile && userProfile.supportType === 'support-giver' && (
              <Button
                onClick={() => setShowSupportRequests(!showSupportRequests)}
                variant={showSupportRequests ? "default" : "outline"}
                className="flex flex-wrap relative"
              >
                <span className="material-icons mr-1">support</span>
                {supportRequests.length > 0 && (
                  <span className="absolute -top-3 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {supportRequests.length}
                  </span>
                )}
              </Button>
            )}
            
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
              className="flex items-center"
            >
              <span className="material-icons">home</span>
            </Button>
          </div>
        </div>

        {/* Personalized journey-based message */}
        {isAuthenticated && userProfile && personalizedMessage && (
          <div className={`p-5 rounded-xl shadow-sm ${messageStyles.container}`}>
            <h2 className={`text-xl font-semibold mb-2 ${messageStyles.title}`}>
              {personalizedMessage.title}
            </h2>
            <p className={messageStyles.text}>
              {personalizedMessage.description}
            </p>
          </div>
        )}

        {/* View Selector for authenticated users */}
        {isAuthenticated && userProfile && (
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 mr-2">I want to:</h3>
                <div className="flex flex-wrap gap-2">
                  {userProfile.supportType === 'support-seeker' && (
                    <Button
                     // onClick={() => setActiveView('need')}
                      variant={activeView === 'need' ? "default" : "outline"}
                      className="bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white"
                    >
                      Get Support
                    </Button>
                  )}
                  
                  {userProfile.supportType === 'support-giver' && (
                    <Button
                    //  onClick={() => setActiveView('give')}
                      variant={activeView === 'give' ? "default" : "outline"}
                      className="bg-[#F6D2C6] text-blue-700 hover:bg-blue-600 hover:text-white"
                    >
                      Give Support
                    </Button>
                  )}
                  
                  {/* Show All button if user has both roles */}
                { /* {userProfile.supportType === 'both' && (
                    <Button
                      onClick={() => setActiveView('all')}
                      variant={activeView === 'all' ? "default" : "outline"}
                      className="hover:bg-blue-600"
                    >
                      All
                    </Button>
                  )} */}
                
                
                <Button
                  onClick={() => setShowJourneySelector(!showJourneySelector)}
                  variant="outline"
                  className="flex items-center relative"
                  aria-expanded={showJourneySelector}
                >
                  <span className="material-icons mr-1">tune</span>
                  My Journey
                  {selectedJourneys.length > 0 && (
                    <span className="absolute -top-1 right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                  )}
                </Button>
              </div>
              </div>
            </div>

                  {/* Journey selector
                       {showJourneySelector && (                
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-md font-semibold text-gray-900 mb-2">
                  Select Areas for Your Journey:
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {journeyOptions.map(journey => (
                    <label
                      key={journey}
                      className={`px-3 py-2 rounded-full border cursor-pointer ${
                        selectedJourneys.includes(journey)
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={journey}
                        checked={selectedJourneys.includes(journey)}
                        onChange={() => handleJourneyToggle(journey)}
                        className="sr-only"
                      />
                      {journey}
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={saveJourneyPreferences}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Save Preferences
                  </Button>
                </div> */} 

           {/* Journey selector modal */}
            {showJourneySelector && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Select Areas for Your Journey
                    </h3>
                    <button
                      onClick={() => setShowJourneySelector(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <span className="material-icons">close</span>
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {journeyOptions.map(journey => (
                      <label
                        key={journey}
                        className={`px-3 py-2 rounded-full border cursor-pointer ${
                          selectedJourneys.includes(journey)
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={journey}
                          checked={selectedJourneys.includes(journey)}
                          onChange={() => handleJourneyToggle(journey)}
                          className="sr-only"
                        />
                        {journey}
                      </label>
                    ))}
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button
                      onClick={() => setShowJourneySelector(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        saveJourneyPreferences();
                        setShowJourneySelector(false);
                      }}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Chats List */}
        {showMyChatsList && myChatsList.length > 0 && (
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {activeView === 'need' 
                ? 'My Support Providers' 
                : activeView === 'give' 
                  ? 'People I\'m Supporting' 
                  : 'My Peer Conversations'}
            </h2>
            <div className="space-y-3">
              {myChatsList.map(peer => (
                <div 
                  key={peer.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-blue-200 cursor-pointer"
                  onClick={() => {
                    setSelectedPeer(peer);
                    setShowChat(true);
                    setShowMyChatsList(false);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{peer.avatar}</div>
                    <div>
                      <h3 className="font-medium">{peer.name}</h3>
                      <div className="flex items-center">
                        <p className="text-sm text-gray-500">
                          {peer.isActive ? 'Active now' : 'Last active: Recently'}
                        </p>
                        {peer.supportType === 'support-giver' && (
                          <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            Provider
                          </span>
                        )}
                        {peer.supportType === 'support-seeker' && (
                          <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            Seeker
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {peer.isActive && (
                    <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showMyChatsList && myChatsList.length === 0 && (
          <div className="bg-white p-5 rounded-xl shadow-sm text-center py-8">
            <p className="text-gray-500 mb-4">You don't have any active conversations yet</p>
            <Button 
              onClick={() => setShowMyChatsList(false)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Find Peers to Connect With
            </Button>
          </div>
        )}

        {/* Support Requests */}
        {showSupportRequests && (
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Support Requests
            </h2>
            
            {supportRequests.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="mb-4">You don't have any pending support requests.</p>
                {activeView === 'give' && (
                  <Button
                    onClick={() => setShowSupportRequests(false)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Find People to Support
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {supportRequests.map((request, index) => (
                  <div 
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{request.peer.avatar}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{request.peer.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2 mb-2">
                          {request.peer.experienceAreas.map((area, i) => (
                            <span 
                              key={i}
                              className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{request.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(request.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-3">
                      <Button
                        onClick={() => {
                          // Remove from requests
                          setSupportRequests(prev => prev.filter((_, i) => i !== index));
                          // Add to chats
                          if (!myChatsList.find(p => p.id === request.peer.id)) {
                            setMyChatsList(prev => [...prev, request.peer]);
                          }
                          // Show chat with this peer
                          setSelectedPeer(request.peer);
                          setShowChat(true);
                          setShowSupportRequests(false);
                          // Add welcome message
                          setChatMessages([
                            {
                              sender: 'system',
                              message: `You've accepted a support request from ${request.peer.name}.`,
                              timestamp: new Date()
                            }
                          ]);
                        }}
                        className="bg-green-500 hover:bg-green-600"
                        size="sm"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={() => {
                          setSupportRequests(prev => prev.filter((_, i) => i !== index));
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
     
         
            <h2 className="text-xl font-semibold text-gray-900">
              {activeView === 'need' 
                ? 'Find Friends' 
                : activeView === 'give' 
                  ? 'Find Friends' 
                  : 'Find Friends'}
              <span className="text-gray-500 font-normal ml-2 text-sm">
                ({filteredPeers.length})
              </span>
            </h2>
      
            {/* Filter and Sort controls */}
            <div className="flex md:flex-row justify-between items-start md:items-center gap-4">
              {/* Filter icon */}
             
              
              <button
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'
                }`}
              >
                <span className="material-icons text-xl">filter_list</span>
                <span>Filters</span>
              
              </button>
              
              {/* Sort dropdown */}
              <div className="relative w-full md:w-auto">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none flex items-center min-w-[180px] justify-between bg-white"
                  aria-haspopup="listbox"
                  aria-expanded={showSortOptions}
                >
                  <span>
                    {(() => {
                      switch (sortBy) {
                        case 'match': return 'Sort By';
                        case 'rating': return 'Highest Rating';
                        case 'peopleSupported': return 'Most People Supported';
                        case 'availability': return 'Currently Available';
                        default: return 'Sort By';
                      }
                    })()}
                  </span>
                  <span className="material-icons ml-2 text-gray-500 text-base">
                    {showSortOptions ? 'arrow_drop_up' : 'arrow_drop_down'}
                  </span>
                </button>
                {showSortOptions && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-20 w-full py-1 border">
                    {[
                      { id: 'match', label: 'Best Match' },
                      { id: 'rating', label: 'Highest Rating' },
                      { id: 'peopleSupported', label: 'Most People Supported' },
                      { id: 'availability', label: 'Currently Available' }
                    ].map(option => (
                      <button
                        key={option.id}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          sortBy === option.id 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSortBy(option.id as SortOption);
                          setShowSortOptions(false);
                        }}
                      >
                        {option.label}
                        {sortBy === option.id && (
                          <span className="float-right material-icons text-blue-500 text-sm">check</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            </div>
          

          {filteredPeers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>
                {selectedJourneys.length > 0 
                  ? 'No peers match your selected journeys. Try selecting different areas or view all peers.'
                  : 'No peers match your current filters. Try adjusting your filters.'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPeers.map(peer => (
              <div 
                key={peer.id}
                className="border border-gray-100 rounded-xl p-5 hover:border-blue-200 transition-all card-hover shadow-sm bg-white hover:shadow-md relative"
                onClick={() => router.push(`/peer-support/${peer.id}`)}
                style={{ cursor: 'pointer' }}
              >
                  {peer.certifiedMentor && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      <span className="flex items-center">
                        <span className="material-icons text-xs mr-1">recommend</span>
                        Certified
                      </span>
                    </div>
                  )}
                <div className="flex items-start space-x-4">
                  
                  <div className="relative">
                
                    <div className="text-4xl">{peer.avatar}</div>
                    {peer.isActive && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                 
                  </div>
               
                  <div className="flex-1">
                    
                    <div className="flex justify-between items-start">
                      
                      <div>
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900 text-xl">{peer.name}</h3>

                        </div>
                
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500 material-icons text-sm">star</span>
                          <span className="text-sm text-gray-700 ml-1">{peer.rating}</span>
                          <span className="text-xs text-gray-500 ml-1">({peer.totalRatings} ratings)</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-sm text-gray-600">{peer.location}</span>
                        </div>
                        <span className="text-sm text-gray-600">{peer.peopleSupported} People Supported</span>
                      </div>
                    </div>
                   
                     </div>
                    </div>
                  
                    {/* Journey Note - limited to 2 lines */}
                    {peer.journeyNote && (
                      <div className="mt-3">
                        <p className="text-gray-700 text-sm line-clamp-2">{peer.journeyNote}</p>
                    
                      </div>
                    )}
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {peer.experienceAreas.map((area, i) => (
                        <span 
                          key={i}
                          className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                    
                    <div className="mb-2 mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {peer.supportType === 'support-giver' ? 'Provides support' : 
                         peer.supportType === 'support-seeker' ? 'Needs support' : 
                         'Both needs and provides support'}
                      </span>
                    </div>
                
                
                  <div className="border-t pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4 flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
                  {isAuthenticated ? (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(peer);
                      }}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Connect
                    </Button>
                  ) : (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push('/auth/signup?redirect=peer-support');
                      }}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Sign Up to Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
       

        {/* Get more relevant matches banner */}
        {showRelevantMatchesBanner && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
            <div className="flex items-start">
              <div className="text-blue-500 text-xl mr-3">💡</div>
              <div className="flex-1">
                <p className="text-blue-800">
                  Improve your match quality by completing additional profile information.
                </p>
                <div className="mt-3">
                  <Button 
                    onClick={() => {
                      if (!isProfileComplete) {
                        // If profile is not complete and onStartProfileSetup is provided, use it
                        if (onStartProfileSetup) {
                          onStartProfileSetup();
                        } else {
                          // Otherwise redirect to profile setup
                          router.push('/onboarding/profile-setup');
                        }
                      } else {
                        // If profile is already complete, redirect to profile section
                        router.push('/profile');
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    size="sm"
                  >
                    Get More Relevant Matches
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-screen Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full h-full md:h-auto md:max-w-3xl md:rounded-xl md:max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold">Filter Friends</h2>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Experience filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Area</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {experienceAreas.map((area, index) => (
                    <button
                      key={index}
                      onClick={() => setExperienceFilter(area === experienceFilter ? 'all' : area)}
                      className={`p-2 text-sm rounded-md border ${
                        experienceFilter === area
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Support type filter */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['support-seeker', 'support-giver', 'both', 'all'].map((type, index) => {
                    const label = type === 'support-giver' ? 'Providing Support' :
                                 type === 'support-seeker' ? 'Needs Support' :
                                 type === 'both' ? 'Both' : type === 'all' ? 'All Types' : 'All Types';
                    return (
                      <button
                        key={index}
                        onClick={() => setSupportTypeFilter(type as SupportTypeFilter)}
                        className={`p-2 text-sm rounded-md border ${
                          supportTypeFilter === type
                            ? 'bg-blue-50 border-blue-300 text-blue-700' 
                            : 'border-gray-300 text-gray-700'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div> */}
              
              {/* Active now filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: null, label: 'All Users' },
                    { value: true, label: 'Active Now' },
                    { value: false, label: 'Not Active' }
                  ].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveOnlyFilter(option.value)}
                      className={`p-2 text-sm rounded-md border ${
                        activeOnlyFilter === option.value
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t flex justify-between">
              <Button 
                onClick={() => {
                  setExperienceFilter('all');
                  //setSupportTypeFilter('all');
                  setActiveOnlyFilter(null);
                }}
                variant="outline"
              >
                Reset All
              </Button>
              <Button 
                onClick={() => {
                  setShowFilterModal(false);
                }}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}