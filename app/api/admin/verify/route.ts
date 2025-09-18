// app/api/admin/verify/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const adminSession = (await cookieStore).get('admin_session')

  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ authenticated: false })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: 'admin',
      email: 'admin@familia.app',
      role: 'admin'
    }
  })
}

