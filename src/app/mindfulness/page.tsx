'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/profile/ProfileSetup';

// Add custom animation styles
const fadeInAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

interface MeditationTrack {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: string;
  audioUrl: string;
  instructor: string;
  completed?: boolean;
  favorite?: boolean;
  fileId?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  tags: string[];
}

interface GratitudeEntry {
  id: string;
  date: string;
  content: string;
  category: string;
}

interface Affirmation {
  id: string;
  text: string;
  category: string;
  favorite?: boolean;
}

// Categories for filtering
const categories = [
  'All',
  'Meditation',
  'Breathing',
  'Movement',
  'Sleep',
  'Focus',
  'Chanting'
];

const meditationTracks: MeditationTrack[] = [
  {
    id: '1',
    title: 'Morning Meditation',
    description: 'Start your day with a calm and focused mind',
    duration: '10:00',
    category: 'Meditation',
    icon: '🧘‍♀️',
    audioUrl: 'https://docs.google.com/uc?export=download&id=17OyAwa6FJ6xhT3tvJiuiP_BOE93PNLoQ',
    instructor: 'Dr. Judson Brewer',
    fileId: '17OyAwa6FJ6xhT3tvJiuiP_BOE93PNLoQ'
  },
  {
    id: '2',
    title: 'Body Scan Relaxation',
    description: 'Progressive relaxation technique for whole-body awareness',
    duration: '15:12',
    category: 'Meditation',
    icon: '👁️',
    audioUrl: 'https://docs.google.com/uc?export=download&id=1tDcMRteThX7E99VLqbvmeSn7faXQmCOZ',
    instructor: 'Diana Winston',
    fileId: '1tDcMRteThX7E99VLqbvmeSn7faXQmCOZ'
  },
  {
    id: '3',
    title: 'Loving-Kindness Meditation',
    description: 'Practice extending compassion and good wishes to yourself and others',
    duration: '12:35',
    category: 'Meditation',
    icon: '❤️',
    audioUrl: 'https://docs.google.com/uc?export=download&id=1MIuwrVZ-gynPrwMlL2ogFFy1WEIdTbIE',
    instructor: 'Dr. Emma Seppälä',
    fileId: '1MIuwrVZ-gynPrwMlL2ogFFy1WEIdTbIE'
  },
  {
    id: '4',
    title: 'Mindful Walking',
    description: 'Transform your daily walk into a mindfulness practice',
    duration: '08:45',
    category: 'Movement',
    icon: '🚶‍♀️',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-garden-birds-ambience-1210.mp3',
    instructor: 'Dr. Judson Brewer'
  },
  {
    id: '5',
    title: 'Stress Relief Breathing',
    description: 'Quick breathing exercises to reduce stress and anxiety',
    duration: '05:30',
    category: 'Breathing',
    icon: '🌬️',
    audioUrl: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-1186.mp3',
    instructor: 'Diana Winston'
  },
  {
    id: '6',
    title: 'Gratitude Meditation',
    description: 'Cultivate gratitude with this guided meditation',
    duration: '10:00',
    category: 'Meditation',
    icon: '🙏',
    audioUrl: 'https://docs.google.com/uc?export=download&id=1vWFtvIKC37NHPYmF5gULnNLus2ENjsh-',
    instructor: 'Dr. Emma Seppälä',
    fileId: '1vWFtvIKC37NHPYmF5gULnNLus2ENjsh-'
  }
];

const affirmations: Affirmation[] = [
  {
    id: '1',
    text: 'I am capable of handling whatever comes my way',
    category: 'Confidence'
  },
  {
    id: '2',
    text: 'I choose to be calm and peaceful',
    category: 'Peace'
  },
  {
    id: '3',
    text: 'I am worthy of love and respect',
    category: 'Self-Love'
  },
  {
    id: '4',
    text: 'I trust in my journey and my growth',
    category: 'Growth'
  }
];

// Add streak data interface
interface StreakData {
  meditation: number;
  journaling: number;
  gratitude: number;
  focus: number;
  affirmations: number;
  lastUpdated: string;
  // Track the last completion date for each activity type to calculate streaks
  lastMeditationDate: string;
  lastJournalingDate: string;
  lastGratitudeDate: string;
  lastFocusDate: string;
  lastAffirmationsDate: string;
}

