// app/api/admin/studios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = cookies()
  const adminSession = (await cookieStore).get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Await the params object
  const { id: studioId } = await params

  try {
    // Fetch studio details
    const { data: studio, error: studioError } = await supabase
      .from('DiscoveryTabOrganizers')
      .select(`
        *,
        studioauth!inner(
          email,
          last_login,
          login_attempts,
          is_active,
          default_password
        )
      `)
      .eq('organizer_id', studioId)
      .single()

    if (studioError) throw studioError

    // Fetch events with registration data
    const { data: events, error: eventsError } = await supabase
      .from('DiscoveryTabEvents')
      .select(`
        *,
        DiscoveryTabEventRegistration(
          registration_id,
          status,
          registered_at,
          Users(full_name, email),
          DiscoveryTabPayments(amount, payment_status)
        )
      `)
      .eq('organizer_id', studioId)
      .order('created_at', { ascending: false })

    if (eventsError) throw eventsError

    // Define registration type
    interface Registration {
      status: string;
      registered_at: string;
      Users?: {
        full_name?: string;
        email?: string;
      };
      DiscoveryTabPayments?: Array<{
        amount?: number;
        payment_status?: string;
      }>;
    }

    // Process events data
    const processedEvents = events?.map(event => {
      const registrations: Registration[] = event.DiscoveryTabEventRegistration || []
      const totalRevenue = registrations.reduce((acc: number, reg: Registration) => {
        const payment = reg.DiscoveryTabPayments?.[0]
        return acc + (payment?.amount || 0)
      }, 0)

      const attendeeList = registrations.map((reg: Registration) => ({
        user_name: reg.Users?.full_name,
        user_email: reg.Users?.email,
        registration_status: reg.status,
        payment_amount: reg.DiscoveryTabPayments?.[0]?.amount || 0,
        registered_at: reg.registered_at
      }))

      return {
        event_id: event.event_id,
        title: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        price: event.price,
        capacity: event.capacity,
        is_active: event.is_active,
        created_at: event.created_at,
        registration_count: registrations.length,
        total_revenue: totalRevenue,
        attendee_list: attendeeList
      }
    }) || []

    // Fetch referrals
    const { data: referrals, error: referralsError } = await supabase
      .from('referral_tracking')
      .select(`
        id,
        status,
        created_at,
        completed_at,
        Users!referred_user_id(
          full_name,
          email,
          DiscoveryTabEventRegistration(
            registered_at
          )
        )
      `)
      .eq('referrer_studio_id', studioId)
      .eq('referrer_type', 'studio')
      .order('created_at', { ascending: false })

    if (referralsError) throw referralsError

    // Process referrals
    const processedReferrals = referrals?.map(referral => {
      const firstUser = Array.isArray(referral.Users) ? referral.Users[0] : referral.Users
      const firstBooking = firstUser?.DiscoveryTabEventRegistration?.[0]
      return {
        referral_id: referral.id,
        referred_user_name: firstUser?.full_name,
        referred_user_email: firstUser?.email,
        status: referral.status,
        created_at: referral.created_at,
        completed_at: referral.completed_at,
        first_booking_date: firstBooking?.registered_at || null
      }
    }) || []

    // Calculate financial summary
    const totalRevenue = processedEvents.reduce((acc, event) => acc + event.total_revenue, 0)
    const totalBookings = processedEvents.reduce((acc, event) => acc + event.registration_count, 0)
    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Group revenue by month
    const revenueByMonth: { [key: string]: { revenue: number, bookings: number } } = {}
    
    for (const event of processedEvents) {
      const monthKey = new Date(event.start_time).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      })
      
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { revenue: 0, bookings: 0 }
      }
      
      revenueByMonth[monthKey].revenue += event.total_revenue
      revenueByMonth[monthKey].bookings += event.registration_count
    }

    const monthlyRevenue = Object.entries(revenueByMonth)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        bookings: data.bookings
      }))
      .sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime())

    // Prepare response data
    const studioDetails = {
      studio: {
        organizer_id: studio.organizer_id,
        name: studio.name,
        description: studio.description,
        email: studio.studioauth.email,
        contact_email: studio.contact_email,
        phone: studio.phone,
        address: studio.address,
        website_url: studio.website_url,
        referral_code: studio.referral_code,
        created_at: studio.created_at,
        updated_at: studio.updated_at,
        auth_status: {
          last_login: studio.studioauth.last_login,
          login_attempts: studio.studioauth.login_attempts,
          is_active: studio.studioauth.is_active,
          default_password: studio.studioauth.default_password
        }
      },
      events: processedEvents,
      referrals: processedReferrals,
      financial: {
        total_revenue: totalRevenue,
        total_bookings: totalBookings,
        average_booking_value: averageBookingValue,
        revenue_by_month: monthlyRevenue,
        pending_payouts: 0, // You'll need to calculate this based on your payout logic
        completed_payouts: 0 // You'll need to calculate this based on your payout logic
      }
    }

    return NextResponse.json(studioDetails)
    
  } catch (error) {
    console.error('Studio details fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch studio details' },
      { status: 500 }
    )
  }
}