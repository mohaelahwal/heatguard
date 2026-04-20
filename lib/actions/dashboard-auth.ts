'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Comma-separated list of internal staff emails that bypass the demo trial
// expiry check. Set in .env.local / Vercel environment variables.
// Example: INTERNAL_STAFF_EMAILS=mohaned@heatguard.ae,khaled@heatguard.ae
const INTERNAL_EMAILS = (process.env.INTERNAL_STAFF_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

export interface LoginState {
  error: string
}

export async function loginDashboardUser(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const credential = (formData.get('credential') as string | null)?.trim().toLowerCase() ?? ''
  const password   = (formData.get('password')   as string | null) ?? ''

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    credential,
    password,
  })

  if (error || !data.user) {
    return { error: 'Invalid email or password. Please try again.' }
  }

  const cookieStore = await cookies()
  const userEmail   = data.user.email!

  cookieStore.set('dashboard_session', 'authenticated', {
    path: '/', httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 10,
  })

  // Internal staff skip the demo trial expiry guard — only set this cookie
  // for demo users so the layout can enforce their expires_at date.
  if (!INTERNAL_EMAILS.includes(userEmail)) {
    cookieStore.set('demo_user_email', userEmail, {
      path: '/', httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 10,
    })
  }

  redirect('/dashboard')
}
