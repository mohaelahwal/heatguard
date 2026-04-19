'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  MapPin,
  Users,
  AlertTriangle,
  ShieldCheck,
  FileText,
  MessageSquare,
  Stethoscope,
  Briefcase,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_MAIN = [
  { icon: LayoutGrid,   label: 'Dash',       href: '/dashboard',           exact: true  },
  { icon: Users,        label: 'Roster',      href: '/dashboard/workers',   exact: false },
  { icon: MapPin,       label: 'Map',         href: '/dashboard/map',       exact: false },
  { icon: AlertTriangle,label: 'Incidents',   href: '/dashboard/incidents', exact: false },
  { icon: ShieldCheck,  label: 'Compliance',  href: '/dashboard/compliance',exact: false },
  { icon: FileText,     label: 'Claims',      href: '/dashboard/claims',    exact: false },
  { icon: MessageSquare,label: 'Messages',    href: '/dashboard/messages',  exact: false },
  { icon: Stethoscope,  label: 'Tele Triage', href: '/dashboard/tele-triage', exact: false },
  { icon: Briefcase,    label: 'Toolbox',     href: '/dashboard/toolbox',    exact: false },
]

const NAV_BOTTOM = [
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', exact: false },
]

function NavItem({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: React.ElementType
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-colors duration-150 w-full',
        active
          ? 'text-white'
          : 'text-white/50 hover:text-white/80'
      )}
      aria-current={active ? 'page' : undefined}
    >
      <span
        className={cn(
          'w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-150',
          active
            ? 'bg-[#00D15A]'
            : 'hover:bg-white/10'
        )}
      >
        <Icon className="w-[18px] h-[18px]" strokeWidth={active ? 2.5 : 2} />
      </span>
      <span
        className={cn(
          'text-[9px] font-semibold leading-none tracking-wide truncate w-full text-center px-1',
          active ? 'text-white' : 'text-white/45'
        )}
      >
        {label}
      </span>
    </Link>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside
      className="w-[72px] shrink-0 flex flex-col h-full overflow-hidden"
      style={{ backgroundColor: '#0C2A1F' }}
    >
      {/* Nav items */}
      <nav className="flex-1 flex flex-col items-center px-2 pt-3 gap-0.5">
        {NAV_MAIN.map(({ icon, label, href, exact }) => (
          <NavItem
            key={href}
            icon={icon}
            label={label}
            href={href}
            active={isActive(href, exact)}
          />
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/[0.08] mb-1" />

      {/* Bottom nav */}
      <div className="flex flex-col items-center px-2 pb-4 gap-0.5">
        {NAV_BOTTOM.map(({ icon, label, href, exact }) => (
          <NavItem
            key={href}
            icon={icon}
            label={label}
            href={href}
            active={isActive(href, exact)}
          />
        ))}
      </div>
    </aside>
  )
}
