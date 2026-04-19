import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Root: redirect authenticated users to their role-appropriate interface
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'manager') redirect('/dashboard')
  redirect('/app')
}
