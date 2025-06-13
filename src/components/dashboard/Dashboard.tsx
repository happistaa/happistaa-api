'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/profile/ProfileSetup';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface DashboardProps {
  userProfile?: UserProfile | null;
  onStartProfileSetup?: () => void;
}

const features = [
  {
    id: 'ai-companion',
    title: 'AI Companion',
    description: 'Get instant support and guidance',
    icon: '💬',
    path: '/ai-companion',
    requiresAuth: false
  },
  {
    id: 'peer-support',
    title: 'Peer Support',
    description: 'Connect with others who understand your journey',
    icon: '🤝',
    path: '/peer-support',
    requiresAuth: true
  },
  {
    id: 'therapy',
    title: 'Professional Therapy',
    description: 'Get guidance from licensed therapists',
    icon: '👨‍⚕️',
    path: '/therapy',
    requiresAuth: true
  },
  {
    id: 'mindfulness',
    title: 'Mindfulness Tools',
    description: 'Access meditation and stress relief resources',
    icon: '🧘‍♀️',
    path: '/mindfulness',
    requiresAuth: true
  },
  {
    id: 'resources',
    title: 'Helpful Resources',
    description: 'Find trusted mental health resources and guides',
    icon: '📚',
    path: '/resources',
    requiresAuth: false
  }
];

// Inspirational quotes to display randomly
const inspirationalQuotes = [
  {
    quote: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman"
  },
  {
    quote: "Mental health problems don't define who you are. They are something you experience.",
    author: "Sangu Delle"
  },
  {
    quote: "There is hope, even when your brain tells you there isn't.",
    author: "John Green"
  },
  {
    quote: "The strongest people are those who win battles we know nothing about.",
    author: "Happistaa"
  },
  {
    quote: "You are not alone in this journey. Every step you take is a step towards healing.",
    author: "Happistaa"
  }
];

// Blog resources interface
interface BlogResource {
  title: string;
  description: string;
  readTime: string;
  category: string;
  image: string;
  url: string;
  embedable?: boolean;
  isVideo?: boolean;
}

// Blog resources
const blogResources: BlogResource[] = [
  {
    title: "Mindfulness Practices from Ancient Indian Traditions",
    description: "Explore meditation techniques rooted in yoga and Ayurveda for mental well-being.",
    readTime: "5 min read",
    category: "Mindfulness",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3",
    url: "https://www.artofliving.org/in-en/meditation/meditation-for-you/benefits-of-meditation",
    embedable: true
  },
  {
    title: "Managing Stress in Modern Indian Life",
    description: "Practical strategies to balance work, family expectations and personal well-being.",
    readTime: "6 min read",
    category: "Stress Management",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3",
    url: "https://nimhans.ac.in/stress-management/",
    embedable: true
  },
  {
    title: "Breaking Mental Health Stigma in Indian Communities",
    description: "How to talk about mental health with family and overcome cultural barriers.",
    readTime: "7 min read",
    category: "Awareness",
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?ixlib=rb-4.0.3",
    url: "https://www.thelivelovelaughfoundation.org/",
    embedable: true
  }
];

