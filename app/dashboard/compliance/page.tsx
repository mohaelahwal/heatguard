'use client'

import { useState, useCallback, useEffect, Fragment } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  Droplets,
  Award,
  Clock,
  ClipboardList,
  Building2,
  Search,
  BadgeCheck,
  Shield,
  FileDown,
  Share2,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  CalendarClock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ToastMsg {
  id: number
  message: string
  type: 'success' | 'info'
}

type WorkflowStatus = 'done' | 'active' | 'pending'

interface WorkflowStep {
  id: number
  icon: React.ElementType
  label: string
  sublabel: string
  status: WorkflowStatus
}

interface ReportingEntity {
  id: number
  name: string
  type: 'Government' | 'Insurance'
  syncFrequency: 'Daily' | 'Weekly' | 'Monthly'
  autoSubmit: boolean
}

// ── Data ──────────────────────────────────────────────────────────────────────

const MIDDAY_DATA = [
  { day: 'Mon 24', compliant: 18, violation: 2 },
  { day: 'Tue 25', compliant: 21, violation: 1 },
  { day: 'Wed 26', compliant: 16, violation: 5 },
  { day: 'Thu 27', compliant: 20, violation: 3 },
  { day: 'Fri 28', compliant: 23, violation: 0 },
  { day: 'Sat 29', compliant: 19, violation: 2 },
  { day: 'Sun 30', compliant: 22, violation: 1 },
]

const SCORE_DONUT = [
  { value: 91.4, fill: '#00D15A' },
  { value: 8.6,  fill: '#F3F4F6' },
]

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 1, icon: Clock,        label: 'AI Log Capture',          sublabel: 'Continuous · AI-verified',    status: 'done'    },
  { id: 2, icon: ClipboardList,label: 'HSE Manager Review',      sublabel: 'Audit prep · In Progress',    status: 'active'  },
  { id: 3, icon: Building2,    label: 'MOHRE Submission',        sublabel: 'Digital regulator portal',    status: 'pending' },
  { id: 4, icon: Search,       label: 'Verification Window',     sublabel: '3–12 month evaluation',       status: 'pending' },
  { id: 5, icon: BadgeCheck,   label: 'Certificate Issued',      sublabel: 'Safe site status active',     status: 'pending' },
  { id: 6, icon: Shield,       label: 'Insurance Premium Unlock',sublabel: 'Certified data shared',       status: 'pending' },
]

const AUDIT_LOGS = [
  { time: '12:31', worker: 'Rajesh Kumar',       badge: '#0047', crew: 'Crew Alpha',   event: 'Midday Break Enforced', status: 'Compliant' },
  { time: '12:35', worker: 'Ahmad Al-Farsi',     badge: '#0023', crew: 'Crew Bravo',   event: 'Midday Break Enforced', status: 'Compliant' },
  { time: '12:44', worker: 'Carlos Mendez',      badge: '#0061', crew: 'Crew Delta',   event: 'Midday Violation',      status: 'Violation' },
  { time: '13:02', worker: 'Mohammed Al-Rashid', badge: '#0038', crew: 'Crew Alpha',   event: 'Heat Break Enforced',   status: 'Compliant' },
  { time: '13:15', worker: 'Priya Sharma',       badge: '#0055', crew: 'Crew Charlie', event: 'SOS Triggered',         status: 'Violation' },
  { time: '13:28', worker: 'Yusuf Ibrahim',      badge: '#0029', crew: 'Crew Bravo',   event: 'Heat Break Enforced',   status: 'Compliant' },
  { time: '14:00', worker: 'Tran Van Duc',       badge: '#0072', crew: 'Crew Delta',   event: 'Midday Break Enforced', status: 'Compliant' },
  { time: '14:12', worker: 'Omar Khalil',        badge: '#0044', crew: 'Crew Charlie', event: 'Midday Violation',      status: 'Violation' },
]

