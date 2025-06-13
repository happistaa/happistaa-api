'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/profile/ProfileSetup';

interface Therapist {
  id: string;
  name: string;
  avatar: string;
  specialties: string[];
  experience: string;
  yearsOfExperience: number;
  education: string;
  degree: string;
  bio: string;
  rating: number;
  reviewCount: number;
  price: string;
  pricePerHour: number;
  nextAvailable: string[];
  languages: string[];
  age: number;
  gender: string;
  counselingTypes: string[];
  sessionCount: number;
  isRecommended?: boolean;
}

interface Session {
  id: string;
  therapistId: string;
  therapistName: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
  notes: string;
  price: string;
  meetingLink: string;
  approvedAt: string | null;
  hasFeedback?: boolean;
  feedback?: {
    rating: number;
    comment: string;
    date: string;
  };
}

const mockTherapists: Therapist[] = [
  {
    id: '1',
    name: 'Dr. Jennifer Williams',
    avatar: '👩‍⚕️',
    specialties: ['Anxiety', 'Depression', 'Trauma'],
    experience: '10+ years',
    yearsOfExperience: 10,
    education: 'PhD in Clinical Psychology',
    degree: 'PhD',
    bio: 'I specialize in helping individuals navigate through anxiety, depression, and trauma. My approach combines cognitive-behavioral therapy with mindfulness practices.',
    rating: 4.9,
    reviewCount: 127,
    price: '$120/session',
    pricePerHour: 120,
    nextAvailable: ['Today, 4:00 PM', 'Tomorrow, 10:00 AM', 'Tomorrow, 2:00 PM'],
    languages: ['English'],
    age: 35,
    gender: 'Female',
    counselingTypes: ['Individual', 'Group'],
    sessionCount: 200,
    isRecommended: true
  },
  {
    id: '2',
    name: 'Dr. Robert Chen',
    avatar: '👨‍⚕️',
    specialties: ['Stress Management', 'Relationship Issues', 'Work-Life Balance'],
    experience: '8 years',
    yearsOfExperience: 8,
    education: 'PsyD in Psychology',
    degree: 'PsyD',
    bio: 'I help clients develop strategies to manage stress and improve relationships. My therapeutic approach is client-centered and solution-focused.',
    rating: 4.7,
    reviewCount: 89,
    price: '$100/session',
    pricePerHour: 100,
    nextAvailable: ['Tomorrow, 1:00 PM', 'Friday, 11:00 AM', 'Saturday, 9:00 AM'],
    languages: ['English'],
    age: 40,
    gender: 'Male',
    counselingTypes: ['Individual', 'Couple'],
    sessionCount: 100
  },
  {
    id: '3',
    name: 'Dr. Maria Rodriguez',
    avatar: '👩‍⚕️',
    specialties: ['Grief Counseling', 'Life Transitions', 'Self-Esteem'],
    experience: '12 years',
    yearsOfExperience: 12,
    education: 'PhD in Counseling Psychology',
    degree: 'PhD',
    bio: 'I support individuals through life transitions, grief, and self-esteem issues. My approach is compassionate, warm, and grounded in evidence-based practices.',
    rating: 4.8,
    reviewCount: 156,
    price: '$130/session',
    pricePerHour: 130,
    nextAvailable: ['Today, 6:00 PM', 'Wednesday, 3:00 PM', 'Thursday, 5:00 PM'],
    languages: ['Spanish'],
    age: 30,
    gender: 'Female',
    counselingTypes: ['Individual', 'Group'],
    sessionCount: 150
  }
];

// Available issues for filtering
const issueOptions = [
  'Anxiety', 'Depression', 'Trauma', 'Stress Management', 'Relationship Issues',
  'Work-Life Balance', 'Grief', 'Life Transitions', 'Self-Esteem'
];

// Add additional filter options
const experienceOptions = ['Any', '0-5 years', '5-10 years', '10+ years'];
const ratingOptions = ['Any', '4.5+', '4.0+', '3.5+'];
const priceRangeOptions = ['Any', '$50-100', '$100-150', '$150+'];
const languageOptions = ['Any', 'English', 'Spanish', 'Mandarin', 'Hindi', 'Urdu', 'Portuguese'];
const genderOptions = ['Any', 'Male', 'Female', 'Non-binary'];
const counselingTypeOptions = ['Any', 'Individual', 'Couples', 'Group', 'Family', 'CBT', 'Trauma-Focused', 'Psychodynamic'];
const degreeOptions = ['Any', 'PhD', 'PsyD', 'MD', 'LMFT', 'LCSW'];

// Mock user sessions
const userSessions: Session[] = [
  {
    id: '1',
    therapistId: '1',
    therapistName: 'Dr. Jennifer Williams',
    date: '2023-11-15',
    time: '10:00 AM',
    status: 'upcoming',
    notes: '',
    price: '$120/session',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    approvedAt: '2023-11-10T14:30:00Z'
  },
  {
    id: '2',
    therapistId: '3',
    therapistName: 'Dr. Maria Rodriguez',
    date: '2023-11-10',
    time: '2:00 PM',
    status: 'completed',
    notes: 'Follow-up discussion on anxiety management techniques',
    price: '$130/session',
    meetingLink: 'https://meet.google.com/xyz-abcd-efg',
    approvedAt: '2023-11-05T09:15:00Z'
  },
  {
    id: '3',
    therapistId: '2',
    therapistName: 'Dr. Robert Chen',
    date: '2023-11-05',
    time: '3:30 PM',
    status: 'cancelled',
    notes: 'Rescheduled for Nov 20',
    price: '$100/session',
    meetingLink: '',
    approvedAt: null
  },
  {
    id: '4',
    therapistId: '1',
    therapistName: 'Dr. Jennifer Williams',
    date: '2023-11-20',
    time: '11:00 AM',
    status: 'pending',
    notes: 'Waiting for therapist approval',
    price: '$120/session',
    meetingLink: '',
    approvedAt: null
  }
];

