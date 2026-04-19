import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess, calculateHeatIndex, heatIndexSeverity } from '@/lib/utils'

// POST /api/heat-readings  — worker submits a reading
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { temperature, humidity, lat, lng } = body

  if (typeof temperature !== 'number') {
    return apiError('temperature is required and must be a number')
  }

  const heat_index =
    humidity != null ? calculateHeatIndex(temperature, humidity) : null

  const { data, error } = await supabase
    .from('heat_readings')
    .insert({ worker_id: user.id, temperature, humidity, heat_index, lat, lng })
    .select()
    .single()

  if (error) return apiError(error.message, 500)

  // Update worker live status with latest heat index
  if (heat_index !== null) {
    await supabase
      .from('worker_status')
      .upsert(
        { worker_id: user.id, current_heat_index: heat_index, last_seen: new Date().toISOString() },
        { onConflict: 'worker_id' }
      )

    // Auto-generate alert if heat index is dangerous
    const severity = heatIndexSeverity(heat_index)
    if (severity === 'high' || severity === 'critical') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('site_id, full_name')
        .eq('id', user.id)
        .single()

      if (profile?.site_id) {
        await supabase.from('alerts').insert({
          site_id: profile.site_id,
          worker_id: user.id,
          type: 'heat_stress',
          severity,
          message: `Heat index ${heat_index}°C detected for ${profile.full_name ?? 'worker'}`,
          metadata: { heat_index, temperature, humidity },
        })
      }
    }
  }

  return apiSuccess(data, 201)
}

// GET /api/heat-readings?worker_id=&limit=&from=&to=
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const worker_id = searchParams.get('worker_id') ?? user.id
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)
  const from = searchParams.get('from')
  const to = searchParams.get('to')

  let query = supabase
    .from('heat_readings')
    .select('*')
    .eq('worker_id', worker_id)
    .order('recorded_at', { ascending: false })
    .limit(limit)

  if (from) query = query.gte('recorded_at', from)
  if (to)   query = query.lte('recorded_at', to)

  const { data, error } = await query
  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
}
