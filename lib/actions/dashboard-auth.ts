'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const MOCK_USERS = [
  { email: 'mohaned@heatguard.ae', password: 'Moh64$-LowN' },
  { email: 'khaled@heatguard.ae',  password: '123456'         },
]

export interface LoginState {
  error: string
}

// Uses the (prevState, formData) signature required by useFormState so the
// form is submitted natively — this is the only pattern that guarantees
// Set-Cookie headers are committed to the browser before the redirect fires.
export async function loginDashboardUser(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const credential = (formData.get('credential') as string | null)?.trim().toLowerCase() ?? ''
  const password   = (formData.get('password')   as string | null) ?? ''

  const match = MOCK_USERS.find(
    u => u.email === credential && u.password === password
  )

  if (!match) {
    return { error: 'Invalid credentials. Please check and try again.' }
  }

  const cookieStore = await cookies()
  cookieStore.set('dashboard_session', 'authenticated', {
    path:     '/',
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 10, // 10 hours
  })

  redirect('/dashboard')
}
