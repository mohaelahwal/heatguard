import { openai } from '@ai-sdk/openai'
import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'

export const maxDuration = 30

// ── Dashboard snapshot (mirrors the hardcoded data shown in the UI) ──────────
// When the dashboard is wired to live Supabase data, update this function.
function buildDashboardContext(): string {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
  return `
=== LIVE HEATGUARD DASHBOARD SNAPSHOT ===
Sites: Palm Jebel Ali · Dubai Creek Harbour · Expo City · Date: ${today}

WORKFORCE SUMMARY:
- Total registered workers: 276
- Active on shift: 250
- On shift (live): 204
- On break: 34
- In alert / at risk: 24
- Open incidents: 3

HEAT & ENVIRONMENT (today, Dubai UAE):
- WBGT (Wet Bulb Globe Temp): 40.5°C — WARNING level
- Humidity: 68%
- AQI: 72 (Moderate)
- Season: May/Summer — Dubai peak heat season (WBGT typically 40–46°C through September)
- Historical trend: temperatures rise by ~0.5–1°C/hr from 09:00–14:00; peak risk window 11:00–15:00
- UAE labour law: outdoor work ban 12:30–15:00 (June–September)

OPEN INCIDENTS (requires action):
1. INC-001 · George Adam (HG-0541) · Zone C · Crew C · Palm Jebel Ali
   Type: Heat Exhaustion | Severity: CRITICAL | Time: 09:12 | Status: Pending
   Context: Crane Operator · pre-existing Type 2 diabetes (diet-controlled) · medical clearance required before return to duty

2. INC-002 · Vinay Barad (HG-0692) · Zone A · Crew B · Palm Jebel Ali
   Type: Dizziness Reported | Severity: HIGH | Time: 09:34 | Status: Under Review
   Context: Electrician · currently on break · monitor closely

3. INC-003 · Indira Comar (HG-0318) · Zone C · Crew C · Palm Jebel Ali
   Type: High Heat Index | Severity: WARNING | Time: 09:51 | Status: Monitoring
   Context: Site Safety Officer · Fit-for-Duty cert issued Feb 2026 (may need renewal by Aug 2026)

ACTIVE ALERTS (latest):
- Khaled Saeed (HG-1103) · Critical · 8 min ago · Scaffolding Technician · Zone B · Palm Jebel Ali
- Rajesh Iyer (HG-0877) · Heat Danger · 5 min ago · Concrete Finisher · heat index 44.7°C · has asthma (inhaler required on site)
- Tarek Haddad (HG-1042) · Heat Warning · 2 min ago · Structural Steel Worker · Zone B · previous heat exhaustion Jul 2023
- Thabo Molefe (HG-1600) · Heat Warning · 1 min ago · Precast Installer · Expo City · fatigue reported

ALL WORKERS — HEAT RISK LEVELS:
CRITICAL: Rajesh Iyer (HG-0877) · 44.7°C · asthma · Crew B
DANGER:   Tarek Haddad (HG-1042) · 41.2°C · prev. heat exhaustion · Crew A
WARNING:  Khaled Saeed (HG-1103) · 38.5°C · Crew A | Thabo Molefe (HG-1600) · 39.3°C · Expo City
CAUTION:  Nadia El Masri (HG-1510) · 35.6°C | Bilal Chaudhry (HG-1340) · 35.0°C | Santhosh Kumar (HG-1220) · 34.8°C
          George Adam (HG-0541) · 34.1°C | Priya Nair (HG-0455) · 33.6°C
SAFE:     Vinay Barad, Mohammed Al Rashid, Indira Comar, Ahmed Al Mansoori, Omar Farouk,
          Fatima Al Zaabi, Liu Wei, Carlos Mendes, Arjun Menon, Kenji Tanaka

CERTIFICATIONS — STATUS:
⛔ EXPIRED — requires immediate action:
- Tarek Haddad (HG-1042) · Crew A · Palm Jebel Ali · First Aid/CPR — EXPIRED
  ⚠ DOUBLE RISK: currently in DANGER heat zone with expired first aid cert
- Thabo Molefe (HG-1600) · Crew F · Expo City · First Aid/CPR — EXPIRED
  ⚠ Currently in WARNING zone with fatigue — no valid first aid coverage

⏳ PENDING — not yet obtained:
- Liu Wei (HG-0788) · Crew E · Dubai Creek Harbour · OSHA 10-Hour — PENDING

🔍 NEEDS REVIEW:
- Indira Comar (HG-0318) · Fit-for-Duty cert dated Feb 2026 — currently shows valid; verify renewal deadline (likely Aug 2026)

WORKER DETAILS (notable):
- Rajesh Iyer (HG-0877): asthma (inhaler required on site); pending medical clearance before next shift
- Tarek Haddad (HG-1042): mild hypertension (managed); previous heat exhaustion Jul 2023; hydration gap at 12:00–13:00
- George Adam (HG-0541): Type 2 diabetes (diet-controlled)
- Ahmed Al Mansoori (HG-0140): allergy to penicillin
- Arjun Menon (HG-1655): allergy to latex
- Priya Nair (HG-0455): mild iron-deficiency anaemia (supplement)

COMPLIANCE: 91.4% (target: 90%) ✓ On track
Next MOHRE submission deadline: April 6, 2026 (85% complete — 42 consecutive compliant days)

SITES:
- Palm Jebel Ali (Zone B–C · primary site)
- Dubai Creek Harbour (Zone D)
- Expo City Site (Jebel Ali / Dubai South)
=== END SNAPSHOT ===
`.trim()
}

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json()

    const systemPrompt = `You are HeatGuard AI, the built-in safety intelligence assistant for HSE managers at HeatGuard. You have direct access to live dashboard data, worker records, certification statuses, medical notes, and environmental readings shown below.

SCOPE — you ONLY answer questions related to:
- Worker heat safety, health, and risk levels
- Site incidents, alerts, and open cases
- Worker certifications, licences, and compliance
- Environmental conditions (WBGT, humidity, AQI) as they relate to site safety
- UAE labour law and HSE regulations relevant to the worksite
- HeatGuard platform features and dashboard data

If a question is outside this scope (general knowledge, news, coding, cooking, sports, personal advice, or anything unrelated to HeatGuard and worker safety), respond ONLY with:
"I'm HeatGuard AI — I can only assist with worker safety, site incidents, certifications, and heat risk management. Please ask me something related to your HeatGuard dashboard."
Do not attempt to answer off-topic questions even partially.

Rules:
- NEVER say "I don't have access to that information" if the data exists in the snapshot — use it directly and answer confidently.
- NEVER ask the manager to go check records themselves if the answer is in the snapshot.
- Give specific names, badge IDs, crews, zones, and severity levels from the data.
- Be concise and action-oriented. Lead with the most critical information first.
- For weather/forecast questions: only answer in the context of site safety — use today's WBGT of 40.5°C in Dubai, May peak season, to give a safety-focused forecast (e.g. expected heat levels tomorrow, recommended break schedules, UAE outdoor work ban hours).
- For compliance/certification questions: always check the CERTIFICATIONS section and report expired/pending certs by name and badge.
- Give proactive insights and predictions using the data available. If exact data doesn't exist, reason from what you know (seasonal patterns, medical history, risk trajectory) and say so.
- If a worker has both a high heat risk AND a medical condition or expired cert, flag this as a compound risk.
- Format responses with **bold** for names and key numbers. Use bullet points for lists.

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
