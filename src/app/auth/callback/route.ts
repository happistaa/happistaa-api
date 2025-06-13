import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session?.user) {
      // Check if profile exists and create it if it doesn't
      const userId = data.session.user.id;
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create a minimal one
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: data.session.user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_setup: false
          });
          
        if (insertError) {
          console.error('Error creating profile in auth callback:', insertError);
        } else {
          console.log('Successfully created profile in auth callback');
        }
      }
    }
  }

  return NextResponse.redirect(new URL('/onboarding/profile-setup?sync=true', requestUrl.origin));
}
