import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/lib/utils'

// POST /api/symptoms — worker logs symptoms
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { symptoms, severity, notes } = body

  if (!Array.isArray(symptoms) || symptoms.length === 0) {
    return apiError('symptoms must be a non-empty array')
  }
  if (typeof severity !== 'number' || severity < 1 || severity > 5) {
    return apiError('severity must be a number between 1 and 5')
  }

  const { data, error } = await supabase
    .from('symptoms')
    .insert({ worker_id: user.id, symptoms, severity, notes })
    .select()
    .single()

  if (error) return apiError(error.message, 500)

  // Auto-generate alert for high-severity symptoms (4–5)
  if (severity >= 4) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('site_id, full_name')
      .eq('id', user.id)
      .single()

    if (profile?.site_id) {
      const alertSeverity = severity === 5 ? 'critical' : 'high'
      await supabase.from('alerts').insert({
        site_id: profile.site_id,
        worker_id: user.id,
        type: 'symptom_report',
        severity: alertSeverity,
        message: `${profile.full_name ?? 'Worker'} reported: ${symptoms.join(', ')} (severity ${severity}/5)`,
        metadata: { symptoms, severity, notes },
      })
    }
  }

  // Update worker status to alert if critical
  if (severity >= 4) {
    await supabase
      .from('worker_status')
      .upsert(
        { worker_id: user.id, status: 'alert', last_seen: new Date().toISOString() },
        { onConflict: 'worker_id' }
      )
  }

  return apiSuccess(data, 201)
}

// GET /api/symptoms?worker_id=&limit=
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const worker_id = searchParams.get('worker_id') ?? user.id
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  const { data, error } = await supabase
    .from('symptoms')
    .select('*')
    .eq('worker_id', worker_id)
    .order('recorded_at', { ascending: false })
    .limit(limit)

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
}
