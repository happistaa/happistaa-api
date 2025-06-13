import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Mock data for fallback
const mockPeers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: '👩',
    matchScore: 95,
    experienceAreas: ['Anxiety', 'Career Change', 'Academic Stress'],
    supportType: 'support-giver',
    location: 'New York',
    isActive: true,
    rating: 4.8,
    totalRatings: 24,
    certifiedMentor: true,
    peopleSupported: 42,
    journeyNote: "Overcame anxiety through mindfulness and career transition. Happy to share my techniques."
  },
  {
    id: '2',
    name: 'Michael Chen',
    avatar: '👨',
    matchScore: 88,
    experienceAreas: ['Academic Stress', 'Family Issues', 'Relocation'],
    supportType: 'support-seeker',
    location: 'San Francisco',
    isActive: false,
    rating: 4.6,
    totalRatings: 18,
    certifiedMentor: false,
    peopleSupported: 27,
    journeyNote: "Moved across the country while dealing with family issues. Found balance through community support."
  }
];

// Get all available peers or filtered peers based on query parameters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // First, let's log all profiles to see what's in the database
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('profiles')
      .select('id, name, support_type, support_preferences');
    
    if (allProfilesError) {
      console.error("Error fetching all profiles:", allProfilesError);
    } else {
      console.log(`API: Found ${allProfiles?.length || 0} total profiles in database:`);
      allProfiles?.forEach(profile => {
        console.log(`- Profile ${profile.id}: name=${profile.name}, support_type=${profile.support_type}`);
      });
    }
    

    const { searchParams } = new URL(request.url);
    
    // Get session to check authentication status
    const { data: { session } } = await supabase.auth.getSession();
    
    // For both authenticated and unauthenticated users, fetch from profiles table
    let userId = session?.user?.id || null;
    
    console.log("API: Fetching peers for user:", userId);
    

    // Start building the query
    let query = supabase
      .from('profiles')
      .select('*');
    
    // Exclude current user if authenticated
  //  if (userId) {
    //  query = query.neq('id', userId);
   // }
        // Handle support type filtering
 /*      const supportType = searchParams.get('supportType');
        console.log("API: Support type filter:", supportType);
        
        if (supportType) {
          if (supportType === 'support-giver') {
            console.log("API: Filtering for support givers");
            query = query.eq('support_type', 'support-giver');
          } else if (supportType === 'support-seeker') {
            console.log("API: Filtering for support seekers");
            query = query.eq('support_type', 'support-seeker');
          }
          else {
            query =query.neq('id', userId); 
          }
        } */
        

    // Handle supportPreferences array parameter for filtering by multiple preferences
    const supportPreferencesParam = searchParams.get('supportPreferences');
    if (supportPreferencesParam) {
      try {
        const preferences = JSON.parse(supportPreferencesParam);
        if (Array.isArray(preferences) && preferences.length > 0) {
          console.log("API: Filtering by support preferences:", preferences);
          // Use overlaps to find profiles that have any of these preferences
          query = query.contains('support_preferences', preferences);
        }
      } catch (e) {
        console.error("Error parsing supportPreferences parameter:", e);
      }
    }
        // Apply filters based on query parameters
        const experienceFilter = searchParams.get('experience');
        if (experienceFilter) {
          console.log("API: Filtering by experience:", experienceFilter);
          query = query.contains('support_preferences', [experienceFilter]);
        }

    // Get all filtered peers
    const { data: profiles, error } = await query;
    
    if (error) {
      console.error("Error fetching peers from database:", error);
      // Fall back to mock data if there's an error
      return NextResponse.json({ peers: mockPeers });
    }
    
    console.log(`API: Found ${profiles?.length || 0} profiles matching criteria`);
    
    // Log detailed information about each profile found
    profiles?.forEach(profile => {
      console.log(`API: Profile ${profile.id}:`, {
        name: profile.name,
        support_type: profile.support_type,
        support_preferences: profile.support_preferences
      });
    });
    
    // If no profiles found, return empty array
    if (!profiles || profiles.length === 0) {
      console.log("API: No profiles found, returning empty array");
      return NextResponse.json({ peers: [] });
    }
    
    // Get current user's profile for match scoring if authenticated
    let currentUserProfile = null;
    if (userId) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      currentUserProfile = userProfile;
      console.log("API: Current user profile for matching:", currentUserProfile ? "found" : "not found");
    }
    
    // Transform profiles to peer matches
    const transformedPeers = profiles.map(profile => {
      // Calculate match score based on shared interests, preferences, etc.
      let matchScore = 50; // Default match score
      
      if (currentUserProfile && currentUserProfile.support_preferences && profile.support_preferences) {
        // Match based on support preferences (experiences/interests)
        const sharedPreferences = currentUserProfile.support_preferences.filter(
          (pref: string) => profile.support_preferences?.includes(pref)
        );
        matchScore += sharedPreferences.length * 10;
        
        // Match based on location
        if (currentUserProfile.location && profile.location && 
            currentUserProfile.location === profile.location) {
          matchScore += 15;
        }
        
        // Match based on availability
        if (currentUserProfile.availability && profile.availability && 
            currentUserProfile.availability === profile.availability) {
          matchScore += 10;
        }
      }
      
      // Normalize score to be between 0-100
      matchScore = Math.min(Math.round(matchScore), 100);
      
      // Ensure we have a valid supportType, defaulting to 'support-giver' if missing
     let supportType = 'support-giver';
      if (profile.support_type === 'support-seeker') {
        supportType = 'support-seeker';
      } else if (profile.support_type === 'support-giver') {
        supportType = 'support-giver';
      }
      
      console.log(`API: Transformed peer ${profile.id} with support_type: ${profile.support_type} -> supportType: ${supportType}`);
      
      return {
        id: profile.id,
        name: profile.name || 'Anonymous User',
        avatar: profile.avatar_url || '👤', // Use avatar_url if available, otherwise default
        matchScore,
        experienceAreas: profile.support_preferences || [],
        supportType: profile.support_type || 'support-giver',
        location: profile.location || 'Unknown',
        isActive: profile.last_active_at ? 
          (new Date().getTime() - new Date(profile.last_active_at).getTime() < 3600000) : 
          false, // Consider active if last active within an hour
        rating: profile.rating || 4.5, // Use rating if available, otherwise default
        totalRatings: profile.total_ratings || 0,
        certifiedMentor: profile.certified_mentor || false,
        peopleSupported: profile.people_supported || 0,
        journeyNote: profile.journey_note || undefined
      };
    });
    
    // Sort by match score
    transformedPeers.sort((a, b) => b.matchScore - a.matchScore);
    
    console.log(`API: Returning ${transformedPeers.length} transformed peers`);
    
    return NextResponse.json({ peers: transformedPeers });
    
  } catch (error) {
    console.error('Error in peer-support API:', error);
    // Return mock data as fallback in case of any error
    return NextResponse.json({ peers: mockPeers });
  }
}