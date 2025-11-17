// app/api/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // First, check if the email exists in the newsletter list
    const { data: existingEmail, error: checkError } = await supabase
      .from('NewsletterEmails')
      .select('id, email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (checkError || !existingEmail) {
      console.log('Email not found in newsletter list:', email)
      return NextResponse.json(
        { error: 'Email not found in newsletter list' },
        { status: 404 }
      )
    }

    // Delete the email from the newsletter list
    const { error: deleteError } = await supabase
      .from('NewsletterEmails')
      .delete()
      .eq('email', email.toLowerCase().trim())

    if (deleteError) {
      console.error('Error deleting email:', deleteError)
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      )
    }

    // Optional: Log the unsubscribe event
    // You might want to create an unsubscribe tracking table
    try {
      await supabase
        .from('NewsletterUnsubscribes')
        .insert({
          email: email.toLowerCase().trim(),
          unsubscribed_at: new Date().toISOString(),
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        })
    } catch (logError) {
      // Don't fail the unsubscribe if logging fails
      console.error('Failed to log unsubscribe event:', logError)
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    })

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

// Optional: GET method to check if an email is subscribed
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('NewsletterEmails')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !data) {
      return NextResponse.json(
        { subscribed: false },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { subscribed: true },
      { status: 200 }
    )

  } catch (error) {
    console.error('Check subscription error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}