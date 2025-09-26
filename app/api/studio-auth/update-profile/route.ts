// app/api/studio-auth/update-profile/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('studio-auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, jwtSecret)
    const organizerId = payload.organizerId as string

    // Parse the request body
    const body = await request.json()
    const {
      name,
      description,
      contact_email,
      phone,
      address,
      website_url
    } = body

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Studio name is required' },
        { status: 400 }
      )
    }

    // Validate email format if provided
    if (contact_email && !isValidEmail(contact_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate URL format if provided
    if (website_url && !isValidUrl(website_url)) {
      return NextResponse.json(
        { error: 'Invalid website URL format' },
        { status: 400 }
      )
    }

    // Update the organizer profile
    const { data, error } = await supabase
      .from('DiscoveryTabOrganizers')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        contact_email: contact_email?.trim() || null,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
        website_url: website_url?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('organizer_id', organizerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating organizer profile:', error)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Return the updated studio data
    return NextResponse.json({
      success: true,
      studioData: {
        organizer_id: data.organizer_id,
        name: data.name,
        description: data.description,
        image_url: data.image_url,
        contact_email: data.contact_email,
        phone: data.phone,
        address: data.address,
        website_url: data.website_url,
        social_media_links: data.social_media_links,
        business_hours: data.business_hours,
        referral_code: data.referral_code,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper function to validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}