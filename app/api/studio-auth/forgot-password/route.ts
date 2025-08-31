import { NextRequest, NextResponse } from "next/server"
import { StudioAuthService } from '../../../../lib/studio-auth'

// app/api/studio-auth/forgot-password/route.ts
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await StudioAuthService.requestPasswordReset(email)

    if (result.resetToken) {
      // TODO: Send email with reset link
      // You would integrate with your email service here
      console.log(`Password reset token for ${email}: ${result.resetToken}`)
      
      // In production, you'd send an email like:
      // await sendPasswordResetEmail(email, result.resetToken)
    }

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json({ 
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
