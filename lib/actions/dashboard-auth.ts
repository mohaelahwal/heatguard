'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const MOCK_USERS = [
  { email: 'mohaned@heatguard.ae', password: 'Moh64$-LowN' },
  { email: 'khaled@heatguard.ae',  password: '123456'       },
]

export interface LoginState {
  error: string
}

export async function loginDashboardUser(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const credential = (formData.get('credential') as string | null)?.trim().toLowerCase() ?? ''
  const password   = (formData.get('password')   as string | null) ?? ''

  const cookieStore = await cookies()

  // ── Internal HeatGuard staff (mock) ─────────────────────
  const mockMatch = MOCK_USERS.find(u => u.email === credential && u.password === password)
  if (mockMatch) {
    cookieStore.set('dashboard_session', 'authenticated', {
      path: '/', httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 10,
    })
    redirect('/dashboard')
  }

  // ── Demo users — authenticate via Supabase Auth ──────────
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    credential,
    password,
  })

  if (error || !data.user) {
    return { error: 'Invalid email or password. Please try again.' }
  }

  // Allow demo user through the dashboard_session guard
  cookieStore.set('dashboard_session', 'authenticated', {
    path: '/', httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 10,
  })
  // Store email so the dashboard layout can check trial expiry
  cookieStore.set('demo_user_email', data.user.email!, {
    path: '/', httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 10,
  })

  redirect('/dashboard')
}
