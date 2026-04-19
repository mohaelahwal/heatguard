import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Handles Supabase Auth email/OAuth redirect
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect to role-appropriate default page
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        const destination =
          profile?.role === 'manager' ? '/dashboard' : '/app'

        return NextResponse.redirect(`${origin}${destination}`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
