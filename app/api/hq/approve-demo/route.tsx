import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { DemoApprovedEmail } from '@/components/emails/DemoApprovedEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

function generatePassword(length = 12): string {
  // Exclude ambiguous chars (0/O, 1/I/l) for readability
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
    const loginUrl = 'https://dashboard.heatguard.ae/login'

    // ── 1. Create (or update) Supabase Auth user ─────────────────────
    let authUserId: string | null = null

    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error('[approve-demo] Supabase Auth Error:', createError)

      const msg = createError.message?.toLowerCase() ?? ''
      if (msg.includes('already been registered') || msg.includes('already exists')) {
        // User exists — reset their password so the new credentials still work
        const { data: listData, error: listError } = await adminClient.auth.admin.listUsers()
        if (listError) {
          console.error('[approve-demo] Supabase listUsers Error:', listError)
        } else {
          const existing = listData?.users?.find(u => u.email === email)
          if (existing) {
            authUserId = existing.id
            const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(
              existing.id,
              { password }
            )
            if (updateAuthError) {
              console.error('[approve-demo] Supabase updateUserById Error:', updateAuthError)
            }
          }
        }
      } else {
        // Unexpected auth error — abort so the admin knows something is wrong
        return NextResponse.json(
          { error: `Auth user creation failed: ${createError.message}` },
          { status: 500 }
        )
      }
    } else {
      authUserId = createData.user?.id ?? null
    }

    // ── 2. Update demo_requests row ──────────────────────────────────
    const updatePayload: Record<string, unknown> = {
      status:     'active',
      expires_at: expiresAt,
    }
    if (authUserId) updatePayload.auth_user_id = authUserId

    const { error: updateError } = await adminClient
      .from('demo_requests')
      .update(updatePayload)
      .eq('id', id)

    if (updateError) {
      // Retry without auth_user_id in case the column doesn't exist yet
      console.warn('[approve-demo] demo_requests update with auth_user_id failed, retrying without:', updateError)
      const { error: fallbackError } = await adminClient
        .from('demo_requests')
        .update({ status: 'active', expires_at: expiresAt })
        .eq('id', id)

      if (fallbackError) {
        console.error('[approve-demo] demo_requests fallback update failed:', fallbackError)
        return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 })
      }
    }

    // ── 3. Send welcome email ────────────────────────────────────────
    const emailHtml = await render(
      <DemoApprovedEmail
        name={name}
        email={email}
        password={password}
        expiresAt={expiresAt}
        loginUrl={loginUrl}
      />
    )

    const { data: emailData, error: emailError } = await resend.emails.send({
      from:    'HeatGuard <onboarding@heatguard.ae>',
      to:      [email],
      subject: 'Your HeatGuard Demo is Ready — Login Credentials Inside',
      html:    emailHtml,
    })

    if (emailError) {
      console.error('[approve-demo] Resend Error:', emailError)
      return NextResponse.json(
        { error: `Email delivery failed: ${emailError.message}` },
        { status: 500 }
      )
    }

    console.log('[approve-demo] Email sent successfully, Resend id:', emailData?.id)
    return NextResponse.json({ success: true, expiresAt })

  } catch (err) {
    console.error('[approve-demo] Unhandled error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
