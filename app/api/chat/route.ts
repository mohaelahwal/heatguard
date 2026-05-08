import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'

export const maxDuration = 30

// ── Dashboard snapshot (mirrors the hardcoded data shown in the UI) ──────────
// When the dashboard is wired to live Supabase data, update this function.
function buildDashboardContext(): string {
  return `
=== LIVE HEATGUARD DASHBOARD SNAPSHOT ===
Site: Palm Jebel Ali · Real-time monitoring

WORKFORCE SUMMARY:
- Total registered workers: 276
- Active on shift: 250
- On shift (live): 204
- On break: 34
- In alert / at risk: 24
- Open incidents: 3

HEAT & ENVIRONMENT:
- WBGT (Wet Bulb Globe Temp): 40.5°C — WARNING level
- Humidity: 68%
- AQI: 72 (Moderate)

OPEN INCIDENTS (requires action):
1. INC-001 · George Adam (GA-0203) · Zone B-4
   Type: Heat Exhaustion | Severity: CRITICAL | Time: 09:12 | Status: Pending

2. INC-002 · Vinay Barad (VB-0144) · Zone A-2
   Type: Dizziness Reported | Severity: HIGH | Time: 09:34 | Status: Under Review

3. INC-003 · Indira Comar (IC-0089) · Zone C-1
   Type: High Heat Index | Severity: WARNING | Time: 09:51 | Status: Monitoring

ACTIVE ALERTS (latest):
- Khaled Saeed (KS-0077) · Critical · 8 min ago
- Rajesh Iyer (RI-0118) · Heat Danger · 5 min ago
- Tarek Haddad (TH-0042) · Heat Warning · 2 min ago

COMPLIANCE: 91.4% (target: 90%) ✓ On track
=== END SNAPSHOT ===
`.trim()
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const systemPrompt = `You are HeatGuard AI, the built-in safety intelligence assistant for HSE managers at HeatGuard. You have direct access to the live dashboard data shown below.

Rules:
- NEVER ask the manager to provide data that is already in the snapshot — use it directly.
- Give specific names, badge numbers, zones, and severity levels from the data.
- Be concise and action-oriented. Lead with the most critical information.
- If asked about workers at risk, reference the exact workers from the snapshot.
- If you don't know something not in the snapshot, say so clearly.

${buildDashboardContext()}`

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
