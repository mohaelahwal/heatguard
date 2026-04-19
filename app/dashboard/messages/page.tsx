'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Search,
  Plus,
  Phone,
  Mic,
  Paperclip,
  Send,
  MapPin,
  AlertTriangle,
  Radio,
  Heart,
  Thermometer,
  Navigation,
  Zap,
  ShieldAlert,
  Play,
  Volume2,
  Users,
  ChevronRight,
  Camera,
  TriangleAlert,
  Siren,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { Metadata } from 'next'

// ── Types ─────────────────────────────────────────────────────────────────────

type WorkerStatus = 'shift' | 'break' | 'offline' | 'sos'

type MessageType = 'text' | 'voice' | 'hazard' | 'system'

interface Worker {
  id:       string
  name:     string
  badge:    string
  role:     string
  location: string
  status:   WorkerStatus
  hr:       number
  temp:     number
  unread?:  number
}

interface Channel {
  id:       string
  label:    string
  icon:     string
  type:     'emergency' | 'site'
  unread?:  number
}

interface Message {
  id:           string
  from:         string
  initials:     string
  time:         string
  type:         MessageType
  text?:        string
  translate?:   string
  duration?:    string
  voiceCaption?: string
  hazardLabel?: string
  coords?:      string
  isSelf?:      boolean
  alertVariant?: 'red' | 'orange'
}

// ── Static data ───────────────────────────────────────────────────────────────

const EMERGENCY_CHANNELS: Channel[] = [
  { id: 'site-alerts',   label: 'Site-Wide Alerts',    icon: '📢', type: 'emergency', unread: 2 },
  { id: 'zone-b-evac',   label: 'Zone B Evacuation',   icon: '⚠️', type: 'emergency' },
]

const SITE_CHANNELS: Channel[] = [
  { id: 'crane-ops',     label: 'Crane Ops — Palm Jebel', icon: '🏗️', type: 'site', unread: 5 },
  { id: 'rigging-alpha', label: 'Rigging Team Alpha',     icon: '👷', type: 'site' },
  { id: 'medical',       label: 'Medical Staff',          icon: '🩺', type: 'site', unread: 1 },
]

const DM_WORKERS: Worker[] = [
  { id: 'w1', name: 'Rajesh Kumar',       badge: '#0047', role: 'Steel Fixer',     location: 'Zone B — Spine North', status: 'sos',     hr: 112, temp: 38.8, unread: 1 },
  { id: 'w2', name: 'Ahmad Al-Farsi',     badge: '#0023', role: 'Site Supervisor', location: 'Zone A — Level 3',     status: 'shift',   hr: 78,  temp: 37.1 },
  { id: 'w3', name: 'Priya Sharma',       badge: '#0055', role: 'Safety Officer',  location: 'Site Office',          status: 'shift',   hr: 82,  temp: 36.9 },
  { id: 'w4', name: 'Carlos Mendez',      badge: '#0061', role: 'Crane Operator',  location: 'Zone C — Tower 2',     status: 'break',   hr: 69,  temp: 36.6 },
  { id: 'w5', name: 'Mohammed Al-Rashid', badge: '#0038', role: 'Rigger',          location: 'Zone B — Spine South', status: 'offline', hr: 0,   temp: 0 },
]

const ACTIVE_MESSAGES: Message[] = [
  {
    id: 'm0',
    from: 'HeatGuard AI',
    initials: 'AI',
    time: '09:12',
    type: 'system',
    text: 'Worker Rajesh Kumar core temp exceeded 38.5°C. Immediate intervention required. Zone B — Spine North.',
  },
  {
    id: 'm1',
    from: 'Ahmad Al-Farsi',
    initials: 'AA',
    time: '09:14',
    type: 'text',
    text: 'On it — dispatching nurse to Zone B now. Everyone else hold positions.',
  },
  {
    id: 'm2',
    from: 'Priya Sharma',
    initials: 'PS',
    time: '09:15',
    type: 'voice',
    duration: '0:18',
    voiceCaption: 'Everyone return to your posts. We will keep monitoring.',
  },
  {
    id: 'm3',
    from: 'Carlos Mendez',
    initials: 'CM',
    time: '09:17',
    type: 'hazard',
    hazardLabel: 'Exposed Wiring — Scaffold Level 2',
    coords: '25.2048°N, 55.2718°E',
  },
  {
    id: 'm4',
    from: 'Ahmad Al-Farsi',
    initials: 'AA',
    time: '09:19',
    type: 'text',
    text: 'Hazard logged. Maintenance notified. Keep 5m clearance until resolved.',
  },
  {
    id: 'm5',
    from: 'Me',
    initials: 'ME',
    time: '09:21',
    type: 'text',
    text: 'Rajesh has been moved to the cooling station. Vitals stabilising. Incident report filed.',
    isSelf: true,
  },
]

