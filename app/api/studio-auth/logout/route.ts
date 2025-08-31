import { NextResponse } from "next/server"

// app/api/studio-auth/logout/route.ts
export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('studio-auth-token')
  return response
}