// Detail-modal data per card
const VIOLATION_DETAIL = [
  { time: '12:44', worker: 'Carlos Mendez',      badge: '#0061', crew: 'Crew Delta',   event: 'Midday Violation'  },
  { time: '13:15', worker: 'Priya Sharma',       badge: '#0055', crew: 'Crew Charlie', event: 'SOS Triggered'     },
  { time: '14:12', worker: 'Omar Khalil',        badge: '#0044', crew: 'Crew Charlie', event: 'Midday Violation'  },
  { time: '09:33', worker: 'Bala Krishnan',      badge: '#0081', crew: 'Crew Alpha',   event: 'Midday Violation'  },
  { time: '10:05', worker: 'Hasan Yilmaz',       badge: '#0093', crew: 'Crew Delta',   event: 'Heat Stress Alert' },
]

const HYDRATION_DETAIL = [
  { time: '08:00', worker: 'Tran Van Duc',        badge: '#0072', crew: 'Crew Delta',   event: 'Missed Hydration Log'  },
  { time: '08:00', worker: 'Nabil Mansour',       badge: '#0019', crew: 'Crew Bravo',   event: 'Missed Hydration Log'  },
  { time: '10:00', worker: 'Ali Hassan',          badge: '#0033', crew: 'Crew Alpha',   event: 'Missed Hydration Log'  },
  { time: '10:00', worker: 'George Petridis',     badge: '#0086', crew: 'Crew Charlie', event: 'Missed Hydration Log'  },
  { time: '12:00', worker: 'Farhan Iqbal',        badge: '#0058', crew: 'Crew Bravo',   event: 'Missed Hydration Log'  },
  { time: '12:00', worker: 'David Osei',          badge: '#0067', crew: 'Crew Delta',   event: 'Missed Hydration Log'  },
  { time: '14:00', worker: 'Ricardo Pereira',     badge: '#0041', crew: 'Crew Alpha',   event: 'Missed Hydration Log'  },
]

const INITIAL_ENTITIES: ReportingEntity[] = [
  { id: 1, name: 'MOHRE Dubai',          type: 'Government', syncFrequency: 'Daily',   autoSubmit: true  },
  { id: 2, name: 'AXA Insurance Gulf',   type: 'Insurance',  syncFrequency: 'Weekly',  autoSubmit: true  },
  { id: 3, name: 'Dubai Municipality',   type: 'Government', syncFrequency: 'Monthly', autoSubmit: false },
  { id: 4, name: 'Oman Re Insurance',    type: 'Insurance',  syncFrequency: 'Weekly',  autoSubmit: false },
]

// ── Primitives ─────────────────────────────────────────────────────────────────