const SITE_ALERTS_MESSAGES: Message[] = [
  {
    id: 'sa0',
    from: 'HeatGuard AI',
    initials: 'AI',
    time: '10:03',
    type: 'system',
    alertVariant: 'red',
    text: 'SEVERE WEATHER: Approaching sandstorm detected. Visibility dropping below safe operational limits in approx. 45 mins. Immediate site assessment required.',
  },
  {
    id: 'sa1',
    from: 'HeatGuard AI',
    initials: 'AI',
    time: '10:04',
    type: 'system',
    alertVariant: 'orange',
    text: 'EXTREME HEAT: Category 4 Heat Wave warning issued. WBGT expected to exceed 43°C within 2 hours. Mandatory rest protocols now in effect for all outdoor workers.',
  },
  {
    id: 'sa2',
    from: 'Tariq Al-Sayed — Zone A',
    initials: 'TA',
    time: '10:06',
    type: 'text',
    text: 'All crews in Zone A, begin securing loose scaffolding materials immediately. Do not wait for further instruction.',
  },
  {
    id: 'sa3',
    from: 'Khaled Mansour — Crane Ops',
    initials: 'KM',
    time: '10:07',
    type: 'text',
    text: 'Crane operations suspended with immediate effect. Directing all riggers to the main AC cooling tents. Stay clear of lifting zones.',
  },
  {
    id: 'sa4',
    from: 'Dr. Sarah Al-Hamdan — Medical',
    initials: 'SH',
    time: '10:09',
    type: 'text',
    text: 'Medical team is on standby at Tent 1 & Tent 2. Extra hydration packs are prepped. Any workers showing heat symptoms — report immediately.',
  },
]

const STATUS_DOT: Record<WorkerStatus, string> = {
  shift:   'bg-[#00D15A]',
  break:   'bg-yellow-400',
  offline: 'bg-gray-300',
  sos:     'bg-[#FF3B30] animate-pulse',
}

const STATUS_LABEL: Record<WorkerStatus, { text: string; color: string }> = {
  shift:   { text: 'On Shift',  color: 'text-[#00D15A]' },
  break:   { text: 'On Break',  color: 'text-yellow-500' },
  offline: { text: 'Offline',   color: 'text-gray-400' },
  sos:     { text: 'SOS',       color: 'text-[#FF3B30]' },
}

// ── Sub-components ────────────────────────────────────────────────────────────

function WorkerAvatar({
  name,
  status,
  size = 'md',
  className,
}: {
  name: string
  status: WorkerStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const initials = name.split(' ').map(n => n[0]).join('')
  const sizeClasses = { sm: 'w-7 h-7 text-[9px]', md: 'w-9 h-9 text-xs', lg: 'w-14 h-14 text-base' }
  const dotClasses  = { sm: 'w-1.5 h-1.5 -bottom-0 -right-0', md: 'w-2.5 h-2.5 bottom-0 right-0', lg: 'w-3.5 h-3.5 bottom-0.5 right-0.5' }

  return (
    <div className={cn('relative shrink-0', className)}>
      <div className={cn('rounded-full bg-[#0B281F] text-[#00D15A] flex items-center justify-center font-bold', sizeClasses[size])}>
        {initials}
      </div>
      <span className={cn('absolute rounded-full ring-2 ring-white', STATUS_DOT[status], dotClasses[size])} />
    </div>
  )
}

function AudioWaveform() {
  const bars = [3, 6, 10, 14, 9, 16, 11, 7, 13, 10, 6, 14, 8, 12, 5, 9, 15, 11, 7, 4]
  return (
    <svg width="90" height="24" viewBox="0 0 90 24" className="shrink-0">
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 4.5 + 1}
          y={(24 - h) / 2}
          width={3}
          height={h}
          rx={1.5}
          fill="currentColor"
          className="text-[#00D15A]"
        />
      ))}
    </svg>
  )
}