// Update the GoogleDriveAudio component to handle guest users
const GoogleDriveAudio = ({ 
  fileId, 
  title, 
  onEnded, 
  isAuthenticated,
  onRequestSignup
}: { 
  fileId: string; 
  title: string; 
  onEnded?: () => void;
  isAuthenticated: boolean;
  onRequestSignup: () => void;
}) => {
  // Extract file ID from URL if a full URL is provided
  const getFileId = (idOrUrl: string) => {
    if (idOrUrl.includes('drive.google.com')) {
      const match = idOrUrl.match(/[-\w]{25,}/);
      return match ? match[0] : idOrUrl;
    }
    return idOrUrl;
  };

  const cleanFileId = getFileId(fileId);
  // Use Google Drive's embedded preview player directly
  const embedUrl = `https://drive.google.com/file/d/${cleanFileId}/preview`;

  // Set up event listener for completion (approximate)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Listen for messages from the iframe (this is approximate as Google Drive doesn't send clear "ended" events)
      if (event.data && typeof event.data === 'string' && event.data.includes('complete') && onEnded) {
        onEnded();
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onEnded]);

  const handleMarkComplete = () => {
    if (isAuthenticated) {
      // For authenticated users, just mark as complete
      if (onEnded) onEnded();
    } else {
      // For guest users, redirect to signup
      onRequestSignup();
    }
  };

  return (
    <div className="google-drive-player rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
      <iframe
        src={embedUrl}
        width="100%"
        height="180"
        allow="autoplay"
        title={title}
        className="w-full"
        frameBorder="0"
      ></iframe>
      <div className="p-3 text-center">
        <p className="text-sm text-gray-600">Playing: {title}</p>
        <button 
          onClick={handleMarkComplete} 
          className="mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full"
        >
          Mark as Complete {!isAuthenticated && '(Sign Up)'}
        </button>
      </div>
    </div>
  );
};

