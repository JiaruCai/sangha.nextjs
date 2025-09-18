// app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const adminSession = (await cookieStore).get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const dateFilter = searchParams.get('dateFilter') || '7days'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '100')

  try {
    // Calculate date range
    const now = new Date()
    let startDate: Date | null = null
    
    switch (dateFilter) {
      case '24hours':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = null // No date filter for all time
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Fetch studios data
    const { data: studios, error: studiosError } = await supabase
      .from('DiscoveryTabOrganizers')
      .select(`
        organizer_id,
        name,
        referral_code,
        created_at,
        studioauth!inner(email),
        DiscoveryTabEvents(
          event_id,
          is_active,
          price,
          created_at,
          DiscoveryTabEventRegistration(
            registration_id,
            registered_at
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (studiosError) throw studiosError

    // Process studios data with date filtering for bookings and revenue
    const studiosOverview = studios?.map(studio => {
      const events = studio.DiscoveryTabEvents || []
      
      // Filter bookings within date range
      const bookingsInRange = events.reduce((acc: number, event: any) => {
        if (startDate) {
          const registrationsInRange = event.DiscoveryTabEventRegistration?.filter((reg: any) => 
            new Date(reg.registered_at) >= startDate
          ).length || 0
          return acc + registrationsInRange
        } else {
          // All time - count all registrations
          return acc + (event.DiscoveryTabEventRegistration?.length || 0)
        }
      }, 0)
      
      // Calculate revenue only for bookings within date range
      const revenueInRange = events.reduce((acc: number, event: any) => {
        if (startDate) {
          const registrationsInRange = event.DiscoveryTabEventRegistration?.filter((reg: any) => 
            new Date(reg.registered_at) >= startDate
          ).length || 0
          return acc + (event.price * registrationsInRange)
        } else {
          // All time revenue
          return acc + (event.price * (event.DiscoveryTabEventRegistration?.length || 0))
        }
      }, 0)
      
      // Total stats (all time)
      const totalBookings = events.reduce((acc: number, event: any) => 
        acc + (event.DiscoveryTabEventRegistration?.length || 0), 0
      )
      const totalRevenue = events.reduce((acc: number, event: any) => 
        acc + (event.price * (event.DiscoveryTabEventRegistration?.length || 0)), 0
      )
      
      return {
        organizer_id: studio.organizer_id,
        name: studio.name,
        email: studio.studioauth[0]?.email || '',
        created_at: studio.created_at,
        total_events: events.length,
        active_events: events.filter((e: any) => e.is_active).length,
        total_revenue: totalRevenue,
        total_bookings: totalBookings,
        revenue_in_period: revenueInRange,
        bookings_in_period: bookingsInRange,
        referral_code: studio.referral_code,
        referrals_generated: 0 // Will be calculated below
      }
    }) || []

    // Fetch user statistics - ALL TIME stats
    const { count: totalUsersData } = await supabase
      .from('Users')
      .select('user_id', { count: 'exact', head: true })

    // Date filtered user statistics
    let newUsersInPeriodQuery = supabase
      .from('Users')
      .select('user_id', { count: 'exact', head: true })
    
    if (startDate) {
      newUsersInPeriodQuery = newUsersInPeriodQuery.gte('created_at', startDate.toISOString())
    }
    
    const { count: newUsersInPeriod } = await newUsersInPeriodQuery

    // Fixed time period stats (independent of dateFilter)
    const { count: newUsersToday } = await supabase
      .from('Users')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString())

    const { count: newUsersWeek } = await supabase
      .from('Users')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const { count: newUsersMonth } = await supabase
      .from('Users')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const { count: activeSubscribersData } = await supabase
      .from('UserSubscriptions')
      .select('subscription_id', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: trialUsersData } = await supabase
      .from('UserSubscriptions')
      .select('subscription_id', { count: 'exact', head: true })
      .eq('status', 'trialing')

    const { count: referredUsersData } = await supabase
      .from('Users')
      .select('user_id', { count: 'exact', head: true })
      .not('used_referral_code', 'is', null)

    // Date filtered referred users
    let referredUsersInPeriodQuery = supabase
      .from('Users')
      .select('user_id', { count: 'exact', head: true })
      .not('used_referral_code', 'is', null)
    
    if (startDate) {
      referredUsersInPeriodQuery = referredUsersInPeriodQuery.gte('created_at', startDate.toISOString())
    }
    
    const { count: referredUsersInPeriod } = await referredUsersInPeriodQuery

    // Fetch subscription statistics
    const { data: subscriptions } = await supabase
      .from('UserSubscriptions')
      .select('plan_type, status, stripe_price_id, created_at')
      .in('status', ['active', 'trialing'])

    // Date filtered new subscriptions
    let newSubscriptionsQuery = supabase
      .from('UserSubscriptions')
      .select('plan_type, status')
      .in('status', ['active', 'trialing'])
    
    if (startDate) {
      newSubscriptionsQuery = newSubscriptionsQuery.gte('created_at', startDate.toISOString())
    }
    
    const { data: newSubscriptionsInPeriod } = await newSubscriptionsQuery

    const monthlySubscribers = subscriptions?.filter(s => 
      s.plan_type === 'monthly' && s.status === 'active'
    ).length || 0
    
    const yearlySubscribers = subscriptions?.filter(s => 
      s.plan_type === 'yearly' && s.status === 'active'
    ).length || 0
    
    const trialSubscribers = subscriptions?.filter(s => 
      s.status === 'trialing'
    ).length || 0

    const newSubscribersInPeriod = newSubscriptionsInPeriod?.length || 0

    // Calculate revenue
    const monthlyRevenue = monthlySubscribers * 9.99
    const yearlyRevenue = yearlySubscribers * 99.99
    const totalMRR = monthlyRevenue + (yearlyRevenue / 12)

    // Fetch referral statistics
    const { data: referralData } = await supabase
      .from('referral_tracking')
      .select(`
        id,
        status,
        referrer_type,
        referrer_user_id,
        referrer_studio_id,
        referral_code,
        created_at,
        Users!referrer_user_id(full_name),
        DiscoveryTabOrganizers!referrer_studio_id(name)
      `)

    // Filter referrals by date
    const referralsInPeriod = startDate 
      ? referralData?.filter(r => new Date(r.created_at) >= startDate) || []
      : referralData || []

    const totalReferrals = referralData?.length || 0
    const completedReferrals = referralData?.filter(r => r.status === 'completed').length || 0
    const pendingReferrals = referralData?.filter(r => r.status === 'pending').length || 0
    const studioReferrals = referralData?.filter(r => r.referrer_type === 'studio').length || 0
    const userReferrals = referralData?.filter(r => r.referrer_type === 'user').length || 0

    // Period-specific referral stats
    const referralsInPeriodCount = referralsInPeriod.length
    const completedReferralsInPeriod = referralsInPeriod.filter(r => r.status === 'completed').length

    // Calculate referrals per studio
    const studioReferralCounts = referralData?.reduce((acc: any, ref: any) => {
      if (ref.referrer_type === 'studio' && ref.referrer_studio_id) {
        acc[ref.referrer_studio_id] = (acc[ref.referrer_studio_id] || 0) + 1
      }
      return acc
    }, {}) || {}

    // Update studios with referral counts
    studiosOverview.forEach(studio => {
      studio.referrals_generated = studioReferralCounts[studio.organizer_id] || 0
    })

    // Get top referrers
    const referrerStats = referralData?.reduce((acc: any, ref: any) => {
      const key = ref.referrer_type === 'studio' 
        ? `studio_${ref.referrer_studio_id}`
        : `user_${ref.referrer_user_id}`
      
      if (!acc[key]) {
        acc[key] = {
          referrer_name: ref.referrer_type === 'studio' 
            ? ref.DiscoveryTabOrganizers?.name || 'Unknown Studio'
            : ref.Users?.full_name || 'Unknown User',
          referrer_type: ref.referrer_type,
          referral_count: 0,
          completed_count: 0
        }
      }
      
      acc[key].referral_count++
      if (ref.status === 'completed') {
        acc[key].completed_count++
      }
      
      return acc
    }, {}) || {}

    const topReferrers = Object.values(referrerStats)
      .sort((a: any, b: any) => b.referral_count - a.referral_count)
      .slice(0, 10)

    // Fetch recent users with pagination and date filter
    const offset = (page - 1) * pageSize
    let recentUsersQuery = supabase
      .from('Users')
      .select(`
        user_id,
        full_name,
        email,
        created_at,
        used_referral_code,
        referral_tracking!referred_user_id(
          referrer_type,
          referrer_user_id,
          referrer_studio_id,
          Users!referrer_user_id(full_name),
          DiscoveryTabOrganizers!referrer_studio_id(name)
        ),
        UserSubscriptions(status)
      `, { count: 'exact' })
    
    if (startDate) {
      recentUsersQuery = recentUsersQuery.gte('created_at', startDate.toISOString())
    }
    
    const { data: recentUsers, count: totalUserCount } = await recentUsersQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1)

    const processedRecentUsers = recentUsers?.map(user => {
      const referralTracking = user.referral_tracking?.[0]
      const subscription = user.UserSubscriptions?.[0]
      
      return {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        created_at: user.created_at,
        subscription_status: subscription?.status || null,
        referral_source: user.used_referral_code,
        referrer_name: referralTracking?.referrer_type === 'studio'
          ? referralTracking.DiscoveryTabOrganizers?.[0]?.name
          : referralTracking?.Users?.[0]?.full_name || null
      }
    }) || []

    const dashboardData = {
      studios: studiosOverview,
      userStats: {
        total_users: totalUsersData || 0,
        new_users_today: newUsersToday || 0,
        new_users_week: newUsersWeek || 0,
        new_users_month: newUsersMonth || 0,
        new_users_in_period: dateFilter === 'all' ? totalUsersData || 0 : newUsersInPeriod || 0,
        active_subscribers: activeSubscribersData || 0,
        trial_users: trialUsersData || 0,
        referred_users: referredUsersData || 0,
        referred_users_in_period: dateFilter === 'all' ? referredUsersData || 0 : referredUsersInPeriod || 0
      },
      subscriptionStats: {
        total_active: (activeSubscribersData || 0) + (trialUsersData || 0),
        monthly_subscribers: monthlySubscribers,
        yearly_subscribers: yearlySubscribers,
        trial_subscribers: trialSubscribers,
        new_subscribers_in_period: newSubscribersInPeriod,
        monthly_revenue: monthlyRevenue,
        yearly_revenue: yearlyRevenue,
        total_mrr: totalMRR,
        churn_rate: 5.2 // You'll need to calculate this based on your data
      },
      referralStats: {
        total_referrals: totalReferrals,
        completed_referrals: completedReferrals,
        pending_referrals: pendingReferrals,
        studio_referrals: studioReferrals,
        user_referrals: userReferrals,
        referrals_in_period: referralsInPeriodCount,
        completed_in_period: completedReferralsInPeriod,
        top_referrers: topReferrers
      },
      recentUsers: processedRecentUsers,
      pagination: {
        page,
        pageSize,
        totalUsers: totalUserCount || 0,
        totalPages: Math.ceil((totalUserCount || 0) / pageSize)
      },
      dateFilter: {
        filter: dateFilter,
        startDate: startDate?.toISOString() || null,
        endDate: now.toISOString()
      }
    }

    return NextResponse.json(dashboardData)
    
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}