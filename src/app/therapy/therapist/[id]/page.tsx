'use client'

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

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
  reviews?: Review[];
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
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
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
    reviews: [
      {
        id: 'r1',
        userId: 'u1',
        userName: 'Sarah M.',
        rating: 5,
        comment: 'Dr. Williams was incredibly helpful and supportive. She provided practical strategies for managing my anxiety that I use every day.',
        date: '2023-10-15T09:30:00Z'
      },
      {
        id: 'r2',
        userId: 'u2',
        userName: 'Michael T.',
        rating: 5,
        comment: "I've been seeing Dr. Williams for three months and have noticed significant improvement in my depression symptoms. Highly recommend!",
        date: '2023-09-22T14:15:00Z'
      },
      {
        id: 'r3',
        userId: 'u3',
        userName: 'Jessica K.',
        rating: 4,
        comment: 'Very professional and knowledgeable. The strategies she taught me have been life-changing.',
        date: '2023-08-05T11:45:00Z'
      }
    ]
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
    sessionCount: 100,
    reviews: [
      {
        id: 'r4',
        userId: 'u4',
        userName: 'David L.',
        rating: 5,
        comment: 'Dr. Chen helped me navigate a difficult work situation with practical advice and stress management techniques.',
        date: '2023-10-05T16:30:00Z'
      },
      {
        id: 'r5',
        userId: 'u5',
        userName: 'Emily R.',
        rating: 4,
        comment: 'Great therapist who really listens. Has helped our relationship tremendously.',
        date: '2023-09-12T10:15:00Z'
      }
    ]
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
    sessionCount: 150,
    reviews: [
      {
        id: 'r6',
        userId: 'u6',
        userName: 'Thomas J.',
        rating: 5,
        comment: 'Dr. Rodriguez helped me through the hardest time in my life after losing my father. Forever grateful.',
        date: '2023-10-18T14:00:00Z'
      },
      {
        id: 'r7',
        userId: 'u7',
        userName: 'Anna P.',
        rating: 5,
        comment: 'Compassionate, understanding, and incredibly skilled. Helped me rebuild my self-confidence.',
        date: '2023-09-30T11:45:00Z'
      },
      {
        id: 'r8',
        userId: 'u8',
        userName: 'Carlos M.',
        rating: 4,
        comment: 'Great to have a Spanish-speaking therapist who understands cultural nuances. Very helpful sessions.',
        date: '2023-08-22T15:30:00Z'
      }
    ]
  }
];

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

  // Calculate available dates (next 30 days)
  const availableDates = Array.from({ length: 30 }, (_, i) => {
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
            <p className="text-blue-600">Amount to pay: {confirmation.price}</p>
            <p className="text-blue-600 text-sm">Payment can be made directly to the therapist during the session.</p>
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
                  className="w-full p-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        className={`p-3 text-sm rounded-full border ${
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
                  className="w-full p-2 border border-gray-300 rounded-full h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

export default function TherapistProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [therapist, setTherapist] = useState<Therapist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingComplete, setBookingComplete] = useState<boolean>(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<{
    therapistName: string;
    date: string;
    time: string;
    price: string;
  } | null>(null);
  const [selectedTab, setSelectedTab] = useState<'about' | 'reviews' | 'availability'>('about');
  
  // Fetch therapist data
  useEffect(() => {
    // Check if user is authenticated
    const isAuth = !!localStorage.getItem('isAuthenticated');
    setIsAuthenticated(isAuth);
    
    // In a real app, you would fetch this from an API
    const therapistData = mockTherapists.find(t => t.id === params.id);
    
    if (therapistData) {
      // Check for reviews in localStorage (from feedback submissions)
      const storedSessions = localStorage.getItem('therapySessions');
      if (storedSessions) {
        try {
          const sessions = JSON.parse(storedSessions);
          const therapistSessions = sessions.filter(
            (s: any) => s.therapistId === therapistData.id && s.hasFeedback && s.feedback
          );
          
          // Add feedback as reviews if they don't already exist
          if (therapistSessions.length > 0) {
            const existingReviewIds = therapistData.reviews?.map(r => r.id) || [];
            const newReviews = therapistSessions
              .filter((s: any) => !existingReviewIds.includes(`session-${s.id}`))
              .map((s: any) => ({
                id: `session-${s.id}`,
                userId: 'current-user',
                userName: 'You',
                rating: s.feedback.rating,
                comment: s.feedback.comment,
                date: s.feedback.date
              }));
            
            if (newReviews.length > 0) {
              therapistData.reviews = [...(therapistData.reviews || []), ...newReviews];
            }
          }
        } catch (error) {
          console.error('Error parsing stored sessions:', error);
        }
      }
      
      setTherapist(therapistData);
    } else {
      // Therapist not found
      router.push('/therapy');
    }
    
    setIsLoading(false);
  }, [params.id, router]);
  
  const handleBookSession = () => {
    if (!isAuthenticated) {
      router.push('/auth/signup?redirect=therapy');
      return;
    }
    
    setShowBookingModal(true);
  };
  
  const completeBooking = (date: string, time: string) => {
    if (!therapist) return;
    
    setBookingComplete(true);
    
    // Show confirmation
    setBookingConfirmation({
      therapistName: therapist.name,
      date,
      time,
      price: therapist.price
    });
    
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingComplete(false);
      setBookingConfirmation(null);
      // Navigate to sessions view
      router.push('/therapy?view=sessions');
    }, 5000);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }
  
  if (!therapist) {
    return (
      <div className="min-h-screen gradient-bg p-6">
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Therapist Not Found
          </h1>
          <p className="text-gray-600">
            Sorry, we couldn't find the therapist you're looking for.
          </p>
          <Button
            onClick={() => router.push('/therapy')}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Back to Therapists
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with back button */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => router.push('/therapy')}
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
        
        {/* Therapist profile card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar and basic info */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <div className="text-8xl mb-3">{therapist.avatar}</div>
              <div className="flex items-center">
                <span className="text-yellow-500 material-icons text-sm">star</span>
                <span className="text-sm text-gray-700 ml-1">{therapist.rating}</span>
                <span className="text-xs text-gray-500 ml-1">({therapist.reviewCount} reviews)</span>
              </div>
              <p className="text-blue-600 font-medium mt-2">{therapist.price}</p>
              <Button
                onClick={handleBookSession}
                className="mt-4 bg-blue-500 hover:bg-blue-600 w-full"
              >
                Book Session
              </Button>
            </div>
            
            {/* Main content */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{therapist.name}</h1>
              <p className="text-gray-600 mb-3">{therapist.education} • {therapist.experience}</p>
              
              {/* Tabs */}
              <div className="border-b mb-4">
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setSelectedTab('about')}
                    className={`px-4 py-2 ${
                      selectedTab === 'about' 
                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    About
                  </button>
                  <button 
                    onClick={() => setSelectedTab('reviews')}
                    className={`px-4 py-2 ${
                      selectedTab === 'reviews' 
                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Reviews
                  </button>
                  <button 
                    onClick={() => setSelectedTab('availability')}
                    className={`px-4 py-2 ${
                      selectedTab === 'availability' 
                        ? 'border-b-2 border-blue-500 text-blue-500 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Availability
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              {selectedTab === 'about' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">About Me</h2>
                    <p className="text-gray-700">{therapist.bio}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Specialties</h2>
                    <div className="flex flex-wrap gap-2">
                      {therapist.specialties.map((specialty, i) => (
                        <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm mb-2">{specialty}</div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Details</h2>
                      <ul className="space-y-2">
                        <li className="flex justify-between">
                          <span className="text-gray-600">Languages</span>
                          <span className="font-medium">{therapist.languages.join(', ')}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Gender</span>
                          <span className="font-medium">{therapist.gender}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Age</span>
                          <span className="font-medium">{therapist.age}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-gray-600">Degree</span>
                          <span className="font-medium">{therapist.degree}</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Session Types</h2>
                      <ul className="space-y-2">
                        {therapist.counselingTypes.map((type, i) => (
                          <li key={i} className="flex items-center">
                            <span className="material-icons text-blue-500 mr-2">check_circle</span>
                            <span>{type} Therapy</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Client Reviews</h2>
                    <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                      <span className="text-yellow-500 material-icons">star</span>
                      <span className="ml-1 font-medium text-blue-700">{therapist.rating}</span>
                      <span className="text-xs text-gray-500 ml-1">({therapist.reviewCount})</span>
                    </div>
                  </div>
                  
                  {therapist.reviews && therapist.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {therapist.reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{review.userName}</p>
                              <div className="flex text-yellow-400 mt-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span key={star} className="material-icons text-sm">
                                    {star <= review.rating ? 'star' : 'star_border'}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 mt-2">{review.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-gray-600">No reviews yet</p>
                    </div>
                  )}
                </div>
              )}
              
              {selectedTab === 'availability' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Next Available Slots</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {therapist.nextAvailable.map((time, i) => (
                      <button
                        key={i}
                        onClick={handleBookSession}
                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg mt-4">
                    <div className="flex items-center">
                      <span className="material-icons text-blue-500 mr-2">info</span>
                      <p className="text-blue-700 text-sm">
                        Book a session now to secure your preferred time slot. More slots may be available upon request.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        therapist={therapist}
        onBook={completeBooking}
        isComplete={bookingComplete}
        confirmation={bookingConfirmation}
      />
    </div>
  );
} 