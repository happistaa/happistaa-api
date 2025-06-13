import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// Get all chat messages between current user and a specific peer
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
    const peerId = searchParams.get('peer_id');
    
    if (!peerId) {
      return NextResponse.json(
        { error: 'Peer ID is required' },
        { status: 400 }
      );
    }
    
    // Get chat messages between current user and peer
    const { data: chatMessages, error: messagesError } = await supabase
      .from('peer_support_chats')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('Error fetching chat messages:', messagesError);
      return NextResponse.json(
        { error: 'Error fetching chat messages' },
        { status: 500 }
      );
    }
    
    // Get peer information
    const { data: peerProfile, error: peerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', peerId)
      .single();
    
    if (peerError && peerError.code !== 'PGRST116') { // Not Found error is acceptable
      console.error('Error fetching peer profile:', peerError);
    }
    
    // Mark messages from this peer as read
    if (chatMessages && chatMessages.length > 0) {
      const unreadMessagesIds = chatMessages
        .filter(msg => msg.receiver_id === userId && !msg.is_read)
        .map(msg => msg.id);
        
      if (unreadMessagesIds.length > 0) {
        await supabase
          .from('peer_support_chats')
          .update({ is_read: true })
          .in('id', unreadMessagesIds);
      }
    }
    
    // Format messages for frontend
    const formattedMessages = chatMessages?.map(msg => {
      const isSender = msg.sender_id === userId;
      
      return {
        id: msg.id,
        sender: isSender ? 'you' : peerProfile?.name || 'Peer',
        message: msg.message,
        timestamp: msg.created_at,
        isAnonymous: msg.is_anonymous,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id
      };
    }) || [];
    
    // Format peer info if available
    let peer = null;
    if (peerProfile) {
      peer = {
        id: peerProfile.id,
        name: peerProfile.name || 'Anonymous User',
        avatar: peerProfile.avatar_url || '👤',
        supportType: peerProfile.support_type || 'support-giver',
        experienceAreas: peerProfile.support_preferences || [],
        location: peerProfile.location || 'Unknown',
        isActive: peerProfile.last_active_at ? 
          (new Date().getTime() - new Date(peerProfile.last_active_at).getTime() < 3600000) : 
          false
      };
    }
    
    return NextResponse.json({ 
      messages: formattedMessages,
      peer
    });
    
  } catch (error) {
    console.error('Error in chat messages API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Send a new chat message
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
    
    // Check if there's an accepted support request between these users
    // Only if this is a new conversation (no messages yet)
    const { count, error: countError } = await supabase
      .from('peer_support_chats')
      .select('*', { count: 'exact', head: true })
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${userId})`);
    
    if (countError) {
      console.error('Error checking existing conversation:', countError);
    }
    
    // If this is a new conversation, check if there's an accepted request
    if (count === 0) {
      const { data: requests, error: requestError } = await supabase
        .from('support_requests')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${receiver_id}),and(sender_id.eq.${receiver_id},receiver_id.eq.${userId})`)
        .eq('status', 'accepted');
      
      if (requestError) {
        console.error('Error checking support requests:', requestError);
      }
      
      // If there's no accepted request between these users, create one automatically
      if (!requests || requests.length === 0) {
        // Auto-create an accepted request
        await supabase
          .from('support_requests')
          .insert({
            sender_id: userId,
            receiver_id,
            message: 'Initiated conversation',
            status: 'accepted',
            is_anonymous
          });
      }
    }
    
    // Insert the new message
    const { data, error } = await supabase
      .from('peer_support_chats')
      .insert({
        sender_id: userId,
        receiver_id,
        message,
        is_anonymous,
        is_read: false
      })
      .select();
    
    if (error) {
      return NextResponse.json(
        { error: 'Error sending message' },
        { status: 500 }
      );
    }
    
    // Get sender's name for the response
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', userId)
      .single();
    
    // Format the chat message for response
    const chatMessage = {
      id: data[0].id,
      sender: 'you',
      message: data[0].message,
      timestamp: data[0].created_at,
      isAnonymous: data[0].is_anonymous,
      senderId: data[0].sender_id,
      receiverId: data[0].receiver_id
    };
    
    return NextResponse.json({ 
      message: 'Message sent successfully',
      chat: chatMessage
    });
    
  } catch (error) {
    console.error('Error in chat messages API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
