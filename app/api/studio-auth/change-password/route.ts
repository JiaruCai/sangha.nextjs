
// app/api/studio-auth/change-password/route.ts
import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'
import { StudioAuthService } from '../../../../lib/studio-auth'

// Replace this with your actual JWT secret, or import from your config
const jwtSecret = process.env.JWT_SECRET || 'your-default-jwt-secret'

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('studio-auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret))
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    const result = await StudioAuthService.changePassword(
      payload.authId as string,
      currentPassword,
      newPassword
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    )
  }
}
