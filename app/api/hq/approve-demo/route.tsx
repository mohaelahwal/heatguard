import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { DemoApprovedEmail } from '@/components/emails/DemoApprovedEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function POST(req: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[approve-demo] SUPABASE_SERVICE_ROLE_KEY is not set')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { id, email, name, company, tier } = await req.json()

    if (!id || !email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const password  = generatePassword()
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()

    // ── 1. Update demo_requests to active FIRST ──────────────────────
    // Must succeed before we do anything else — this is what gates login.
    const { error: updateError } = await adminClient
      .from('demo_requests')
      .update({ status: 'active', expires_at: expiresAt })
      .eq('id', id)

    if (updateError) {
      console.error('[approve-demo] demo_requests update failed:', updateError)
      return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 })
    }

    // ── 2. Create or reset Supabase Auth user ────────────────────────
    // Non-fatal: if this fails after DB update, admin can re-approve to retry.
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      const msg = createError.message?.toLowerCase() ?? ''
      if (msg.includes('already been registered') || msg.includes('already exists')) {
        // User already in auth — reset their password so new credentials work
        const { data: listData } = await adminClient.auth.admin.listUsers()
        const existing = listData?.users?.find(u => u.email === email)
        if (existing) {
          const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
            existing.id,
            { password }
          )
          if (updateAuthError) {
            console.error('[approve-demo] Failed to reset password:', updateAuthError)
          }
        }
      } else {
        // Unexpected error — DB is already updated so log but don't abort
        console.error('[approve-demo] Auth user creation failed:', createError)
      }
    } else {
      console.log('[approve-demo] Auth user created:', createData.user?.id)
    }

    // ── 3. Send welcome email with credentials ───────────────────────
    // Non-fatal: DB is already active, user can log in. Log failure for follow-up.
    const emailHtml = await render(
      <DemoApprovedEmail
        name={name}
        email={email}
        password={password}
        expiresAt={expiresAt}
        loginUrl="https://dashboard.heatguard.ae/login"
      />
    )

    const { error: emailError } = await resend.emails.send({
      from:    'HeatGuard <onboarding@heatguard.ae>',
      to:      [email],
      subject: 'Your HeatGuard Demo is Ready — Login Credentials Inside',
      html:    emailHtml,
    })

    if (emailError) {
      console.error('[approve-demo] Email delivery failed (user still approved):', emailError)
    } else {
      console.log('[approve-demo] Welcome email sent to:', email)
    }

    // Always return success if DB update worked — email/auth failures are logged
    return NextResponse.json({ success: true, expiresAt })

  } catch (err) {
    console.error('[approve-demo] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
