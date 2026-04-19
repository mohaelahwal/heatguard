'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, Languages,
  MapPin, Heart, Thermometer, Wind, Activity, Sun,
  Ambulance, Snowflake, CheckCircle2, AlertTriangle,
  Clock, FileText, ArrowRight, ChevronRight,
  Building2, User, ShieldAlert, Loader2, Radio, Phone,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { DispatchModal } from '@/components/DispatchModal'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// ── Types & Data ─────────────────────────────────────────────────────────────

interface QueueWorker {
  id:       string
  name:     string
  badge:    string
  waitMins: number
  reason:   string
  severity: 'critical' | 'high' | 'warning'
  hr:       number
  temp:     number
}

interface Transfer {
  id:        string
  name:      string
  badge:     string
  hospital:  string
  time:      string
  diagnosis: string
  claimId:   string
}

const QUEUE: QueueWorker[] = [
  { id: 'q1', name: 'Rajesh Kumar',    badge: '#0047', waitMins: 2,  reason: 'Core Temp: 39.1°C',         severity: 'critical', hr: 118, temp: 39.1 },
  { id: 'q2', name: 'Yusuf Ibrahim',   badge: '#0029', waitMins: 7,  reason: 'SpO₂ drop: 91%',            severity: 'high',     hr: 104, temp: 38.4 },
  { id: 'q3', name: 'Binu Mathew',     badge: '#0071', waitMins: 12, reason: 'Dizziness + tachycardia',   severity: 'high',     hr: 99,  temp: 38.1 },
  { id: 'q4', name: 'Farrukh Tashkentov', badge: '#0083', waitMins: 18, reason: 'Self-reported chest pain', severity: 'warning', hr: 91,  temp: 37.6 },
]

const TRANSFERS: Transfer[] = [
  {
    id: 't1', name: 'Mohammed Al-Rashid', badge: '#0038',
    hospital: 'Mediclinic City Hospital', time: '11:42',
    diagnosis: 'Heat Stroke — Grade III',
    claimId: 'CLM-2024-038',
  },
  {
    id: 't2', name: 'Priya Sharma', badge: '#0055',
    hospital: 'NMC Royal Hospital DIP', time: '09:17',
    diagnosis: 'SOS — Cardiac Screening',
    claimId: 'CLM-2024-037',
  },
]

