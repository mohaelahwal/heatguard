import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/lib/utils'

// POST /api/breaks — start a break
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { break_type = 'rest' } = body

  // End any currently open break for this worker
  const { data: openBreak } = await supabase
    .from('breaks')
    .select('id, started_at')
    .eq('worker_id', user.id)
    .is('ended_at', null)
    .single()

  if (openBreak) {
    const durationMs = Date.now() - new Date(openBreak.started_at).getTime()
    await supabase
      .from('breaks')
      .update({
        ended_at: new Date().toISOString(),
        duration_minutes: Math.round(durationMs / 60000),
      })
      .eq('id', openBreak.id)
  }

  const { data, error } = await supabase
    .from('breaks')
    .insert({ worker_id: user.id, break_type })
    .select()
    .single()

  if (error) return apiError(error.message, 500)

  // Update worker live status
  await supabase
    .from('worker_status')
    .upsert(
      { worker_id: user.id, status: 'on_break', last_seen: new Date().toISOString() },
      { onConflict: 'worker_id' }
    )

  return apiSuccess(data, 201)
}

// PATCH /api/breaks — end the current open break
export async function PATCH() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { data: openBreak } = await supabase
    .from('breaks')
    .select('id, started_at')
    .eq('worker_id', user.id)
    .is('ended_at', null)
    .single()

  if (!openBreak) return apiError('No active break found', 404)

  const durationMs = Date.now() - new Date(openBreak.started_at).getTime()
  const ended_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('breaks')
    .update({ ended_at, duration_minutes: Math.round(durationMs / 60000) })
    .eq('id', openBreak.id)
    .select()
    .single()

  if (error) return apiError(error.message, 500)

  // Restore active status
  await supabase
    .from('worker_status')
    .upsert(
      { worker_id: user.id, status: 'active', last_seen: new Date().toISOString() },
      { onConflict: 'worker_id' }
    )

  return apiSuccess(data)
}

// GET /api/breaks?worker_id=&limit=
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const worker_id = searchParams.get('worker_id') ?? user.id
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  const { data, error } = await supabase
    .from('breaks')
    .select('*')
    .eq('worker_id', worker_id)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
}
