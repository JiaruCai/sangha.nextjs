// /api/validate-registration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple rate limiting (consider using Redis in production)
const attempts = new Map<string, number[]>();

function checkRateLimit(userId: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const userAttempts = attempts.get(userId) || [];
  
  // Remove old attempts outside the window
  const validAttempts = userAttempts.filter(time => now - time < windowMs);
  
  if (validAttempts.length >= limit) {
    return false;
  }
  
  validAttempts.push(now);
  attempts.set(userId, validAttempts);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId } = body;

    // Validate required fields
    if (!eventId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields', code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' },
        { status: 429 }
      );
    }

    // Verify user exists and has created profile
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('user_id, profile_created, full_name')
      .eq('user_id', userId)
      .single();
    
    if (userError || !user) {
      console.error('User validation error:', userError);
      return NextResponse.json(
        { error: 'Invalid user', code: 'INVALID_USER' },
        { status: 403 }
      );
    }

    if (!user.profile_created) {
      return NextResponse.json(
        { error: 'Profile required. Please complete your profile first.', code: 'PROFILE_REQUIRED' },
        { status: 403 }
      );
    }

    // Verify event exists, is active, and is an online paid event
    const { data: event, error: eventError } = await supabase
      .from('DiscoveryTabEvents')
      .select(`
        event_id,
        title,
        price,
        location,
        is_active,
        capacity,
        start_time,
        end_time
      `)
      .eq('event_id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Event validation error:', eventError);
      return NextResponse.json(
        { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (!event.is_active) {
      return NextResponse.json(
        { error: 'Event is no longer active', code: 'EVENT_INACTIVE' },
        { status: 400 }
      );
    }

    // Verify it's an online paid event
    if (event.location.toLowerCase() !== 'online' || event.price <= 0) {
      return NextResponse.json(
        { 
          error: 'This registration method is only for online paid events', 
          code: 'INVALID_EVENT_TYPE' 
        },
        { status: 400 }
      );
    }

    // Check if event has already started
    const eventStartTime = new Date(event.start_time);
    if (eventStartTime < new Date()) {
      return NextResponse.json(
        { error: 'This event has already started', code: 'EVENT_STARTED' },
        { status: 400 }
      );
    }

    // Check if already registered
    const { data: existingRegistration } = await supabase
      .from('DiscoveryTabEventRegistration')
      .select('registration_id, status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existingRegistration && existingRegistration.status === 'confirmed') {
      return NextResponse.json(
        { error: 'You are already registered for this event', code: 'ALREADY_REGISTERED' },
        { status: 400 }
      );
    }

    // Check capacity if specified
    if (event.capacity) {
      const { count: registrationCount } = await supabase
        .from('DiscoveryTabEventRegistration')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'confirmed');

      if (registrationCount && registrationCount >= event.capacity) {
        return NextResponse.json(
          { error: 'Event is full', code: 'EVENT_FULL' },
          { status: 400 }
        );
      }
    }

    // All validations passed
    return NextResponse.json({ 
      valid: true,
      user: {
        userId: user.user_id,
        fullName: user.full_name
      },
      event: {
        eventId: event.event_id,
        title: event.title,
        price: event.price,
        location: event.location,
        startTime: event.start_time,
        endTime: event.end_time
      }
    });

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'An error occurred during validation', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}