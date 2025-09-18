// /api/create-event-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId, customerEmail } = body;

    // Validate required fields
    if (!eventId || !userId || !customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user exists and has profile (basic validation)
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('user_id, profile_created')
      .eq('user_id', userId)
      .single();

    if (userError || !user || !user.profile_created) {
      return NextResponse.json(
        { error: 'Invalid user or profile not created' },
        { status: 403 }
      );
    }

    // Check if already registered
    const { data: existingRegistration } = await supabase
      .from('DiscoveryTabEventRegistration')
      .select('registration_id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .single();

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }

    // Fetch fresh event data from database to ensure price integrity
    const { data: event, error: eventError } = await supabase
      .from('DiscoveryTabEvents')
      .select('event_id, title, price, location')
      .eq('event_id', eventId)
      .eq('is_active', true)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found or inactive' },
        { status: 404 }
      );
    }

    // Double-check it's an online paid event
    if (event.location.toLowerCase() !== 'online' || event.price <= 0) {
      return NextResponse.json(
        { error: 'Invalid event type for this payment method' },
        { status: 400 }
      );
    }

    // Calculate fees based on database price (not client-provided)
    const subtotal = event.price;
    const familiaFee = Math.round(subtotal * 0.13 * 100) / 100;
    const taxes = Math.round(subtotal * 0.004 * 100) / 100;
    const total = subtotal + familiaFee + taxes;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        eventId: event.event_id,
        eventTitle: event.title,
        userId: userId,
        subtotal: subtotal.toString(),
        familiaFee: familiaFee.toString(),
        taxes: taxes.toString(),
        customerEmail: customerEmail,
      },
      receipt_email: customerEmail,
      description: `Registration for ${event.title}`,
    });

    // Log the payment attempt for audit trail
    console.log('Payment intent created:', {
      paymentIntentId: paymentIntent.id,
      eventId: event.event_id,
      userId: userId,
      amount: total,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: Math.round(total * 100),
      breakdown: {
        subtotal: subtotal,
        familiaFee: familiaFee,
        taxes: taxes,
        total: total,
      }
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: `Payment error: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}