/** Inline toggle switch — no extra dep needed */
function Switch({
  checked,
  onCheckedChange,
  ariaLabel,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  ariaLabel?: string
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D15A] focus:ring-offset-2 ${
        checked ? 'bg-[#00D15A]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

/** Inline progress bar */
function Progress({
  value,
  accentClass = 'bg-[#00D15A]',
  bgClass = 'bg-gray-100',
}: {
  value: number
  accentClass?: string
  bgClass?: string
}) {
  return (
    <div className={`w-full h-2 rounded-full overflow-hidden ${bgClass}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${accentClass}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({
  id,
  message,
  type,
  onDismiss,
}: {
  id: number
  message: string
  type: 'success' | 'info'
  onDismiss: (id: number) => void
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), 3500)
    return () => clearTimeout(timer)
  }, [id, onDismiss])

  return (
    <div
      role="alert"
      className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgb(0,0,0,0.12)] border border-gray-100 max-w-sm animate-in slide-in-from-right duration-300"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          type === 'success' ? 'bg-green-50' : 'bg-blue-50'
        }`}
      >
        <CheckCircle2
          className={`w-4 h-4 ${type === 'success' ? 'text-[#00D15A]' : 'text-blue-500'}`}
        />
      </div>
      <p className="text-sm font-medium text-gray-900 flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        aria-label="Dismiss notification"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Workflow Timeline ──────────────────────────────────────────────────────────

function WorkflowTimeline() {
  return (
    <div className="flex items-start">
      {WORKFLOW_STEPS.map((step, i) => {
        const Icon = step.icon
        const isDone = step.status === 'done'
        const isActive = step.status === 'active'
        const prevStep = i > 0 ? WORKFLOW_STEPS[i - 1] : null

        return (
          <Fragment key={step.id}>
            {i > 0 && (
              <div
                className={`flex-1 h-0.5 mt-6 ${
                  prevStep?.status === 'done' ? 'bg-[#00D15A]' : 'bg-gray-200'
                }`}
              />
            )}
            <div className="flex flex-col items-center" style={{ minWidth: '100px' }}>
              <div className="relative">
                {isActive && (
                  <span className="absolute -inset-2 rounded-full motion-safe:animate-ping bg-orange-300/50" />
                )}
                <div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all ${
                    isDone
                      ? 'bg-[#00D15A] text-white'
                      : isActive
                      ? 'bg-white border-2 border-orange-500 text-orange-500'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 text-center px-2">
                <p className={`text-xs font-semibold leading-tight ${isDone || isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{step.sublabel}</p>
                {isActive && (
                  <span className="mt-1.5 inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 motion-safe:animate-pulse inline-block" />
                    Active
                  </span>
                )}
                {isDone && (
                  <span className="mt-1.5 inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </div>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

// ── Report Previews ────────────────────────────────────────────────────────────

function PdfPreview() {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      <div className="bg-[#0C2A1F] rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <div className="w-28 h-2 bg-white/40 rounded-full mb-1.5" />
          <div className="w-20 h-1.5 bg-white/20 rounded-full" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#00D15A]/30 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[#00D15A]" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-12 bg-gray-300 rounded-full" />
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-2.5 border border-gray-100">
            <div className="w-full h-1.5 bg-gray-200 rounded-full mb-1.5" />
            <div className="w-2/3 h-1.5 bg-gray-100 rounded-full mb-1" />
            <div className="w-1/2 h-1 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-3 py-2 grid grid-cols-4 gap-2">
          {['Time', 'Worker', 'Event', 'Status'].map((h) => (
            <div key={h} className="h-1.5 bg-gray-300 rounded-full" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-3 py-2 grid grid-cols-4 gap-2 border-t border-gray-50">
            <div className="h-1.5 bg-gray-100 rounded-full" />
            <div className="h-1.5 bg-gray-100 rounded-full" />
            <div className="h-1.5 bg-gray-100 rounded-full" />
            <div className={`h-1.5 rounded-full ${i === 1 || i === 3 ? 'bg-red-200' : 'bg-green-200'}`} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2.5 bg-[#00D15A]/10 border border-[#00D15A]/20 rounded-xl py-3">
        <ShieldCheck className="w-5 h-5 text-[#00D15A]" />
        <div>
          <p className="text-[11px] font-bold text-[#00D15A]">HeatGuard Compliance Seal</p>
          <p className="text-[9px] text-gray-400">Digitally certified · Site A · 2026</p>
        </div>
      </div>
    </div>
  )
}

function CsvPreview() {
  const headers = ['timestamp', 'worker_id', 'crew', 'event_type', 'compliant', 'lat', 'lng']
  const rows = [
    ['2026-03-24 12:31', 'W-0047', 'Alpha', 'midday_break',     'true',  '24.9786', '55.0051'],
    ['2026-03-24 12:35', 'W-0023', 'Bravo', 'midday_break',     'true',  '24.9712', '54.9961'],
    ['2026-03-24 12:44', 'W-0061', 'Delta', 'midday_violation', 'false', '24.9820', '55.0120'],
    ['2026-03-24 13:02', 'W-0038', 'Alpha', 'heat_break',       'true',  '24.9786', '55.0051'],
    ['2026-03-24 13:15', 'W-0055', 'Charlie','sos_triggered',   'false', '24.9650', '54.9890'],
  ]

  return (
    <div className="bg-gray-50 rounded-2xl p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] font-mono">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((h) => (
                <th key={h} scope="col" className="text-left text-gray-500 pb-2 pr-4 font-semibold whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-white/60'}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`py-1.5 pr-4 whitespace-nowrap ${
                      ci === 4
                        ? cell === 'true'
                          ? 'text-[#00D15A] font-semibold'
                          : 'text-[#FF3B30] font-semibold'
                        : 'text-gray-600'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-gray-400 mt-3 text-center">
        Schema-validated · Ready for insurer upload
      </p>
    </div>
  )
}

// ── Incident Detail Modal ──────────────────────────────────────────────────────

type IncidentRow = { time: string; worker: string; badge: string; crew: string; event: string }

function IncidentModal({
  open,
  onClose,
  title,
  rows,
  onExport,
}: {
  open: boolean
  onClose: () => void
  title: string
  rows: IncidentRow[]
  onExport: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[42rem] shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle>{title}</DialogTitle>
            <button
              onClick={onExport}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </DialogHeader>

        <div className="mt-2 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Time', 'Worker Name', 'Badge ID', 'Crew', 'Event Type'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-2.5 px-4 first:pl-0"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 px-4 first:pl-0 text-xs font-mono text-gray-500 tabular-nums">{row.time}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{row.worker}</td>
                  <td className="py-3 px-4 text-xs font-mono text-gray-500">{row.badge}</td>
                  <td className="py-3 px-4 text-xs text-gray-500">{row.crew}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      {row.event}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CompliancePage() {
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  const [violationModalOpen, setViolationModalOpen] = useState(false)
  const [hydrationModalOpen, setHydrationModalOpen] = useState(false)
  const [entities, setEntities] = useState<ReportingEntity[]>(INITIAL_ENTITIES)

  const addToast = useCallback(
    (message: string, type: ToastMsg['type'] = 'success') => {
      setToasts((prev) => [...prev, { id: Date.now(), message, type }])
    },
    []
  )

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toggleAutoSubmit = useCallback((id: number, value: boolean) => {
    setEntities((prev) => prev.map((e) => (e.id === id ? { ...e, autoSubmit: value } : e)))
  }, [])

  const removeEntity = useCallback((id: number) => {
    setEntities((prev) => prev.filter((e) => e.id !== id))
  }, [])

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Toasts */}
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} message={t.message} type={t.type} onDismiss={removeToast} />
      ))}

      {/* Modals */}
      <IncidentModal
        open={violationModalOpen}
        onClose={() => setViolationModalOpen(false)}
        title="Detailed Incident Log — Midday Violations"
        rows={VIOLATION_DETAIL}
        onExport={() => { addToast('Exporting violation CSV…', 'info'); setViolationModalOpen(false) }}
      />
      <IncidentModal
        open={hydrationModalOpen}
        onClose={() => setHydrationModalOpen(false)}
        title="Detailed Incident Log — Missed Hydration"
        rows={HYDRATION_DETAIL}
        onExport={() => { addToast('Exporting hydration CSV…', 'info'); setHydrationModalOpen(false) }}
      />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Compliance &amp; Audit Readiness
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            GCC regulatory tracking · UAE MOHRE Midday Break Rule · Palm Jebel Ali Site A
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D15A] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D15A]" />
          </span>
          <span className="text-green-700 text-xs font-semibold">Live Monitoring</span>
        </div>
      </div>

      {/* ── Page-Level Tabs ───────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview">
        <TabsList className="mb-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reporting">Reporting Entities</TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                                        */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview">
          <div className="space-y-6 mt-2">

            {/* ── KPI Stat Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-5 gap-5">

              {/* 1 — Compliance Score with mini donut */}
              <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider leading-tight">
                    Compliance Score
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-[#00D15A]" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-3xl font-bold text-gray-900 tabular-nums">91.4%</p>
                    <p className="text-xs text-gray-400 mt-1">+3.2% vs last week</p>
                  </div>
                  {/* Mini donut */}
                  <div className="ml-auto flex-shrink-0">
                    <PieChart width={52} height={52}>
                      <Pie
                        data={SCORE_DONUT}
                        cx={22}
                        cy={22}
                        innerRadius={14}
                        outerRadius={22}
                        startAngle={90}
                        endAngle={-270}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {SCORE_DONUT.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </div>
                </div>
              </div>

              {/* 2 — Midday Violations (clickable) */}
              <button
                onClick={() => setViolationModalOpen(true)}
                className="text-left bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:border-red-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    Midday Violations
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">14</p>
                <p className="text-xs text-gray-400 mt-1">Past 7 days · 12:30–15:00</p>
                <p className="text-[11px] text-[#00D15A] font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  View details →
                </p>
              </button>

              {/* 3 — Missed Hydration (clickable) */}
              <button
                onClick={() => setHydrationModalOpen(true)}
                className="text-left bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] hover:border-yellow-200 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    Missed Hydration
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <Droplets className="w-4 h-4 text-[#FFCC00]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">7</p>
                <p className="text-xs text-gray-400 mt-1">Workers missed log today</p>
                <p className="text-[11px] text-[#00D15A] font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  View details →
                </p>
              </button>

              {/* 4 — MOHRE Certified Days */}
              <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    MOHRE Certified Days
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                    <Award className="w-4 h-4 text-[#00D15A]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">42</p>
                <p className="text-xs text-gray-400 mt-1">Consecutive compliant days</p>
              </div>

              {/* 5 — Next Submission deadline */}
              <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
                    Next Submission
                  </p>
                  <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                    <CalendarClock className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 tabular-nums">6 Days</p>
                <p className="text-xs text-gray-400 mt-1 mb-3">Deadline: April 6, 2026</p>
                <Progress value={85} accentClass="bg-orange-500" bgClass="bg-orange-100" />
              </div>

            </div>

            {/* ── Midday Break Chart ──────────────────────────────────────────── */}
            <div className="bg-[#E3FAED] rounded-3xl shadow-sm border-2 border-white overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/60">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Midday Break Enforcements</h2>
                  <p className="text-xs text-gray-600 mt-0.5">12:30 PM – 3:00 PM window · Past 7 days (Dubai)</p>
                </div>
                <div className="flex items-center gap-5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#00D15A] inline-block" />
                    <span className="text-gray-500">Compliant</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-[#FF3B30] inline-block" />
                    <span className="text-gray-500">Violation</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={MIDDAY_DATA} barGap={6} barCategoryGap="28%">
                    <CartesianGrid strokeDasharray="4 4" stroke="#c2ebd4" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                      cursor={{ fill: 'rgba(0,209,90,0.06)' }}
                    />
                    <Bar dataKey="compliant" name="Compliant" fill="#00D15A" radius={[6, 6, 0, 0]} barSize={48} />
                    <Bar dataKey="violation"  name="Violation"  fill="#FF3B30" radius={[6, 6, 0, 0]} barSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Workflow Timeline ───────────────────────────────────────────── */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Regulator &amp; Insurance Submission Workflow</h2>
                <p className="text-xs text-gray-400 mt-0.5">GCC heat stress compliance pipeline · UAE MOHRE certification path</p>
              </div>
              <div className="px-10 py-8">
                <WorkflowTimeline />
              </div>
            </div>

            {/* ── Report Guide + Audit Logs ───────────────────────────────────── */}
            <div className="grid grid-cols-12 gap-5">
              {/* Report Formatting Guide */}
              <div className="col-span-5 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-base font-semibold text-gray-900">Report Formatting Guide</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Visual preview of generated compliance reports</p>
                </div>
                <div className="p-5">
                  <Tabs defaultValue="pdf">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="pdf" className="flex-1">Regulator PDF</TabsTrigger>
                      <TabsTrigger value="csv" className="flex-1">Insurance CSV</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pdf"><PdfPreview /></TabsContent>
                    <TabsContent value="csv"><CsvPreview /></TabsContent>
                  </Tabs>
                </div>
              </div>

              {/* Audit Logs */}
              <div className="col-span-7 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Audit Logs</h2>
                    <p className="text-xs text-gray-400 mt-0.5">GCC midday enforcement events · Today</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToast('Generating certified PDF…', 'info')}
                      className="flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      Export PDF
                    </button>
                    <button
                      onClick={() => addToast('MOHRE integration link active', 'success')}
                      className="flex items-center gap-2 bg-[#00D15A] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-150 cursor-pointer shadow-lg shadow-[#00D15A]/30"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      Share with Regulator
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {['Time', 'Worker', 'Crew', 'Event Type', 'Status'].map((h) => (
                          <th key={h} scope="col" className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-4 first:px-5">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {AUDIT_LOGS.map((log, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-50 last:border-0">
                          <td className="py-3 px-5 text-xs font-mono text-gray-500 tabular-nums">{log.time}</td>
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">{log.worker}</td>
                          <td className="py-3 px-4 text-xs text-gray-500">{log.crew}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{log.event}</td>
                          <td className="py-3 px-4">
                            {log.status === 'Compliant' ? (
                              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                <CheckCircle2 className="w-3 h-3" />Compliant
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                                <XCircle className="w-3 h-3" />Violation
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* REPORTING ENTITIES TAB                                              */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <TabsContent value="reporting">
          <div className="space-y-6 mt-2">

            {/* Sub-header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Automated Reporting Integrations</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage entities that receive automated compliance reports from HeatGuard.
                </p>
              </div>
              <button
                onClick={() => addToast('Add entity form coming soon', 'info')}
                className="flex items-center gap-2 bg-[#00D15A] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-green-600 transition-colors duration-150 cursor-pointer shadow-lg shadow-[#00D15A]/30"
              >
                <Plus className="w-4 h-4" />
                Add New Entity
              </button>
            </div>

            {/* Entities Table */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">Connected Entities</h3>
                <p className="text-xs text-gray-400 mt-0.5">{entities.length} active integrations</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['Entity Name', 'Type', 'Sync Frequency', 'Auto-Submit', 'Actions'].map((h) => (
                        <th key={h} scope="col" className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {entities.map((entity) => (
                      <tr key={entity.id} className="hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 last:border-0">
                        {/* Entity name */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              entity.type === 'Government' ? 'bg-blue-50' : 'bg-purple-50'
                            }`}>
                              {entity.type === 'Government'
                                ? <Building2 className="w-4 h-4 text-blue-500" />
                                : <Shield className="w-4 h-4 text-purple-500" />
                              }
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{entity.name}</span>
                          </div>
                        </td>

                        {/* Type badge */}
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            entity.type === 'Government'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {entity.type}
                          </span>
                        </td>

                        {/* Sync frequency */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {entity.syncFrequency}
                          </div>
                        </td>

                        {/* Auto-submit switch */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={entity.autoSubmit}
                              onCheckedChange={(v) => toggleAutoSubmit(entity.id, v)}
                              ariaLabel={`Auto-submit for ${entity.name}`}
                            />
                            <span className={`text-xs font-medium ${entity.autoSubmit ? 'text-[#00D15A]' : 'text-gray-400'}`}>
                              {entity.autoSubmit ? 'On' : 'Off'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => addToast(`Editing ${entity.name}…`, 'info')}
                              aria-label={`Edit ${entity.name}`}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeEntity(entity.id)}
                              aria-label={`Remove ${entity.name}`}
                              className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-[#FF3B30] hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {entities.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-gray-400">
                          No reporting entities configured.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-[#00D15A]/5 border border-[#00D15A]/20 rounded-3xl px-6 py-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-[#00D15A]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-[#00D15A]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">End-to-end encrypted transmission</p>
                <p className="text-xs text-gray-500 mt-1">
                  All compliance data transmitted to government and insurance entities uses TLS 1.3 encryption and is digitally signed with the HeatGuard compliance seal. Reports are immutable once submitted.
                </p>
              </div>
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
