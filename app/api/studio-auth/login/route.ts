// app/api/studio-auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { StudioAuthService } from '../../../../lib/studio-auth'
import { SignJWT } from 'jose'

const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const result = await StudioAuthService.authenticateStudio(email, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = await new SignJWT({ 
      authId: result.user!.auth_id,
      organizerId: result.user!.organizer_id,
      email: result.user!.email
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(jwtSecret)

    const response = NextResponse.json({
      success: true,
      user: result.user,
      requiresPasswordReset: result.requiresPasswordReset
    })

    // Set HTTP-only cookie
    response.cookies.set('studio-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
