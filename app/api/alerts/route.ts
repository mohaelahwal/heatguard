import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/lib/utils'

// GET /api/alerts?site_id=&worker_id=&unresolved=true&limit=
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const site_id    = searchParams.get('site_id')
  const worker_id  = searchParams.get('worker_id')
  const unresolved = searchParams.get('unresolved') === 'true'
  const limit      = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  let query = supabase
    .from('alerts')
    .select(`
      *,
      worker:profiles!alerts_worker_id_fkey (id, full_name, avatar_url, badge_id),
      creator:profiles!alerts_created_by_fkey (id, full_name, role)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (site_id)   query = query.eq('site_id', site_id)
  if (worker_id) query = query.eq('worker_id', worker_id)
  if (unresolved) query = query.is('resolved_at', null)

  const { data, error } = await query
  if (error) return apiError(error.message, 500)
  return apiSuccess(data)
}

// POST /api/alerts — manager or system creates a custom alert
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, site_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'manager') {
    return apiError('Only managers can create custom alerts', 403)
  }

  const body = await request.json()
  const { worker_id, type = 'custom', severity = 'medium', message, metadata } = body

  if (!message) return apiError('message is required')

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      site_id: profile.site_id,
      worker_id,
      created_by: user.id,
      type,
      severity,
      message,
      metadata: metadata ?? {},
    })
    .select(`
      *,
      worker:profiles!alerts_worker_id_fkey (id, full_name, avatar_url, badge_id)
    `)
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data, 201)
}