export default function TherapyPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  
  // Filters
  const [experienceFilter, setExperienceFilter] = useState<string>('Any');
  const [ratingFilter, setRatingFilter] = useState<string>('Any');
  const [priceMinFilter, setPriceMinFilter] = useState<number>(0);
  const [priceMaxFilter, setPriceMaxFilter] = useState<number>(500);
  const [languageFilters, setLanguageFilters] = useState<string[]>([]);
  const [genderFilters, setGenderFilters] = useState<string[]>([]);
  const [counselingTypeFilters, setCounselingTypeFilters] = useState<string[]>([]);
  const [degreeFilters, setDegreeFilters] = useState<string[]>([]);
  const [issueFilters, setIssueFilters] = useState<string[]>([]);
  
  // Booking state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    therapistName: string;
    date: string;
    time: string;
    price: string;
  } | null>(null);

  // Add state for filter modal
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState<number>(0);
  
  // Add state for sorting
  const [sortOption, setSortOption] = useState<string>('recommended');
  const [showSortOptions, setShowSortOptions] = useState<boolean>(false);
  
  // Add state for sessions view
  const [showSessionsView, setShowSessionsView] = useState<boolean>(false);
  const [sessions, setSessions] = useState(userSessions);
  
  // Add loading state for filters
  const [isFilteringLoading, setIsFilteringLoading] = useState<boolean>(false);

  // Session management state (moved outside conditional)
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'pending' | 'completed' | 'cancelled'>('all');
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [countdowns, setCountdowns] = useState<{[sessionId: string]: string}>({});

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = !!localStorage.getItem('isAuthenticated');
    setIsAuthenticated(isAuth);
    
    // Check if profile is complete
    const profileCompleted = localStorage.getItem('profileSetupCompleted');
    const profileData = localStorage.getItem('userProfile');
    
    if (profileCompleted === 'true' && profileData) {
      const profile = JSON.parse(profileData);
      setUserProfile(profile);
      
      // Only consider profile complete if the user has fully completed setup
      setIsProfileComplete(profile.completedSetup !== false);
    }
    
    // Load therapists data for all users
      setTherapists(mockTherapists);
    setFilteredTherapists(mockTherapists);
    
    // Load sessions for authenticated users
    if (isAuth) {
      // Try to load sessions from localStorage first
      const savedSessions = localStorage.getItem('therapySessions');
      if (savedSessions) {
        try {
          setSessions(JSON.parse(savedSessions));
        } catch (e) {
          console.error('Error parsing saved sessions:', e);
          setSessions(userSessions);
        }
      } else {
        setSessions(userSessions);
      }
    }
    
    setIsLoading(false);
  }, []);
  
  // Countdown timer effect - only run when showing sessions view
  useEffect(() => {
    if (!showSessionsView) return;
    
    const timer = setInterval(() => {
      const updatedCountdowns: {[sessionId: string]: string} = {};
      
      sessions.forEach(session => {
        if (session.status === 'upcoming') {
          try {
            // Parse the date and time
            const [hours, minutes] = session.time
              .replace(' AM', '')
              .replace(' PM', '')
              .split(':')
              .map(Number);
            
            const isPM = session.time.includes('PM') && hours !== 12;
            const sessionHours = isPM ? hours + 12 : hours;
            
            const sessionDate = new Date(session.date);
            sessionDate.setHours(sessionHours, minutes, 0, 0);
            
            const now = new Date();
            const timeDiff = sessionDate.getTime() - now.getTime();
            
            if (timeDiff > 0 && timeDiff <= 10 * 60 * 1000) {
              // Format as MM:SS
              const totalSeconds = Math.floor(timeDiff / 1000);
              const mins = Math.floor(totalSeconds / 60);
              const secs = totalSeconds % 60;
              updatedCountdowns[session.id] = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }
          } catch (error) {
            // Ignore parsing errors
          }
        }
      });
      
      setCountdowns(updatedCountdowns);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [sessions, showSessionsView]);

  // Enhanced filter logic
  useEffect(() => {
    // Show loading state when filters change
    setIsFilteringLoading(true);
    
    // Use timeout to simulate API call for filtering
    const filterTimeout = setTimeout(() => {
      let result = [...therapists];
      let filterCount = 0;
      
      // Filter by issues (multiple selection)
      if (issueFilters.length > 0) {
        result = result.filter(therapist => 
          therapist.specialties.some(specialty => 
            issueFilters.some(issue => specialty.toLowerCase().includes(issue.toLowerCase()))
          )
        );
        filterCount++;
      }
      
      // Filter by experience
      if (experienceFilter !== 'Any') {
        if (experienceFilter === '0-5 years') {
          result = result.filter(therapist => therapist.yearsOfExperience < 5);
        } else if (experienceFilter === '5-10 years') {
          result = result.filter(therapist => therapist.yearsOfExperience >= 5 && therapist.yearsOfExperience < 10);
        } else if (experienceFilter === '10+ years') {
          result = result.filter(therapist => therapist.yearsOfExperience >= 10);
        }
        filterCount++;
      }
      
      // Filter by rating
      if (ratingFilter !== 'Any') {
        const minRating = parseFloat(ratingFilter.replace('+', ''));
        result = result.filter(therapist => therapist.rating >= minRating);
        filterCount++;
      }
      
      // Filter by price range (slider)
      if (priceMinFilter > 0 || priceMaxFilter < 500) {
        result = result.filter(therapist => 
          therapist.pricePerHour >= priceMinFilter && 
          (priceMaxFilter === 500 || therapist.pricePerHour <= priceMaxFilter)
        );
        filterCount++;
      }
      
      // Filter by language (multiple selection)
      if (languageFilters.length > 0) {
        result = result.filter(therapist => 
          therapist.languages.some(language => 
            languageFilters.includes(language)
          )
        );
        filterCount++;
      }
      
      // Filter by gender (multiple selection)
      if (genderFilters.length > 0) {
        result = result.filter(therapist => 
          genderFilters.includes(therapist.gender)
        );
        filterCount++;
      }
      
      // Filter by counseling type (multiple selection)
      if (counselingTypeFilters.length > 0) {
        result = result.filter(therapist => 
          therapist.counselingTypes.some(type => 
            counselingTypeFilters.includes(type)
          )
        );
        filterCount++;
      }
      
      // Filter by degree (multiple selection)
      if (degreeFilters.length > 0) {
        result = result.filter(therapist => 
          degreeFilters.includes(therapist.degree)
        );
        filterCount++;
      }
      
      // Apply sorting
      if (sortOption === 'price_low_high') {
        result.sort((a, b) => a.pricePerHour - b.pricePerHour);
      } else if (sortOption === 'price_high_low') {
        result.sort((a, b) => b.pricePerHour - a.pricePerHour);
      } else if (sortOption === 'experience_high_low') {
        result.sort((a, b) => b.yearsOfExperience - a.yearsOfExperience);
      } else if (sortOption === 'rating_high_low') {
        result.sort((a, b) => b.rating - a.rating);
      } else if (sortOption === 'sessions_high_low') {
        result.sort((a, b) => b.sessionCount - a.sessionCount);
      } else if (sortOption === 'availability_soon') {
        // Sort by earliest available slot (simplified)
        result.sort((a, b) => {
          if (a.nextAvailable.length === 0) return 1;
          if (b.nextAvailable.length === 0) return -1;
          return a.nextAvailable[0].localeCompare(b.nextAvailable[0]);
        });
      }
      
      setActiveFiltersCount(filterCount);
      setFilteredTherapists(result);
      setIsFilteringLoading(false);
    }, 300); // Short delay to show loading state
    
    return () => clearTimeout(filterTimeout);
  }, [therapists, issueFilters, experienceFilter, ratingFilter, priceMinFilter, priceMaxFilter, languageFilters, genderFilters, counselingTypeFilters, degreeFilters, sortOption]);

  const handleSelectTimeslot = (therapistId: string, time: string) => {
    // If not authenticated, redirect to signup
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=therapy');
      return;
    }
    
    setSelectedTherapist(therapists.find(t => t.id === therapistId) || null);
    setShowBookingModal(true);
  };

  const handleBookSession = (therapist: Therapist) => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=therapy');
      return;
    }
    
    // Then check if profile is complete
 //   if (!isProfileComplete) {
   //   router.push('/onboarding/profile-setup');
   //    return;
   //  }
    
    // Existing booking logic
    setSelectedTherapist(therapist);
    setShowBookingModal(true);
    setBookingComplete(false);
    setBookingConfirmation(null);
  };

  const completeBooking = (date: string, time: string) => {
    if (!selectedTherapist) return;
    
    setBookingComplete(true);
    
    // Create a new session
    const newSession: Session = {
      id: `session-${Date.now()}`,
      therapistId: selectedTherapist.id,
      therapistName: selectedTherapist.name,
      date,
      time,
      status: 'pending',
      notes: 'Waiting for therapist approval',
      price: selectedTherapist.price,
      meetingLink: '', // Will be provided by therapist after approval
      approvedAt: null
    };
    
    // Add to sessions
    setSessions([...sessions, newSession]);
    
    // Show confirmation
    setBookingConfirmation({
      therapistName: selectedTherapist.name,
      date,
      time,
      price: selectedTherapist.price
    });
    
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingComplete(false);
      setBookingConfirmation(null);
      // Navigate to sessions view
      setShowSessionsView(true);
    }, 5000);
  };

  const viewTherapistProfile = (therapist: Therapist) => {
    if (isAuthenticated) {
      router.push(`/therapy/therapist/${therapist.id}`);
    } else {
      router.push('/auth/signup?redirect=therapy');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  // If not authenticated, show the listing but prompt for signup when booking
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
              Professional Therapy
          </h1>
            <div className="flex items-center space-x-2">
              {/* Sign up button for guests */}
          <Button
                onClick={() => router.push('/auth/signup?redirect=therapy')}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Sign Up
              </Button>
              
              {/* Back to dashboard button */}
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="flex items-center"
              >
                <span className="material-icons">home</span>
          </Button>
            </div>
          </div>
          
          {/* Filter and Sort Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <button
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                  activeFiltersCount > 0 ? 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'
                }`}
              >
                <span className="material-icons text-xl">filter_list</span>
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              {/* Show active filters as pills */}
              <div className="hidden md:flex ml-2 flex-wrap gap-2">
                {issueFilters.map((issue, index) => (
                  <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center">
                    {issue}
                    <button 
                      onClick={() => setIssueFilters(issueFilters.filter(i => i !== issue))}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <span className="material-icons text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none flex items-center min-w-[180px] justify-between bg-white"
                aria-haspopup="listbox"
                aria-expanded={showSortOptions}
              >
                <span>
                  {(() => {
                    switch (sortOption) {
                      case 'recommended': return 'Recommended';
                      case 'price_low_high': return 'Price: Low to High';
                      case 'price_high_low': return 'Price: High to Low';
                      case 'experience_high_low': return 'Experience';
                      case 'rating_high_low': return 'Rating';
                      case 'sessions_high_low': return 'Most Sessions';
                      case 'availability_soon': return 'Earliest Available';
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
                    { id: 'recommended', label: 'Recommended' },
                    { id: 'price_low_high', label: 'Price: Low to High' },
                    { id: 'price_high_low', label: 'Price: High to Low' },
                    { id: 'experience_high_low', label: 'Experience: Most to Least' },
                    { id: 'rating_high_low', label: 'Rating: High to Low' },
                    { id: 'sessions_high_low', label: 'Most Sessions' },
                    { id: 'availability_soon', label: 'Earliest Available' },
                  ].map(option => (
                    <button
                      key={option.id}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortOption === option.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSortOption(option.id);
                        setShowSortOptions(false);
                      }}
                    >
                      {option.label}
                      {sortOption === option.id && (
                        <span className="float-right material-icons text-blue-500 text-sm">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Filter Modal */}
          <FilterModal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={{
              issues: issueFilters,
              experience: experienceFilter,
              rating: ratingFilter,
              priceMin: priceMinFilter,
              priceMax: priceMaxFilter,
              languages: languageFilters,
              genders: genderFilters,
              counselingTypes: counselingTypeFilters,
              degrees: degreeFilters
            }}
            setFilters={{
              setIssues: setIssueFilters,
              setExperience: setExperienceFilter,
              setRating: setRatingFilter,
              setPriceRange: (min: number, max: number) => {
                setPriceMinFilter(min);
                setPriceMaxFilter(max);
              },
              setLanguages: setLanguageFilters,
              setGenders: setGenderFilters,
              setCounselingTypes: setCounselingTypeFilters,
              setDegrees: setDegreeFilters
            }}
            options={{
              issues: issueOptions,
              experience: experienceOptions,
              rating: ratingOptions,
              language: languageOptions,
              gender: genderOptions,
              counselingType: counselingTypeOptions,
              degree: degreeOptions
            }}
          />

          {/* Therapist list */}
          <div className="space-y-6">
            {isFilteringLoading ? (
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                <p className="text-gray-600 mt-2">Filtering therapists...</p>
              </div>
            ) : filteredTherapists.length === 0 ? (
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <p className="text-gray-600">No therapists match your criteria. Please try different filters.</p>
              </div>
            ) : (
              filteredTherapists.map(therapist => (
                <div 
                  key={therapist.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-100 cursor-pointer transition-all relative"
                  onClick={() => viewTherapistProfile(therapist)}
                >
                  {therapist.isRecommended && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      <span className="flex items-center">
                        <span className="material-icons text-xs mr-1">recommend</span>
                        Recommended
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Therapist info */}
                    <div className="md:col-span-3">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{therapist.avatar}</div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{therapist.name}</h3>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500 material-icons text-sm">star</span>
                            <span className="text-sm text-gray-700 ml-1">{therapist.rating}</span>
                            <span className="text-xs text-gray-500 ml-1">({therapist.reviewCount} reviews)</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{therapist.education} • {therapist.experience}</p>
                          <p className="text-blue-600 font-medium mt-1">{therapist.price}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-gray-700 text-sm line-clamp-2">{therapist.bio}</p>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {therapist.specialties.map((specialty, i) => (
                          <span 
                            key={i}
                            className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Booking options */}
                    <div className="border-t pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4 flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
                      <p className="text-sm font-medium text-gray-700 mb-2">Next Available: {therapist.nextAvailable[0] || 'Contact for availability'}</p>
                      {isAuthenticated ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookSession(therapist);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 w-full rounded-full"
                        >
                          Book Session
                        </Button>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/auth/signup?redirect=therapy');
                          }}
                          className="bg-blue-500 hover:bg-blue-600 w-full rounded-full"
                        >
                          Sign Up to Book
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Add BookingModal */}
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            therapist={selectedTherapist}
            onBook={completeBooking}
            isComplete={bookingComplete}
            confirmation={bookingConfirmation}
          />
        </div>
      </div>
    );
  }

  // For authenticated users
  if (isAuthenticated) {
    // Sessions view
    if (showSessionsView) {
      // Filter sessions based on active tab
      const filteredSessions = sessions.filter(session => {
        if (activeTab === 'all') return true;
        return session.status === activeTab;
      });

      // Handle reschedule
      const handleReschedule = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setShowRescheduleModal(true);
      };

      // Handle cancel
      const handleCancel = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setShowCancelModal(true);
      };

      // Handle feedback
      const handleFeedback = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        setFeedbackRating(0);
        setFeedbackComment('');
        setShowFeedbackModal(true);
      };

      // Confirm cancellation
      const confirmCancel = () => {
        if (selectedSessionId) {
          // Update the session status to cancelled
          setSessions(sessions.map(session => 
            session.id === selectedSessionId 
              ? {...session, status: 'cancelled', notes: 'Cancelled by user'} 
              : session
          ));
          setShowCancelModal(false);
          setSelectedSessionId(null);
        }
      };

      // Confirm reschedule (simplified for demo)
      const confirmReschedule = (newDate: string, newTime: string) => {
        if (selectedSessionId) {
          // Update the session with new date and time
          setSessions(sessions.map(session => 
            session.id === selectedSessionId 
              ? {...session, date: newDate, time: newTime, status: 'pending', notes: 'Rescheduled by user'} 
              : session
          ));
          setShowRescheduleModal(false);
          setSelectedSessionId(null);
        }
      };

      // Submit feedback (simplified for demo)
      const submitFeedback = () => {
        if (selectedSessionId && feedbackRating > 0) {
          const session = sessions.find(s => s.id === selectedSessionId);
          if (!session) return;
          
          const feedbackDate = new Date().toISOString();
          
          // Update the session with feedback
          const updatedSessions = sessions.map(s => 
            s.id === selectedSessionId 
              ? {
                  ...s, 
                  hasFeedback: true,
                  feedback: {
                    rating: feedbackRating,
                    comment: feedbackComment,
                    date: feedbackDate
                  }
                } 
              : s
          );
          
          setSessions(updatedSessions);
          
          // Store sessions in localStorage for persistence
          localStorage.setItem('therapySessions', JSON.stringify(updatedSessions));
          
          // Update therapist rating
          const therapistId = session.therapistId;
          const updatedTherapists = therapists.map(t => {
            if (t.id === therapistId) {
              // Calculate new average rating
              const newTotalRating = t.rating * t.reviewCount + feedbackRating;
              const newReviewCount = t.reviewCount + 1;
              const newRating = parseFloat((newTotalRating / newReviewCount).toFixed(1));
              
              return {
                ...t,
                rating: newRating,
                reviewCount: newReviewCount
              };
            }
            return t;
          });
          
          setTherapists(updatedTherapists);
          setFilteredTherapists(
            filteredTherapists.map(t => 
              t.id === therapistId 
                ? updatedTherapists.find(ut => ut.id === therapistId) || t 
                : t
            )
          );
          
          setShowFeedbackModal(false);
          setSelectedSessionId(null);
          setFeedbackRating(0);
          setFeedbackComment('');
        }
      };

      // Check if a session is starting soon (within 10 minutes)
      const isSessionStartingSoon = (session: Session) => {
        if (session.status !== 'upcoming') return false;
        
        try {
          // Parse the date and time
          const [hours, minutes] = session.time
            .replace(' AM', '')
            .replace(' PM', '')
            .split(':')
            .map(Number);
          
          const isPM = session.time.includes('PM') && hours !== 12;
          const sessionHours = isPM ? hours + 12 : hours;
          
          const sessionDate = new Date(session.date);
          sessionDate.setHours(sessionHours, minutes, 0, 0);
          
          const now = new Date();
          const timeDiff = sessionDate.getTime() - now.getTime();
          
          // Return true if the session is within the next 10 minutes
          return timeDiff <= 10 * 60 * 1000 && timeDiff > 0;
        } catch (error) {
          return false;
        }
      };

  return (
    <div className="min-h-screen gradient-bg p-6">
          <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
                My Sessions
          </h1>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowSessionsView(false)}
                  variant="default"
                  className="flex items-center"
                >
                  <span className="material-icons">arrow_back</span>
                </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="flex items-center"
          >
            <span className="material-icons">home</span>
          </Button>
              </div>
        </div>

            {/* Sessions Tabs */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="border-b mb-4">
                <div className="flex space-x-4 overflow-x-auto pb-1">
                  <button 
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === 'all' 
                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    All Sessions
                  </button>
                  <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === 'upcoming' 
                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button 
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === 'pending' 
                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Pending
                  </button>
                  <button 
                    onClick={() => setActiveTab('completed')}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === 'completed' 
                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Completed
                  </button>
                  <button 
                    onClick={() => setActiveTab('cancelled')}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === 'cancelled' 
                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Cancelled
                  </button>
                </div>
              </div>
              
              {/* Sessions List */}
              <div className="space-y-4">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No {activeTab !== 'all' ? activeTab : ''} sessions found.</p>
                    <Button
                      onClick={() => setShowSessionsView(false)}
                      className="mt-4 bg-blue-500 hover:bg-blue-600"
                    >
                      Book a Session
                    </Button>
                  </div>
                ) : (
                  filteredSessions.map(session => {
                    // Check if session is starting soon
                    const isStartingSoon = isSessionStartingSoon(session);
                    
                    // Format date for display
                    const formattedDate = new Date(session.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });
                    
                    return (
                      <div 
                        key={session.id}
                        className={`border rounded-lg p-4 hover:border-blue-200 transition-all ${
                          isStartingSoon ? 'bg-green-50 border-green-200' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{session.therapistName}</h3>
                            <div className="mt-1 text-gray-600">
                              <p>{formattedDate}</p>
                              <p>{session.time}</p>
                            </div>
                            {session.notes && !session.hasFeedback && (
                              <p className="mt-2 text-sm text-gray-500">{session.notes}</p>
                            )}
                            {session.hasFeedback && session.feedback && (
                              <div className="mt-2 bg-blue-50 p-2 rounded-md">
                                <div className="flex items-center">
                                  <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <span key={star} className="material-icons text-sm">
                                        {star <= session.feedback!.rating ? 'star' : 'star_border'}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-gray-500 ml-1">
                                    {new Date(session.feedback.date).toLocaleDateString()}
                                  </span>
                                </div>
                                {session.feedback.comment && (
                                  <p className="text-sm text-gray-700 mt-1">{session.feedback.comment}</p>
                                )}
                              </div>
                            )}
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-gray-700">Fee:</span>
                              <span className="text-blue-600 ml-1">{session.price}</span>
                            </div>
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              session.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                              session.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              session.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Meeting Link - Only show if approved and starting soon */}
                        {session.status === 'upcoming' && session.meetingLink && isStartingSoon && (
                          <div className="mt-3 bg-green-50 p-3 rounded-lg border border-green-100">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-green-700 font-medium">Your session is starting soon!</p>
                                {countdowns[session.id] && (
                                  <p className="text-sm text-gray-600 flex items-center">
                                    <span className="material-icons text-sm mr-1">timer</span>
                                    Starting in {countdowns[session.id]}
                                  </p>
                                )}
                              </div>
                              <a 
                                href={session.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
                              >
                                <span className="material-icons mr-1">videocam</span>
                                Join Session
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {/* Upcoming Session Info */}
                        {session.status === 'upcoming' && !isStartingSoon && (
                          <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div className="flex items-start">
                              <span className="material-icons text-blue-500 mr-2">event</span>
                              <div>
                                <p className="text-blue-700 font-medium">Upcoming Session</p>
                                <p className="text-sm text-gray-600">
                                  Your Google Meet link will be available 10 minutes before the session.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Payment Reminder */}
                        {session.status === 'upcoming' && (
                          <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <p className="text-blue-700 font-medium">Payment Information</p>
                            <p className="text-sm text-gray-600">
                              Please have {session.price} ready to pay your therapist directly during the session.
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-4 flex flex-wrap justify-end gap-2">
                          {session.status === 'upcoming' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReschedule(session.id)}
                              >
                                <span className="material-icons text-sm mr-1">event</span>
                                Reschedule
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-300 hover:bg-red-50"
                                onClick={() => handleCancel(session.id)}
                              >
                                <span className="material-icons text-sm mr-1">cancel</span>
                                Cancel
                              </Button>
                            </>
                          )}
                          {session.status === 'completed' && !session.hasFeedback && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleFeedback(session.id)}
                            >
                              <span className="material-icons text-sm mr-1">star_rate</span>
                              Leave Feedback
                            </Button>
                          )}
                          {session.status === 'pending' && (
                            <div className="text-sm text-yellow-600 italic flex items-center">
                              <span className="material-icons text-sm mr-1">hourglass_top</span>
                              Awaiting therapist approval
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Cancel Modal */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cancel Session</h2>
          <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel this session? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedSessionId(null);
                    }}
                  >
                    No, Keep It
                  </Button>
                  <Button
                    className="bg-red-500 hover:bg-red-600"
                    onClick={confirmCancel}
                  >
                    Yes, Cancel Session
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reschedule Modal */}
          {showRescheduleModal && selectedSessionId && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Reschedule Session</h2>
                <p className="text-gray-600 mb-6">
                  Select a new date and time for your session.
                </p>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Date
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue={sessions.find(s => s.id === selectedSessionId)?.date || ''}
                      id="reschedule-date"
                    >
                      {Array.from({ length: 14 }, (_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i + 1);
                        const dateStr = date.toISOString().split('T')[0];
                        return (
                          <option key={dateStr} value={dateStr}>
                            {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Time
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      defaultValue={sessions.find(s => s.id === selectedSessionId)?.time || ''}
                      id="reschedule-time"
                    >
                      {['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                    <div className="flex items-start">
                      <span className="material-icons text-yellow-500 mr-2">info</span>
                      <p className="text-sm text-yellow-700">
                        Rescheduling will require approval from your therapist. Your session status will change to "Pending" until approved.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setSelectedSessionId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      const dateEl = document.getElementById('reschedule-date') as HTMLSelectElement;
                      const timeEl = document.getElementById('reschedule-time') as HTMLSelectElement;
                      if (dateEl && timeEl) {
                        confirmReschedule(dateEl.value, timeEl.value);
                      }
                    }}
                  >
                    Confirm Reschedule
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {showFeedbackModal && selectedSessionId && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Leave Feedback</h2>
                <p className="text-gray-600 mb-6">
                  How was your session with {sessions.find(s => s.id === selectedSessionId)?.therapistName}?
                </p>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rating
                    </label>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          className="text-2xl text-yellow-400 focus:outline-none"
                          onClick={() => setFeedbackRating(rating)}
                        >
                          {rating <= feedbackRating ? '★' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comments
                    </label>
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md h-24"
                      placeholder="Share your experience..."
                    ></textarea>
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setSelectedSessionId(null);
                      setFeedbackRating(0);
                      setFeedbackComment('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    disabled={feedbackRating === 0}
                    onClick={submitFeedback}
                  >
                    Submit Feedback
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Regular therapist listing view
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Find a Therapist
            </h1>
            <div className="flex items-center space-x-2">
              {/* Session history button for authenticated users */}
              {isAuthenticated && (
                <Button
                  onClick={() => setShowSessionsView(true)}
                  variant="outline"
                  className="flex items-center"
                >
                  <span className="material-icons mr-1">calendar_today</span>
                  My Sessions
                </Button>
              )}
              
              {/* Sign up button for guests */}
              {!isAuthenticated && (
                <Button
                  onClick={() => router.push('/auth/signup?redirect=therapy')}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Sign Up
                </Button>
              )}
              
              {/* Back to dashboard button */}
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="flex items-center"
              >
                <span className="material-icons">home</span>
              </Button>
            </div>
          </div>
          
          {/* Filter and Sort Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center">
              <button
                onClick={() => setShowFilterModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                  activeFiltersCount > 0 ? 'border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700'
                }`}
              >
                <span className="material-icons text-xl">filter_list</span>
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              {/* Show active filters as pills */}
              <div className="hidden md:flex ml-2 flex-wrap gap-2">
                {issueFilters.map((issue, index) => (
                  <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full flex items-center">
                    {issue}
                    <button 
                      onClick={() => setIssueFilters(issueFilters.filter(i => i !== issue))}
                      className="ml-1 text-blue-500 hover:text-blue-700"
                    >
                      <span className="material-icons text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setShowSortOptions(!showSortOptions)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none flex items-center min-w-[180px] justify-between bg-white"
                aria-haspopup="listbox"
                aria-expanded={showSortOptions}
              >
                <span>
                  {(() => {
                    switch (sortOption) {
                      case 'recommended': return 'Sort By';
                      case 'price_low_high': return 'Price: Low to High';
                      case 'price_high_low': return 'Price: High to Low';
                      case 'experience_high_low': return 'Experience';
                      case 'rating_high_low': return 'Rating';
                      case 'sessions_high_low': return 'Most Sessions';
                      case 'availability_soon': return 'Earliest Available';
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
                    { id: 'recommended', label: 'Recommended' },
                    { id: 'price_low_high', label: 'Price: Low to High' },
                    { id: 'price_high_low', label: 'Price: High to Low' },
                    { id: 'experience_high_low', label: 'Experience: Most to Least' },
                    { id: 'rating_high_low', label: 'Rating: High to Low' },
                    { id: 'sessions_high_low', label: 'Most Sessions' },
                    { id: 'availability_soon', label: 'Earliest Available' },
                  ].map(option => (
                    <button
                      key={option.id}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        sortOption === option.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSortOption(option.id);
                        setShowSortOptions(false);
                      }}
                    >
                      {option.label}
                      {sortOption === option.id && (
                        <span className="float-right material-icons text-blue-500 text-sm">check</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Filter Modal */}
          <FilterModal
            isOpen={showFilterModal}
            onClose={() => setShowFilterModal(false)}
            filters={{
              issues: issueFilters,
              experience: experienceFilter,
              rating: ratingFilter,
              priceMin: priceMinFilter,
              priceMax: priceMaxFilter,
              languages: languageFilters,
              genders: genderFilters,
              counselingTypes: counselingTypeFilters,
              degrees: degreeFilters
            }}
            setFilters={{
              setIssues: setIssueFilters,
              setExperience: setExperienceFilter,
              setRating: setRatingFilter,
              setPriceRange: (min: number, max: number) => {
                setPriceMinFilter(min);
                setPriceMaxFilter(max);
              },
              setLanguages: setLanguageFilters,
              setGenders: setGenderFilters,
              setCounselingTypes: setCounselingTypeFilters,
              setDegrees: setDegreeFilters
            }}
            options={{
              issues: issueOptions,
              experience: experienceOptions,
              rating: ratingOptions,
              language: languageOptions,
              gender: genderOptions,
              counselingType: counselingTypeOptions,
              degree: degreeOptions
            }}
          />

          {/* Therapist list */}
          <div className="space-y-6">
            {isFilteringLoading ? (
              <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  <p className="text-gray-600 mt-2">Filtering therapists...</p>
                </div>
                                  ) : filteredTherapists.length === 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <p className="text-gray-600">No therapists match your criteria. Please try different filters.</p>
                </div>
                ) : (
                filteredTherapists.map(therapist => (
              <div 
                key={therapist.id}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-blue-100 cursor-pointer transition-all relative"
                  onClick={() => viewTherapistProfile(therapist)}
                >
                  {therapist.isRecommended && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                      <span className="flex items-center">
                        <span className="material-icons text-xs mr-1">recommend</span>
                        Recommended
                      </span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Therapist info */}
                    <div className="md:col-span-3">
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{therapist.avatar}</div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{therapist.name}</h3>
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-500 material-icons text-sm">star</span>
                            <span className="text-sm text-gray-700 ml-1">{therapist.rating}</span>
                            <span className="text-xs text-gray-500 ml-1">({therapist.reviewCount} reviews)</span>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{therapist.education} • {therapist.experience}</p>
                          <p className="text-blue-600 font-medium mt-1">{therapist.price}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-gray-700 text-sm line-clamp-2">{therapist.bio}</p>
                      </div>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {therapist.specialties.map((specialty, i) => (
                        <span 
                          key={i}
                          className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                        >
                          {specialty}
                        </span>
                        ))}
                      </div>
                  
                    
                    {/* Booking options */}
                    <div className="border-t pt-3 md:border-t-0 md:pt-0 md:border-l md:pl-4 flex flex-col justify-center" onClick={(e) => e.stopPropagation()}>
                      <p className="text-sm font-medium text-gray-700 mb-2">Next Available: {therapist.nextAvailable[0] || 'Contact for availability'}</p>
                      {isAuthenticated ? (
                  <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookSession(therapist);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 w-full rounded-full"
                  >
                    Book Session
                  </Button>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/auth/signup?redirect=therapy');
                          }}
                          className="bg-blue-500 hover:bg-blue-600 w-full rounded-full"
                        >
                          Sign Up to Book
                        </Button>
                      )}
                </div>
              </div>
                </div>
                </div>
              ))
            )}
          </div>
          
          {/* Add BookingModal */}
          <BookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            therapist={selectedTherapist}
            onBook={completeBooking}
            isComplete={bookingComplete}
            confirmation={bookingConfirmation}
          />
        </div>
      </div>
    );
  }
}

// Add FilterModal component
interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    issues: string[];
    experience: string;
    rating: string;
    priceMin: number;
    priceMax: number;
    languages: string[];
    genders: string[];
    counselingTypes: string[];
    degrees: string[];
  };
  setFilters: {
    setIssues: (value: string[]) => void;
    setExperience: (value: string) => void;
    setRating: (value: string) => void;
    setPriceRange: (min: number, max: number) => void;
    setLanguages: (value: string[]) => void;
    setGenders: (value: string[]) => void;
    setCounselingTypes: (value: string[]) => void;
    setDegrees: (value: string[]) => void;
  };
  options: {
    issues: string[];
    experience: string[];
    rating: string[];
    language: string[];
    gender: string[];
    counselingType: string[];
    degree: string[];
  };
}

function FilterModal({ 
  isOpen, 
  onClose, 
  filters, 
  setFilters,
  options
}: FilterModalProps) {
  const [tempFilters, setTempFilters] = useState({...filters});
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset temp filters when modal opens with current filters
  useEffect(() => {
    if (isOpen) {
      setTempFilters({...filters});
    }
  }, [isOpen, filters]);
  
  const handleApply = () => {
    setFilters.setIssues(tempFilters.issues);
    setFilters.setExperience(tempFilters.experience);
    setFilters.setRating(tempFilters.rating);
    setFilters.setPriceRange(tempFilters.priceMin, tempFilters.priceMax);
    setFilters.setLanguages(tempFilters.languages);
    setFilters.setGenders(tempFilters.genders);
    setFilters.setCounselingTypes(tempFilters.counselingTypes);
    setFilters.setDegrees(tempFilters.degrees);
    onClose();
  };
  
  const handleClearAll = () => {
    setTempFilters({
      issues: [],
      experience: 'Any',
      rating: 'Any',
      priceMin: 0,
      priceMax: 500,
      languages: [],
      genders: [],
      counselingTypes: [],
      degrees: []
    });
  };

  const toggleIssue = (issue: string) => {
    if (tempFilters.issues.includes(issue)) {
      setTempFilters({
        ...tempFilters,
        issues: tempFilters.issues.filter(i => i !== issue)
      });
    } else {
      setTempFilters({
        ...tempFilters,
        issues: [...tempFilters.issues, issue]
      });
    }
  };

  const toggleLanguage = (language: string) => {
    if (tempFilters.languages.includes(language)) {
      setTempFilters({
        ...tempFilters,
        languages: tempFilters.languages.filter(l => l !== language)
      });
    } else {
      setTempFilters({
        ...tempFilters,
        languages: [...tempFilters.languages, language]
      });
    }
  };

  const toggleGender = (gender: string) => {
    if (tempFilters.genders.includes(gender)) {
      setTempFilters({
        ...tempFilters,
        genders: tempFilters.genders.filter(g => g !== gender)
      });
    } else {
      setTempFilters({
        ...tempFilters,
        genders: [...tempFilters.genders, gender]
      });
    }
  };

  const toggleCounselingType = (type: string) => {
    if (tempFilters.counselingTypes.includes(type)) {
      setTempFilters({
        ...tempFilters,
        counselingTypes: tempFilters.counselingTypes.filter(t => t !== type)
      });
    } else {
      setTempFilters({
        ...tempFilters,
        counselingTypes: [...tempFilters.counselingTypes, type]
      });
    }
  };

  const toggleDegree = (degree: string) => {
    if (tempFilters.degrees.includes(degree)) {
      setTempFilters({
        ...tempFilters,
        degrees: tempFilters.degrees.filter(d => d !== degree)
      });
    } else {
      setTempFilters({
        ...tempFilters,
        degrees: [...tempFilters.degrees, degree]
      });
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-0 md:p-4"
      onClick={() => onClose()}
    >
      <div 
        ref={modalRef} 
        className="bg-white w-full h-full md:h-auto md:max-w-3xl md:rounded-xl md:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Filter Therapists</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Issue filter - multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issues (select multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.issues.map((issue, index) => (
                <button
                  key={index}
                  onClick={() => toggleIssue(issue)}
                  className={`p-2 text-sm rounded-md border ${
                    tempFilters.issues.includes(issue)
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {issue}
                </button>
            ))}
          </div>
        </div>
          
          {/* Experience filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.experience.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setTempFilters({...tempFilters, experience: option})}
                  className={`p-2 text-sm rounded-md border ${
                    tempFilters.experience === option 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Rating filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.rating.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setTempFilters({...tempFilters, rating: option})}
                  className={`p-2 text-sm rounded-md border ${
                    tempFilters.rating === option 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Price filter - slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range: ${tempFilters.priceMin} - ${tempFilters.priceMax === 500 ? '500+' : tempFilters.priceMax}
            </label>
            <div className="px-2 py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">$0</span>
                <span className="text-xs text-gray-500">$500+</span>
              </div>
              <div className="relative mt-5 mb-8">
                <div className="absolute h-1 w-full bg-gray-200 rounded"></div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={tempFilters.priceMin}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value < tempFilters.priceMax) {
                      setTempFilters({...tempFilters, priceMin: value});
                    }
                  }}
                  className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none"
                  style={{
                    zIndex: 2,
                    '--thumb-color': 'white',
                    '--thumb-border': '2px solid #f97316'
                  } as React.CSSProperties}
                />
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={tempFilters.priceMax}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value > tempFilters.priceMin) {
                      setTempFilters({...tempFilters, priceMax: value});
                    }
                  }}
                  className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none"
                  style={{
                    zIndex: 3,
                    '--thumb-color': 'white',
                    '--thumb-border': '2px solid #f97316'
                  } as React.CSSProperties}
                />
                <div 
                  className="absolute h-1 bg-blue-500 rounded" 
                  style={{
                    left: `${(tempFilters.priceMin / 500) * 100}%`,
                    width: `${((tempFilters.priceMax - tempFilters.priceMin) / 500) * 100}%`
                  }}
                ></div>
              </div>
              <style jsx>{`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: var(--thumb-color);
                  border: var(--thumb-border);
                  cursor: pointer;
                  pointer-events: auto;
                  z-index: 5;
                  position: relative;
                }
                input[type="range"]::-moz-range-thumb {
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: var(--thumb-color);
                  border: var(--thumb-border);
                  cursor: pointer;
                  pointer-events: auto;
                  z-index: 5;
                  position: relative;
                }
              `}</style>
            </div>
          </div>
          
          {/* Language filter - multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Languages (select multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.language.filter(l => l !== 'Any').map((option, index) => (
                <button
                  key={index}
                  onClick={() => toggleLanguage(option)}
                  className={`p-2 text-sm rounded-md border ${
                    tempFilters.languages.includes(option)
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Gender filter - multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender (select multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.gender.filter(g => g !== 'Any').map((option, index) => (
                <button
                  key={index}
                  onClick={() => toggleGender(option)}
                  className={`p-2 text-sm rounded-md border ${
                    tempFilters.genders.includes(option)
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Counseling Type filter - multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Therapy Type (select multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.counselingType.filter(t => t !== 'Any').map((option, index) => (
                <button
                  key={index}
                  onClick={() => toggleCounselingType(option)}
                  className={`p-2 text-sm rounded-md border ${
                    tempFilters.counselingTypes.includes(option)
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          {/* Degree filter - multi-select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qualification (select multiple)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {options.degree.filter(d => d !== 'Any').map((option, index) => (
                <button
                  key={index}
                  onClick={() => toggleDegree(option)}
                  className={`p-2 text-sm rounded-md border ${
                    tempFilters.degrees.includes(option)
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-between z-10 shadow-md">
                  <Button
            onClick={handleClearAll}
            variant="outline"
          >
            Clear All
          </Button>
          <Button
            onClick={handleApply}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
            Apply Filters
                  </Button>
                </div>
              </div>
    </div>
  );
}

// Add BookingModal component
interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapist: Therapist | null;
  onBook: (date: string, time: string) => void;
  isComplete: boolean;
  confirmation: {
    therapistName: string;
    date: string;
    time: string;
    price: string;
  } | null;
}

function BookingModal({ 
  isOpen, 
  onClose, 
  therapist, 
  onBook, 
  isComplete,
  confirmation
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingType, setMeetingType] = useState<'video' | 'audio'>('video');
  const [notes, setNotes] = useState<string>('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Calculate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // Mock booked slots - in a real app, this would come from an API
  const bookedSlots: {[key: string]: string[]} = {
    '2023-11-15': ['10:00 AM', '2:00 PM'],
    '2023-11-16': ['11:00 AM'],
    '2023-11-20': ['9:00 AM', '4:00 PM']
  };

  // Get available time slots for the selected date
  const getAvailableTimeSlots = (date: string) => {
    if (!therapist) return [];
    
    // All possible time slots this therapist offers
    const allTimeSlots = [
      '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
      '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
    ];
    
    // Filter out booked slots for the selected date
    const bookedForDate = bookedSlots[date] || [];
    return allTimeSlots.filter(slot => !bookedForDate.includes(slot));
  };

  // Reset form when modal opens or therapist changes
  useEffect(() => {
    if (isOpen && therapist) {
      setSelectedDate(availableDates[0]);
      const availableSlots = getAvailableTimeSlots(availableDates[0]);
      setSelectedTime(availableSlots.length > 0 ? availableSlots[0] : '');
      setMeetingType('video');
      setNotes('');
    }
  }, [isOpen, therapist]);

  // Update time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const availableSlots = getAvailableTimeSlots(selectedDate);
      if (availableSlots.length > 0 && !availableSlots.includes(selectedTime)) {
        setSelectedTime(availableSlots[0]);
      }
    }
  }, [selectedDate, selectedTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      onBook(selectedDate, selectedTime);
    }
  };
  
  if (!isOpen || !therapist) return null;

  // If booking is complete, show confirmation
  if (isComplete && confirmation) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-green-500 text-3xl">check</span>
        </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h2>
          <p className="text-gray-600 mb-4">
            Your session with {confirmation.therapistName} on {new Date(confirmation.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {confirmation.time} has been requested.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-blue-700 font-medium">Payment Information</p>
            <p className="text-gray-600">Amount to pay: {confirmation.price}</p>
            <p className="text-gray-600 text-sm">Payment can be made directly to the therapist during the session.</p>
          </div>
          <p className="text-gray-600 mb-6">
            Once the therapist approves your request, you'll receive a Google Meet link to join the session.
          </p>
          <div className="animate-pulse">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full w-3/4"></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Redirecting to your sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Available time slots for the selected date
  const availableTimeSlots = getAvailableTimeSlots(selectedDate);
  
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white p-4 border-b z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Book Session with {therapist.name}
        </h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="material-icons">close</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Therapist info */}
          <div className="md:w-1/3 flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-3">{therapist.avatar}</div>
            <h3 className="font-semibold text-lg">{therapist.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{therapist.education}</p>
            <div className="flex items-center mb-2">
              <span className="text-yellow-500 material-icons text-sm">star</span>
              <span className="text-sm text-gray-700 ml-1">{therapist.rating}</span>
              <span className="text-xs text-gray-500 ml-1">({therapist.reviewCount} reviews)</span>
            </div>
            <p className="text-blue-600 font-medium">{therapist.price}</p>
          </div>
          
          {/* Booking form */}
          <div className="md:w-2/3">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <select
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {availableDates.map((date) => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                {availableTimeSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableTimeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 text-sm rounded-md border ${
                          selectedTime === time 
                            ? 'bg-blue-50 border-blue-300 text-blue-700' 
                            : 'border-gray-300 text-gray-700 hover:border-blue-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-500 text-sm">No available time slots for this date.</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="meetingType"
                      value="video"
                      checked={meetingType === 'video'}
                      onChange={() => setMeetingType('video')}
                      className="mr-2"
                    />
                    <span>Video Call</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="meetingType"
                      value="audio"
                      checked={meetingType === 'audio'}
                      onChange={() => setMeetingType('audio')}
                      className="mr-2"
                    />
                    <span>Audio Only</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any specific concerns or topics you'd like to discuss..."
                ></textarea>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Session Fee:</span>
                  <span className="font-medium text-blue-700">{therapist.price}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Payment will be collected during the session</p>
              </div>
            </form>
          </div>
        </div>
        
        {/* Privacy notice */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8">
          <div className="flex items-start">
            <span className="material-icons text-blue-500 mr-2">privacy_tip</span>
            <div>
              <h4 className="font-medium text-blue-800">Privacy Notice</h4>
              <p className="text-sm text-blue-700">
                Your session details and personal information are kept confidential. All sessions are conducted on secure platforms.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end space-x-3 z-10">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedTime || availableTimeSlots.length === 0}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            !selectedTime || availableTimeSlots.length === 0
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Book Session
        </button>
      </div>
    </div>
  );
} 