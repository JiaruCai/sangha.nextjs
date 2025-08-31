import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId, paymentIntentId, amount } = body;

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('DiscoveryTabPayments')
      .insert({
        user_id: userId,
        event_id: eventId,
        amount: amount / 100, // Convert from cents to dollars
        payment_method: 'card',
        payment_status: 'succeeded',
        stripe_payment_intent_id: paymentIntentId,
        currency: 'USD',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      throw new Error('Failed to create payment record');
    }

    // Create registration record
    const { error: registrationError } = await supabase
      .from('DiscoveryTabEventRegistration')
      .insert({
        user_id: userId,
        event_id: eventId,
        status: 'confirmed',
        payment_id: payment.payment_id,
        registered_at: new Date().toISOString(),
        is_attending: true,
      });

    if (registrationError) {
      throw new Error('Failed to create registration');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to complete registration' },
      { status: 500 }
    );
  }
}