// app/api/studio-auth/referral-stats/route.ts

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

    // Get studio's referral code
    const { data: studioData, error: studioError } = await supabase
      .from('DiscoveryTabOrganizers')
      .select('referral_code')
      .eq('organizer_id', organizerId)
      .single()

    if (studioError) {
      console.error('Error fetching studio data:', studioError)
      return NextResponse.json(
        { error: 'Failed to fetch studio data' },
        { status: 500 }
      )
    }

    // If studio doesn't have a referral code, return empty stats
    if (!studioData?.referral_code) {
      return NextResponse.json({
        totalReferrals: 0,
        pendingReferrals: 0,
        completedReferrals: 0,
        totalMonthsGranted: 0,
        referrals: []
      })
    }

    // Fetch all referrals for this studio
    const { data: referrals, error: referralsError } = await supabase
      .from('referral_tracking')
      .select(`
        referral_tracking_id,
        referred_user_id,
        referral_code,
        status,
        premium_months_granted,
        created_at,
        Users!referred_user_id (
          user_id,
          full_name,
          email
        )
      `)
      .eq('referrer_studio_id', organizerId)
      .eq('referrer_type', 'studio')
      .order('created_at', { ascending: false })

    if (referralsError) {
      console.error('Error fetching referrals:', referralsError)
      return NextResponse.json(
        { error: 'Failed to fetch referral data' },
        { status: 500 }
      )
    }

    // Calculate statistics
    const totalReferrals = referrals?.length || 0
    const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0
    const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0
    const totalMonthsGranted = referrals?.reduce((sum, r) => sum + (r.premium_months_granted || 0), 0) || 0

    // Format referrals for frontend
    const formattedReferrals = referrals?.map(referral => ({
      referral_tracking_id: referral.referral_tracking_id,
      referred_user_id: referral.referred_user_id,
      referral_code: referral.referral_code,
      status: referral.status,
      premium_months_granted: referral.premium_months_granted,
      created_at: referral.created_at,
      referredUser: referral.Users && referral.Users[0] ? {
        fullName: referral.Users[0].full_name,
        email: referral.Users[0].email
      } : null
    })) || []

    return NextResponse.json({
      totalReferrals,
      pendingReferrals,
      completedReferrals,
      totalMonthsGranted,
      referrals: formattedReferrals
    })

  } catch (error) {
    console.error('Referral stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch referral stats' },
      { status: 500 }
    )
  }
}