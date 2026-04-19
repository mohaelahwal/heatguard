import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/lib/utils'

// PATCH /api/alerts/[id]/acknowledge
export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['manager', 'nurse'].includes(profile.role)) {
    return apiError('Only managers and nurses can acknowledge alerts', 403)
  }

  const { data, error } = await supabase
    .from('alerts')
    .update({
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: user.id,
    })
    .eq('id', params.id)
    .is('acknowledged_at', null)  // idempotent
    .select()
    .single()

  if (error) return apiError(error.message, 500)
  if (!data) return apiError('Alert not found or already acknowledged', 404)
  return apiSuccess(data)
}

// PATCH-style resolve: POST /api/alerts/[id]/acknowledge with { resolve: true }
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'manager') {
    return apiError('Only managers can resolve alerts', 403)
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('alerts')
    .update({
      acknowledged_at: now,
      acknowledged_by: user.id,
      resolved_at: now,
      resolved_by: user.id,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return apiError(error.message, 500)
  if (!data) return apiError('Alert not found', 404)
  return apiSuccess(data)
}
