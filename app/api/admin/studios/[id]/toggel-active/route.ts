import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


// app/api/admin/studios/[id]/toggle-active/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = cookies()
  const adminSession = (await cookieStore).get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const studioId = await params.then(p => p.id)

  try {
    // Get current status
    const { data: currentAuth, error: fetchError } = await supabase
      .from('studioauth')
      .select('is_active')
      .eq('organizer_id', studioId)
      .single()

    if (fetchError) throw fetchError

    // Toggle the status
    const { error: updateError } = await supabase
      .from('studioauth')
      .update({
        is_active: !currentAuth.is_active
      })
      .eq('organizer_id', studioId)

    if (updateError) throw updateError

    return NextResponse.json({ 
      success: true,
      new_status: !currentAuth.is_active
    })
    
  } catch (error) {
    console.error('Toggle active error:', error)
    return NextResponse.json(
      { error: 'Failed to toggle studio status' },
      { status: 500 }
    )
  }
}