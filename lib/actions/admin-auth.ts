'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAdmin(
  _prevState: { error: string },
  formData: FormData
) {
  const adminEmail    = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    console.error('ADMIN_EMAIL or ADMIN_PASSWORD environment variables are not set')
    return { error: 'Server misconfiguration — contact support' }
  }

  const email    = formData.get('email')    as string
  const password = formData.get('password') as string

  if (email === adminEmail && password === adminPassword) {
    const cookieStore = await cookies()
    cookieStore.set('hq_session', 'authenticated', {
      path:     '/hq',
      httpOnly: true,
      secure:   true,
      sameSite: 'lax',
      maxAge:   60 * 60 * 8, // 8 hours
    })
    redirect('/hq')
  }

  return { error: 'Invalid admin credentials' }
}
