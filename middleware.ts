import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types/database'
import type { UserRole } from '@/lib/types/database'

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/register', '/auth/callback', '/auth/demo-signout', '/api/send-demo', '/api/hq', '/requests', '/trial-expired']

// Role-based access: which roles can access which path prefixes
const ROLE_ACCESS: Record<string, UserRole[]> = {
  '/dashboard': ['manager'],
  '/app':       ['worker', 'nurse'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  /* ── Super Admin (/hq) guard ──────────────────────────────────────
     Completely independent of Supabase auth — uses its own cookie.
  ─────────────────────────────────────────────────────────────────── */
  if (pathname.startsWith('/hq')) {
    if (pathname === '/hq/login') return NextResponse.next()

    const session = request.cookies.get('hq_session')
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/hq/login', request.url))
    }
    return NextResponse.next()
  }

  /* ── Dashboard / App guard ───────────────────────────────────────
     Checks the dashboard_session cookie set by loginDashboardUser().
     Completely independent of Supabase — works without a configured
     Supabase project during development.
  ─────────────────────────────────────────────────────────────────── */
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/app')) {
    const dashSession = request.cookies.get('dashboard_session')
    if (dashSession?.value === 'authenticated') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }


  // Allow public routes before hitting Supabase
  if (PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next()
  }

  // Skip Supabase entirely if env vars are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // No Supabase — any non-public route that wasn't already bypassed above
    // gets redirected to login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — must be called before accessing session data
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users to login
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check role-based access for protected route prefixes
  for (const [prefix, allowedRoles] of Object.entries(ROLE_ACCESS)) {
    if (pathname.startsWith(prefix)) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !allowedRoles.includes(profile.role)) {
        const redirectTo = profile?.role === 'manager' ? '/dashboard' : '/app'
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }
      break
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
