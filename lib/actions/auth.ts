'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '@/lib/schemas/auth'

export type AuthResult =
  | { error: string }
  | { success: true; message?: string }

// ── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { credential, password, site_name } = parsed.data
  const supabase = await createClient()

  // Resolve email from Badge ID if needed
  let email = credential
  if (!credential.includes('@')) {
    const service = createServiceClient()
    const { data: profile } = await service
      .from('profiles')
      .select('id')
      .eq('badge_id', credential)
      .maybeSingle()

    if (!profile) return { error: 'No account found with that Badge ID.' }

    const { data: adminData } = await service.auth.admin.getUserById(profile.id)
    if (!adminData.user?.email) {
      return { error: 'Badge ID lookup failed — please sign in with your email address.' }
    }
    email = adminData.user.email
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'Invalid credentials. Please check and try again.' }

  // Optionally assign site on first login
  if (site_name) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('site_id')
        .eq('id', user.id)
        .single()

      if (!profile?.site_id) {
        const service = createServiceClient()
        const siteId = await findOrCreateSite(service, site_name)
        if (siteId) {
          await service.from('profiles').update({ site_id: siteId }).eq('id', user.id)
        }
      }
    }
  }

  return { success: true }
}

// ── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(input: RegisterInput): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { full_name, job_title, badge_id, email, password, site_name } = parsed.data
  const service = createServiceClient()

  // Badge ID uniqueness check
  const { data: badgeCheck } = await service
    .from('profiles')
    .select('id')
    .eq('badge_id', badge_id)
    .maybeSingle()
  if (badgeCheck) return { error: 'That Badge ID is already registered to another worker.' }

  // Find or create site
  const siteId = await findOrCreateSite(service, site_name)
  if (!siteId) return { error: 'Failed to configure site. Please contact your administrator.' }

  // Create auth user
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, job_title } },
  })

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { error: 'An account with that email address already exists.' }
    }
    return { error: error.message }
  }
  if (!data.user) return { error: 'Registration failed. Please try again.' }

  // Complete profile (trigger only populates full_name + avatar_url)
  const { error: profileError } = await service
    .from('profiles')
    .update({ badge_id, site_id: siteId })
    .eq('id', data.user.id)

  if (profileError) {
    await service.auth.admin.deleteUser(data.user.id)
    return { error: 'Failed to complete registration. Please try again.' }
  }

  return {
    success: true,
    message: 'Account created! Please check your email to verify your address, then sign in.',
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function findOrCreateSite(
  service: Awaited<ReturnType<typeof createServiceClient>>,
  name: string
): Promise<string | null> {
  const { data: existing } = await service
    .from('sites')
    .select('id')
    .eq('name', name)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created } = await service
    .from('sites')
    .insert({ name })
    .select('id')
    .single()

  return created?.id ?? null
}
