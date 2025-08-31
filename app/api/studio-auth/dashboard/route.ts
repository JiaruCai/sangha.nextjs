// app/api/studio-auth/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('studio-auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, jwtSecret)
    const organizerId = payload.organizerId as string

    // Fetch all events for this organizer
    const { data: events, error: eventsError } = await supabase
      .from('DiscoveryTabEvents')
      .select(`
        *,
        DiscoveryTabEventRegistration (
          registration_id,
          user_id,
          status,
          registered_at,
          is_attending,
          Users (
            user_id,
            full_name,
            email,
            profile_photo_url
          )
        ),
        DiscoveryTabPayments (
          payment_id,
          amount,
          payment_status,
          created_at
        )
      `)
      .eq('organizer_id', organizerId)
      .order('start_time', { ascending: false })

    if (eventsError) {
      console.error('Error fetching events:', eventsError)
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    // Calculate analytics
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    
    // Active events (upcoming or ongoing)
    const activeEvents = events?.filter(event => 
      new Date(event.end_time) >= now
    ) || []

    // Completed events
    const completedEvents = events?.filter(event => 
      new Date(event.end_time) < now
    ) || []

    // Total bookings across all events
    const totalBookings = events?.reduce((sum, event) => 
      sum + (event.DiscoveryTabEventRegistration?.filter((reg: {
        registration_id: string;
        user_id: string;
        status: string;
        registered_at: string;
        is_attending: boolean;
        Users?: {
          user_id: string;
          full_name: string;
          email: string;
          profile_photo_url: string;
        } | null;
      }) => 
        reg.status === 'confirmed'
      ).length || 0), 0
    ) || 0

    // Monthly bookings
    const monthlyBookings = events?.reduce((sum, event) => 
      sum + (event.DiscoveryTabEventRegistration?.filter((reg: {
        registration_id: string;
        user_id: string;
        status: string;
        registered_at: string;
        is_attending: boolean;
        Users?: {
          user_id: string;
          full_name: string;
          email: string;
          profile_photo_url: string;
        } | null;
      }) => 
        reg.status === 'confirmed' && 
        new Date(reg.registered_at) >= oneMonthAgo
      ).length || 0), 0
    ) || 0

    // Calculate revenue data
    type Payment = {
      amount: string;
      payment_id: string;
      payment_status: string;
      created_at: string;
    };

    const confirmedPayments = events?.flatMap(event => 
      event.DiscoveryTabPayments?.filter((payment: Payment) => 
        payment.payment_status === 'succeeded'
      ) || []
    ) || []

    const totalRevenue = confirmedPayments.reduce((sum: number, payment: Payment) => 
      sum + parseFloat(payment.amount), 0
    )

    // Calculate monthly revenue for the last 4 months
    const monthlyRevenue = []
    for (let i = 0; i < 4; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const monthRevenue = confirmedPayments
        .filter((payment: Payment) => {
          const paymentDate = new Date(payment.created_at)
          return paymentDate >= monthStart && paymentDate <= monthEnd
        })
        .reduce((sum: number, payment: Payment) => sum + parseFloat(payment.amount), 0)

      monthlyRevenue.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        amount: monthRevenue
      })
    }

    // Get popular events (by registration count)
    const popularEvents = events
      ?.map(event => ({
        title: event.title,
        eventId: event.event_id,
        bookings: event.DiscoveryTabEventRegistration?.filter((reg: {
          registration_id: string;
          user_id: string;
          status: string;
          registered_at: string;
          is_attending: boolean;
          Users?: {
            user_id: string;
            full_name: string;
            email: string;
            profile_photo_url: string;
          } | null;
        }) => 
          reg.status === 'confirmed'
        ).length || 0,
        startTime: event.start_time,
        price: event.price
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5) || []

    // Calculate pending payouts (simplified - you may want to implement actual payout logic)
    const pendingPayouts = confirmedPayments
      .filter((payment: { amount: string; payment_id: string; payment_status: string; created_at: string }) => {
        const paymentDate = new Date(payment.created_at)
        const daysSincePayment = (now.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24)
        return daysSincePayment < 7 // Assuming 7-day payout period
      })
      .reduce(
        (sum: number, payment: { amount: string; payment_id: string; payment_status: string; created_at: string }) =>
          sum + parseFloat(payment.amount) * 0.9,
        0
      ) // 90% after fees

    const response = {
      events: events?.map(event => ({
        eventId: event.event_id,
        title: event.title,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        price: event.price,
        capacity: event.capacity,
        imageUrl: event.image_url,
        isActive: event.is_active,
        status: new Date(event.end_time) < now ? 'completed' : 
                new Date(event.start_time) > now ? 'upcoming' : 'ongoing',
        registrations: event.DiscoveryTabEventRegistration?.map((reg: {
          registration_id: string;
          user_id: string;
          status: string;
          registered_at: string;
          is_attending: boolean;
          Users?: {
            user_id: string;
            full_name: string;
            email: string;
            profile_photo_url: string;
          } | null;
        }) => ({
          registrationId: reg.registration_id,
          userId: reg.user_id,
          status: reg.status,
          registeredAt: reg.registered_at,
          isAttending: reg.is_attending,
          user: reg.Users ? {
            userId: reg.Users.user_id,
            fullName: reg.Users.full_name,
            email: reg.Users.email,
            profilePhotoUrl: reg.Users.profile_photo_url
          } : null
        })) || [],
        totalRegistrations: event.DiscoveryTabEventRegistration?.filter((reg: {
          registration_id: string;
          user_id: string;
          status: string;
          registered_at: string;
          is_attending: boolean;
          Users?: {
            user_id: string;
            full_name: string;
            email: string;
            profile_photo_url: string;
          } | null;
        }) => 
          reg.status === 'confirmed'
        ).length || 0
      })) || [],
      analytics: {
        totalBookings,
        monthlyBookings,
        activeEvents: activeEvents.length,
        completedEvents: completedEvents.length,
        popularEvents,
        monthlyRevenue: monthlyRevenue.reverse(),
        totalRevenue,
        averageRating: 4.8 // You may want to implement actual rating calculation
      },
      payouts: {
        currentBalance: totalRevenue * 0.9, // 90% after platform fees
        pendingPayouts,
        totalEarnings: totalRevenue,
        lastPayout: null // Implement actual payout tracking
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Dashboard data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}