'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { HeatGuardLogo } from '@/components/HeatGuardLogo'

const NAV = [
  { label: 'Overview',      href: '/hq',           icon: LayoutDashboard },
  { label: 'Entities',      href: '/hq/entities',   icon: Building2 },
  { label: 'Global Admins', href: '/hq/admins',     icon: ShieldCheck },
  { label: 'Billing',       href: '/hq/billing',    icon: CreditCard },
]

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#050A08]/80 backdrop-blur-md flex flex-col flex-shrink-0 h-screen sticky top-0">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <HeatGuardLogo className="w-7 h-7 flex-shrink-0" />
          <div>
            <p className="font-bold text-base text-white leading-none">HeatGuard<sup className="text-[9px] align-super">®</sup></p>
            <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
              Super Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-2 mb-2 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
          Management
        </p>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/hq' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-[#00D15A]/20 text-[#00D15A] shadow-[0_0_15px_rgba(0,209,90,0.2)]'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-[10px] text-gray-600">
          HeatGuard HQ · Internal only
        </p>
      </div>

    </aside>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#0A1915] via-[#050A08] to-[#020504] text-gray-300 font-sans">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
