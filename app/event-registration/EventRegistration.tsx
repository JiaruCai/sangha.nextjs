"use client";

import React, { useState, useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface EventInfo {
  eventId: string;
  userId: string;
  returnUrl: string;
  // These will be fetched from Supabase
  eventTitle?: string;
  price?: number;
  location?: string;
  startTime?: string;
}

interface EventData {
  event_id: string;
  title: string;
  price: number;
  location: string;
  start_time: string;
  end_time: string;
  description: string;
  is_active: boolean;
}

// Payment Form Component
const EventPaymentForm: React.FC<{
  eventInfo: EventInfo;
  eventData: EventData;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
}> = ({ eventInfo, eventData, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');

  // Calculate fees (matching your mobile app logic)
  const subtotal = eventData.price;
  const familiaFee = Math.round(subtotal * 0.13 * 100) / 100;
  const taxes = Math.round(subtotal * 0.004 * 100) / 100;
  const total = subtotal + familiaFee + taxes;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !customerEmail) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent for event registration
      const response = await fetch('/api/create-event-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          eventId: eventInfo.eventId,
          userId: eventInfo.userId,
          eventTitle: eventData.title,
          customerEmail,
          familiaFee: Math.round(familiaFee * 100),
          taxAmount: Math.round(taxes * 100),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret, paymentIntentId } = await response.json();

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: customerEmail,
          },
        },
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else {
        // Register for the event after successful payment
        const registrationResponse = await fetch('/api/register-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: eventInfo.eventId,
            userId: eventInfo.userId,
            paymentIntentId,
            amount: Math.round(total * 100),
            familiaFee: Math.round(familiaFee * 100),
            taxAmount: Math.round(taxes * 100),
          }),
        });

        if (!registrationResponse.ok) {
          const errorData = await registrationResponse.json();
          console.error('Registration error:', errorData);
          throw new Error(errorData.details || 'Failed to complete registration');
        }

        onPaymentSuccess();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold font-arsenal mb-6 text-center">Complete Your Registration</h2>
      
      {/* Event Details */}
      <div className="bg-[#F9F9F9] rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-lg mb-4">{eventData.title}</h3>
        <div className="text-sm text-gray-600 mb-2">{eventData.location}</div>
        
        {/* Price Breakdown */}
        <div className="space-y-2 mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span>Event Price</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Familia Fee</span>
            <span>${familiaFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Taxes</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span>
            <span className="text-[#bf608f]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            required
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-700"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block font-arsenal text-gray-700 text-sm font-medium mb-2">
            Card Information
          </label>
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <span className="mr-2">🔒</span>
          <span>Your payment information is secure and encrypted</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className={`w-full font-arsenal text-white px-6 py-3 rounded-full font-bold transition-colors ${
            isProcessing 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-[#bf608f] hover:bg-[#a94e7a]'
          }`}
        >
          {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

// Main Component
export default function EventRegistration() {
  const searchParams = useSearchParams();
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        // Parse URL parameters (only essential ones)
        const eventId = searchParams?.get('eventId');
        const userId = searchParams?.get('userId');
        const returnUrl = searchParams?.get('returnUrl');

        if (!eventId || !userId || !returnUrl) {
          setError('Missing required information. Please try again from the app.');
          setIsLoading(false);
          return;
        }

        // Set basic info
        setEventInfo({
          eventId,
          userId,
          returnUrl,
        });

        // Fetch event details from Supabase
        const { data: event, error: fetchError } = await supabase
          .from('DiscoveryTabEvents')
          .select('*')
          .eq('event_id', eventId)
          .eq('is_active', true)
          .single();

        if (fetchError || !event) {
          console.error('Error fetching event:', fetchError);
          setError('Unable to load event details. Please try again.');
          setIsLoading(false);
          return;
        }

        // Verify it's an online paid event
        if (event.location.toLowerCase() !== 'online' || event.price <= 0) {
          setError('This registration method is only for online paid events.');
          setIsLoading(false);
          return;
        }

        setEventData(event);
        setIsLoading(false);
      } catch (err) {
        console.error('Error in fetchEventData:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [searchParams]);

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    
    // Redirect back to app after short delay
    if (eventInfo?.returnUrl) {
      setTimeout(() => {
        const successUrl = `${eventInfo.returnUrl}?success=true&eventId=${eventInfo.eventId}`;
        window.location.href = successUrl;
      }, 3000);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleBackToApp = () => {
    if (eventInfo?.returnUrl) {
      const cancelUrl = `${eventInfo.returnUrl}?success=false&eventId=${eventInfo.eventId}`;
      window.location.href = cancelUrl;
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF7F5] to-[#F9E3E0] flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#bf608f] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !eventData) {
    // Extract error code from error message if present
    let errorCode: string | undefined;
    if (typeof error === 'string') {
      if (error.includes('already registered')) errorCode = 'ALREADY_REGISTERED';
      else if (error.includes('event full')) errorCode = 'EVENT_FULL';
      else if (error.includes('profile required')) errorCode = 'PROFILE_REQUIRED';
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF7F5] to-[#F9E3E0] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className={`text-5xl mb-4 ${errorCode === 'ALREADY_REGISTERED' ? 'text-green-500' : 'text-red-500'}`}>
            {errorCode === 'ALREADY_REGISTERED' ? '✓' : '⚠️'}
          </div>
          <h2 className="text-2xl font-bold mb-4">
            {errorCode === 'ALREADY_REGISTERED' ? 'Already Registered' : 
             errorCode === 'EVENT_FULL' ? 'Event Full' :
             errorCode === 'PROFILE_REQUIRED' ? 'Profile Required' :
             'Registration Unavailable'}
          </h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load event information'}</p>
          
          {errorCode === 'PROFILE_REQUIRED' ? (
            <button
              onClick={() => {
                // Deep link back to profile creation in the app
                window.location.href = 'JoinSangha://profile/create';
              }}
              className="bg-[#bf608f] text-white px-6 py-2 rounded-full font-bold hover:bg-[#a94e7a] mb-3 w-full"
            >
              Create Profile in App
            </button>
          ) : null}
          
          <button
            onClick={handleBackToApp}
            className={`${errorCode === 'PROFILE_REQUIRED' ? 'bg-gray-500' : 'bg-[#bf608f]'} text-white px-6 py-2 rounded-full font-bold hover:opacity-90`}
          >
            Return to App
          </button>
        </div>
      </div>
    );
  }

  // Success State
  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF7F5] to-[#F9E3E0] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4">Registration Complete!</h2>
          <p className="text-gray-600 mb-6">
            Your payment was successful. You&apos;re now registered for {eventData?.title}.
          </p>
          <p className="text-sm text-gray-500">Redirecting back to app...</p>
        </div>
      </div>
    );
  }

  // Payment Form
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7F5] to-[#F9E3E0] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-arsenal mb-2">Event Registration</h1>
          <p className="text-gray-600">Complete your registration for this online event</p>
        </div>

        {/* Payment Form */}
        {eventInfo && eventData && (
          <Elements stripe={stripePromise}>
            <EventPaymentForm
              eventInfo={eventInfo}
              eventData={eventData}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          </Elements>
        )}

        {/* Cancel Link */}
        <div className="text-center mt-6">
          <button
            onClick={handleBackToApp}
            className="text-gray-600 underline hover:text-gray-800"
          >
            Cancel and return to app
          </button>
        </div>
      </div>
    </div>
  );
}