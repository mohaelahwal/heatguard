import { createClient } from '@/lib/supabase/server'
import { apiError, apiSuccess } from '@/lib/utils'

// GET /api/messages?with=<user_id>&site_id=&limit=
// Returns conversation thread or site broadcast messages
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const { searchParams } = new URL(request.url)
  const withUser = searchParams.get('with')
  const site_id  = searchParams.get('site_id')
  const limit    = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200)

  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (id, full_name, avatar_url, role)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (withUser) {
    // Direct message thread between two users
    query = query.or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${withUser}),` +
      `and(sender_id.eq.${withUser},recipient_id.eq.${user.id})`
    )
  } else if (site_id) {
    // Broadcast messages for a site
    query = query.eq('site_id', site_id).is('recipient_id', null)
  } else {
    // All messages visible to this user
    query = query.or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
  }

  const { data, error } = await query
  if (error) return apiError(error.message, 500)

  // Mark incoming messages as read
  const unreadIds = (data ?? [])
    .filter(m => m.recipient_id === user.id && !m.read_at)
    .map(m => m.id)

  if (unreadIds.length > 0) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)
  }

  return apiSuccess(data)
}

// POST /api/messages — send a direct or broadcast message
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return apiError('Unauthorized', 401)

  const body = await request.json()
  const { recipient_id, site_id, content, type = 'text', metadata } = body

  if (!content?.trim()) return apiError('content is required')
  if (!recipient_id && !site_id) {
    return apiError('Either recipient_id (direct) or site_id (broadcast) is required')
  }

  // Only managers can broadcast
  if (!recipient_id && site_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'manager') {
      return apiError('Only managers can send broadcast messages', 403)
    }
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      recipient_id: recipient_id ?? null,
      site_id: site_id ?? null,
      content: content.trim(),
      type,
      metadata: metadata ?? {},
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey (id, full_name, avatar_url, role)
    `)
    .single()

  if (error) return apiError(error.message, 500)
  return apiSuccess(data, 201)
}
