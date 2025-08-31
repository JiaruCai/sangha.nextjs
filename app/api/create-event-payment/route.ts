import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, eventId, userId, eventTitle, customerEmail, familiaFee, taxAmount } = body;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: 'usd',
      metadata: {
        eventId,
        userId,
        eventTitle,
        customerEmail,
        familiaFee: familiaFee.toString(),
        taxAmount: taxAmount.toString(),
        type: 'event_registration'
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}