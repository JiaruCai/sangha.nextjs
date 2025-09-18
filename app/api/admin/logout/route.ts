// app/api/admin/logout/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  
  // Clear all admin-related cookies
  cookieStore.delete('admin_session')
  cookieStore.delete('admin_email')
  cookieStore.delete('admin_email_verified')
  cookieStore.delete('admin_verified_email')
  
  return NextResponse.json({ success: true })
}