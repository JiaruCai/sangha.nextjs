// app/api/confirm-event-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      paymentId, 
      eventId, 
      userId, 
      stripePaymentIntentId,
      stripeCustomerId 
    } = body;

    // Update payment status to succeeded
    const { error: paymentUpdateError } = await supabase
      .from('DiscoveryTabPayments')
      .update({
        payment_status: 'succeeded',
        paid_at: new Date().toISOString(),
        stripe_customer_id: stripeCustomerId,
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', paymentId);

    if (paymentUpdateError) {
      console.error('Error updating payment status:', paymentUpdateError);
      return NextResponse.json(
        { error: 'Failed to update payment status' },
        { status: 500 }
      );
    }

    // Check if a registration already exists
    const { data: existingRegistration, error: checkError } = await supabase
      .from('DiscoveryTabEventRegistration')
      .select('registration_id, status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    let registrationId;

    if (existingRegistration && (!checkError || checkError.code !== 'PGRST116')) {
      // Registration exists - update it
      const { data: updatedReg, error: updateError } = await supabase
        .from('DiscoveryTabEventRegistration')
        .update({
          status: 'confirmed',
          registered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          added_to_calendar: false,
          is_attending: true,
          payment_id: paymentId,
          cancelled_at: null,
          cancellation_reason: null,
        })
        .eq('registration_id', existingRegistration.registration_id)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating registration:', updateError);
        return NextResponse.json(
          { error: 'Failed to update registration' },
          { status: 500 }
        );
      }

      registrationId = updatedReg.registration_id;
    } else {
      // Create new registration
      const { data: newRegistration, error: insertError } = await supabase
        .from('DiscoveryTabEventRegistration')
        .insert({
          user_id: userId,
          event_id: eventId,
          status: 'confirmed',
          registered_at: new Date().toISOString(),
          added_to_calendar: false,
          is_attending: true,
          payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating registration:', insertError);
        return NextResponse.json(
          { error: 'Failed to complete registration' },
          { status: 500 }
        );
      }

      registrationId = newRegistration.registration_id;
    }

    return NextResponse.json({
      success: true,
      registrationId: registrationId,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}