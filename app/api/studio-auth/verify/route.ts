// app/api/studio-auth/verify/route.ts

import { jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key")

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('studio-auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, jwtSecret)

    // Fetch the studio data from Supabase
    const { data: authData, error } = await supabase
      .from('studioauth')
      .select(`
        *,
        DiscoveryTabOrganizers (*)
      `)
      .eq('auth_id', payload.authId)
      .eq('is_active', true)
      .single()

    if (error || !authData) {
      // Token is valid but user not found or inactive
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        authId: payload.authId as string,
        organizerId: payload.organizerId as string,
        email: payload.email as string,
        studioData: authData.DiscoveryTabOrganizers
      }
    })

  } catch {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}