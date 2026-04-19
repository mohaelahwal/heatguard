import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { DemoRequestEmail } from '@/components/emails/DemoRequestEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, company, email, phone, teamSize, tier, date } = body

    if (!name || !company || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'HeatGuard <onboarding@resend.dev>',
      to:   ['moha.decodo@gmail.com'],
      subject: `New Demo Request — ${company} (${tier})`,
      react: DemoRequestEmail({ name, company, email, phone, teamSize, tier, date }),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('send-demo route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
