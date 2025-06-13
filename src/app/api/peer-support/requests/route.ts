import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Get all support requests for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    // Build query based on request type
    let query = supabase.from('support_requests').select(`
      id, 
      created_at, 
      sender_id, 
      receiver_id, 
      message, 
      status, 
      is_anonymous,
      profiles!sender_id(name, avatar_url, support_preferences, location, journey_note)
    `);
    
    if (type === 'sent') {
      // Get requests sent by the user
      query = query.eq('sender_id', userId);
    } else if (type === 'received') {
      // Get requests received by the user
      query = query.eq('receiver_id', userId);
    } else {
      // Get all requests involving the user
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }
    
    // Filter by status if provided
    const status = searchParams.get('status');
    if (status) {
      query = query.eq('status', status);
    }
    
    // Order by created_at
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      return NextResponse.json(
        { error: 'Error fetching support requests' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ requests: data });
    
  } catch (error) {
    console.error('Error in support requests API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new support request
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { receiver_id, message, is_anonymous = false } = await request.json();
    
    if (!receiver_id || !message) {
      return NextResponse.json(
        { error: 'Receiver ID and message are required' },
        { status: 400 }
      );
    }
    
    // Insert the support request
    const { data, error } = await supabase
      .from('support_requests')
      .insert({
        sender_id: userId,
        receiver_id,
        message,
        status: 'pending',
        is_anonymous
      })
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: 'Error creating support request' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Support request sent successfully',
      request: data[0]
    });
    
  } catch (error) {
    console.error('Error in support requests API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a support request (accept or reject)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const { id, status } = await request.json();
    
    if (!id || !status) {
      return NextResponse.json(
        { error: 'Request ID and status are required' },
        { status: 400 }
      );
    }
    
    // Verify the user is the receiver of the request
    const { data: existingRequest, error: fetchError } = await supabase
      .from('support_requests')
      .select('receiver_id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return NextResponse.json(
        { error: 'Error fetching support request' },
        { status: 500 }
      );
    }
    
    if (existingRequest.receiver_id !== userId) {
      return NextResponse.json(
        { error: 'You can only update requests sent to you' },
        { status: 403 }
      );
    }
    
    // Update the request
    const { data, error } = await supabase
      .from('support_requests')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: 'Error updating support request' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: `Support request ${status}`,
      request: data[0]
    });
    
  } catch (error) {
    console.error('Error in support requests API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 