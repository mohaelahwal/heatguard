'use client'

import Link from 'next/link'
import { Activity, Coffee, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

const ALERTS = [
  {
    name: 'Khaled Saeed',
    badge: 'KS-0077',
    state: 'Critical',
    severity: 'critical' as const,
    time: '8 min ago',
  },
  {
    name: 'Rajesh Iyer',
    badge: 'RI-0118',
    state: 'Heat Danger',
    severity: 'danger' as const,
    time: '5 min ago',
  },
  {
    name: 'Tarek Haddad',
    badge: 'TH-0042',
    state: 'Heat Warning',
    severity: 'warning' as const,
    time: '2 min ago',
  },
]

const severityStyles = {
  warning: {
    dot: 'bg-[#FFCC00]',
    pill: 'bg-amber-50 text-amber-700',
    ring: 'ring-amber-200',
  },
  danger: {
    dot: 'bg-[#FF6B00]',
    pill: 'bg-orange-50 text-orange-700',
    ring: 'ring-orange-200',
  },
  critical: {
    dot: 'bg-[#FF3B30]',
    pill: 'bg-red-50 text-red-700',
    ring: 'ring-red-200',
  },
}

function Avatar({ initials, severity }: { initials: string; severity: keyof typeof severityStyles }) {
  const colors = {
    warning: 'bg-amber-100 text-amber-700',
    danger:  'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }
  return (
    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0', colors[severity])}>
      {initials}
    </div>
  )
}

export function LiveMonitoringCard() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Live Monitoring</h3>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#00D15A]">
          <span className="w-2 h-2 rounded-full bg-[#00D15A] animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <Activity className="w-4 h-4 text-[#00D15A] mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900 leading-none">204</p>
          <p className="text-[10px] text-gray-400 mt-1">On Shift</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <Coffee className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-gray-900 leading-none">34</p>
          <p className="text-[10px] text-gray-400 mt-1">On Break</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-3 text-center">
          <Bell className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <p className="text-xl font-bold text-red-600 leading-none">24</p>
          <p className="text-[10px] text-red-400 mt-1">Alerts</p>
        </div>
      </div>

      {/* Alert list */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Active Alerts
        </p>
        <div className="space-y-3">
          {ALERTS.map((alert) => {
            const styles = severityStyles[alert.severity]
            const initials = alert.name.split(' ').map(n => n[0]).join('')
            return (
              <Link
                key={alert.badge}
                href="/dashboard/incidents"
                className={cn(
                  'flex items-center gap-3 p-3 rounded-2xl bg-white cursor-pointer transition-all hover:shadow-md hover:ring-[#00D15A]',
                  alert.severity === 'critical' ? 'ring-2 ring-red-300' : `ring-1 ${styles.ring}`
                )}
              >
                <Avatar initials={initials} severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{alert.name}</p>
                  <p className="text-[10px] text-gray-400">{alert.badge}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', styles.pill)}>
                    {alert.state}
                  </span>
                  <span className="text-[10px] text-gray-400">{alert.time}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
