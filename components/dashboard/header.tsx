'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Bell, AlignJustify, LogOut, Loader2,
  User, Shield, History, Timer, BookOpen, LifeBuoy, ChevronDown,
  Thermometer, AlertTriangle, Droplets, MessageSquare, Wifi,
  MapPin, FileText, Users, Check,
} from 'lucide-react'
import Link from 'next/link'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutAction } from '@/lib/actions/auth'
import { ClockModal } from '@/components/dashboard/clock-modal'
import { HeatGuardLogo } from '@/components/HeatGuardLogo'

/* ── Notification data ───────────────────────────────────────────── */
interface Notif {
  id:      number
  title:   string
  body:    string          // may contain HTML
  time:    string
  unread:  boolean
  icon:    React.ElementType
  iconBg:  string
  iconColor: string
  href:    string
}

const INITIAL_NOTIFS: Notif[] = [
  {
    id: 1,
    title: 'Critical Heat Alert',
    body: 'Rajesh Kumar (#0047) core temp reached <span class="text-red-600 font-bold">39.2°C</span>. Immediate action required.',
    time: '2m ago', unread: true,
    icon: Thermometer, iconBg: 'bg-red-100', iconColor: 'text-red-500',
    href: '/dashboard/tele-triage',
  },
  {
    id: 2,
    title: 'SOS / Fall Detected',
    body: 'Immediate assistance required for Vinay Barad in Zone A-2.',
    time: '8m ago', unread: true,
    icon: AlertTriangle, iconBg: 'bg-red-100', iconColor: 'text-red-500',
    href: '/dashboard/incidents',
  },
  {
    id: 3,
    title: 'Hydration Compliance',
    body: '3 workers in Zone B missed their scheduled 10:30 AM water break.',
    time: '15m ago', unread: true,
    icon: Droplets, iconBg: 'bg-orange-100', iconColor: 'text-orange-500',
    href: '/dashboard/compliance',
  },
  {
    id: 4,
    title: 'New Message from Dr. Sarah',
    body: '"I have cleared Ahmed to return to work. Hydration IV completed."',
    time: '1h ago', unread: true,
    icon: MessageSquare, iconBg: 'bg-blue-100', iconColor: 'text-blue-500',
    href: '/dashboard/messages',
  },
  {
    id: 5,
    title: 'Gateway Status',
    body: 'Zone C IoT Gateway has reconnected successfully.',
    time: '2h ago', unread: false,
    icon: Wifi, iconBg: 'bg-green-100', iconColor: 'text-[#00D15A]',
    href: '/dashboard/settings',
  },
  {
    id: 6,
    title: 'Zone Alert',
    body: 'Unauthorized entry detected in Crane Ops sector.',
    time: '3h ago', unread: false,
    icon: MapPin, iconBg: 'bg-gray-100', iconColor: 'text-gray-500',
    href: '/dashboard/map',
  },
  {
    id: 7,
    title: 'MOHRE Report Generated',
    body: 'Weekly Midday Break compliance report is ready for your review.',
    time: '5h ago', unread: false,
    icon: FileText, iconBg: 'bg-purple-100', iconColor: 'text-purple-500',
    href: '/dashboard/compliance',
  },
  {
    id: 8,
    title: 'Shift Started',
    body: 'Morning shift clock-in completed. 240/250 workers active.',
    time: '7h ago', unread: false,
    icon: Users, iconBg: 'bg-gray-100', iconColor: 'text-gray-500',
    href: '/dashboard',
  },
]

/* ── Brand mark ──────────────────────────────────────────────────── */
// BrandMark replaced by HeatGuardLogo import below

/* ── Header user type ────────────────────────────────────────────── */
interface HeaderUser {
  name?:   string | null
  email?:  string | null
  avatar?: string | null
}