function VoiceBubble({ duration, caption }: { duration: string; caption?: string }) {
  return (
    <div className="flex flex-col gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 w-[260px]">
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-full bg-[#00D15A] flex items-center justify-center flex-shrink-0 hover:bg-green-600 transition-colors">
          <Play className="w-3.5 h-3.5 text-white ml-0.5" />
        </button>
        <AudioWaveform />
        <span className="text-[11px] text-gray-400 font-medium tabular-nums">{duration}</span>
      </div>
      {caption && (
        <div className="border-t border-gray-200 pt-2">
          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mb-0.5">
            <span>🌐</span> AI Caption · Translated from Hindi
          </p>
          <p className="text-[11px] text-gray-500 italic leading-relaxed">"{caption}"</p>
        </div>
      )}
    </div>
  )
}

function HazardBubble({ label, coords }: { label: string; coords: string }) {
  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 overflow-hidden w-[260px]">
      {/* Mini map placeholder */}
      <div className="relative h-[80px] bg-[#e8f4e8] overflow-hidden">
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#3d8c5e" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Roads */}
        <div className="absolute top-[40%] left-0 right-0 h-[6px] bg-[#c8e6c9] opacity-60" />
        <div className="absolute left-[40%] top-0 bottom-0 w-[6px] bg-[#c8e6c9] opacity-60" />
        {/* Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="w-6 h-6 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg ring-2 ring-white">
            <TriangleAlert className="w-3 h-3 text-white" />
          </div>
        </div>
        <span className="absolute top-1.5 right-2 text-[9px] font-mono text-gray-500 bg-white/80 px-1.5 py-0.5 rounded">
          {coords}
        </span>
      </div>
      {/* Label */}
      <div className="px-3 py-2.5 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
        <div>
          <p className="text-xs font-bold text-orange-700">Hazard Reported</p>
          <p className="text-[11px] text-orange-600 mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  )
}

function SystemAlertBubble({ text, variant = 'red' }: { text: string; variant?: 'red' | 'orange' }) {
  const isRed = variant === 'red'
  const iconBg    = isRed ? 'bg-[#FF3B30] ring-[#FF3B30]/20' : 'bg-orange-500 ring-orange-500/20'
  const cardBg    = isRed ? 'bg-[#FFF1F0] border-[#FF3B30]/25' : 'bg-orange-50 border-orange-200'
  const labelCol  = isRed ? 'text-[#FF3B30]' : 'text-orange-600'
  const dotCol    = isRed ? 'bg-[#FF3B30]' : 'bg-orange-500'
  const labelText = isRed ? 'AI Alert · Severe Weather' : 'AI Alert · Extreme Heat Warning'
  const footerCol = isRed ? 'text-red-400' : 'text-orange-400'

  return (
    <div className="flex items-start gap-3 mx-auto max-w-[480px] w-full">
      <div className={cn('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ring-4 shadow-md', iconBg)}>
        <Siren className="w-3.5 h-3.5 text-white" />
      </div>
      <div className={cn('flex-1 border rounded-2xl rounded-tl-sm px-4 py-3', cardBg)}>
        <p className={cn('text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5', labelCol)}>
          <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse inline-block', dotCol)} />
          {labelText}
        </p>
        <p className="text-sm text-gray-800 font-medium leading-relaxed">{text}</p>
        <p className={cn('text-[10px] mt-2', footerCol)}>Broadcast to all site channels · HeatGuard System</p>
      </div>
    </div>
  )
}

function MessageBubble({ msg }: { msg: Message }) {
  if (msg.type === 'system') return <SystemAlertBubble text={msg.text!} variant={msg.alertVariant ?? 'red'} />

  return (
    <div className={cn('flex items-end gap-2.5', msg.isSelf ? 'flex-row-reverse' : 'flex-row')}>
      {!msg.isSelf && (
        <div className="w-7 h-7 rounded-full bg-[#0B281F] text-[#00D15A] flex items-center justify-center text-[9px] font-bold flex-shrink-0 mb-0.5">
          {msg.initials}
        </div>
      )}

      <div className={cn('flex flex-col gap-1', msg.isSelf ? 'items-end' : 'items-start')}>
        {!msg.isSelf && (
          <span className="text-[10px] text-gray-400 font-medium px-1">{msg.from}</span>
        )}

        <div>
          {msg.type === 'text' && (
            <div
              className={cn(
                'rounded-2xl px-4 py-2.5 max-w-[320px] text-sm leading-relaxed',
                msg.isSelf
                  ? 'bg-[#00D15A] text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              )}
            >
              {msg.text}
              {msg.translate && (
                <div className="mt-2 pt-2 border-t border-black/10">
                  <p className="text-[10px] text-gray-500 italic mb-0.5 flex items-center gap-1">
                    <span>🌐</span> Translated from Hindi
                  </p>
                  <p className="text-[11px] text-gray-600">{msg.translate}</p>
                </div>
              )}
            </div>
          )}

          {msg.type === 'voice' && (
            <VoiceBubble duration={msg.duration!} caption={msg.voiceCaption} />
          )}

          {msg.type === 'hazard' && (
            <HazardBubble label={msg.hazardLabel!} coords={msg.coords!} />
          )}
        </div>

        <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
      </div>
    </div>
  )
}

function WorkerContextPanel({ worker }: { worker: Worker }) {
  const sl = STATUS_LABEL[worker.status]
  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-100 overflow-y-auto">
      {/* Profile */}
      <div className="p-5 border-b border-gray-100 flex flex-col items-center text-center gap-3">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-[#0B281F] text-[#00D15A] flex items-center justify-center text-xl font-bold">
            {worker.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span className={cn('absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-white', STATUS_DOT[worker.status])} />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{worker.name}</p>
          <p className="text-xs text-gray-400">{worker.badge} · {worker.role}</p>
          <p className={cn('text-xs font-semibold mt-1', sl.color)}>{sl.text}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-1.5 text-xs text-gray-600 w-full justify-center">
          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
          <span className="font-medium">{worker.location}</span>
        </div>
      </div>

      {/* Live Vitals */}
      <div className="p-4 border-b border-gray-100">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Live Wearable Vitals
        </p>
        {worker.status === 'offline' ? (
          <p className="text-xs text-gray-400 text-center py-2">Device offline</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <div className={cn(
              'rounded-2xl p-3 flex flex-col gap-1.5',
              worker.hr > 100 ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'
            )}>
              <div className="flex items-center gap-1.5">
                <Heart className={cn('w-3.5 h-3.5', worker.hr > 100 ? 'text-red-500' : 'text-gray-400')} />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Heart Rate</span>
              </div>
              <p className={cn('text-xl font-bold tabular-nums', worker.hr > 100 ? 'text-red-600' : 'text-gray-900')}>
                {worker.hr} <span className="text-xs font-medium text-gray-400">bpm</span>
              </p>
              {worker.hr > 100 && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">Elevated</span>
              )}
            </div>
            <div className={cn(
              'rounded-2xl p-3 flex flex-col gap-1.5',
              worker.temp > 38 ? 'bg-red-50 border border-red-100' : 'bg-gray-50 border border-gray-100'
            )}>
              <div className="flex items-center gap-1.5">
                <Thermometer className={cn('w-3.5 h-3.5', worker.temp > 38 ? 'text-red-500' : 'text-gray-400')} />
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Core Temp</span>
              </div>
              <p className={cn('text-xl font-bold tabular-nums', worker.temp > 38 ? 'text-red-600' : 'text-gray-900')}>
                {worker.temp}° <span className="text-xs font-medium text-gray-400">C</span>
              </p>
              {worker.temp > 38 && (
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">Critical</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 flex flex-col gap-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Quick Actions
        </p>
        <button className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors cursor-pointer text-left">
          <Navigation className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          Ping Location
        </button>
        <button className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-[#E3FAED] border border-[#00D15A]/20 text-[#007A38] text-xs font-semibold hover:bg-green-100 transition-colors cursor-pointer text-left">
          <Zap className="w-3.5 h-3.5 text-[#00D15A] flex-shrink-0" />
          Send Immediate Break Order
        </button>
        <button className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer text-left">
          <ShieldAlert className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          Escalate to Medic
        </button>
      </div>
    </div>
  )
}

const ACTIVE_MANAGERS = [
  { name: 'Tariq Al-Sayed',       role: 'Zone A Manager',   status: 'shift' as WorkerStatus },
  { name: 'Khaled Mansour',       role: 'Crane Ops Manager', status: 'shift' as WorkerStatus },
  { name: 'Dr. Sarah Al-Hamdan',  role: 'Medical Lead',      status: 'shift' as WorkerStatus },
  { name: 'Ahmad Al-Farsi',       role: 'Site Supervisor',   status: 'break' as WorkerStatus },
]

function BroadcastContextPanel() {
  return (
    <div className="h-full flex flex-col bg-[#F7F9F8] overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Broadcast Context</p>
        <h3 className="text-sm font-bold text-gray-900">Site-Wide Alerts</h3>
        <p className="text-xs text-gray-400 mt-0.5">Palm Jebel Ali — Site A</p>
      </div>

      {/* Mini site map */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Site Overview</p>
        <div className="relative h-[110px] rounded-2xl bg-[#dff0e8] overflow-hidden border border-[#c2e8d4]">
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-25">
            <defs>
              <pattern id="bc-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#3d8c5e" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bc-grid)" />
          </svg>
          {/* Roads */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[5px] bg-[#a8d8b8] opacity-70" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[5px] bg-[#a8d8b8] opacity-70" />
          {/* Zone labels */}
          {[
            { label: 'Zone A', x: '20%', y: '25%' },
            { label: 'Zone B', x: '70%', y: '25%' },
            { label: 'Zone C', x: '20%', y: '72%' },
            { label: 'Zone D', x: '70%', y: '72%' },
          ].map(z => (
            <div key={z.label} className="absolute" style={{ left: z.x, top: z.y, transform: 'translate(-50%,-50%)' }}>
              <div className="bg-[#FF3B30]/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                {z.label}
              </div>
            </div>
          ))}
          {/* Pulse overlay — whole site affected */}
          <div className="absolute inset-0 bg-[#FF3B30]/5 animate-pulse rounded-2xl" />
          <span className="absolute bottom-1.5 right-2 text-[8px] font-mono text-gray-500 bg-white/70 px-1 py-0.5 rounded">
            All zones affected
          </span>
        </div>
      </div>

      {/* Alert status cards */}
      <div className="px-4 py-3 border-b border-gray-200 space-y-2">
        <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <span className="text-xs font-semibold text-gray-600">Affected Zones</span>
          <span className="text-xs font-bold text-red-600">All · 4/4</span>
        </div>
        <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
          <span className="text-xs font-semibold text-gray-600">Alert Level</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
            Critical
          </span>
        </div>
        <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
          <span className="text-xs font-semibold text-gray-600">Workers Notified</span>
          <span className="text-xs font-bold text-orange-700">276 / 276</span>
        </div>
      </div>

      {/* Active managers */}
      <div className="p-4">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          Active Managers in Channel
        </p>
        <div className="space-y-2">
          {ACTIVE_MANAGERS.map(m => (
            <div key={m.name} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2">
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#0B281F] text-[#00D15A] flex items-center justify-center text-[9px] font-bold">
                  {m.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <span className={cn('absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white', STATUS_DOT[m.status])} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">{m.name}</p>
                <p className="text-[10px] text-gray-400">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [activeChannel, setActiveChannel] = useState<string>('')
  const [activeDM,      setActiveDM]      = useState<Worker | null>(DM_WORKERS[0])
  const [messageText,   setMessageText]   = useState('')
  const [isPriority,    setIsPriority]    = useState(false)
  const [isPTT,         setIsPTT]         = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isDM           = activeDM !== null && activeChannel === ''
  const isSiteAlerts   = activeChannel === 'site-alerts'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChannel, activeDM])

  const activeChatTitle = isSiteAlerts
    ? '📢 Site-Wide Alerts'
    : isDM
      ? activeDM?.name
      : 'Zone B Safety Hub'

  const activeChatSub = isSiteAlerts
    ? 'Broadcast channel · All zones · 276 workers'
    : isDM
      ? `${activeDM?.role} · ${activeDM?.location}`
      : '24 members · 3 active incidents'

  const activeMessages = isSiteAlerts ? SITE_ALERTS_MESSAGES : ACTIVE_MESSAGES

  function handleChannelClick(id: string) {
    setActiveChannel(id)
    setActiveDM(null)
  }

  function handleDMClick(w: Worker) {
    setActiveDM(w)
    setActiveChannel('')
  }

  return (
    // Escape dashboard padding to go edge-to-edge
    <div className="-m-5 lg:-m-6 flex h-[calc(100vh-64px)]">

      {/* ── LEFT: Channels & Inbox ─────────────────────────────────────────── */}
      <aside className="w-[270px] flex-shrink-0 flex flex-col bg-[#F7F9F8] border-r border-gray-200 overflow-hidden">

        {/* Top controls */}
        <div className="p-4 flex flex-col gap-3 border-b border-gray-200">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                placeholder="Search channels, people…"
                className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 placeholder:text-gray-400 outline-none focus:border-[#00D15A] transition-colors"
              />
            </div>
            <button className="w-8 h-8 rounded-lg bg-[#00D15A] flex items-center justify-center text-white hover:bg-green-600 transition-colors cursor-pointer flex-shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable channel list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">

          {/* Emergency Channels */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Emergency &amp; Broadcasts
            </p>
            {EMERGENCY_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleChannelClick(ch.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer',
                  activeChannel === ch.id
                    ? 'bg-red-50 text-red-700'
                    : 'hover:bg-white text-gray-700'
                )}
              >
                <span className="text-sm leading-none">{ch.icon}</span>
                <span className="text-xs font-semibold flex-1 truncate">{ch.label}</span>
                {ch.unread ? (
                  <span className="w-4 h-4 rounded-full bg-[#FF3B30] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {ch.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <Separator className="bg-gray-200" />

          {/* Site Channels */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Site Channels
            </p>
            {SITE_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleChannelClick(ch.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer',
                  activeChannel === ch.id
                    ? 'bg-[#E3FAED] text-[#007A38]'
                    : 'hover:bg-white text-gray-700'
                )}
              >
                <span className="text-sm leading-none">{ch.icon}</span>
                <span className="text-xs font-semibold flex-1 truncate">{ch.label}</span>
                {ch.unread ? (
                  <span className="w-4 h-4 rounded-full bg-[#00D15A] text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {ch.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <Separator className="bg-gray-200" />

          {/* Direct Messages */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
              Direct Messages
            </p>
            {DM_WORKERS.map((w) => (
              <button
                key={w.id}
                onClick={() => handleDMClick(w)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer',
                  activeDM?.id === w.id
                    ? 'bg-[#E3FAED]'
                    : 'hover:bg-white'
                )}
              >
                <WorkerAvatar name={w.name} status={w.status} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{w.name}</p>
                  <p className={cn('text-[10px] font-medium', STATUS_LABEL[w.status].color)}>
                    {STATUS_LABEL[w.status].text}
                  </p>
                </div>
                {w.unread ? (
                  <span className={cn(
                    'w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0',
                    w.status === 'sos' ? 'bg-[#FF3B30]' : 'bg-[#00D15A]'
                  )}>
                    {w.unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

        </div>
      </aside>

      {/* ── MIDDLE: Active Chat ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">

        {/* Chat Header */}
        <div className={cn(
          'flex items-center justify-between px-5 py-3.5 border-b bg-white flex-shrink-0',
          isSiteAlerts ? 'border-red-100 bg-red-50/40' : 'border-gray-100'
        )}>
          <div className="flex items-center gap-3 min-w-0">
            {isDM && activeDM ? (
              <WorkerAvatar name={activeDM.name} status={activeDM.status} size="md" />
            ) : isSiteAlerts ? (
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-base flex-shrink-0 ring-2 ring-[#FF3B30]/20">
                📢
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#E3FAED] flex items-center justify-center text-base flex-shrink-0">
                🏗️
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900 truncate">{activeChatTitle}</h2>
                {isSiteAlerts && (
                  <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-[#FF3B30] bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    <span className="w-1 h-1 rounded-full bg-[#FF3B30] animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 truncate">{activeChatSub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isSiteAlerts && (
              <button className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#E3FAED] text-[#007A38] hover:bg-green-100 transition-colors cursor-pointer border border-[#00D15A]/20">
                <Radio className="w-3.5 h-3.5" />
                Voice Channel
              </button>
            )}
            <button className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
              <Users className="w-3.5 h-3.5" />
              {isSiteAlerts ? '276 Workers' : 'Members'}
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className={cn(
          'flex-1 overflow-y-auto px-5 py-5 space-y-5',
          isSiteAlerts ? 'bg-red-50/20' : 'bg-white'
        )}>
          {activeMessages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white flex-shrink-0">

          {/* Priority banner */}
          {isPriority && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-red-50 border border-red-100 rounded-xl">
              <TriangleAlert className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <p className="text-[11px] font-semibold text-red-600 flex-1">
                High Priority — all recipients will receive a push alert
              </p>
              <button onClick={() => setIsPriority(false)} className="text-[10px] text-red-400 hover:text-red-600 cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Attachment */}
            <button className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0">
              <Camera className="w-4 h-4" />
            </button>

            {/* Text input */}
            <div className="flex-1 relative">
              <input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message…"
                className="w-full h-9 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#00D15A] transition-colors"
                onKeyDown={(e) => { if (e.key === 'Enter' && messageText.trim()) setMessageText('') }}
              />
            </div>

            {/* Priority toggle */}
            <button
              onClick={() => setIsPriority(p => !p)}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer flex-shrink-0',
                isPriority
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
              title="Toggle High Priority"
            >
              <TriangleAlert className="w-4 h-4" />
            </button>

            {/* Send (when typing) */}
            {messageText.trim() ? (
              <button
                onClick={() => setMessageText('')}
                className="w-9 h-9 rounded-xl bg-[#00D15A] flex items-center justify-center text-white hover:bg-green-600 transition-colors cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              /* Push-to-Talk */
              <button
                onMouseDown={() => setIsPTT(true)}
                onMouseUp={() => setIsPTT(false)}
                onMouseLeave={() => setIsPTT(false)}
                onTouchStart={() => setIsPTT(true)}
                onTouchEnd={() => setIsPTT(false)}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 select-none',
                  isPTT
                    ? 'bg-[#FF3B30] text-white scale-110 shadow-lg shadow-[#FF3B30]/40 ring-4 ring-[#FF3B30]/25'
                    : 'bg-[#00D15A] text-white hover:bg-green-600 shadow-md shadow-[#00D15A]/30'
                )}
                title="Push to Talk — hold to record"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {isPTT && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[#FF3B30] font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FF3B30]" />
              Recording… Release to send
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Worker Context Panel ───────────────────────────────────── */}
      <aside className="w-[260px] flex-shrink-0 overflow-hidden border-l border-gray-200">
        {isSiteAlerts ? (
          <BroadcastContextPanel />
        ) : isDM && activeDM ? (
          <WorkerContextPanel worker={activeDM} />
        ) : (
          /* Channel context panel */
          <div className="h-full flex flex-col bg-[#F7F9F8] overflow-y-auto p-4 gap-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Active Members
              </p>
              <div className="space-y-2">
                {DM_WORKERS.filter(w => w.status !== 'offline').map(w => (
                  <div key={w.id} className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-gray-100">
                    <WorkerAvatar name={w.name} status={w.status} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-800 truncate">{w.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{w.location}</p>
                    </div>
                    {w.status === 'sos' && (
                      <Siren className="w-3.5 h-3.5 text-[#FF3B30] flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Channel Actions
              </p>
              <div className="space-y-2">
                <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-white border border-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Siren className="w-3.5 h-3.5 text-[#FF3B30] flex-shrink-0" />
                  Broadcast Emergency Alert
                </button>
                <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-white border border-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <Zap className="w-3.5 h-3.5 text-[#00D15A] flex-shrink-0" />
                  Send Zone Break Order
                </button>
                <button className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl bg-white border border-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-left">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  Ping All Locations
                </button>
              </div>
            </div>

            <Separator className="bg-gray-200" />

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Zone Heat Status
              </p>
              <div className="rounded-2xl bg-red-50 border border-red-100 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Zone B Heat Index</span>
                  <span className="text-xs font-bold text-red-600">49°C</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Risk Level</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Critical</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 font-medium">Workers Active</span>
                  <span className="text-xs font-bold text-gray-900">8 of 12</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

    </div>
  )
}