export default function Dashboard({ userProfile: propUserProfile, onStartProfileSetup }: DashboardProps) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(propUserProfile || null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quote, setQuote] = useState(inspirationalQuotes[0]);
  const [streaks, setStreaks] = useState({
    mindfulness: 0,
    peerSupport: 0,
    aiCompanion: 0
  });
  const [overallStreak, setOverallStreak] = useState(0);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<(typeof blogResources)[0] | null>(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const { user, loading: authLoading, signOut } = useAuth();

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
            console.log("Profile completed_setup status:", profile.completed_setup);
            
            // Map Supabase profile to our application profile structure
            const mappedProfile: UserProfile = {
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
            
            // Clear unnecessary localStorage data
            localStorage.removeItem('supportType');
            localStorage.removeItem('selectedJourneys');
            localStorage.removeItem('journeyNote');
            console.log("Cleared unnecessary localStorage data");
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
    
    // Set a random quote
    setQuote(inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]);
    
    // Mock streak data - in a real app this would come from an API or local storage
    setStreaks({
      mindfulness: 3,
      peerSupport: 1,
      aiCompanion: 5
    });
    setOverallStreak(7);
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

  const handleFeatureClick = (feature: typeof features[0]) => {
    // Always navigate to the feature page regardless of authentication status
    // Sign-up will be prompted on the feature page when trying to interact with items
    router.push(feature.path);
  };

  const handleCompleteProfile = () => {
    if (onStartProfileSetup) {
      onStartProfileSetup();
    } else {
      router.push('/auth/signup');
    }
  };

  const toggleAuthDropdown = () => {
    setShowAuthDropdown(!showAuthDropdown);
  };

  const handleBlogClick = (blog: typeof blogResources[0]) => {
    // Check if the content is embedable
    if (blog.embedable) {
      setSelectedBlog(blog);
      setShowBlogModal(true);
    } else {
      // If not embedable, open directly in a new tab
      window.open(blog.url, '_blank');
    }
  };

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleLogout = () => (
    <Button
      onClick={signOut}
      variant="outline"
      className="ml-2 rounded-full text-sm text-red-600 hover:text-red-700"
      size="sm"
    >
      Logout
    </Button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#1E3A5F]">
            Happistaa
          </h1>
          
          <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mt-3">
            {isAuthenticated ? 'Welcome back' : 'Welcome'}
          </h2>
        
        {/* Auth and Profile Section */}
        <div className="items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="relative cursor-pointer" onClick={() => router.push('/profile')}>
                  <div className="relative w-12 h-12 mt-3">
                    <svg className="w-12 h-12" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="2"></circle>
                      <circle 
                        cx="18" 
                        cy="18" 
                        r="16" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="2" 
                        strokeDasharray={`${userProfile?.profileCompletionPercentage || 67}, 100`}
                        transform="rotate(-90 18 18)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-sm font-medium">
                        {userProfile?.name ? userProfile.name[0].toUpperCase() : 'G'}
                      </div>
                    </div>
                  </div>
                </div>
                {handleLogout()}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="outline"
                  className="rounded-full"
                >
                  Login
                </Button>
                <Button
                  onClick={() => router.push('/auth/signup')}
                  className="rounded-full"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
        </div>
        

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-2 gap-4">
          {/* Progress Section */}
          <div className="bg-[#EFB39F] p-5 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your progress</h2>
            <div className="flex items-center justify-center">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f3e1d4" strokeWidth="10" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#1e3a5f" 
                    strokeWidth="10" 
                    strokeDasharray={`${overallStreak * 5}, 300`} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">{overallStreak}</span>
                  <span className="text-xs text-gray-600">days streak</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mood Check-in Section */}
          <div className="bg-[#F6D2C6] p-5 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How is your mood?</h2>
            <div className="flex justify-center space-x-2">
              <button 
                onClick={() => handleMoodSelect('bad')}
                className="flex flex-col items-center"
              >
                <div className={`w-10 h-10 rounded-full ${selectedMood === 'bad' ? 'bg-[#1E3A5F]' : 'bg-[#E8A87C]'} flex items-center justify-center text-2xl mb-2`}>
                  <span className={selectedMood === 'bad' ? 'text-white' : ''}>😔</span>
                </div>
              </button>
              <button 
                onClick={() => handleMoodSelect('okay')}
                className="flex flex-col items-center"
              >
                <div className={`w-10 h-10 rounded-full ${selectedMood === 'okay' ? 'bg-[#1E3A5F]' : 'bg-[#E8A87C]'} flex items-center justify-center text-2xl mb-2`}>
                  <span className={selectedMood === 'okay' ? 'text-white' : ''}>😐</span>
                </div>
              </button>
              <button 
                onClick={() => handleMoodSelect('good')}
                className="flex flex-col items-center"
              >
                <div className={`w-10 h-10 rounded-full ${selectedMood === 'good' ? 'bg-[#1E3A5F]' : 'bg-[#E8A87C]'} flex items-center justify-center text-2xl mb-2`}>
                  <span className={selectedMood === 'good' ? 'text-white' : ''}>😊</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Support options - 2x2 grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Support options</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* AI Companion */}
            <div 
              onClick={() => handleFeatureClick(features[0])}
              className="bg-[#F6D2C6] p-3 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start">
                <div className="text-3xl mr-2">💬</div>
                <div>
                  <h3 className="font-semibold text-gray-900">AI Companion</h3>
                  <p className="text-sm text-gray-600 mt-1">Get instant support and guidance</p>
                </div>
              </div>
            </div>
            
            {/* Peer Support */}
            <div 
              onClick={() => handleFeatureClick(features[1])}
              className="bg-[#C4D9F8] p-3 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start">
                <div className="text-3xl mr-2">🤝</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Peer Support</h3>
                  <p className="text-sm text-gray-600 mt-1">Connect with others who understand your journey</p>
                </div>

              </div>
            </div>
            
            {/* Professional Therapy */}
            <div 
              onClick={() => handleFeatureClick(features[2])}
              className="bg-[#F6D2C6] p-3 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start">
                <div className="text-3xl mr-2">👨‍⚕️</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Professional Therapy</h3>
                  <p className="text-sm text-gray-600 mt-1">Get guidance from licensed therapists</p>
                </div>
              </div>
            </div>
            
            {/* Mindfulness Tools */}
            <div 
              onClick={() => handleFeatureClick(features[3])}
              className="bg-[#F6D2C6] p-3 rounded-3xl shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start">
                <div className="text-3xl mr-2">🧘‍♀️</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mindfulness Tools</h3>
                  <p className="text-sm text-gray-600 mt-1">Access meditation and stress relief</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inspirational quote */}
        <div className="text-center py-6">
          <p className="text-xl italic text-gray-700">"{quote.quote}"</p>
          <p className="text-sm text-gray-500 mt-2">— {quote.author}</p>
        </div>

        {/* Resources Section with horizontal scroll */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Recommended Resources</h2>
          <div className="flex overflow-x-auto pb-4 space-x-4 scrollbar-hide">
            {blogResources.map((blog, index) => (
              <div 
                key={blog.title}
                onClick={() => handleBlogClick(blog)}
                className={`rounded-2xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 ${
                  index % 3 === 0 ? 'bg-[#FDF3EB]' : 
                  index % 3 === 1 ? 'bg-[#F1D6C2]' : 'bg-[#E8A87C]'
                }`}
                style={{ width: "280px" }}
              >
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-white bg-opacity-50 text-gray-800 rounded-full">
                      {blog.category}
                    </span>
                    <span className="text-xs text-gray-700">{blog.readTime}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{blog.title}</h3>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{blog.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Modal */}
      {showBlogModal && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-xl font-semibold">{selectedBlog.title}</h2>
                <p className="text-sm text-gray-600">{selectedBlog.category} • {selectedBlog.readTime}</p>
              </div>
              <button 
                onClick={() => setShowBlogModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe 
                src={selectedBlog.url} 
                className="w-full h-full min-h-[70vh] border-none"
                title={selectedBlog.title}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                loading="lazy"
                allowFullScreen={selectedBlog.isVideo}
              ></iframe>
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <p className="text-sm text-gray-600">{selectedBlog.description}</p>
              <Button 
                onClick={() => window.open(selectedBlog.url, '_blank')}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
              >
                <span className="material-icons mr-1 text-sm">open_in_new</span>
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}