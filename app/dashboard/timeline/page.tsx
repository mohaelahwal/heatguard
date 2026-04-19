'use client'

import { cn } from '@/lib/utils'
import {
  CheckCircle2, Ambulance, Shield, AlertTriangle,
  LogIn, FileText, Bell, Thermometer, Users,
  Settings, Eye,
} from 'lucide-react'

type EventType = 'claim' | 'dispatch' | 'auth' | 'alert' | 'system' | 'report' | 'notification' | 'temp' | 'access' | 'settings'

interface TimelineEvent {
  id:      string
  time:    string
  date:    string
  title:   string
  detail:  string
  type:    EventType
}

const TYPE_CONFIG: Record<EventType, { icon: React.ElementType; ring: string; bg: string; icon_color: string }> = {
  claim:        { icon: CheckCircle2,  ring: 'ring-green-200',  bg: 'bg-[#E3FAED]',  icon_color: 'text-[#00D15A]'  },
  dispatch:     { icon: Ambulance,     ring: 'ring-red-200',    bg: 'bg-red-50',      icon_color: 'text-red-500'    },
  auth:         { icon: LogIn,         ring: 'ring-blue-200',   bg: 'bg-blue-50',     icon_color: 'text-blue-500'   },
  alert:        { icon: AlertTriangle, ring: 'ring-amber-200',  bg: 'bg-amber-50',    icon_color: 'text-amber-500'  },
  system:       { icon: Settings,      ring: 'ring-gray-200',   bg: 'bg-gray-100',    icon_color: 'text-gray-500'   },
  report:       { icon: FileText,      ring: 'ring-purple-200', bg: 'bg-purple-50',   icon_color: 'text-purple-500' },
  notification: { icon: Bell,          ring: 'ring-orange-200', bg: 'bg-orange-50',   icon_color: 'text-orange-500' },
  temp:         { icon: Thermometer,   ring: 'ring-red-200',    bg: 'bg-red-50',      icon_color: 'text-red-500'    },
  access:       { icon: Eye,           ring: 'ring-gray-200',   bg: 'bg-gray-100',    icon_color: 'text-gray-500'   },
  settings:     { icon: Users,         ring: 'ring-blue-200',   bg: 'bg-blue-50',     icon_color: 'text-blue-500'   },
}

const EVENTS: TimelineEvent[] = [
  { id: 'e01', time: '14:38', date: 'Today',       title: 'Dispatched ambulance for Rajesh Kumar',          detail: 'Badge #0047 · Zone B — Spine North · ETA 4 mins',             type: 'dispatch'     },
  { id: 'e02', time: '14:02', date: 'Today',       title: 'Approved medical claim CLM-2024-041',             detail: 'Mohammed Al-Rashid · Heat Stroke Grade III · AXA Gulf',       type: 'claim'        },
  { id: 'e03', time: '13:50', date: 'Today',       title: 'Changed Zone B status to High Alert',             detail: 'WBGT exceeded 42°C threshold · Palm Jebel Ali Site A',        type: 'alert'        },
  { id: 'e04', time: '11:17', date: 'Today',       title: 'Logged in from new IP address',                   detail: '212.93.14.7 · Dubai, UAE · Chrome 124 on MacBook Pro',        type: 'auth'         },
  { id: 'e05', time: '09:30', date: 'Today',       title: 'Reviewed incident report IR-2024-019',            detail: 'Heat exhaustion — Yusuf Ibrahim · Closed with recommendations', type: 'report'       },
  { id: 'e06', time: '08:15', date: 'Today',       title: 'Updated roster — 12 workers added to Site A',    detail: 'Batch import from Oracle HCM · Approved by HR',               type: 'settings'     },
  { id: 'e07', time: '16:44', date: 'Yesterday',   title: 'Triggered site-wide heat alert',                  detail: 'Zone C WBGT reached 43.2°C · All supervisors notified',       type: 'notification' },
  { id: 'e08', time: '15:02', date: 'Yesterday',   title: 'Acknowledged SOS — Binu Mathew',                  detail: 'Badge #0071 · Dizziness + tachycardia · Sent to Cooling Tent', type: 'dispatch'    },
  { id: 'e09', time: '12:30', date: 'Yesterday',   title: 'Submitted compliance report to MOHRE',            detail: 'Q2 2024 heat-safety audit · 300 workers · Ref: MOHRE-2024-Q2', type: 'report'      },
  { id: 'e10', time: '09:00', date: 'Yesterday',   title: 'Reset 2FA for team member Anita Verma',           detail: 'Medic role · Expo City Site · Action logged for audit',        type: 'system'       },
  { id: 'e11', time: '17:10', date: '30 Jun 2025', title: 'Core Temp threshold breach — auto-alert fired',   detail: 'Farrukh Tashkentov #0083 · 39.6°C · AI dispatched alert',    type: 'temp'         },
  { id: 'e12', time: '11:45', date: '30 Jun 2025', title: 'Accessed worker health record',                   detail: 'Rajesh Kumar #0047 · Pre-existing: Hypertension · Audit log', type: 'access'      },
]

// Group events by date
const grouped = EVENTS.reduce<Record<string, TimelineEvent[]>>((acc, ev) => {
  if (!acc[ev.date]) acc[ev.date] = []
  acc[ev.date].push(ev)
  return acc
}, {})

export default function TimelinePage() {
  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Timeline</h1>
          <p className="text-sm text-gray-500 mt-1">Chronological audit log of your platform actions — SOC 2 compliant.</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-[#E3FAED] text-[#007A38] border border-[#00D15A]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A]" />
          Tamper-proof log
        </span>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([date, events]) => (
          <div key={date}>
            {/* Date label */}
            <div className="flex items-center gap-3 mb-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">{date}</p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Events */}
            <div className="relative space-y-0">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-100" />

              {events.map((ev, i) => {
                const cfg = TYPE_CONFIG[ev.type]
                const Icon = cfg.icon
                return (
                  <div key={ev.id} className={cn('relative flex gap-4 pb-5', i === events.length - 1 && 'pb-0')}>
                    {/* Node */}
                    <div className={cn(
                      'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-white shadow-sm',
                      cfg.bg
                    )}>
                      <Icon className={cn('w-4 h-4', cfg.icon_color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 space-y-1 mt-0.5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900 leading-snug">{ev.title}</p>
                        <span className="text-[10px] font-mono text-gray-400 flex-shrink-0 mt-0.5">{ev.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{ev.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">
        Showing last 30 days · All times in GST (UTC+4) · Exported to SIEM on request
      </p>
    </div>
  )
}
