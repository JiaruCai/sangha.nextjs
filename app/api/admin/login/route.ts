import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'FamiliaAdmin2024!'

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json()
    const cookieStore = await cookies()

    // Check email verification
    const emailVerified = cookieStore.get('admin_email_verified')?.value
    const verifiedEmail = cookieStore.get('admin_verified_email')?.value

    if (!emailVerified || !verifiedEmail) {
      return NextResponse.json({ error: 'Email verification required' }, { status: 401 })
    }

    // Verify passcode
    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json({ error: 'Invalid passcode' }, { status: 401 })
    }

    // Clear verification cookies
    cookieStore.delete('admin_email_verified')
    cookieStore.delete('admin_verified_email')

    // Set authenticated session
    cookieStore.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    // Store admin email in session
    cookieStore.set('admin_email', verifiedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24
    })

    return NextResponse.json({
      success: true,
      user: {
        email: verifiedEmail,
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}