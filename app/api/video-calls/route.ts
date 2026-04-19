import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/lib/utils'
import type { CallStatus } from '@/lib/types/database'
import { randomUUID } from 'crypto'

// POST /api/video-calls — initiate a call
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { callee_id } = body

  if (!callee_id) return apiError('callee_id is required')
  if (callee_id === user.id) return apiError('Cannot call yourself')

  // Check callee exists and is on same site
  const { data: callee } = await supabase
    .from('profiles')
    .select('id, full_name, site_id')
    .eq('id', callee_id)
    .single()

  if (!callee) return apiError('Callee not found', 404)

  const room_id = `hg-${randomUUID()}`

  const { data, error } = await supabase
    .from('video_calls')
    .insert({
      caller_id: user.id,
      callee_id,
      status: 'pending',
      room_id,
    })
    .select(`
      *,
      caller:profiles!video_calls_caller_id_fkey (id, full_name, avatar_url),
      callee:profiles!video_calls_callee_id_fkey (id, full_name, avatar_url)
    `)
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data, 201)
}

// GET /api/video-calls?status=pending
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = supabase
    .from('video_calls')
    .select(`
      *,
      caller:profiles!video_calls_caller_id_fkey (id, full_name, avatar_url),
      callee:profiles!video_calls_callee_id_fkey (id, full_name, avatar_url)
    `)
    .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (status) query = query.eq('status', status as CallStatus)

  const { data, error } = await query
  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
}