const SEVERITY_CONFIG = {
  critical: { pill: 'bg-red-100 text-red-700',    dot: 'bg-[#FF3B30]', ring: 'ring-red-200',    label: '🔴' },
  high:     { pill: 'bg-orange-100 text-orange-700', dot: 'bg-[#FF6B00]', ring: 'ring-orange-200', label: '🟠' },
  warning:  { pill: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-400', ring: 'ring-amber-200',  label: '🟡' },
}

// Temp graph data leading up to SOS
const TEMP_GRAPH = [
  { t: '13:30', v: 36.8 }, { t: '13:40', v: 37.0 }, { t: '13:50', v: 37.4 },
  { t: '14:00', v: 37.9 }, { t: '14:10', v: 38.3 }, { t: '14:20', v: 38.7 },
  { t: '14:30', v: 39.1 }, { t: '14:35', v: 39.4 }, { t: '14:38', v: 39.8 },
]

// Hydration data — full shift 06:00–14:00 (total 1.2 L, under 3.0 L target)
const HYDRATION_LOG = [
  { t: '06:00', ml: 350 },
  { t: '07:00', ml: 250 },
  { t: '08:00', ml: 200 },
  { t: '09:00', ml: 150 },
  { t: '10:00', ml: 100 },
  { t: '11:00', ml: 100 },
  { t: '12:00', ml: 50  },
  { t: '13:00', ml: 0   },
  { t: '14:00', ml: 0   },
]

const CLINICAL_NOTES =
  'Patient presents with extreme diaphoresis, dizziness, and tachycardia (118 BPM). Complains of chest tightness. Denies loss of consciousness. Immediate cooling protocol initiated on-site. Recommend IV fluids if symptoms persist.'

// ── Claim Report Modal ────────────────────────────────────────────────────────

function ClaimReportModal({
  transfer,
  open,
  onClose,
}: {
  transfer: Transfer | null
  open: boolean
  onClose: () => void
}) {
  if (!transfer) return null

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent
        showCloseButton
        className="sm:max-w-4xl shadow-2xl p-0 gap-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="px-7 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between pr-8">
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Incident &amp; Clinical Claim Report
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Sent to AXA Insurance Gulf · {transfer.claimId} · {transfer.name}
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#00D15A] bg-green-50 px-3 py-1.5 rounded-full border border-[#00D15A]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A]" />
              Submitted
            </span>
          </div>
        </DialogHeader>

        {/* 2-col body */}
        <div className="grid grid-cols-2 divide-x divide-gray-100">

          {/* Left — AI Environmental Log */}
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              {/* Gemini star */}
              <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
                <path d="M14 2C14 2 15.8 9.2 20.8 14C15.8 18.8 14 26 14 26C14 26 12.2 18.8 7.2 14C12.2 9.2 14 2 14 2Z" fill="url(#mr-v)"/>
                <path d="M2 14C2 14 9.2 12.2 14 7.2C18.8 12.2 26 14 26 14C26 14 18.8 15.8 14 20.8C9.2 15.8 2 14 2 14Z" fill="url(#mr-h)"/>
                <defs>
                  <linearGradient id="mr-v" x1="14" y1="2" x2="14" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4285F4"/><stop offset="1" stopColor="#8B5CF6"/>
                  </linearGradient>
                  <linearGradient id="mr-h" x1="2" y1="14" x2="26" y2="14" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA"/><stop offset="1" stopColor="#A78BFA"/>
                  </linearGradient>
                </defs>
              </svg>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                AI Environmental &amp; Biometric Log
              </p>
            </div>

            {/* Key events */}
            <div className="space-y-2.5">
              {[
                { label: 'Threshold Breached',       value: '14:28:03 GST',  accent: 'text-[#FF3B30]' },
                { label: 'Core Temp at SOS',          value: '39.8°C',        accent: 'text-[#FF3B30]' },
                { label: 'Max WBGT Recorded',         value: '43.2°C',        accent: 'text-orange-600' },
                { label: 'Last Break Taken',          value: '12:45 GST',     accent: 'text-gray-700' },
                { label: 'Continuous Exposure',       value: '103 minutes',   accent: 'text-orange-600' },
                { label: 'AI Alert Dispatched',       value: '14:28:05 GST',  accent: 'text-gray-700' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{row.label}</span>
                  <span className={cn('text-xs font-bold tabular-nums', row.accent)}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Temp graph */}
            <div>
              <p className="text-[10px] font-semibold text-gray-400 mb-2">Core Temp Trend (Pre-SOS)</p>
              <div className="rounded-2xl bg-gray-50 border border-gray-100 px-2 pt-3 pb-1">
                <ResponsiveContainer width="100%" height={110}>
                  <AreaChart data={TEMP_GRAPH} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#FF3B30" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[36, 40.5]} tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="°" />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #f3f4f6', padding: '6px 10px' }}
                      formatter={(v) => [`${v}°C`, 'Core Temp']}
                    />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#FF3B30"
                      strokeWidth={2}
                      fill="url(#tempGrad)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#FF3B30' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hydration Compliance Log */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-px bg-gray-100" />
                <p className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">
                  Hydration Compliance Log (Pre-Incident)
                </p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="rounded-2xl bg-gray-50 border border-gray-100 px-2 pt-3 pb-1">
                <ResponsiveContainer width="100%" height={90}>
                  <BarChart data={HYDRATION_LOG} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={12}>
                    <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 600]} unit="ml" />
                    <XAxis dataKey="t" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 11, borderRadius: 10, border: '1px solid #f3f4f6', padding: '6px 10px' }}
                      formatter={(v) => [`${v}ml`, 'Intake']}
                    />
                    <ReferenceLine
                      y={500}
                      stroke="#F59E0B"
                      strokeDasharray="4 3"
                      strokeWidth={1.5}
                      label={{ value: 'Min. 500ml/hr', position: 'insideTopRight', fontSize: 8, fill: '#F59E0B' }}
                    />
                    <Bar dataKey="ml" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right — Nurse Clinical Assessment */}
          <div className="p-6 space-y-5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              Triage Nurse Report
            </p>

            {/* Worker quick info */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-[#0B281F] text-[#00D15A] flex items-center justify-center font-bold text-sm flex-shrink-0">
                {transfer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{transfer.name}</p>
                <p className="text-xs text-gray-400">{transfer.badge} · {transfer.diagnosis}</p>
              </div>
            </div>

            {/* Clinical notes */}
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Nurse Clinical Notes</p>
              <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
                {CLINICAL_NOTES}
              </div>
            </div>

            {/* Actions taken */}
            <div className="space-y-2.5">
              {[
                { label: 'Action Taken',        value: 'Ambulance Dispatched',      color: 'text-[#FF3B30]', bg: 'bg-red-50',   icon: <Ambulance className="w-3.5 h-3.5 text-red-500" /> },
                { label: 'Dispatch Time',        value: '14:02 GST',                 color: 'text-gray-700',  bg: 'bg-gray-50',  icon: <Clock      className="w-3.5 h-3.5 text-gray-400" /> },
                { label: 'Receiving Hospital',   value: transfer.hospital,           color: 'text-blue-700',  bg: 'bg-blue-50',  icon: <Building2  className="w-3.5 h-3.5 text-blue-500" /> },
                { label: 'Attending Physician',  value: 'Dr. Anita Verma, ER',       color: 'text-gray-700',  bg: 'bg-gray-50',  icon: <User       className="w-3.5 h-3.5 text-gray-400" /> },
              ].map(row => (
                <div key={row.label} className={cn('flex items-center gap-3 rounded-xl px-3.5 py-2.5 border border-transparent', row.bg)}>
                  {row.icon}
                  <span className="text-xs text-gray-500 flex-1">{row.label}</span>
                  <span className={cn('text-xs font-bold', row.color)}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between rounded-b-xl">
          <p className="text-xs text-gray-400">Generated by HeatGuard AI · {new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</p>
          <div className="flex gap-2">
            <DialogClose className="text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
              Close
            </DialogClose>
            <button className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-700 transition-colors cursor-pointer">
              Open Claim in Claims Hub
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


// ── Page ─────────────────────────────────────────────────────────────────────

export default function TeleTriagePage() {
  const [activeWorker,       setActiveWorker]       = useState<QueueWorker>(QUEUE[0])
  const [claimTransfer,      setClaimTransfer]      = useState<Transfer | null>(null)
  const [isMuted,            setIsMuted]            = useState(false)
  const [isCamOff,           setIsCamOff]           = useState(false)
  const [notes,              setNotes]              = useState(CLINICAL_NOTES)
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">

      {/* Dispatch modal */}
      <DispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        patient={{
          name:      activeWorker.name,
          badge:     activeWorker.badge,
          zone:      'Zone B — Spine North',
          gps:       '25.2048°N · 55.2718°E',
          wbgt:      43.2,
          heartRate: activeWorker.hr,
          type:      'Heat Stress',
        }}
      />

      {/* Claim report modal */}
      <ClaimReportModal
        transfer={claimTransfer}
        open={!!claimTransfer}
        onClose={() => setClaimTransfer(null)}
      />

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Tele-Triage &amp; Virtual Clinic
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Remote occupational health consultations · Palm Jebel Ali Site A · Live
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100">
            <span className="w-2 h-2 rounded-full bg-[#FF3B30] animate-pulse" />
            {QUEUE.length} in triage queue
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#E3FAED] text-[#007A38] border border-[#00D15A]/20">
            <span className="w-2 h-2 rounded-full bg-[#00D15A]" />
            Doctor Online
          </span>
        </div>
      </div>

      {/* ── 3-Column Layout ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-5 items-start">

        {/* ── LEFT: Triage Queue ─────────────────────────────────────────── */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* Queue header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Active Queue</h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Sorted by priority
            </span>
          </div>

          {/* Queue cards */}
          <div className="space-y-2.5">
            {QUEUE.map((w) => {
              const cfg = SEVERITY_CONFIG[w.severity]
              const isActive = activeWorker.id === w.id
              return (
                <button
                  key={w.id}
                  onClick={() => setActiveWorker(w)}
                  className={cn(
                    'w-full text-left rounded-2xl p-3.5 ring-1 transition-all cursor-pointer',
                    isActive
                      ? 'bg-[#0B281F] ring-[#00D15A]/40 shadow-lg shadow-[#00D15A]/10'
                      : cn('bg-white hover:bg-gray-50', cfg.ring)
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Avatar */}
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                      isActive ? 'bg-[#00D15A]/20 text-[#00D15A]' : 'bg-[#0B281F] text-[#00D15A]'
                    )}>
                      {w.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-bold truncate', isActive ? 'text-white' : 'text-gray-900')}>
                        {w.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className={cn('w-3 h-3', isActive ? 'text-[#00D15A]/70' : 'text-gray-400')} />
                        <span className={cn('text-[10px]', isActive ? 'text-[#00D15A]/70' : 'text-gray-400')}>
                          Wait: {w.waitMins}m
                        </span>
                      </div>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#00D15A] animate-pulse flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-2.5">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full',
                      isActive ? 'bg-[#FF3B30]/20 text-red-300' : cfg.pill
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-red-400' : cfg.dot)} />
                      {cfg.label} {w.reason}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Hospital Transfers Today
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Transfers */}
          <div className="space-y-2.5">
            {TRANSFERS.map((tr) => (
              <div
                key={tr.id}
                className="bg-white rounded-2xl p-3.5 border border-gray-100 space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0B281F] text-[#00D15A] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {tr.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{tr.name}</p>
                    <p className="text-[10px] text-gray-400">{tr.badge}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{tr.time}</span>
                </div>
                <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-500 truncate">{tr.diagnosis}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <p className="text-[10px] text-gray-400 truncate">{tr.hospital}</p>
                  </div>
                </div>
                <button
                  onClick={() => setClaimTransfer(tr)}
                  className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl py-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  📄 View Claim Report
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* ── MIDDLE: Video Consultation ─────────────────────────────────── */}
        <div className="col-span-6 flex flex-col">

          {/* 1. Vitals KPI Cards — z-20 + translate-y bites into video top edge */}
          <div className="flex gap-2.5 relative z-20 translate-y-6 px-1">

            {/* Heart Rate */}
            <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-red-100 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Heart Rate</span>
              </div>
              <p className="text-xl font-black text-red-500 tabular-nums leading-none">
                118<span className="text-xs font-medium text-gray-400 ml-0.5">bpm</span>
              </p>
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Elevated
              </span>
            </div>

            {/* Core Temp */}
            <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-red-100 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Core Temp</span>
              </div>
              <p className="text-xl font-black text-red-500 tabular-nums leading-none">
                39.1<span className="text-xs font-medium text-gray-400 ml-0.5">°C</span>
              </p>
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Elevated
              </span>
            </div>

            {/* SpO₂ */}
            <div className="flex-1 bg-red-50 rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-red-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">SpO₂</span>
              </div>
              <p className="text-xl font-black text-red-600 tabular-nums leading-none">
                94<span className="text-xs font-medium text-red-400 ml-0.5">%</span>
              </p>
            </div>

            {/* WBGT */}
            <div className="flex-1 bg-white rounded-2xl p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.18)] border border-red-100 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">WBGT</span>
              </div>
              <p className="text-xl font-black text-red-500 tabular-nums leading-none">
                43.2<span className="text-xs font-medium text-gray-400 ml-0.5">°C</span>
              </p>
              <span className="text-[9px] font-bold text-red-500 flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> Elevated
              </span>
            </div>

          </div>

          {/* 2. Video Stage */}
          <div className="relative rounded-3xl overflow-hidden bg-[#0B1A14] shadow-[0_8px_40px_rgb(0,0,0,0.3)] aspect-video">

            {/* Main worker feed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.istockphoto.com/id/1334826526/photo/exhausted-construction-worker-at-construction-site.jpg?s=612x612&w=0&k=20&c=9m080LVcGNUmY4CHT-Iw7psdPAN9xy9m7wXxNL9sjgA="
              alt="Worker video feed"
              className={cn(
                'w-full h-full object-cover',
                isCamOff && 'opacity-0'
              )}
            />

            {/* Cam-off overlay */}
            {isCamOff && (
              <div className="absolute inset-0 bg-[#0B1A14] flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-[#0B281F] flex items-center justify-center text-2xl font-bold text-[#00D15A]">
                  {activeWorker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <p className="text-sm text-gray-400 font-medium">Camera disabled</p>
              </div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20 pointer-events-none" />

            {/* Worker name overlay — top-left */}
            <div className="absolute top-12 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
                {activeWorker.name} · {activeWorker.badge}
              </span>
            </div>

            {/* AI subtitle bar — full-width bottom */}
            <div className="absolute bottom-3 left-3 right-3 bg-black/65 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-white/10">
              <p className="text-[9px] text-[#60A5FA] font-semibold mb-0.5 flex items-center gap-1">
                🌐 Hindi → English · AI Subtitle
              </p>
              <p className="text-xs text-white font-medium leading-snug">
                &quot;My chest feels tight and I am dizzy.&quot;
              </p>
            </div>

          </div>

          {/* 3. Call Controls bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-center justify-center gap-3 mt-3">
            <button
              onClick={() => setIsMuted(m => !m)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer',
                isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              )}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-[9px] font-semibold">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button
              onClick={() => setIsCamOff(c => !c)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl transition-colors cursor-pointer',
                isCamOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              )}
            >
              {isCamOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              <span className="text-[9px] font-semibold">{isCamOff ? 'Enable Cam' : 'Disable Cam'}</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer">
              <Languages className="w-4 h-4" />
              <span className="text-[9px] font-semibold">Interpreter</span>
            </button>
            <button className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl bg-[#FF3B30] hover:bg-red-600 text-white transition-colors cursor-pointer ml-2 shadow-md shadow-[#FF3B30]/30">
              <PhoneOff className="w-4 h-4" />
              <span className="text-[9px] font-semibold">End Call</span>
            </button>
          </div>

          {/* 4. Nurse Info / PIP Card */}
          <div className="bg-white rounded-3xl p-4 border-2 border-[#00D15A]/40 shadow-sm flex items-center gap-4 mt-3">
            <div className="w-[88px] h-[68px] rounded-2xl overflow-hidden flex-shrink-0 border-2 border-[#00D15A]/40 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/051/804/323/small/happy-muslim-islamic-woman-doctor-arabian-girl-female-practitioner-adviser-in-hijab-look-at-webcam-talk-at-distance-online-consultation-use-distant-teach-medical-service-give-professional-advice-photo.jpg"
                alt="Dr. Sarah Mansfield"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">Dr. Sarah Mansfield</p>
              <p className="text-xs text-gray-500">On-site Site Physician</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Physician providing on-site consultation</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full bg-[#E3FAED] text-[#007A38] border border-[#00D15A]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A] animate-pulse" />
                Live
              </span>
              <span className="text-[10px] text-gray-400">MBBS · MRCP</span>
            </div>
          </div>

        </div>

        {/* ── RIGHT: Clinical Record & Dispatch ─────────────────────────── */}
        <div className="col-span-3 flex flex-col gap-4">

          {/* Worker profile */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0B281F] text-[#00D15A] flex items-center justify-center font-bold text-base flex-shrink-0">
                {activeWorker.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{activeWorker.name}</p>
                <p className="text-xs text-gray-400">{activeWorker.badge} · Age 34</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full',
                    SEVERITY_CONFIG[activeWorker.severity].pill
                  )}>
                    {SEVERITY_CONFIG[activeWorker.severity].label} {activeWorker.severity.charAt(0).toUpperCase() + activeWorker.severity.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-medium">GPS Location</p>
                <p className="text-xs font-semibold text-gray-700 truncate">Zone B — Spine North · L4</p>
                <p className="text-[10px] font-mono text-gray-400">25.2048°N 55.2718°E</p>
              </div>
            </div>

            {/* Medical alert */}
            <div className="flex items-center gap-2.5 bg-amber-50 rounded-xl px-3.5 py-2.5 border border-amber-200">
              <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-black text-amber-700 uppercase tracking-wide">Pre-existing Condition</p>
                <p className="text-xs font-semibold text-amber-800 mt-0.5">⚠️ Hypertension</p>
              </div>
            </div>

          </div>

          {/* Hydration Log */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-700">💧 Today&apos;s Hydration Log</p>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                1.2L / 3.0L
              </span>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={HYDRATION_LOG} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barSize={13}>
                  <YAxis hide domain={[0, 600]} />
                  <XAxis dataKey="t" tick={{ fontSize: 7.5, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 10, borderRadius: 8, border: '1px solid #f3f4f6', padding: '4px 8px' }}
                    formatter={(v) => [`${v}ml`, 'Intake']}
                  />
                  <ReferenceLine
                    y={500}
                    stroke="#F59E0B"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{ value: '500ml req.', position: 'insideTopRight', fontSize: 8, fill: '#F59E0B' }}
                  />
                  <Bar dataKey="ml" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clinical notes */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-700">Clinical Notes</p>
              <span className="text-[10px] text-gray-400">Auto-saved</span>
            </div>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="text-xs leading-relaxed text-gray-700 bg-gray-50 border-gray-200 rounded-xl min-h-[120px] resize-none focus-visible:border-[#00D15A] focus-visible:ring-[#00D15A]/20"
            />
          </div>

          {/* Dispatch actions */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
            <p className="text-xs font-bold text-gray-700">Dispatch Action</p>

            <button
              onClick={() => setIsDispatchModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#FF3B30] hover:bg-red-600 text-white transition-colors cursor-pointer shadow-lg shadow-[#FF3B30]/30 group"
            >
              <Ambulance className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="text-sm font-bold leading-none">Dispatch Site Ambulance</p>
                <p className="text-[10px] mt-0.5 text-red-200">ETA ~4 mins · Zone B</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-lg shadow-blue-600/25 group">
              <Snowflake className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="text-sm font-bold leading-none">Direct to Cooling Tent</p>
                <p className="text-[10px] mt-0.5 text-blue-200">Tent 2 · 60m from Zone B</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#00D15A] hover:bg-green-600 text-white transition-colors cursor-pointer shadow-lg shadow-[#00D15A]/25 group">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div className="text-left flex-1">
                <p className="text-sm font-bold leading-none">Clear to Resume Work</p>
                <p className="text-[10px] mt-0.5 text-green-100">Log clearance &amp; close case</p>
              </div>
              <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
