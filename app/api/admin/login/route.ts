// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Hardcoded admin passcode - change this to your desired passcode
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'FamiliaAdmin2024!'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { passcode } = body

    if (passcode !== ADMIN_PASSCODE) {
      return NextResponse.json(
        { error: 'Invalid passcode' },
        { status: 401 }
      )
    }

    // Set simple session cookie
    (await
      // Set simple session cookie
      cookies()).set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return NextResponse.json({
      success: true,
      user: {
        id: 'admin',
        email: 'admin@familia.app',
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

