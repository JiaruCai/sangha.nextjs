import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId, paymentIntentId, amount, familiaFee, taxAmount } = body;

    // Validate required fields
    if (!eventId || !userId || !paymentIntentId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('DiscoveryTabPayments')
      .insert({
        user_id: userId,
        event_id: eventId,
        amount: amount / 100, // Convert from cents to dollars
        familia_fee: (familiaFee || 0) / 100, // Convert from cents to dollars
        tax_amount: (taxAmount || 0) / 100, // Convert from cents to dollars
        payment_method: 'card',
        payment_status: 'succeeded',
        stripe_payment_intent_id: paymentIntentId,
        currency: 'USD',
        // created_at and updated_at will use default values
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Supabase payment insertion error:', paymentError);
      return NextResponse.json(
        { 
          error: 'Failed to create payment record',
          details: paymentError.message,
          code: paymentError.code,
          hint: paymentError.hint
        },
        { status: 500 }
      );
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
      console.error('Supabase registration insertion error:', registrationError);
      
      // Try to rollback the payment record if registration fails
      const { error: deleteError } = await supabase
        .from('DiscoveryTabPayments')
        .delete()
        .eq('payment_id', payment.payment_id);
      
      if (deleteError) {
        console.error('Failed to rollback payment:', deleteError);
      }

      return NextResponse.json(
        { 
          error: 'Failed to create registration',
          details: registrationError.message,
          code: registrationError.code,
          hint: registrationError.hint
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      paymentId: payment.payment_id 
    });
    
  } catch (error) {
    console.error('Unexpected error in registration:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}