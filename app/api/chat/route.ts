import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages } from 'ai'
import { createClient } from '@supabase/supabase-js'
import type { UIMessage } from 'ai'

export const maxDuration = 30

async function fetchDashboardContext(): Promise<string> {
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const [workersRes, alertsRes, readingsRes] = await Promise.all([
      admin.from('worker_status').select('status, current_heat_index'),
      admin.from('alerts').select('severity, message, created_at').is('resolved_at', null).order('created_at', { ascending: false }).limit(10),
      admin.from('heat_readings').select('temperature, humidity, heat_index, recorded_at').order('recorded_at', { ascending: false }).limit(20),
    ])

    const workers    = workersRes.data  ?? []
    const alerts     = alertsRes.data   ?? []
    const readings   = readingsRes.data ?? []

    const onShift  = workers.filter(w => w.status === 'active').length
    const onBreak  = workers.filter(w => w.status === 'break').length
    const atRisk   = workers.filter(w => w.status === 'alert').length
    const total    = workers.length

    const heatValues    = workers.map(w => w.current_heat_index).filter(Boolean) as number[]
    const avgHeat       = heatValues.length ? (heatValues.reduce((a, b) => a + b, 0) / heatValues.length).toFixed(1) : 'N/A'
    const maxHeat       = heatValues.length ? Math.max(...heatValues).toFixed(1) : 'N/A'

    const latestReading = readings[0]
    const recentWBGT    = latestReading ? `${latestReading.heat_index ?? latestReading.temperature}°C` : 'N/A'
    const recentHumidity = latestReading?.humidity ? `${latestReading.humidity}%` : 'N/A'

    const criticalAlerts = alerts.filter(a => a.severity === 'critical')
    const highAlerts     = alerts.filter(a => a.severity === 'high')

    const alertSummary = alerts.slice(0, 5).map(a =>
      `- [${a.severity.toUpperCase()}] ${a.message} (${new Date(a.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })})`
    ).join('\n')

    return `
=== LIVE HEATGUARD DASHBOARD DATA (as of ${new Date().toISOString()}) ===

WORKFORCE:
- Total workers: ${total}
- On shift (active): ${onShift}
- On break: ${onBreak}
- At risk / in alert: ${atRisk}

HEAT READINGS:
- Latest WBGT: ${recentWBGT}
- Latest humidity: ${recentHumidity}
- Average heat index across workers: ${avgHeat}°C
- Highest heat index recorded: ${maxHeat}°C

ACTIVE ALERTS (unresolved): ${alerts.length} total — ${criticalAlerts.length} critical, ${highAlerts.length} high
${alertSummary || '- No active alerts'}

=== END OF LIVE DATA ===
`.trim()
  } catch (err) {
    console.error('[chat] Failed to fetch dashboard context:', err)
    return ''
  }
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const liveContext = await fetchDashboardContext()

    const systemPrompt = `You are HeatGuard AI, an expert workplace heat safety assistant for HSE managers in the UAE. Answer concisely and professionally using the live data provided below. Never ask the manager for data that is already in the live dashboard — use it directly in your answer.

${liveContext}`

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('AI API Error:', error)
    return new Response('Failed to generate AI response', { status: 500 })
  }
}
