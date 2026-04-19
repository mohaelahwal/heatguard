'use client'

import { Building2, FlaskConical, TrendingUp, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell,
} from 'recharts'

/* ─── Mock Data ───────────────────────────────────────────────────── */
const MRR_DATA = [
  { month: 'Nov', mrr: 181000 },
  { month: 'Dec', mrr: 194500 },
  { month: 'Jan', mrr: 207000 },
  { month: 'Feb', mrr: 219000 },
  { month: 'Mar', mrr: 233800 },
  { month: 'Apr', mrr: 248500 },
]

const SUBSCRIPTION_DATA = [
  { name: 'Enterprise', value: 78,  color: '#8b5cf6' },
  { name: 'Pro',        value: 46,  color: '#3b82f6' },
  { name: 'Demo',       value: 18,  color: '#f97316' },
]

const STATS = [
  {
    label:   'Total Entities',
    value:   '142',
    sub:     'Registered companies',
    icon:    Building2,
    iconBg:  'bg-blue-500/10',
    iconClr: 'text-blue-400',
  },
  {
    label:   'Active Demos',
    value:   '18',
    sub:     'Trial accounts running',
    icon:    FlaskConical,
    iconBg:  'bg-amber-500/10',
    iconClr: 'text-amber-400',
  },
  {
    label:   'MRR',
    value:   '$248,500',
    sub:     'Monthly recurring revenue',
    icon:    TrendingUp,
    iconBg:  'bg-[#00D15A]/10',
    iconClr: 'text-[#00D15A]',
  },
]

/* ─── Shared tooltip style ────────────────────────────────────────── */
const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: 'rgba(10, 25, 21, 0.85)',
    backdropFilter:  'blur(10px)',
    borderColor:     'rgba(255,255,255,0.1)',
    color:           '#fff',
    borderRadius:    '12px',
    fontSize:        '12px',
  },
  cursor: { fill: 'rgba(255,255,255,0.03)' },
}

/* ─── Custom Pie Legend ───────────────────────────────────────────── */
function PieLegend() {
  const total = SUBSCRIPTION_DATA.reduce((s, d) => s + d.value, 0)
  return (
    <div className="flex flex-col gap-3 justify-center pl-6">
      {SUBSCRIPTION_DATA.map(d => (
        <div key={d.name} className="flex items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-sm text-gray-400">{d.name}</span>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-white tabular-nums">{d.value}</span>
            <span className="text-xs text-gray-600 ml-1.5">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        </div>
      ))}
      <div className="mt-1 pt-3 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-gray-500">Total</span>
        <span className="text-sm font-bold text-white tabular-nums">{total}</span>
      </div>
    </div>
  )
}

/* ─── Support Tickets ─────────────────────────────────────────────── */
type TicketStatus = 'Pending' | 'Solved' | 'Dismissed'
type AffectedSection = 'Tele-Triage' | 'IoT Hardware' | 'Compliance' | 'User Management'

interface Ticket {
  id:              string
  entityName:      string
  title:           string
  description:     string
  dateTime:        string
  status:          TicketStatus
  affectedSection: AffectedSection
}

const TICKETS: Ticket[] = [
  {
    id:              'TKT-0041',
    entityName:      'Emaar Properties',
    title:           'Tele-Triage video call drops after 30 seconds',
    description:     'Nurses report that all video calls to workers in Zone C are automatically disconnecting after approximately 30 seconds. Issue began after the latest firmware update on site sensors.',
    dateTime:        'Apr 5, 2026 · 08:14',
    status:          'Pending',
    affectedSection: 'Tele-Triage',
  },
  {
    id:              'TKT-0040',
    entityName:      'Nakheel',
    title:           'IoT sensor offline — Bay 4 construction site',
    description:     'Three heat sensors in Bay 4 have been reporting offline status since yesterday morning. Heat index readings for 47 workers are unavailable.',
    dateTime:        'Apr 4, 2026 · 14:52',
    status:          'Pending',
    affectedSection: 'IoT Hardware',
  },
  {
    id:              'TKT-0039',
    entityName:      'Aldar Properties',
    title:           'Compliance report export failing for Q1 2026',
    description:     'Managers are unable to export the Q1 compliance PDF. The download button triggers a spinner that never resolves. Affects all users on this entity.',
    dateTime:        'Apr 3, 2026 · 11:30',
    status:          'Solved',
    affectedSection: 'Compliance',
  },
  {
    id:              'TKT-0038',
    entityName:      'Meraas Holding',
    title:           'Unable to deactivate former worker accounts',
    description:     'Admin users report that the deactivate button in User Management has no effect. Accounts remain active after clicking and confirming the action.',
    dateTime:        'Apr 2, 2026 · 09:05',
    status:          'Solved',
    affectedSection: 'User Management',
  },
  {
    id:              'TKT-0037',
    entityName:      'DAMAC Holdings',
    title:           'Request to whitelist external IP for dashboard access',
    description:     'Entity admin requesting a static IP whitelist for their remote monitoring team. No technical fault — policy clarification needed.',
    dateTime:        'Mar 31, 2026 · 16:40',
    status:          'Dismissed',
    affectedSection: 'User Management',
  },
]