/* ── Component ───────────────────────────────────────────────────── */
export function DashboardHeader({ user }: { user?: HeaderUser }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState('')
  const [isClockModalOpen, setIsClockModalOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL_NOTIFS)

  const unreadCount = notifs.filter(n => n.unread).length

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })))
  }

  function handleLogout() {
    startTransition(async () => {
      await logoutAction()
      router.push('/login')
      router.refresh()
    })
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'KM'

  return (
    <>
    <header
      className="h-14 shrink-0 flex items-center gap-4 px-5 z-30"
      style={{ backgroundColor: '#0C2A1F' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <HeatGuardLogo className="w-8 h-8" />
        <span className="font-bold text-base text-white hidden sm:block">
          HeatGuard<sup className="text-[9px] align-super">®</sup>
        </span>
      </div>

      {/* Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md lg:max-w-lg">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search Site, Employee ID, Claim #"
            className="w-full h-9 pl-4 pr-12 rounded-full text-[13px] text-white/90 placeholder:text-white/40 bg-white/10 border border-white/15 outline-none focus:border-white/30 focus:bg-white/15 transition-colors"
          />
          <button
            aria-label="Search"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-[#00D15A] rounded-full flex items-center justify-center hover:bg-[#00b84f] transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0">

        {/* ── Notification Bell with Popover ────────────────────── */}
        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger
            aria-label="Notifications"
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors outline-none"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-1 ring-[#0C2A1F]" />
            )}
          </PopoverPrimitive.Trigger>

          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
              <PopoverPrimitive.Popup className="w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-100 origin-(--transform-origin)">

                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h3 className="text-[14px] font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 text-red-600 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#00D15A] hover:text-green-700 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all as read
                  </button>
                </div>

                {/* Sub-header */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Today</p>
                </div>

                {/* Scrollable list */}
                <div className="overflow-y-auto max-h-[400px]">
                  {notifs.map((n) => {
                    const Icon = n.icon
                    return (
                      <Link
                        key={n.id}
                        href={n.href}
                        className={`flex gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors ${
                          n.unread
                            ? 'bg-[#E3FAED]/40 hover:bg-[#E3FAED]'
                            : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        {/* Icon circle */}
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${n.iconBg}`}>
                          <Icon className={`w-4 h-4 ${n.iconColor}`} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-1.5 min-w-0">
                              {n.unread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A] flex-shrink-0" />
                              )}
                              <p className="text-[12px] font-bold text-gray-900 truncate">{n.title}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">{n.time}</span>
                          </div>
                          <p
                            className="text-[11px] text-gray-500 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: n.body }}
                          />
                        </div>
                      </Link>
                    )
                  })}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100">
                  <button className="w-full py-3 text-[12px] font-semibold text-[#00D15A] hover:bg-gray-50 transition-colors">
                    View all notifications
                  </button>
                </div>

              </PopoverPrimitive.Popup>
            </PopoverPrimitive.Positioner>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        {/* Menu icon */}
        <button
          aria-label="Menu"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <AlignJustify className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-white/15" />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="User menu"
            className="flex items-center gap-2.5 px-1 py-1 rounded-xl hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00D15A]"
          >
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarImage src={user?.avatar ?? undefined} />
              <AvatarFallback className="bg-[#1a4a36] text-[#00D15A] text-[11px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left leading-tight">
              <p className="text-[13px] font-semibold text-white leading-none">
                {user?.name ?? 'Mohaned Elahwal'}
              </p>
              <p className="text-[11px] text-[#00D15A] mt-0.5 leading-none">Site Supervisor</p>
            </div>
            <ChevronDown className="w-3 h-3 text-white/40 hidden lg:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 shadow-lg">

            <div className="flex items-center gap-3 px-2 py-2.5 mb-1">
              <Avatar className="w-9 h-9 shrink-0">
                <AvatarImage src={user?.avatar ?? undefined} />
                <AvatarFallback className="bg-[#0B281F] text-[#00D15A] text-[11px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name ?? 'Mohaned Elahwal'}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {user?.email ?? 'mohaned@heatguard.ae'}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                <User className="w-4 h-4 mr-2 text-gray-400" />Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/security')}>
                <Shield className="w-4 h-4 mr-2 text-gray-400" />Security
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/timeline')}>
                <History className="w-4 h-4 mr-2 text-gray-400" />Timeline
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTimeout(() => setIsClockModalOpen(true), 0)}>
                <Timer className="w-4 h-4 mr-2 text-[#00D15A]" />
                <span className="text-[#00D15A] font-semibold">Clock-in / Clock-out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/dashboard/documentation')}>
                <BookOpen className="w-4 h-4 mr-2 text-gray-400" />Documentation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/support')}>
                <LifeBuoy className="w-4 h-4 mr-2 text-gray-400" />Help &amp; Support
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={isPending}
                className="text-red-600 focus:text-red-600"
              >
                {isPending
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <LogOut className="w-4 h-4 mr-2" />}
                Log out
              </DropdownMenuItem>
            </DropdownMenuGroup>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <ClockModal
      open={isClockModalOpen}
      onOpenChange={setIsClockModalOpen}
      userName={user?.name ?? 'Mohaned Elahwal'}
    />
    </>
  )
}
