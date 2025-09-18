import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_ADMIN_EMAILS = (process.env.ALLOWED_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email is in allowed admin list
    if (!ALLOWED_ADMIN_EMAILS.includes(normalizedEmail)) {
      return NextResponse.json({ error: 'Unauthorized email address' }, { status: 401 })
    }

    // Generate verification code
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store verification code in Supabase
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert([{
        email: normalizedEmail,
        code: code,
        expires_at: expiresAt.toISOString(),
        used: false
      }])

    if (insertError) {
      console.error('Error storing verification code:', insertError)
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 })
    }

    // Store email in a secure session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_verification_email', normalizedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    // Send email via Supabase Edge Function
    const { error: functionError } = await supabase.functions.invoke('send-verification-email', {
      body: {
        email: normalizedEmail,
        code: code,
      },
    })

    if (functionError) {
      console.error('Error sending verification email:', functionError)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DEV] Verification code for ${email}: ${code}`)
      }
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    // Clean up old expired codes
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', normalizedEmail)
      .lt('expires_at', new Date().toISOString())

    return NextResponse.json({ success: true, message: 'Verification code sent' })
  } catch (error) {
    console.error('Request verification error:', error)
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 })
  }
}