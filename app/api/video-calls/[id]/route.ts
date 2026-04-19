import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/lib/utils'
import type { CallStatus } from '@/lib/types/database'

// PATCH /api/video-calls/[id] — update call status (accept, decline, end)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { status } = body as { status: CallStatus }

  const validTransitions: CallStatus[] = ['ringing', 'active', 'ended', 'missed', 'declined']
  if (!validTransitions.includes(status)) {
    return apiError(`Invalid status. Must be one of: ${validTransitions.join(', ')}`)
  }

  const updatePayload: Record<string, unknown> = { status }
  if (status === 'active') updatePayload.started_at = new Date().toISOString()
  if (status === 'ended' || status === 'missed' || status === 'declined') {
    updatePayload.ended_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('video_calls')
    .update(updatePayload)
    .eq('id', params.id)
    .or(`caller_id.eq.${user.id},callee_id.eq.${user.id}`)
    .select(`
      *,
      caller:profiles!video_calls_caller_id_fkey (id, full_name, avatar_url),
      callee:profiles!video_calls_callee_id_fkey (id, full_name, avatar_url)
    `)
    .single()

  if (error) return apiError(error.message, 500)
  if (!data) return apiError('Call not found or access denied', 404)
  return apiSuccess(data)
}
