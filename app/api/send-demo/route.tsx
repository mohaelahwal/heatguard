import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { render } from '@react-email/components'
import { DemoRequestEmail } from '@/components/emails/DemoRequestEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, company, email, phone, teamSize, tier } = body

    if (!name || !company || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert into Supabase first — if this fails, don't send the email
    const { error: dbError } = await supabase
      .from('demo_requests')
      .insert({
        name,
        company,
        email,
        phone:     phone     ?? null,
        team_size: teamSize  ?? null,
        tier:      tier      ?? null,
        status:    'pending',
      })

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save request' }, { status: 500 })
    }

    // Send notification email
    const emailHtml = await render(
      <DemoRequestEmail
        name={name}
        company={company}
        email={email}
        phone={phone}
        teamSize={teamSize}
        tier={tier}
        date={new Date().toISOString()}
      />
    )

    const { error: emailError } = await resend.emails.send({
      from:    'HeatGuard <onboarding@resend.dev>',
      to:      ['moha.decodo@gmail.com'],
      subject: `New Demo Request — ${company} (${tier})`,
      html:    emailHtml,
    })

    if (emailError) {
      // Row is already saved — log but don't fail the request
      console.error('Resend error:', emailError)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('send-demo route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
