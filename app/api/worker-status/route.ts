import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/lib/utils'
import type { WorkerStatusType } from '@/lib/types/database'

// GET /api/worker-status?site_id=&worker_id=
// Managers: get all workers on a site. Workers: get own status.
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const site_id  = searchParams.get('site_id')
  const worker_id = searchParams.get('worker_id')

  if (worker_id) {
    // Single worker status
    const { data, error } = await supabase
      .from('worker_status')
      .select(`
        *,
        worker:profiles!worker_status_worker_id_fkey (
          id, full_name, avatar_url, badge_id, role, phone
        )
      `)
      .eq('worker_id', worker_id)
      .single()

    if (error) return apiError(error.message, 500)
    return apiSuccess(data)
  }

  if (site_id) {
    // All workers on a site — joined with profile and latest reading
    const { data, error } = await supabase
      .from('worker_status')
      .select(`
        *,
        worker:profiles!worker_status_worker_id_fkey (
          id, full_name, avatar_url, badge_id, role, phone, site_id
        )
      `)
      .eq('worker.site_id', site_id)
      .order('last_seen', { ascending: false })

    if (error) return apiError(error.message, 500)
    return apiSuccess(data)
  }

  // Default: return own status
  const { data, error } = await supabase
    .from('worker_status')
    .select('*')
    .eq('worker_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') return apiError(error.message, 500)
  return apiSuccess(data ?? null)
}

// PUT /api/worker-status — worker updates their own live status + GPS
export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { status, lat, lng, accuracy, shift_start } = body

  const updatePayload: {
    worker_id: string
    last_seen: string
    updated_at: string
    status?: WorkerStatusType
    lat?: number | null
    lng?: number | null
    accuracy?: number | null
    shift_start?: string | null
  } = {
    worker_id: user.id,
    last_seen: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (status)      updatePayload.status = status as WorkerStatusType
  if (lat != null) updatePayload.lat = lat
  if (lng != null) updatePayload.lng = lng
  if (accuracy != null) updatePayload.accuracy = accuracy
  if (shift_start) updatePayload.shift_start = shift_start

  const { data, error } = await supabase
    .from('worker_status')
    .upsert(updatePayload, { onConflict: 'worker_id' })
    .select()
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
}