export default function MindfulnessPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [resources, setResources] = useState<MeditationTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentResource, setCurrentResource] = useState<MeditationTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Journal states
  const [showJournal, setShowJournal] = useState(false);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [currentJournalEntry, setCurrentJournalEntry] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  
  // Gratitude states
  const [showGratitude, setShowGratitude] = useState(false);
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>([]);
  const [currentGratitudeEntry, setCurrentGratitudeEntry] = useState('');
  const [selectedGratitudeCategory, setSelectedGratitudeCategory] = useState('');
  
  // Focus timer states
  const [showFocusTimer, setShowFocusTimer] = useState(false);
  const [focusTime, setFocusTime] = useState(25);
  const [isFocusTimerRunning, setIsFocusTimerRunning] = useState(false);
  const [focusTimerProgress, setFocusTimerProgress] = useState(0);
  
  // Affirmation states
  const [showAffirmations, setShowAffirmations] = useState(false);
  const [currentAffirmations, setCurrentAffirmations] = useState<Affirmation[]>(affirmations);
  const [selectedAffirmation, setSelectedAffirmation] = useState<Affirmation | null>(null);

  // Add streak states
  const [streakData, setStreakData] = useState<StreakData>({
    meditation: 0,
    journaling: 0,
    gratitude: 0,
    focus: 0,
    affirmations: 0,
    lastUpdated: new Date().toISOString(),
    lastMeditationDate: '',
    lastJournalingDate: '',
    lastGratitudeDate: '',
    lastFocusDate: '',
    lastAffirmationsDate: ''
  });

  // Add new state for affirmation display
  const [showAffirmationsList, setShowAffirmationsList] = useState(false);

  useEffect(() => {
    // Check authentication and profile status
    const isAuth = !!localStorage.getItem('isAuthenticated');
    setIsAuthenticated(isAuth);
    
    const profileCompleted = localStorage.getItem('profileSetupCompleted');
    const profileData = localStorage.getItem('userProfile');
    
    if (profileCompleted === 'true' && profileData) {
      const profile = JSON.parse(profileData);
      setUserProfile(profile);
      setIsProfileComplete(profile.completedSetup !== false);
    }
    
    // Load resources
    setResources(meditationTracks);
    setIsLoading(false);

    // Fix for Safari AudioContext issue
    document.addEventListener('click', () => {
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(_ => {
            // Automatic playback started
            audioRef.current?.pause();
          }).catch(error => {
            // Auto-play was prevented
            console.log("Audio playback prevented:", error);
          });
        }
      }
    }, { once: true });

    // Initialize or load streak data from localStorage
    const savedStreak = localStorage.getItem('mindfulnessStreaks');
    if (savedStreak) {
      try {
        setStreakData(JSON.parse(savedStreak));
      } catch (e) {
        console.error('Error parsing streak data:', e);
      }
    }
  }, []);

  // Update effect to save streak data
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('mindfulnessStreaks', JSON.stringify(streakData));
    }
  }, [streakData, isAuthenticated]);

  // Audio player functions
  const handlePlayPause = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Helper function to update streak for a specific activity
  const updateStreak = (activityType: 'meditation' | 'journaling' | 'gratitude' | 'focus' | 'affirmations') => {
    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    setStreakData(prev => {
      // Get the last completion date for this activity
      const lastDateKey = `last${activityType.charAt(0).toUpperCase() + activityType.slice(1)}Date` as 
        'lastMeditationDate' | 'lastJournalingDate' | 'lastGratitudeDate' | 'lastFocusDate' | 'lastAffirmationsDate';
      const lastDate = prev[lastDateKey];
      
      // If there's no last date or it's from a previous day, increment streak
      // If it's from today, don't increment (prevent multiple increments in same day)
      let newStreak = prev[activityType];
      
      if (!lastDate || lastDate !== today) {
        newStreak += 1;
      }
      
      return {
        ...prev,
        [activityType]: newStreak,
        [lastDateKey]: today,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  // Journal functions
  const saveJournalEntry = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }

    if (currentJournalEntry.trim()) {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: currentJournalEntry,
        mood: selectedMood,
        tags: []
      };
      setJournalEntries([...journalEntries, newEntry]);
      setCurrentJournalEntry('');
      setSelectedMood('');
      
      // Update streak
      updateStreak('journaling');
    }
  };

  // Gratitude functions
  const saveGratitudeEntry = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }

    if (currentGratitudeEntry.trim()) {
      const newEntry: GratitudeEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: currentGratitudeEntry,
        category: selectedGratitudeCategory
      };
      setGratitudeEntries([...gratitudeEntries, newEntry]);
      setCurrentGratitudeEntry('');
      setSelectedGratitudeCategory('');
      
      // Update streak
      updateStreak('gratitude');
    }
  };

  // Focus timer functions
  const startFocusTimer = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }

    setIsFocusTimerRunning(true);
    const timer = setInterval(() => {
      setFocusTime(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          setIsFocusTimerRunning(false);
          // Update streak when timer completes
          updateStreak('focus');
          return 25;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Filter resources by category
  const filteredResources = selectedCategory === 'All' 
    ? resources 
    : resources.filter(r => r.category === selectedCategory);

  // Add voice recording functionality
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=mindfulness');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        // Convert audio to text using speech recognition
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.onended = () => {
          // Here you would typically send the audio to a speech-to-text service
          // For now, we'll just add a placeholder text
          setCurrentJournalEntry(prev => prev + "\n[Voice recording transcribed]");
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Add category streak data
  const getCategoryStreak = (category: string) => {
    switch(category) {
      case 'Meditation':
        return streakData.meditation;
      case 'Journaling':
        return streakData.journaling;
      case 'Focus':
        return streakData.focus;
      case 'Gratitude':
        return streakData.gratitude;
      case 'Affirmations':
        return streakData.affirmations;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Main content view
  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Mindfulness Tools
          </h1>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="flex items-center"
          >
            <span className="material-icons">home</span>
          </Button>
        </div>

        {/* Mindfulness Tools in 2x2 grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => isAuthenticated ? setShowJournal(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative"
          >
            <span className="text-3xl mb-2 block">📝</span>
            <h3 className="font-semibold">Journal</h3>
            <p className="text-sm text-gray-600">Reflect on your day</p>
            {isAuthenticated && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                🔥 {streakData.journaling} days
              </div>
            )}
          </button>
          
          <button
            onClick={() => isAuthenticated ? setShowGratitude(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative"
          >
            <span className="text-3xl mb-2 block">🙏</span>
            <h3 className="font-semibold">Gratitude</h3>
            <p className="text-sm text-gray-600">Count your blessings</p>
            {isAuthenticated && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                🔥 {streakData.gratitude} days
              </div>
            )}
          </button>
          
          <button
            onClick={() => isAuthenticated ? setShowAffirmations(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative"
          >
            <span className="text-3xl mb-2 block">✨</span>
            <h3 className="font-semibold">Affirmations</h3>
            <p className="text-sm text-gray-600">Positive statements</p>
            {isAuthenticated && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                🔥 {streakData.affirmations || 0} days
              </div>
            )}
          </button>
          
          <button
            onClick={() => isAuthenticated ? setShowFocusTimer(true) : router.push('/auth/signup?redirect=mindfulness')}
            className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative"
          >
            <span className="text-3xl mb-2 block">⏱️</span>
            <h3 className="font-semibold">Focus Timer</h3>
            <p className="text-sm text-gray-600">Stay productive</p>
            {isAuthenticated && (
              <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                🔥 {streakData.focus} days
              </div>
            )}
          </button>
        </div>

        {/* Category Filters */}
        <div className="bg-white p-3 rounded-xl shadow-sm overflow-x-auto">
          <div className="flex space-x-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Meditation Resources with streak data - 2 per row with play icon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map(resource => (
              <div 
                key={resource.id}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative"
              >
              {isAuthenticated && (
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  🔥 {streakData.meditation} days
                </div>
              )}
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{resource.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                    <p className="text-sm text-gray-600">{resource.description}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{resource.duration}</span>
                      <span className="text-sm text-gray-500">{resource.instructor}</span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentResource(resource);
                      }}
                      className="mt-3 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center ml-auto"
                      aria-label="Play meditation"
                    >
                      <span className="material-icons">play_arrow</span>
                    </button>
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* Audio Player Modal */}
        {currentResource && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{currentResource.title}</h2>
                  <p className="text-gray-600">{currentResource.instructor}</p>
                  {isAuthenticated && (
                    <p className="text-sm text-gray-500">Current Streak: 🔥 {streakData.meditation} days</p>
                  )}
                </div>
                <button 
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentResource(null);
                    if (audioRef.current) {
                      audioRef.current.pause();
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{currentResource.icon}</div>
                <p className="text-gray-600">{currentResource.description}</p>
              </div>
              
              {currentResource.fileId ? (
                // Always use Google Drive embedded player for Google Drive files
                <GoogleDriveAudio 
                  fileId={currentResource.fileId} 
                  title={currentResource.title}
                  isAuthenticated={isAuthenticated}
                  onRequestSignup={() => {
                    router.push('/auth/signup?redirect=mindfulness');
                    setCurrentResource(null);
                  }}
                  onEnded={() => {
                    // Update meditation streak when audio completes
                    if (isAuthenticated) {
                      updateStreak('meditation');
                    }
                    // Close the modal for authenticated users
                    setCurrentResource(null);
                  }}
                />
              ) : (
                // Use regular audio player for other files
                <>
                  <audio
                    ref={audioRef}
                    src={currentResource.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => {
                      setIsPlaying(false);
                      // Update meditation streak when audio completes
                      if (isAuthenticated) {
                        updateStreak('meditation');
                      }
                    }}
                    onError={(e) => {
                      console.error("Audio error:", e);
                      alert("There was an error playing this audio. Please try another meditation.");
                    }}
                    preload="auto"
                    className="w-full"
                    controls
                  />
                  
                  <div className="space-y-4 mt-4">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    
                    <div className="w-full h-2 rounded-full bg-gray-200">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handlePlayPause}
                        className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <span className="material-icons">
                          {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            setProgress(0);
                            setCurrentTime(0);
                          }
                        }}
                        className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        <span className="material-icons">replay</span>
                      </button>
                    </div>
                    
                    <div className="flex justify-center">
                      <button 
                        onClick={() => {
                          if (isAuthenticated) {
                            updateStreak('meditation');
                            setCurrentResource(null);
                          } else {
                            router.push('/auth/signup?redirect=mindfulness');
                            setCurrentResource(null);
                          }
                        }}
                        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full"
                      >
                        Mark as Complete {!isAuthenticated && '(Sign Up)'}
                      </button>
                    </div>
                  </div>
                </>
              )}
              
              <div className="mt-4">
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <p className="font-medium text-blue-700 mb-1">Meditation Guidance:</p>
                  <ol className="list-decimal pl-5 text-gray-700 space-y-1">
                    <li>Find a comfortable seated position with your back straight</li>
                    <li>Close your eyes or maintain a soft gaze</li>
                    <li>Take a few deep breaths to center yourself</li>
                    <li>Follow the audio guidance with gentle awareness</li>
                    <li>When your mind wanders, gently return to the practice</li>
                    <li>At the end, take a moment to notice how you feel</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Journal Modal */}
        {showJournal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Journal</h2>
                  <p className="text-sm text-gray-500">Current Streak: 🔥 {streakData.journaling} days</p>
                </div>
                <button 
                  onClick={() => setShowJournal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    How are you feeling today?
                  </label>
                  
                  {/* Enhanced Emoji Mood Selector with interactive visual elements */}
                  <div className="relative pt-2 pb-4 mb-2">
                    {/* Visual mood meter background with improved gradient */}
                    <div className="absolute h-12 bg-gradient-to-r from-green-100 via-yellow-50 to-red-100 left-0 right-0 top-[65px] rounded-xl -z-10"></div>
                    
                    {/* Mood emojis with enhanced interactive elements - make emojis larger and clickable */}
                    <div className="grid grid-cols-5 gap-0 w-full relative mb-2">
                      {[
                        { emoji: '😊', mood: 'happy', label: 'Great', color: 'bg-green-400' },
                        { emoji: '😌', mood: 'calm', label: 'Good', color: 'bg-green-300' },
                        { emoji: '😐', mood: 'neutral', label: 'Okay', color: 'bg-yellow-300' },
                        { emoji: '😔', mood: 'sad', label: 'Low', color: 'bg-orange-300' },
                        { emoji: '😢', mood: 'very-sad', label: 'Bad', color: 'bg-red-400' }
                      ].map((item, index) => (
                        <div key={item.emoji} className="flex flex-col items-center">
                          <button
                            onClick={() => setSelectedMood(item.mood)}
                            className={`text-3xl p-3 rounded-full transition-all duration-300 ${
                              selectedMood === item.mood
                                ? `${item.color} scale-125 shadow-md` 
                                : 'bg-white hover:bg-gray-50 hover:scale-110 shadow-sm'
                            }`}
                            aria-label={`Select mood: ${item.label}`}
                            title={item.label}
                          >
                            {item.emoji}
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Enhanced slider track with better visuals - positioned below emojis */}
                    <div 
                      className="absolute h-3 bg-gray-200 left-[10%] right-[10%] top-[65px] rounded-full shadow-inner cursor-pointer z-10"
                      onClick={(e) => {
                        // Calculate click position relative to the slider width
                        const sliderRect = e.currentTarget.getBoundingClientRect();
                        const clickPosition = e.clientX - sliderRect.left;
                        const clickPercentage = (clickPosition / sliderRect.width) * 100;
                        
                        // Determine which mood to select based on click position
                        if (clickPercentage < 12.5) {
                          setSelectedMood('happy');
                        } else if (clickPercentage < 37.5) {
                          setSelectedMood('calm');
                        } else if (clickPercentage < 62.5) {
                          setSelectedMood('neutral');
                        } else if (clickPercentage < 87.5) {
                          setSelectedMood('sad');
                        } else {
                          setSelectedMood('very-sad');
                        }
                      }}
                    >
                      <div 
                        className="absolute h-3 bg-gradient-to-r from-green-400 via-yellow-300 to-red-400 left-0 top-0 rounded-full"
                        style={{ width: '100%' }}
                      ></div>
                      
                      {/* Position dots for each mood point on the slider */}
                      <div className="relative w-full h-full">
                        {[0, 1, 2, 3, 4].map(index => (
                          <div 
                            key={index}
                            className={`absolute w-4 h-4 rounded-full top-[-0.32rem] transform -translate-x-1/2 ${
                              (selectedMood === 'happy' && index === 0) ||
                              (selectedMood === 'calm' && index === 1) ||
                              (selectedMood === 'neutral' && index === 2) ||
                              (selectedMood === 'sad' && index === 3) ||
                              (selectedMood === 'very-sad' && index === 4)
                                ? 'bg-white border-2 border-gray-300 scale-125 z-20'
                                : 'bg-white border border-gray-300 z-10'
                            } cursor-pointer hover:scale-125 transition-transform duration-150`}
                            style={{ 
                              left: `${index * 25}%`
                            }}
                            onClick={() => setSelectedMood(
                              index === 0 ? 'happy' : 
                              index === 1 ? 'calm' : 
                              index === 2 ? 'neutral' : 
                              index === 3 ? 'sad' : 'very-sad'
                            )}
                            title={
                              index === 0 ? 'Great' : 
                              index === 1 ? 'Good' : 
                              index === 2 ? 'Okay' : 
                              index === 3 ? 'Low' : 'Bad'
                            }
                          ></div>
                        ))}
                      </div>
                      
                      {/* Improved position indicator with animation */}
                      <div 
                        className="absolute w-6 h-6 rounded-full shadow-md -top-1.5 transform -translate-x-1/2 transition-all duration-300 ease-out flex items-center justify-center z-20"
                        style={{ 
                          left: `${
                            selectedMood === 'happy' ? 0 :
                            selectedMood === 'calm' ? 25 :
                            selectedMood === 'neutral' ? 50 :
                            selectedMood === 'sad' ? 75 :
                            selectedMood === 'very-sad' ? 100 : 50
                          }%`,
                          backgroundColor: 
                            selectedMood === 'happy' ? '#34D399' : // green-400
                            selectedMood === 'calm' ? '#6EE7B7' : // green-300
                            selectedMood === 'neutral' ? '#FCD34D' : // yellow-300
                            selectedMood === 'sad' ? '#FDBA74' : // orange-300
                            selectedMood === 'very-sad' ? '#F87171' : // red-400
                            '#F3F4F6' // gray-100 (default)
                        }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    
          
                    
                    {/* Mood description */}
                    {selectedMood && (
                      <div className="text-center mt-6 text-sm text-gray-700 bg-gray-50 p-2 rounded-md transition-all duration-300 animate-fadeIn">
                        {selectedMood === 'happy' && "You're feeling great today! What's contributing to your positive mood?"}
                        {selectedMood === 'calm' && "You're feeling good and calm. What's helping you feel balanced?"}
                        {selectedMood === 'neutral' && "You're feeling okay today. Anything specific on your mind?"}
                        {selectedMood === 'sad' && "You're feeling a bit low today. Would you like to share what's troubling you?"}
                        {selectedMood === 'very-sad' && "You're having a tough day. Remember it's okay to not be okay. What might help right now?"}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Write your thoughts
                  </label>
                  <textarea
                    value={currentJournalEntry}
                    onChange={(e) => setCurrentJournalEntry(e.target.value)}
                    className={`w-full min-h-[120px] p-3 border rounded-md transition-all duration-300 focus:ring-2 focus:ring-offset-1 ${
                      selectedMood === 'happy' ? 'border-green-300 focus:ring-green-300' : 
                      selectedMood === 'calm' ? 'border-green-200 focus:ring-green-200' :
                      selectedMood === 'neutral' ? 'border-yellow-200 focus:ring-yellow-200' :
                      selectedMood === 'sad' ? 'border-orange-200 focus:ring-orange-200' :
                      selectedMood === 'very-sad' ? 'border-red-200 focus:ring-red-200' :
                      'border-gray-300 focus:ring-orange-300'
                    }`}
                    placeholder={
                      selectedMood === 'happy' ? "What's making you feel great today? What positive experiences have you had?" : 
                      selectedMood === 'calm' ? "Reflect on the sense of calm you're experiencing. What's contributing to this feeling?" :
                      selectedMood === 'neutral' ? "How has your day been so far? Any thoughts you'd like to process?" :
                      selectedMood === 'sad' ? "What's on your mind today? Remember that it's okay to have difficult feelings." :
                      selectedMood === 'very-sad' ? "I'm sorry you're feeling this way. Writing about difficult emotions can help process them." :
                      "Select a mood above, then write your thoughts here..."
                    }
                    style={{
                      resize: "none",
                      minHeight: "120px",
                      height: `${Math.max(120, Math.min(300, currentJournalEntry.split('\n').length * 24 + 48))}px`
                    }}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`flex-1 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    <span className="material-icons mr-2">
                      {isRecording ? 'stop' : 'mic'}
                    </span>
                    {isRecording ? 'Stop Recording' : 'Voice Entry'}
                  </Button>
                </div>
                
                <Button
                  onClick={saveJournalEntry}
                  className={`w-full transition-all duration-300 ${
                    currentJournalEntry.trim() && selectedMood 
                      ? 'bg-blue-500 hover:bg-blue-600 shadow-md' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!currentJournalEntry.trim() || !selectedMood}
                >
                  <span className="material-icons mr-2">save</span>
                  {!selectedMood 
                    ? 'Select a mood to continue' 
                    : !currentJournalEntry.trim() 
                      ? 'Write something to save' 
                      : 'Save Journal Entry'}
                </Button>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Previous Entries</h3>
                    
                    {journalEntries.length > 0 && (
                      <div className="flex items-center bg-gray-50 px-3 py-1 rounded-lg">
                        <span className="text-sm text-gray-600 mr-3">Mood trend:</span>
                        <div className="flex space-x-1">
                          {['😊', '😌', '😐', '😔', '😢'].map((emoji, index) => {
                            const count = journalEntries.filter(entry => 
                              entry.mood === (
                                index === 0 ? 'happy' : 
                                index === 1 ? 'calm' : 
                                index === 2 ? 'neutral' : 
                                index === 3 ? 'sad' : 'very-sad'
                              )
                            ).length;
                            
                            return (
                              <div key={emoji} className="flex flex-col items-center" title={`${count} entries`}>
                                <span className="text-xs">{emoji}</span>
                                <span className="text-xs font-medium">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {journalEntries.length === 0 ? (
                      <p className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        No journal entries yet. Start writing to track your thoughts and moods.
                      </p>
                    ) : (
                      journalEntries.map(entry => (
                        <div key={entry.id} className="border rounded-lg overflow-hidden">
                          <div className={`p-4 ${
                            entry.mood === 'happy' ? 'bg-green-50 border-b border-green-100' : 
                            entry.mood === 'calm' ? 'bg-teal-50 border-b border-teal-100' :
                            entry.mood === 'neutral' ? 'bg-yellow-50 border-b border-yellow-100' :
                            entry.mood === 'sad' ? 'bg-orange-50 border-b border-orange-100' :
                            'bg-red-50 border-b border-red-100'
                          }`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">
                                  {entry.mood === 'happy' ? '😊' : 
                                   entry.mood === 'calm' ? '😌' :
                                   entry.mood === 'neutral' ? '😐' :
                                   entry.mood === 'sad' ? '😔' : '😢'}
                                </span>
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {entry.mood === 'happy' ? 'Great day' : 
                                     entry.mood === 'calm' ? 'Good day' :
                                     entry.mood === 'neutral' ? 'Okay day' :
                                     entry.mood === 'sad' ? 'Low day' : 'Tough day'}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(entry.date).toLocaleDateString(undefined, { 
                                      weekday: 'short', 
                                      month: 'short', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <span className={`inline-block w-3 h-3 rounded-full mr-1 ${
                                  entry.mood === 'happy' ? 'bg-green-400' : 
                                  entry.mood === 'calm' ? 'bg-green-300' :
                                  entry.mood === 'neutral' ? 'bg-yellow-300' :
                                  entry.mood === 'sad' ? 'bg-orange-300' : 'bg-red-400'
                                }`}></span>
                                <span className="text-xs uppercase tracking-wide font-medium text-gray-500">
                                  {entry.mood}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-white">
                            <p className="text-gray-700 whitespace-pre-line">{entry.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gratitude Modal */}
        {showGratitude && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Gratitude Journal</h2>
                  <p className="text-sm text-gray-500">Current Streak: 🔥 {streakData.gratitude} days</p>
                </div>
                <button 
                  onClick={() => setShowGratitude(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={selectedGratitudeCategory}
                    onChange={(e) => setSelectedGratitudeCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select category...</option>
                    <option value="relationships">Relationships</option>
                    <option value="health">Health</option>
                    <option value="career">Career</option>
                    <option value="personal">Personal Growth</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    I am grateful for...
                  </label>
                  <textarea
                    value={currentGratitudeEntry}
                    onChange={(e) => setCurrentGratitudeEntry(e.target.value)}
                    className="w-full h-40 p-2 border border-gray-300 rounded-md"
                    placeholder="Write what you're grateful for..."
                  />
                </div>
                
                <Button
                  onClick={saveGratitudeEntry}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Save Entry
                </Button>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Gratitude List</h3>
                  <div className="space-y-4">
                    {gratitudeEntries.map(entry => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm text-gray-500">
                            {new Date(entry.date).toLocaleDateString()}
                      </span>
                          <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {entry.category}
                      </span>
                    </div>
                        <p className="text-gray-700">{entry.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Affirmations Modal */}
        {showAffirmations && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Daily Affirmations</h2>
                  <p className="text-sm text-gray-500">Current Streak: 🔥 {streakData.affirmations || 0} days</p>
                </div>
                <button 
                  onClick={() => setShowAffirmations(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Today's Affirmation</h3>
                  <p className="text-lg font-medium text-gray-700">
                    {selectedAffirmation ? selectedAffirmation.text : "Select an affirmation below"}
                  </p>
                  {selectedAffirmation && (
                    <Button
                      onClick={() => {
                        // Update affirmation streak when affirmed
                        if (isAuthenticated) {
                          updateStreak('affirmations');
                        }
                        setSelectedAffirmation(null);
                      }}
                      className="mt-3 w-full bg-blue-500 hover:bg-blue-600 rounded-full"
                    >
                      {isAuthenticated ? 'I affirm this' : 'Sign Up to Affirm'}
                    </Button>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Choose an Affirmation</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {currentAffirmations.map(affirmation => (
                      <button
                        key={affirmation.id}
                        onClick={() => setSelectedAffirmation(affirmation)}
                        className={`p-3 text-left rounded-lg border transition-all ${
                          selectedAffirmation?.id === affirmation.id
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <p className="font-medium">{affirmation.text}</p>
                        <span className="text-xs text-blue-600 mt-1 block">{affirmation.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Create Your Own</h3>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg h-24"
                    placeholder="Write your own affirmation..."
                  ></textarea>
                  <Button
                    className="mt-2 bg-blue-500 hover:bg-blue-600"
                  >
                    Save Affirmation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Focus Timer Modal */}
        {showFocusTimer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Focus Timer</h2>
                  <p className="text-sm text-gray-500">Current Streak: 🔥 {streakData.focus} days</p>
                </div>
                <button 
                  onClick={() => setShowFocusTimer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center space-y-6">
                <div className="text-6xl font-bold text-blue-500">
                  {Math.floor(focusTime / 60)}:{(focusTime % 60).toString().padStart(2, '0')}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => {
                      if (isFocusTimerRunning) {
                        setIsFocusTimerRunning(false);
                      } else {
                        startFocusTimer();
                      }
                    }}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isFocusTimerRunning ? 'Pause' : 'Start'}
                  </Button>
                  <Button
                    onClick={() => {
                      setFocusTime(25);
                      setIsFocusTimerRunning(false);
                    }}
                    variant="outline"
                  >
                    Reset
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Quick Start</h3>
                  <div className="flex justify-center space-x-2">
                    <Button
                      onClick={() => setFocusTime(25)}
                      variant="outline"
                      size="sm"
                    >
                      25 min
                    </Button>
                    <Button
                      onClick={() => setFocusTime(45)}
                      variant="outline"
                      size="sm"
                    >
                      45 min
                    </Button>
                    <Button
                      onClick={() => setFocusTime(60)}
                      variant="outline"
                      size="sm"
                    >
                      60 min
                    </Button>
                  </div>
                </div>
              </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}