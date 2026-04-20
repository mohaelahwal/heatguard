import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const reason = req.nextUrl.searchParams.get('reason')

  // Sign out from Supabase so the session token is invalidated
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Non-fatal — proceed with cookie cleanup regardless
  }

  const loginUrl = new URL('/login', req.url)
  if (reason === 'expired') loginUrl.searchParams.set('expired', 'true')

  const res = NextResponse.redirect(loginUrl)
  res.cookies.set('dashboard_session', '', { path: '/', maxAge: 0 })
  res.cookies.set('demo_user_email',   '', { path: '/', maxAge: 0 })

  return res
}
