import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
    }

    // Get email from secure cookie
    const cookieStore = await cookies()
    const email = cookieStore.get('admin_verification_email')?.value

    if (!email) {
      return NextResponse.json({ error: 'No verification session found' }, { status: 401 })
    }

    // Check verification code in database
    const { data: verificationData, error: verifyError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code.trim())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (verifyError) {
      console.error('Error verifying code:', verifyError)
      return NextResponse.json({ error: 'Error verifying code' }, { status: 500 })
    }

    if (!verificationData) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 401 })
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationData.id)

    if (updateError) {
      console.error('Error updating verification code:', updateError)
    }

    // Clear the verification email cookie
    cookieStore.delete('admin_verification_email')

    // Set verified session cookies
    cookieStore.set('admin_email_verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300 // 5 minutes to complete login
    })

    cookieStore.set('admin_verified_email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 300
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}