const STATUS_STYLES: Record<TicketStatus, string> = {
  Pending:   'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  Solved:    'bg-[#00D15A]/10 text-[#00D15A] border border-[#00D15A]/20',
  Dismissed: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
}

const STATUS_BORDER: Record<TicketStatus, string> = {
  Pending:   'border-l-orange-500',
  Solved:    'border-l-[#00D15A]',
  Dismissed: 'border-l-gray-500',
}

const ENTITY_COLOR: Record<string, string> = {
  'Emaar Properties':    'text-blue-400',
  'Nakheel':             'text-violet-400',
  'Aldar Properties':    'text-amber-400',
  'Meraas Holding':      'text-cyan-400',
  'DAMAC Holdings':      'text-rose-400',
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function HQOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-semibold text-[#00D15A]/60 uppercase tracking-widest mb-1">
          Super Admin
        </p>
        <h1 className="text-3xl font-semibold text-white tracking-wide">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide metrics and management.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(({ label, value, sub, icon: Icon, iconBg, iconClr }) => (
          <Card
            key={label}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,209,90,0.05)] ring-0 gap-3 hover:bg-white/[0.08] transition-all duration-300"
          >
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-400">{label}</CardTitle>
                <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${iconClr}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Bar Chart — Revenue Growth */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,209,90,0.05)] p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white tracking-wide">Revenue Growth</h2>
            <p className="text-xs text-gray-500 mt-0.5">Monthly recurring revenue — last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MRR_DATA} barSize={28} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                width={46}
              />
              <Tooltip
                {...TOOLTIP_STYLE}
                formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']}
              />
              <Bar dataKey="mrr" fill="#00D15A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart — Subscription Distribution */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,209,90,0.05)] p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-white tracking-wide">Client Subscription Distribution</h2>
            <p className="text-xs text-gray-500 mt-0.5">Active subscriptions by plan tier</p>
          </div>
          <div className="flex items-center" style={{ height: 220 }}>
            <div className="shrink-0" style={{ width: 200, height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SUBSCRIPTION_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {SUBSCRIPTION_DATA.map(entry => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE.contentStyle}
                    formatter={(v: number, name: string) => [v, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <PieLegend />
          </div>
        </div>

      </div>

      {/* Recent Support Tickets */}
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] gap-0">
        <CardHeader className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent Support Tickets</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest issues raised by client entities</p>
            </div>
            <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#00D15A] transition-colors duration-200">
              View All Tickets
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-0">
          {TICKETS.map(ticket => (
            <div key={ticket.id} className="border-b border-white/5 last:border-0">
              <div
                className={`flex items-start justify-between gap-6 py-4 hover:bg-white/5 transition-colors cursor-pointer rounded-lg px-3 -mx-2 border-l-4 ${STATUS_BORDER[ticket.status]}`}
              >
              {/* Left — title + entity + description */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-200 font-medium text-sm">{ticket.title}</span>
                  <span className={`text-xs font-medium shrink-0 ${ENTITY_COLOR[ticket.entityName] ?? 'text-gray-400'}`}>— {ticket.entityName}</span>
                </div>
                <p className="text-gray-400 text-sm mt-1 truncate max-w-2xl">{ticket.description}</p>
              </div>

              {/* Right — section pill, status badge, date */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="bg-white/5 border border-white/10 text-gray-300 text-xs px-2 py-1 rounded-md whitespace-nowrap">
                    {ticket.affectedSection}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap ${STATUS_STYLES[ticket.status]}`}>
                    {ticket.status}
                  </span>
                </div>
                <span className="text-gray-500 text-xs tabular-nums">{ticket.dateTime}</span>
              </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}
