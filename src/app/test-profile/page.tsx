'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function TestProfilePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      setLoading(true);
      setMessage('Checking session...');
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setUserId(session.user.id);
          setMessage(`Session found for user: ${session.user.id}`);
          await checkProfile(session.user.id);
        } else {
          setUserId(null);
          setMessage('No session found. Please login first.');
          setLoading(false);
        }
      } catch (err: any) {
        setError(`Error checking session: ${err.message}`);
        setLoading(false);
      }
    }
    
    checkSession();
  }, []);
  
  const checkProfile = async (id: string) => {
    setMessage(`Checking if profile exists for user: ${id}...`);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        setMessage(`No profile found for user: ${id}`);
        setProfile(null);
      } else {
        setMessage(`Profile found for user: ${id}`);
        setProfile(data);
      }
    } catch (err: any) {
      setError(`Error checking profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const createProfile = async () => {
    if (!userId) {
      setError('No user ID found. Please login first.');
      return;
    }
    
    setLoading(true);
    setMessage(`Creating profile for user: ${userId}...`);
    
    try {
      const newProfile = {
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        name: 'Test User',
        dob: '2000-01-01',
        location: 'Test Location',
        gender: 'Other',
        completed_setup: true
      };
      
      const { error } = await supabase
        .from('profiles')
        .insert(newProfile);
        
      if (error) {
        setError(`Error creating profile: ${error.message}`);
      } else {
        setMessage(`Profile successfully created for user: ${userId}`);
        await checkProfile(userId);
      }
    } catch (err: any) {
      setError(`Error creating profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async () => {
    if (!userId) {
      setError('No user ID found. Please login first.');
      return;
    }
    
    setLoading(true);
    setMessage(`Updating profile for user: ${userId}...`);
    
    try {
      const updatedProfile = {
        id: userId,
        updated_at: new Date().toISOString(),
        name: 'Updated Test User',
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', userId);
        
      if (error) {
        setError(`Error updating profile: ${error.message}`);
      } else {
        setMessage(`Profile successfully updated for user: ${userId}`);
        await checkProfile(userId);
      }
    } catch (err: any) {
      setError(`Error updating profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Test Page</h1>
        
        {loading ? (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Status</h2>
              <p className="text-gray-700">{message}</p>
              
              {error && (
                <p className="text-red-600 mt-2">{error}</p>
              )}
            </div>
            
            {userId && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">User ID</h2>
                <p className="text-gray-700 break-all">{userId}</p>
              </div>
            )}
            
            {profile && (
              <div className="p-4 bg-gray-100 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Profile Data</h2>
                <pre className="text-sm text-gray-700 overflow-auto max-h-60">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="flex space-x-4">
              {userId && !profile && (
                <Button 
                  onClick={createProfile}
                  className="bg-green-500 hover:bg-green-600 rounded-full"
                >
                  Create Profile
                </Button>
              )}
              
              {profile && (
                <Button 
                  onClick={updateProfile}
                  className="bg-blue-500 hover:bg-blue-600 rounded-full"
                >
                  Update Profile
                </Button>
              )}
              
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="rounded-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 