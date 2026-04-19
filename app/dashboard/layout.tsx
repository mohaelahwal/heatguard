import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader }  from '@/components/dashboard/header'
import { AIChatbot }        from '@/components/dashboard/ai-chatbot'
import { TrialGuard }       from '@/components/dashboard/trial-guard'

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s | HeatGuard' },
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Mock-auth bypass: if dashboard_session cookie is set, skip Supabase entirely
  const cookieStore = await cookies()
  const dashSession = cookieStore.get('dashboard_session')
  const isMockAuth  = dashSession?.value === 'authenticated'

  let headerUser = { name: null as string | null, email: null as string | null, avatar: null as string | null }

  if (!isMockAuth) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, avatar_url, site_id')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'manager') redirect('/app')

    headerUser = {
      name:   profile?.full_name ?? null,
      email:  user.email ?? null,
      avatar: profile?.avatar_url ?? null,
    }
  }

  return (
    /*
     * Layout:
     *  ┌─ header (full-width, dark green) ──────────────────┐
     *  ├─ sidebar (72px) ──┬─ main content (flex-1, white) ─┤
     *  └───────────────────┴────────────────────────────────┘
     */
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Full-width dark header */}
      <DashboardHeader user={headerUser} />

      {/* Below header: sidebar + content side-by-side */}
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main
          id="main-content"
          className="flex-1 overflow-auto bg-white p-5 lg:p-6 scrollbar-light"
        >
          {children}
        </main>
      </div>

      {/* Floating AI chatbot — available on all dashboard pages */}
      <AIChatbot />

      {/* Silently checks trial expiry on every dashboard visit */}
      <TrialGuard />
    </div>
  )
}
