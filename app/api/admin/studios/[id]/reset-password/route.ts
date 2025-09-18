import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// app/api/admin/studios/[id]/reset-password/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies()
  const adminToken = (await cookieStore).get('admin_token')

  if (!adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const studioId = params.id

  try {
    // Generate a temporary password
    const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`
    
    // Hash the password (in production, use bcrypt)
    // const hashedPassword = await bcrypt.hash(tempPassword, 10)
    
    // Update the studio auth record
    const { error } = await supabase
      .from('studioauth')
      .update({
        password_hash: tempPassword, // In production, use hashedPassword
        default_password: true,
        login_attempts: 0,
        locked_until: null
      })
      .eq('organizer_id', studioId)

    if (error) throw error

    // In production, send an email to the studio with the temporary password
    
    return NextResponse.json({ 
      success: true,
      message: 'Password has been reset successfully'
    })
    
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}