'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ChevronDown, ChevronRight, ChevronLeft,
  AlertTriangle, Users, List, BarChart2, MapPin, Calendar,
  MessageSquare, ShieldCheck, Stethoscope,
  BadgeCheck, Clock, AlertCircle, CheckCircle2,
  Phone, X, MoreHorizontal, Send, Zap, Check, CheckCheck, Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sheet, SheetContent,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { HydrationChart } from '@/components/HydrationChart'

/* ══════════════════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════════════════ */
type ShiftStatus = 'on_shift' | 'on_break' | 'off_site' | 'alert'
type HeatRisk    = 'safe' | 'caution' | 'warning' | 'danger' | 'critical'

interface ShiftBlock {
  start:        number
  end:          number
  type:         'working' | 'break'
  hasIncident?: boolean
}
interface Certification { label: string; status: 'valid' | 'expired' | 'pending'; expiresAt?: string }
interface Incident {
  date: string; type: string; severity: HeatRisk
  note: string; resolution: string
}
interface Worker {
  id: string; name: string; badgeId: string; avatar: string
  jobTitle: string; nationality: string; joined: string
  phone: string; emergency: string
  site: string; crew: string; zone: string
  shift: ShiftStatus; heatRisk: HeatRisk
  heatIndex: number; lastCheckin: string
  schedule: ShiftBlock[]
  certifications: Certification[]
  medical: string
  upcomingShifts: { label: string; time: string; crew: string }[]
  incidents: Incident[]
  hydrationLog: { time: string; amount: number; missing?: boolean }[]
}
interface Crew { id: string; name: string; workers: Worker[] }
interface Site { id: string; name: string; location: string; crews: Crew[] }

/* ══════════════════════════════════════════════════════════════════
   TIMELINE CONFIG
══════════════════════════════════════════════════════════════════ */
const TL_START = 6
const TL_END   = 18
const TL_SPAN  = TL_END - TL_START
const TL_HOURS = Array.from({ length: 13 }, (_, i) => TL_START + i)

const pct  = (h: number): string => `${((h - TL_START) / TL_SPAN) * 100}%`
const pctN = (h: number): number  => ((h - TL_START) / TL_SPAN) * 100

function rollup(workers: Worker[]): { start: number; end: number } | null {
  const all = workers.flatMap(w => w.schedule)
  if (!all.length) return null
  return { start: Math.min(...all.map(b => b.start)), end: Math.max(...all.map(b => b.end)) }
}

/* ══════════════════════════════════════════════════════════════════
   STYLE MAPS
══════════════════════════════════════════════════════════════════ */
const SHIFT_LABEL: Record<ShiftStatus, string> = {
  on_shift: 'On Shift', on_break: 'On Break', off_site: 'Off Site', alert: 'Alert',
}
const SHIFT_DOT: Record<ShiftStatus, string> = {
  on_shift: 'bg-[#00D15A]', on_break: 'bg-amber-400', off_site: 'bg-slate-400', alert: 'bg-red-500',
}
const SHIFT_TEXT: Record<ShiftStatus, string> = {
  on_shift: 'text-[#00D15A]', on_break: 'text-amber-600', off_site: 'text-slate-500', alert: 'text-red-600',
}
const SHIFT_PILL: Record<ShiftStatus, string> = {
  on_shift: 'bg-[#00D15A]/10 text-[#00D15A]',
  on_break: 'bg-amber-50 text-amber-700',
  off_site: 'bg-slate-100 text-slate-600',
  alert:    'bg-red-50 text-red-700',
}
const AVATAR_BG: Record<ShiftStatus, string> = {
  on_shift: 'bg-[#00D15A]/10 text-[#00D15A]',
  on_break: 'bg-amber-100 text-amber-700',
  off_site: 'bg-slate-100 text-slate-500',
  alert:    'bg-red-100 text-red-600',
}
const RISK_DOT: Record<HeatRisk, string> = {
  safe: 'bg-[#00D15A]', caution: 'bg-amber-400', warning: 'bg-orange-500',
  danger: 'bg-red-500', critical: 'bg-red-800',
}
const RISK_TEXT: Record<HeatRisk, string> = {
  safe: 'text-[#00D15A]', caution: 'text-amber-600', warning: 'text-orange-600',
  danger: 'text-red-600', critical: 'text-red-800',
}
const RISK_LABEL: Record<HeatRisk, string> = {
  safe: 'Safe', caution: 'Caution', warning: 'Warning', danger: 'Danger', critical: 'Critical',
}
const RISK_PILL: Record<HeatRisk, string> = {
  safe:     'bg-[#00D15A]/10 text-[#00D15A]',
  caution:  'bg-amber-100 text-amber-700',
  warning:  'bg-orange-100 text-orange-700',
  danger:   'bg-red-100 text-red-700',
  critical: 'bg-red-200 text-red-800',
}
const INCIDENT_ICON: Record<HeatRisk, { icon: React.ElementType; cls: string }> = {
  safe:     { icon: CheckCircle2, cls: 'text-[#00D15A]' },
  caution:  { icon: Clock,        cls: 'text-amber-500' },
  warning:  { icon: AlertCircle,  cls: 'text-orange-500' },
  danger:   { icon: AlertTriangle, cls: 'text-red-500' },
  critical: { icon: AlertTriangle, cls: 'text-red-800' },
}

const NATIONALITY_LANG: Record<string, { code: string; label: string }> = {
  'Emirati':      { code: 'AR', label: 'Arabic' },
  'Lebanese':     { code: 'AR', label: 'Arabic' },
  'Egyptian':     { code: 'AR', label: 'Arabic' },
  'Indian':       { code: 'HI', label: 'Hindi' },
  'Pakistani':    { code: 'UR', label: 'Urdu' },
  'Filipino':     { code: 'EN', label: 'English' },
  'South African':{ code: 'EN', label: 'English' },
  'Brazilian':    { code: 'PT', label: 'Portuguese' },
  'Chinese':      { code: 'ZH', label: 'Chinese' },
  'Japanese':     { code: 'JA', label: 'Japanese' },
}
function workerLang(nationality: string) {
  return NATIONALITY_LANG[nationality] ?? { code: 'EN', label: 'English' }
}

/* ══════════════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════════════ */
const SITES: Site[] = [
  /* ── Site 1: Palm Jebel Ali ── */
  {
    id: 's1', name: 'Palm Jebel Ali', location: 'Zone B–C · Dubai',
    crews: [
      {
        id: 'c1', name: 'Crew A',
        workers: [
          {
            id: 'w1', name: 'Tarek Haddad', badgeId: 'HG-1042', avatar: 'TH',
            jobTitle: 'Structural Steel Worker', nationality: 'Lebanese',
            joined: 'Mar 2022', phone: '+971 50 234 5678',
            emergency: 'Layla Haddad · +971 50 234 5679',
            site: 'Palm Jebel Ali', crew: 'Crew A', zone: 'Zone B – Palm Jebel Ali',
            shift: 'alert', heatRisk: 'danger', heatIndex: 41.2, lastCheckin: '4 min ago',
            schedule: [
              { start: 6.5, end: 11.7, type: 'working', hasIncident: true },
              { start: 11.7, end: 12.0, type: 'break' },
              { start: 12.0, end: 14.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',        status: 'valid',   expiresAt: '15 Mar 2027' },
              { label: 'OSHA 30-Hour',       status: 'valid',   expiresAt: '01 Jun 2026' },
              { label: 'Steel Erection Cert',status: 'valid',   expiresAt: '01 Sep 2026' },
              { label: 'First Aid/CPR',      status: 'expired', expiresAt: '15 Jan 2026' },
            ],
            medical: 'Clearance: Fit for Heavy Labour.\nAllergies: None.\nPre-existing: Mild hypertension (managed). Prev. heat exhaustion Jul 2023.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 14:30', crew: 'Crew A' },
              { label: 'Wed Apr 9', time: '06:30 – 14:30', crew: 'Crew A' },
            ],
            incidents: [
              { date: 'Apr 7 2026', type: 'Heat Stress Alert', severity: 'danger',
                note: 'WBGT exceeded 41°C in Zone B; reported dizziness.', resolution: 'Removed to shade. Nurse attended. Returned after 35 min.' },
              { date: 'Jul 14 2023', type: 'Heat Exhaustion', severity: 'critical',
                note: 'Hospitalised for 4 hours.', resolution: 'Cleared by physician. Returned to duty next day.' },
              { date: 'Feb 3 2023', type: 'Missed Check-in', severity: 'caution',
                note: 'No GPS ping for 35 min.', resolution: 'Found resting in shade. No injury.' },
            ],
            hydrationLog: [
              { time: '06:00', amount: 150 }, { time: '07:00', amount: 200 },
              { time: '08:00', amount: 180 }, { time: '09:00', amount: 250 },
              { time: '10:00', amount: 200 }, { time: '11:00', amount: 160 },
              { time: '12:00', amount: 0, missing: true },
              { time: '13:00', amount: 0, missing: true },
            ],
          },
          {
            id: 'w3', name: 'Khaled Saeed', badgeId: 'HG-1103', avatar: 'KS',
            jobTitle: 'Scaffolding Technician', nationality: 'Emirati',
            joined: 'Nov 2020', phone: '+971 52 301 9900',
            emergency: 'Fatima Saeed · +971 52 301 9901',
            site: 'Palm Jebel Ali', crew: 'Crew A', zone: 'Zone B – Palm Jebel Ali',
            shift: 'on_shift', heatRisk: 'warning', heatIndex: 38.5, lastCheckin: '22 min ago',
            schedule: [
              { start: 6.5, end: 10.0, type: 'working' },
              { start: 10.0, end: 10.5, type: 'break' },
              { start: 10.5, end: 14.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',         status: 'valid', expiresAt: '20 Nov 2026' },
              { label: 'Scaffold Erection L3', status: 'valid', expiresAt: '15 Aug 2026' },
              { label: 'Working at Height',   status: 'valid', expiresAt: '15 Aug 2026' },
            ],
            medical: 'Clearance: Fit for Heavy Labour.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 14:30', crew: 'Crew A' },
            ],
            incidents: [
              { date: 'Mar 12 2024', type: 'Missed Check-in', severity: 'caution',
                note: 'No check-in for 22 min.', resolution: 'Contacted via radio. No issue found.' },
            ],
            hydrationLog: [
              { time: '06:00', amount: 200 }, { time: '07:00', amount: 350 },
              { time: '08:00', amount: 400 }, { time: '09:00', amount: 300 },
              { time: '10:00', amount: 280 }, { time: '11:00', amount: 250 },
            ],
          },
          {
            id: 'w7', name: 'Mohammed Al Rashid', badgeId: 'HG-0229', avatar: 'MR',
            jobTitle: 'Heavy Equipment Operator', nationality: 'Emirati',
            joined: 'Sep 2019', phone: '+971 50 456 7890',
            emergency: 'Aisha Al Rashid · +971 50 456 7891',
            site: 'Palm Jebel Ali', crew: 'Crew A', zone: 'Zone B – Palm Jebel Ali',
            shift: 'off_site', heatRisk: 'safe', heatIndex: 26.0, lastCheckin: '3 hr ago',
            schedule: [],
            certifications: [
              { label: 'Emirates ID',            status: 'valid', expiresAt: '10 Sep 2027' },
              { label: 'Heavy Machinery Licence', status: 'valid', expiresAt: '01 Dec 2026' },
              { label: 'Crane Operator Cert',    status: 'valid', expiresAt: '01 Dec 2026' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 14:30', crew: 'Crew A' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '06:00', amount: 350 }, { time: '07:00', amount: 480 },
              { time: '08:00', amount: 500 }, { time: '09:00', amount: 420 },
              { time: '10:00', amount: 390 }, { time: '11:00', amount: 340 },
            ],
          },
        ],
      },
      {
        id: 'c2', name: 'Crew B',
        workers: [
          {
            id: 'w2', name: 'Rajesh Iyer', badgeId: 'HG-0877', avatar: 'RI',
            jobTitle: 'Concrete Finisher', nationality: 'Indian',
            joined: 'Jan 2021', phone: '+971 55 876 5432',
            emergency: 'Sunita Iyer · +971 55 876 5433',
            site: 'Palm Jebel Ali', crew: 'Crew B', zone: 'Zone A – Palm Jebel Ali',
            shift: 'alert', heatRisk: 'critical', heatIndex: 44.7, lastCheckin: '2 min ago',
            schedule: [
              { start: 6.5, end: 12.1, type: 'working', hasIncident: true },
              { start: 12.1, end: 12.5, type: 'break' },
            ],
            certifications: [
              { label: 'Emirates ID',           status: 'valid', expiresAt: '05 Jan 2027' },
              { label: 'Concrete Finisher Cert', status: 'valid', expiresAt: '20 Jul 2026' },
              { label: 'First Aid/CPR',         status: 'valid', expiresAt: '20 Jul 2026' },
            ],
            medical: 'Clearance: Fit for Labour.\nAllergies: None.\nPre-existing: Asthma (inhaler required on site).',
            upcomingShifts: [
              { label: 'Pending medical clearance', time: 'TBD', crew: 'Crew B' },
            ],
            incidents: [
              { date: 'Apr 7 2026', type: 'Critical Heat Alert', severity: 'critical',
                note: 'Heat index 44.7°C; SOS pressed. Nurse dispatched.',
                resolution: 'IV fluids administered. Under observation.' },
              { date: 'Jun 20 2024', type: 'Heat Warning', severity: 'warning',
                note: 'Elevated heart rate via wearable.',
                resolution: 'Sent on 20-min break. Recovered fully.' },
            ],
            hydrationLog: [
              { time: '06:00', amount: 100 }, { time: '07:00', amount: 150 },
              { time: '08:00', amount: 120 }, { time: '09:00', amount: 180 },
              { time: '10:00', amount: 140 }, { time: '11:00', amount: 110 },
            ],
          },
          {
            id: 'w5', name: 'Vinay Barad', badgeId: 'HG-0692', avatar: 'VB',
            jobTitle: 'Electrician', nationality: 'Indian',
            joined: 'May 2023', phone: '+971 50 987 6543',
            emergency: 'Pooja Barad · +971 50 987 6544',
            site: 'Palm Jebel Ali', crew: 'Crew B', zone: 'Zone A – Palm Jebel Ali',
            shift: 'on_break', heatRisk: 'safe', heatIndex: 29.3, lastCheckin: '11 min ago',
            schedule: [
              { start: 6.5, end: 10.5, type: 'working' },
              { start: 10.5, end: 11.0, type: 'break' },
              { start: 11.0, end: 14.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',                 status: 'valid', expiresAt: '25 May 2027' },
              { label: 'Electrical Installation Cert', status: 'valid', expiresAt: '10 Oct 2026' },
              { label: 'OSHA 10-Hour',                status: 'valid', expiresAt: '10 Oct 2026' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 14:30', crew: 'Crew B' },
              { label: 'Wed Apr 9', time: '06:30 – 14:30', crew: 'Crew B' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '06:00', amount: 380 }, { time: '07:00', amount: 500 },
              { time: '08:00', amount: 460 }, { time: '09:00', amount: 430 },
              { time: '10:00', amount: 400 }, { time: '11:00', amount: 350 },
            ],
          },
          {
            id: 'w11', name: 'Santhosh Kumar', badgeId: 'HG-1220', avatar: 'SK',
            jobTitle: 'Bar Bender', nationality: 'Indian',
            joined: 'Feb 2022', phone: '+971 55 011 4422',
            emergency: 'Rekha Kumar · +971 55 011 4423',
            site: 'Palm Jebel Ali', crew: 'Crew B', zone: 'Zone A – Palm Jebel Ali',
            shift: 'on_shift', heatRisk: 'caution', heatIndex: 34.8, lastCheckin: '7 min ago',
            schedule: [
              { start: 6.5, end: 10.0, type: 'working' },
              { start: 10.0, end: 10.5, type: 'break' },
              { start: 10.5, end: 14.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',           status: 'valid', expiresAt: '12 Feb 2027' },
              { label: 'Rebar / Bar Bending Cert', status: 'valid', expiresAt: '20 Aug 2026' },
            ],
            medical: 'Clearance: Fit for Heavy Labour.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 14:30', crew: 'Crew B' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '06:00', amount: 250 }, { time: '07:00', amount: 380 },
              { time: '08:00', amount: 420 }, { time: '09:00', amount: 360 },
              { time: '10:00', amount: 300 }, { time: '11:00', amount: 240 },
            ],
          },
        ],
      },
      {
        id: 'c3', name: 'Crew C',
        workers: [
          {
            id: 'w4', name: 'George Adam', badgeId: 'HG-0541', avatar: 'GA',
            jobTitle: 'Crane Operator', nationality: 'Egyptian',
            joined: 'Aug 2022', phone: '+971 56 112 3344',
            emergency: 'Maria Adam · +971 56 112 3345',
            site: 'Palm Jebel Ali', crew: 'Crew C', zone: 'Zone C – Palm Jebel Ali',
            shift: 'on_shift', heatRisk: 'caution', heatIndex: 34.1, lastCheckin: '8 min ago',
            schedule: [
              { start: 6.5, end: 10.0, type: 'working' },
              { start: 10.0, end: 10.25, type: 'break' },
              { start: 10.25, end: 14.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',         status: 'valid', expiresAt: '30 Aug 2026' },
              { label: 'Tower Crane Operator', status: 'valid', expiresAt: '15 Nov 2026' },
              { label: 'OSHA 30-Hour',        status: 'valid', expiresAt: '15 Nov 2026' },
              { label: 'Medical Fitness',      status: 'valid', expiresAt: '07 Apr 2027' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: Type 2 diabetes (diet-controlled).',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 14:30', crew: 'Crew C' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '06:00', amount: 300 }, { time: '07:00', amount: 400 },
              { time: '08:00', amount: 460 }, { time: '09:00', amount: 420 },
              { time: '10:00', amount: 360 }, { time: '11:00', amount: 310 },
            ],
          },
          {
            id: 'w6', name: 'Indira Comar', badgeId: 'HG-0318', avatar: 'IC',
            jobTitle: 'Site Safety Officer', nationality: 'Filipino',
            joined: 'Jan 2020', phone: '+971 54 654 3210',
            emergency: 'Carlos Comar · +971 54 654 3211',
            site: 'Palm Jebel Ali', crew: 'Crew C', zone: 'Zone C – Palm Jebel Ali',
            shift: 'on_shift', heatRisk: 'safe', heatIndex: 28.8, lastCheckin: '6 min ago',
            schedule: [
              { start: 6.5, end: 10.0, type: 'working' },
              { start: 10.0, end: 10.25, type: 'break' },
              { start: 10.25, end: 14.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',           status: 'valid', expiresAt: '15 Jan 2028' },
              { label: 'NEBOSH IGC',            status: 'valid', expiresAt: '01 Jan 2028' },
              { label: 'First Aid/CPR',         status: 'valid', expiresAt: '01 Jun 2026' },
              { label: 'Fit-for-Duty (Feb 2026)', status: 'valid', expiresAt: '01 Aug 2026' },
            ],
            medical: 'Clearance: Fully Fit.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 14:30', crew: 'Crew C' },
              { label: 'Wed Apr 9', time: '06:30 – 14:30', crew: 'Crew C' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '06:00', amount: 420 }, { time: '07:00', amount: 500 },
              { time: '08:00', amount: 480 }, { time: '09:00', amount: 450 },
              { time: '10:00', amount: 400 }, { time: '11:00', amount: 370 },
            ],
          },
          {
            id: 'w12', name: 'Ahmed Al Mansoori', badgeId: 'HG-0140', avatar: 'AM',
            jobTitle: 'Foreman', nationality: 'Emirati',
            joined: 'Jun 2018', phone: '+971 50 700 8800',
            emergency: 'Sara Al Mansoori · +971 50 700 8801',
            site: 'Palm Jebel Ali', crew: 'Crew C', zone: 'Zone C – Palm Jebel Ali',
            shift: 'on_shift', heatRisk: 'safe', heatIndex: 30.4, lastCheckin: '3 min ago',
            schedule: [
              { start: 6.0, end: 9.5, type: 'working' },
              { start: 9.5, end: 10.0, type: 'break' },
              { start: 10.0, end: 15.0, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',          status: 'valid', expiresAt: '01 Jun 2029' },
              { label: 'OSHA 30-Hour',         status: 'valid', expiresAt: '15 Jun 2028' },
              { label: 'Site Foreman Licence', status: 'valid', expiresAt: '01 Jun 2027' },
            ],
            medical: 'Clearance: Fully Fit.\nAllergies: Penicillin.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:00 – 15:00', crew: 'Crew C' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '06:00', amount: 360 }, { time: '07:00', amount: 440 },
              { time: '08:00', amount: 500 }, { time: '09:00', amount: 410 },
              { time: '10:00', amount: 370 }, { time: '11:00', amount: 320 },
            ],
          },
        ],
      },
    ],
  },

  /* ── Site 2: Dubai Creek Harbour ── */
  {
    id: 's2', name: 'Dubai Creek Harbour', location: 'Zone D · Dubai',
    crews: [
      {
        id: 'c4', name: 'Crew D',
        workers: [
          {
            id: 'w8', name: 'Priya Nair', badgeId: 'HG-0455', avatar: 'PN',
            jobTitle: 'Civil Engineer (Site)', nationality: 'Indian',
            joined: 'Jun 2021', phone: '+971 55 321 0987',
            emergency: 'Suresh Nair · +971 55 321 0988',
            site: 'Dubai Creek Harbour', crew: 'Crew D', zone: 'Zone D – Dubai Creek Harbour',
            shift: 'on_shift', heatRisk: 'caution', heatIndex: 33.6, lastCheckin: '14 min ago',
            schedule: [
              { start: 7.0, end: 10.5, type: 'working' },
              { start: 10.5, end: 11.0, type: 'break' },
              { start: 11.0, end: 15.0, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',            status: 'valid', expiresAt: '20 Jun 2026' },
              { label: 'Civil Engineering Degree', status: 'valid', expiresAt: '—' },
              { label: 'OSHA 30-Hour',           status: 'valid', expiresAt: '20 Jun 2026' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: Mild iron-deficiency anaemia (supplement).',
            upcomingShifts: [
              { label: 'Tomorrow', time: '07:00 – 15:00', crew: 'Crew D' },
            ],
            incidents: [
              { date: 'Jan 9 2025', type: 'Caution Alert', severity: 'caution',
                note: 'Heat index reached 34°C; advised hydration.',
                resolution: '15-min shade break. Returned fit.' },
            ],
            hydrationLog: [
              { time: '07:00', amount: 200 }, { time: '08:00', amount: 350 },
              { time: '09:00', amount: 420 }, { time: '10:00', amount: 380 },
              { time: '11:00', amount: 310 }, { time: '12:00', amount: 260 },
            ],
          },
          {
            id: 'w9', name: 'Omar Farouk', badgeId: 'HG-0612', avatar: 'OF',
            jobTitle: 'Waterproofing Specialist', nationality: 'Egyptian',
            joined: 'Mar 2022', phone: '+971 56 444 2200',
            emergency: 'Nour Farouk · +971 56 444 2201',
            site: 'Dubai Creek Harbour', crew: 'Crew D', zone: 'Zone D – Dubai Creek Harbour',
            shift: 'on_shift', heatRisk: 'safe', heatIndex: 30.1, lastCheckin: '9 min ago',
            schedule: [
              { start: 7.0, end: 10.5, type: 'working' },
              { start: 10.5, end: 11.0, type: 'break' },
              { start: 11.0, end: 15.0, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',                  status: 'valid', expiresAt: '15 Mar 2027' },
              { label: 'Waterproofing Specialist Cert', status: 'valid', expiresAt: '01 Aug 2027' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '07:00 – 15:00', crew: 'Crew D' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '07:00', amount: 320 }, { time: '08:00', amount: 420 },
              { time: '09:00', amount: 500 }, { time: '10:00', amount: 460 },
              { time: '11:00', amount: 390 }, { time: '12:00', amount: 330 },
            ],
          },
          {
            id: 'w13', name: 'Fatima Al Zaabi', badgeId: 'HG-0991', avatar: 'FZ',
            jobTitle: 'HSE Inspector', nationality: 'Emirati',
            joined: 'Sep 2020', phone: '+971 52 880 1100',
            emergency: 'Khalid Al Zaabi · +971 52 880 1101',
            site: 'Dubai Creek Harbour', crew: 'Crew D', zone: 'Zone D – Dubai Creek Harbour',
            shift: 'on_shift', heatRisk: 'safe', heatIndex: 29.7, lastCheckin: '5 min ago',
            schedule: [
              { start: 7.0, end: 11.0, type: 'working' },
              { start: 11.0, end: 11.5, type: 'break' },
              { start: 11.5, end: 15.0, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',          status: 'valid', expiresAt: '05 Sep 2028' },
              { label: 'NEBOSH IGC',           status: 'valid', expiresAt: '20 Sep 2028' },
              { label: 'ISO 45001 Lead Auditor', status: 'valid', expiresAt: '20 Sep 2026' },
            ],
            medical: 'Clearance: Fully Fit.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '07:00 – 15:00', crew: 'Crew D' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '07:00', amount: 400 }, { time: '08:00', amount: 480 },
              { time: '09:00', amount: 500 }, { time: '10:00', amount: 440 },
              { time: '11:00', amount: 400 }, { time: '12:00', amount: 360 },
            ],
          },
        ],
      },
      {
        id: 'c5', name: 'Crew E',
        workers: [
          {
            id: 'w10', name: 'Liu Wei', badgeId: 'HG-0788', avatar: 'LW',
            jobTitle: 'MEP Coordinator', nationality: 'Chinese',
            joined: 'Nov 2022', phone: '+971 55 663 7700',
            emergency: 'Chen Wei · +971 55 663 7701',
            site: 'Dubai Creek Harbour', crew: 'Crew E', zone: 'Zone D – Dubai Creek Harbour',
            shift: 'on_shift', heatRisk: 'safe', heatIndex: 31.2, lastCheckin: '5 min ago',
            schedule: [
              { start: 7.5, end: 11.5, type: 'working' },
              { start: 11.5, end: 12.0, type: 'break' },
              { start: 12.0, end: 16.0, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',            status: 'valid',   expiresAt: '10 Nov 2026' },
              { label: 'MEP Project Management', status: 'valid',   expiresAt: '01 Mar 2027' },
              { label: 'OSHA 10-Hour',           status: 'pending' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '07:30 – 16:00', crew: 'Crew E' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '07:30', amount: 260 }, { time: '08:30', amount: 380 },
              { time: '09:30', amount: 500 }, { time: '10:30', amount: 420 },
              { time: '11:30', amount: 360 }, { time: '12:30', amount: 290 },
            ],
          },
          {
            id: 'w14', name: 'Bilal Chaudhry', badgeId: 'HG-1340', avatar: 'BC',
            jobTitle: 'Plumbing Foreman', nationality: 'Pakistani',
            joined: 'Apr 2021', phone: '+971 50 220 9090',
            emergency: 'Asma Chaudhry · +971 50 220 9091',
            site: 'Dubai Creek Harbour', crew: 'Crew E', zone: 'Zone D – Dubai Creek Harbour',
            shift: 'on_break', heatRisk: 'caution', heatIndex: 35.0, lastCheckin: '20 min ago',
            schedule: [
              { start: 7.5, end: 11.0, type: 'working' },
              { start: 11.0, end: 11.75, type: 'break' },
              { start: 11.75, end: 16.0, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',          status: 'valid', expiresAt: '05 Apr 2027' },
              { label: 'Plumbing Foreman Cert', status: 'valid', expiresAt: '15 Jul 2026' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '07:30 – 16:00', crew: 'Crew E' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '07:30', amount: 150 }, { time: '08:30', amount: 300 },
              { time: '09:30', amount: 440 }, { time: '10:30', amount: 400 },
              { time: '11:30', amount: 320 }, { time: '12:30', amount: 260 },
            ],
          },
        ],
      },
    ],
  },

  /* ── Site 3: Expo City ── */
  {
    id: 's3', name: 'Expo City Site', location: 'Jebel Ali · Dubai South',
    crews: [
      {
        id: 'c6', name: 'Crew F',
        workers: [
          {
            id: 'w15', name: 'Carlos Mendes', badgeId: 'HG-1455', avatar: 'CM',
            jobTitle: 'Facade Engineer', nationality: 'Brazilian',
            joined: 'Jan 2023', phone: '+971 56 990 3300',
            emergency: 'Ana Mendes · +971 56 990 3301',
            site: 'Expo City Site', crew: 'Crew F', zone: 'Zone F – Expo City',
            shift: 'on_shift', heatRisk: 'safe', heatIndex: 32.1, lastCheckin: '10 min ago',
            schedule: [
              { start: 6.5, end: 10.5, type: 'working' },
              { start: 10.5, end: 11.0, type: 'break' },
              { start: 11.0, end: 15.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',             status: 'valid', expiresAt: '20 Jan 2028' },
              { label: 'Facade Installation Cert', status: 'valid', expiresAt: '01 Oct 2026' },
              { label: 'Working at Height',       status: 'valid', expiresAt: '01 Oct 2026' },
            ],
            medical: 'Clearance: Fully Fit.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 15:30', crew: 'Crew F' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '06:30', amount: 330 }, { time: '07:30', amount: 430 },
              { time: '08:30', amount: 490 }, { time: '09:30', amount: 450 },
              { time: '10:30', amount: 400 }, { time: '11:30', amount: 350 },
            ],
          },
          {
            id: 'w16', name: 'Nadia El Masri', badgeId: 'HG-1510', avatar: 'NE',
            jobTitle: 'Surveyor', nationality: 'Lebanese',
            joined: 'Mar 2023', phone: '+971 54 331 7700',
            emergency: 'Rami El Masri · +971 54 331 7701',
            site: 'Expo City Site', crew: 'Crew F', zone: 'Zone F – Expo City',
            shift: 'on_shift', heatRisk: 'caution', heatIndex: 35.6, lastCheckin: '17 min ago',
            schedule: [
              { start: 6.5, end: 10.0, type: 'working' },
              { start: 10.0, end: 10.5, type: 'break' },
              { start: 10.5, end: 15.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',         status: 'valid', expiresAt: '10 Mar 2027' },
              { label: 'Land Survey Licence', status: 'valid', expiresAt: '20 Nov 2026' },
              { label: 'AutoCAD Certification', status: 'valid', expiresAt: '01 Jan 2028' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '06:30 – 15:30', crew: 'Crew F' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '06:30', amount: 200 }, { time: '07:30', amount: 320 },
              { time: '08:30', amount: 400 }, { time: '09:30', amount: 360 },
              { time: '10:30', amount: 300 }, { time: '11:30', amount: 240 },
            ],
          },
          {
            id: 'w17', name: 'Thabo Molefe', badgeId: 'HG-1600', avatar: 'TM',
            jobTitle: 'Precast Concrete Installer', nationality: 'South African',
            joined: 'Jul 2023', phone: '+971 55 780 4400',
            emergency: 'Nomsa Molefe · +971 55 780 4401',
            site: 'Expo City Site', crew: 'Crew F', zone: 'Zone F – Expo City',
            shift: 'alert', heatRisk: 'warning', heatIndex: 39.3, lastCheckin: '1 min ago',
            schedule: [
              { start: 6.5, end: 10.0, type: 'working', hasIncident: true },
              { start: 10.0, end: 10.5, type: 'break' },
              { start: 10.5, end: 15.5, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',         status: 'valid',   expiresAt: '25 Jul 2027' },
              { label: 'Precast Installer Cert', status: 'valid', expiresAt: '10 Sep 2026' },
              { label: 'First Aid/CPR',       status: 'expired', expiresAt: '01 Feb 2026' },
            ],
            medical: 'Clearance: Fit for Heavy Labour.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Pending heat clearance', time: 'TBD', crew: 'Crew F' },
            ],
            incidents: [
              { date: 'Apr 7 2026', type: 'Heat Warning Alert', severity: 'warning',
                note: 'Wearable detected heat index 39.3°C; worker reported fatigue.',
                resolution: 'Resting in cooled rest zone. Nurse monitoring.' },
            ],
            hydrationLog: [
              { time: '06:30', amount: 160 }, { time: '07:30', amount: 210 },
              { time: '08:30', amount: 190 }, { time: '09:30', amount: 250 },
              { time: '10:30', amount: 180 }, { time: '11:30', amount: 140 },
            ],
          },
        ],
      },
      {
        id: 'c7', name: 'Crew G',
        workers: [
          {
            id: 'w18', name: 'Arjun Menon', badgeId: 'HG-1655', avatar: 'AJ',
            jobTitle: 'Painter & Decorator', nationality: 'Indian',
            joined: 'Oct 2023', phone: '+971 56 225 8800',
            emergency: 'Deepa Menon · +971 56 225 8801',
            site: 'Expo City Site', crew: 'Crew G', zone: 'Zone G – Expo City',
            shift: 'on_shift', heatRisk: 'safe', heatIndex: 30.8, lastCheckin: '12 min ago',
            schedule: [
              { start: 7.0, end: 11.0, type: 'working' },
              { start: 11.0, end: 11.5, type: 'break' },
              { start: 11.5, end: 16.0, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID',              status: 'valid', expiresAt: '15 Oct 2026' },
              { label: 'Painter & Decorator Cert', status: 'valid', expiresAt: '15 Oct 2026' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: Latex.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '07:00 – 16:00', crew: 'Crew G' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '07:00', amount: 370 }, { time: '08:00', amount: 460 },
              { time: '09:00', amount: 500 }, { time: '10:00', amount: 430 },
              { time: '11:00', amount: 390 }, { time: '12:00', amount: 320 },
            ],
          },
          {
            id: 'w19', name: 'Kenji Tanaka', badgeId: 'HG-1720', avatar: 'KT',
            jobTitle: 'Quality Control Inspector', nationality: 'Japanese',
            joined: 'Feb 2024', phone: '+971 50 115 6600',
            emergency: 'Yuki Tanaka · +971 50 115 6601',
            site: 'Expo City Site', crew: 'Crew G', zone: 'Zone G – Expo City',
            shift: 'off_site', heatRisk: 'safe', heatIndex: 27.5, lastCheckin: '2 hr ago',
            schedule: [],
            certifications: [
              { label: 'Emirates ID',           status: 'valid', expiresAt: '01 Feb 2028' },
              { label: 'ISO 9001 Lead Auditor', status: 'valid', expiresAt: '15 Feb 2027' },
              { label: 'QC Inspector Cert', status: 'valid', expiresAt: '15 Feb 2027' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '07:00 – 16:00', crew: 'Crew G' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '07:00', amount: 290 }, { time: '08:00', amount: 370 },
              { time: '09:00', amount: 430 }, { time: '10:00', amount: 390 },
              { time: '11:00', amount: 330 }, { time: '12:00', amount: 280 },
            ],
          },
          {
            id: 'w20', name: 'Maria Santos', badgeId: 'HG-1810', avatar: 'MS',
            jobTitle: 'Document Controller', nationality: 'Filipino',
            joined: 'May 2024', phone: '+971 52 440 9900',
            emergency: 'Jose Santos · +971 52 440 9901',
            site: 'Expo City Site', crew: 'Crew G', zone: 'Zone G – Expo City',
            shift: 'on_shift', heatRisk: 'safe', heatIndex: 28.2, lastCheckin: '8 min ago',
            schedule: [
              { start: 7.0, end: 11.5, type: 'working' },
              { start: 11.5, end: 12.0, type: 'break' },
              { start: 12.0, end: 16.0, type: 'working' },
            ],
            certifications: [
              { label: 'Emirates ID', status: 'valid' },
              { label: 'Aconex Certification', status: 'valid' },
            ],
            medical: 'Clearance: Fit for Duty.\nAllergies: None.\nPre-existing: None.',
            upcomingShifts: [
              { label: 'Tomorrow', time: '07:00 – 16:00', crew: 'Crew G' },
            ],
            incidents: [],
            hydrationLog: [
              { time: '07:00', amount: 340 }, { time: '08:00', amount: 420 },
              { time: '09:00', amount: 480 }, { time: '10:00', amount: 410 },
              { time: '11:00', amount: 360 }, { time: '12:00', amount: 300 },
            ],
          },
        ],
      },
    ],
  },
]

/* ══════════════════════════════════════════════════════════════════
   UI ATOMS
══════════════════════════════════════════════════════════════════ */
function HourGridLines() {
  return (
    <>
      {TL_HOURS.filter(h => h > TL_START && h < TL_END).map(h => (
        <div key={h} className="absolute inset-y-0 w-px bg-slate-100" style={{ left: pct(h) }} />
      ))}
    </>
  )
}

function NowLine({ nowH }: { nowH: number }) {
  if (nowH <= TL_START || nowH >= TL_END) return null
  return <div className="absolute inset-y-0 w-[1.5px] bg-red-400/70 z-10" style={{ left: pct(nowH) }} />
}

function StatBadge({ icon, label, value, cls }: {
  icon: React.ReactNode; label: string; value: number; cls: string
}) {
  return (
    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium', cls)}>
      {icon}
      <span className="font-bold">{value}</span>
      <span className="font-normal opacity-70">{label}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   MESSAGING DIALOG
══════════════════════════════════════════════════════════════════ */
const QUICK_REPLIES = [
  'Take a 15 min water break',
  'Report to the medical tent',
  'Are you feeling okay?',
  'Return to shade immediately',
]

type ChatMessage = { id: number; text: string; status: 'Delivered' | 'Seen' }

function MessagingDialog({
  worker,
  onClose,
}: {
  worker: Worker | null
  onClose: () => void
}) {
  const [msg,           setMsg]           = useState('')
  const [chatHistory,   setChatHistory]   = useState<ChatMessage[]>([])
  const [autoTranslate, setAutoTranslate] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  function send() {
    if (!msg.trim()) return
    const id   = Date.now()
    const text = msg.trim()
    setMsg('')
    setChatHistory(prev => [...prev, { id, text, status: 'Delivered' }])
    setTimeout(() => {
      setChatHistory(prev =>
        prev.map(m => m.id === id ? { ...m, status: 'Seen' } : m)
      )
    }, 3000)
  }

  function closeAndReset() {
    onClose()
    setMsg('')
    setChatHistory([])
  }

  return (
    <Dialog open={!!worker} onOpenChange={(open: boolean) => { if (!open) closeAndReset() }}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl" showCloseButton={false}>
        {worker && (
          <>
            {/* Header — dark green */}
            <div className="relative bg-[#00421D] px-5 py-4">
              <button
                onClick={closeAndReset}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 pr-8">
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    'w-11 h-11 rounded-full flex items-center justify-center text-base font-bold ring-2 ring-white/20',
                    AVATAR_BG[worker.shift],
                  )}>
                    {worker.avatar}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00D15A] rounded-full border-2 border-[#00421D]" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-sm font-bold text-white leading-tight">
                    {worker.name}
                  </DialogTitle>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5 font-mono">{worker.badgeId} · {worker.zone}</p>
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div
              className="px-5 py-5 flex flex-col gap-3 overflow-y-auto"
              style={{ background: 'linear-gradient(to bottom, #f8faf9, #f1f5f3)', minHeight: 140, maxHeight: 260 }}
            >
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 my-auto">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Start a conversation with <span className="font-semibold text-slate-600">{worker.name.split(' ')[0]}</span>
                  </p>
                </div>
              ) : (
                chatHistory.map(m => (
                  <div key={m.id} className="flex justify-end">
                    <div className="bg-[#00421D] text-white text-sm rounded-2xl rounded-br-none px-4 py-2.5 max-w-[85%] shadow-sm">
                      <p>{m.text}</p>
                      <div className="flex items-center gap-1 mt-1.5 justify-end">
                        {m.status === 'Seen' ? (
                          <CheckCheck className="w-3 h-3 text-[#00D15A]" />
                        ) : (
                          <Check className="w-3 h-3 text-white/50" />
                        )}
                        <span className={cn('text-[10px]', m.status === 'Seen' ? 'text-[#00D15A]/80' : 'text-white/50')}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="px-5 pt-3 pb-2 border-t border-slate-100 bg-white">
              <div className="flex items-center mb-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 flex-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Quick Replies
                </p>
                <button
                  onClick={() => setAutoTranslate(t => !t)}
                  title="Auto-Translate to Worker"
                  className="flex items-center gap-1.5 flex-shrink-0"
                >
                  <span className={cn(
                    'text-[10px] font-semibold transition-colors',
                    autoTranslate ? 'text-emerald-600' : 'text-slate-400',
                  )}>
                    Auto-Translate
                  </span>
                  <div className={cn(
                    'relative w-8 h-4 rounded-full transition-colors duration-200',
                    autoTranslate ? 'bg-emerald-500' : 'bg-slate-200',
                  )}>
                    <span className={cn(
                      'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all duration-200',
                      autoTranslate ? 'left-[18px]' : 'left-0.5',
                    )} />
                  </div>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map(qr => (
                  <button
                    key={qr}
                    onClick={() => setMsg(qr)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border transition-all',
                      msg === qr
                        ? 'bg-[#00421D] border-[#00421D] text-white font-semibold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50',
                    )}
                  >
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-3 bg-white">
              <div className="flex items-center gap-2 bg-slate-100 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-[#00D15A]/30 focus-within:bg-white transition-all border border-transparent focus-within:border-[#00D15A]/40">
                <input
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder={`Message ${worker.name.split(' ')[0]}…`}
                  className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 py-1"
                />
                <button
                  onClick={send}
                  disabled={!msg.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#00D15A] hover:bg-[#00bb52] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ══════════════════════════════════════════════════════════════════
   WORKER PROFILE SHEET
══════════════════════════════════════════════════════════════════ */

/** Mini calendar widget — builds a 6-week grid for April 2026 */
function MiniCalendar() {
  const today = 7 // Apr 7 2026
  const firstDow = 3 // Wednesday (0=Sun)
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDow })
  const cells = [...blanks.map(() => null), ...days]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-800">April 2026</span>
        <div className="flex gap-1">
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-0.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          const isToday  = day === today
          const isShift  = day !== null && [7,8,9,10,12,13,14].includes(day)
          return (
            <div key={i} className={cn(
              'aspect-square flex items-center justify-center rounded text-xs font-medium transition-colors',
              day === null ? '' :
              isToday ? 'bg-[#00D15A] text-white font-bold' :
              isShift ? 'bg-[#00D15A]/10 text-[#00D15A] font-semibold' :
              'text-slate-600 hover:bg-slate-100 cursor-pointer',
            )}>
              {day}
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#00D15A]" />
          <span className="text-[10px] text-slate-500">Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-[#00D15A]/20" />
          <span className="text-[10px] text-slate-500">Scheduled</span>
        </div>
      </div>
    </div>
  )
}

function CertBadge({ cert }: { cert: Certification }) {
  const styles = {
    valid:   'bg-[#00D15A]/10 text-[#00D15A] border-[#00D15A]/20',
    expired: 'bg-red-50 text-red-600 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  const icons = {
    valid:   <BadgeCheck className="w-3 h-3 flex-shrink-0" />,
    expired: <AlertCircle className="w-3 h-3 flex-shrink-0" />,
    pending: <Clock className="w-3 h-3 flex-shrink-0" />,
  }
  const tooltipBg = {
    valid:   'bg-[#0C2A1F] text-[#00D15A]',
    expired: 'bg-red-700 text-white',
    pending: 'bg-amber-600 text-white',
  }
  function getTooltip() {
    if (cert.status === 'pending')  return 'Renewal pending — not yet obtained'
    if (!cert.expiresAt)            return null
    if (cert.status === 'expired')  return `Expired ${cert.expiresAt} · Past expiry`
    return `Expires ${cert.expiresAt}`
  }
  const tooltip = getTooltip()
  return (
    <span className={cn(
      'relative group inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-semibold cursor-default',
      styles[cert.status],
    )}>
      {icons[cert.status]}
      {cert.label}
      {tooltip && (
        <span className={cn(
          'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap',
          'pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg',
          tooltipBg[cert.status],
        )}>
          {tooltip}
          <span className={cn(
            'absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent',
            cert.status === 'valid'   && 'border-t-[#0C2A1F]',
            cert.status === 'expired' && 'border-t-red-700',
            cert.status === 'pending' && 'border-t-amber-600',
          )} />
        </span>
      )}
    </span>
  )
}

function WorkerProfileSheet({
  worker,
  onClose,
  defaultTab = 'overview',
  onMessage,
}: {
  worker: Worker | null
  onClose: () => void
  defaultTab?: string
  onMessage: (w: Worker) => void
}) {
  const [scheduleRange, setScheduleRange] = useState('this-week')

  const ATTENDANCE_THIS_WEEK = [
    { day: 'Mon Apr 6',  checkIn: '06:34', checkOut: '14:28', hours: '7h 54m', breaks: 3, status: 'ok'   },
    { day: 'Tue Apr 7',  checkIn: '06:31', checkOut: '—',     hours: 'Active', breaks: 1, status: 'active'},
    { day: 'Wed Apr 8',  checkIn: '—',     checkOut: '—',     hours: 'Scheduled', breaks: 0, status: 'scheduled'},
    { day: 'Thu Apr 9',  checkIn: '—',     checkOut: '—',     hours: 'Scheduled', breaks: 0, status: 'scheduled'},
    { day: 'Fri Apr 10', checkIn: '—',     checkOut: '—',     hours: 'Scheduled', breaks: 0, status: 'scheduled'},
    { day: 'Sat Apr 11', checkIn: '—',     checkOut: '—',     hours: 'Day Off',   breaks: 0, status: 'off'},
  ]
  const ATTENDANCE_LAST_WEEK = [
    { day: 'Mon Mar 30', checkIn: '06:28', checkOut: '14:31', hours: '8h 03m', breaks: 3, status: 'ok' },
    { day: 'Tue Mar 31', checkIn: '06:32', checkOut: '14:33', hours: '8h 01m', breaks: 2, status: 'ok' },
    { day: 'Wed Apr 1',  checkIn: '06:30', checkOut: '14:30', hours: '8h 00m', breaks: 3, status: 'ok' },
    { day: 'Thu Apr 2',  checkIn: '06:35', checkOut: '14:59', hours: '8h 24m', breaks: 3, status: 'ok' },
    { day: 'Fri Apr 3',  checkIn: '06:31', checkOut: '11:58', hours: '5h 27m', breaks: 2, status: 'ok' },
    { day: 'Sat Apr 4',  checkIn: '06:29', checkOut: '14:28', hours: '7h 59m', breaks: 3, status: 'ok' },
  ]
  const attendance = scheduleRange === 'this-week' ? ATTENDANCE_THIS_WEEK : ATTENDANCE_LAST_WEEK

  return (
    <Sheet open={!!worker} onOpenChange={(open: boolean) => { if (!open) onClose() }}>
      <SheetContent
        className="w-[400px] sm:!max-w-[500px] sm:!w-[500px] p-0 overflow-y-auto flex flex-col gap-0"
        showCloseButton={false}
      >
        {worker && (
          <>
            {/* ── Header ── */}
            <div className="bg-[#00421D] p-6 pb-8 text-white relative">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0',
                  AVATAR_BG[worker.shift],
                )}>
                  {worker.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight">{worker.name}</h2>
                  <p className="text-sm text-[#82EBAE] mt-0.5">{worker.jobTitle}</p>
                  <p className="flex items-center gap-1 text-xs text-white/50 mt-1">
                    <Globe className="w-3 h-3" />
                    {workerLang(worker.nationality).label}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="font-mono text-xs bg-white/20 text-white border-transparent px-2 py-0.5 rounded">
                      {worker.badgeId}
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
                      SHIFT_PILL[worker.shift],
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', SHIFT_DOT[worker.shift])} />
                      {SHIFT_LABEL[worker.shift]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-500/20 text-red-200 border border-red-500/30 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-300 flex-shrink-0" />
                      {worker.heatIndex}°C · {RISK_LABEL[worker.heatRisk]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message button */}
              <button
                onClick={() => onMessage(worker)}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-[#00D15A] hover:bg-[#33FF85] text-[#0A1F16] text-sm font-bold py-2.5 rounded-xl transition-colors border-none"
              >
                <MessageSquare className="w-4 h-4" />
                Message Worker
              </button>

              {/* Quick info row */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { icon: <MapPin className="w-3.5 h-3.5" />,   label: 'Site',     value: worker.site },
                  { icon: <Users className="w-3.5 h-3.5" />,    label: 'Crew',     value: worker.crew },
                  { icon: <Clock className="w-3.5 h-3.5" />,    label: 'Check-in', value: worker.lastCheckin },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="bg-white/10 border border-white/5 backdrop-blur-sm rounded-lg p-3">
                    <div className="flex items-center gap-1 text-emerald-200/70 mb-1">
                      {icon}
                      <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                    </div>
                    <p className="text-sm font-medium text-white truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex-1 px-6 py-4">
              <Tabs defaultValue={defaultTab} key={defaultTab}>
                <TabsList className="w-full justify-start border-b border-slate-200 rounded-none bg-transparent p-0 h-auto mb-5">
                  {[
                    { val: 'overview',  label: 'Overview'   },
                    { val: 'schedule',  label: 'Schedule'   },
                    { val: 'incidents', label: 'Incidents'  },
                  ].map(({ val, label }) => (
                    <TabsTrigger
                      key={val}
                      value={val}
                      className="relative rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 bg-transparent outline-none focus-visible:ring-0 data-[active]:border-[#00D15A] data-[active]:text-slate-900 data-[active]:bg-transparent data-[active]:shadow-none aria-[selected=true]:border-[#00D15A] aria-[selected=true]:text-slate-900 aria-[selected=true]:bg-transparent aria-[selected=true]:shadow-none"
                    >
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* ── Overview tab ── */}
                <TabsContent value="overview" className="space-y-4">
                  {/* Location */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <MapPin className="w-4 h-4 text-[#00D15A]" />
                      <span className="text-sm font-semibold text-slate-700">Current Location</span>
                    </div>
                    <div className="p-4">
                      {/* Mock Google Maps snapshot */}
                      <div className="relative rounded-xl overflow-hidden mb-3" style={{ height: 160 }}>
                        {/* Map background — tiled grid pattern */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: '#e8efe8',
                            backgroundImage: [
                              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
                              'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                            ].join(','),
                            backgroundSize: '24px 24px',
                          }}
                        />
                        {/* Roads */}
                        <div className="absolute inset-0">
                          <div className="absolute left-0 right-0 bg-white/70 h-[3px]" style={{ top: '42%' }} />
                          <div className="absolute left-0 right-0 bg-white/50 h-[2px]" style={{ top: '70%' }} />
                          <div className="absolute top-0 bottom-0 bg-white/70 w-[3px]" style={{ left: '35%' }} />
                          <div className="absolute top-0 bottom-0 bg-white/50 w-[2px]" style={{ left: '65%' }} />
                        </div>
                        {/* Block fills */}
                        <div className="absolute bg-[#d0e8d0]/60 rounded-sm" style={{ left: '37%', top: '44%', width: '27%', height: '25%' }} />
                        <div className="absolute bg-[#c8dfc8]/50 rounded-sm" style={{ left: '10%', top: '10%', width: '24%', height: '30%' }} />
                        {/* GPS pin */}
                        <div className="absolute z-10 flex flex-col items-center" style={{ left: '50%', top: '38%', transform: 'translate(-50%, -100%)' }}>
                          <div className="w-7 h-7 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5 text-white fill-white" />
                          </div>
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-[-2px]" />
                        </div>
                        {/* Pulse ring */}
                        <div className="absolute z-0" style={{ left: '50%', top: '38%', transform: 'translate(-50%, -50%)' }}>
                          <span className="absolute inline-flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-400/30 animate-ping" />
                        </div>
                        {/* Google Maps badge */}
                        <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-0.5 text-[10px] font-medium text-slate-500 shadow-sm">
                          Live GPS
                        </div>
                        {/* Zoom controls mock */}
                        <div className="absolute top-2 right-2 flex flex-col bg-white/90 rounded shadow-sm overflow-hidden">
                          <button className="px-2 py-0.5 text-slate-600 text-sm font-bold hover:bg-slate-100 border-b border-slate-200">+</button>
                          <button className="px-2 py-0.5 text-slate-600 text-sm font-bold hover:bg-slate-100">−</button>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{worker.zone}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Last ping: {worker.lastCheckin}</p>
                    </div>
                  </div>

                  {/* Hydration Log */}
                  <HydrationChart data={worker.hydrationLog} />

                  {/* Certifications */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <ShieldCheck className="w-4 h-4 text-[#00D15A]" />
                      <span className="text-sm font-semibold text-slate-700">ID & Certifications</span>
                    </div>
                    <div className="p-4 flex flex-wrap gap-2">
                      {worker.certifications.map(c => (
                        <CertBadge key={c.label} cert={c} />
                      ))}
                    </div>
                  </div>

                  {/* Medical */}
                  <div className="rounded-xl border border-blue-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-100 bg-blue-50">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">Medical History</span>
                    </div>
                    <div className="bg-blue-50 p-4">
                      {worker.medical.split('\n').map((line, i) => (
                        <p key={i} className="text-sm text-blue-900 leading-relaxed">{line}</p>
                      ))}
                    </div>
                  </div>

                  {/* Contacts */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <Phone className="w-4 h-4 text-[#00D15A]" />
                      <span className="text-sm font-semibold text-slate-700">Contacts</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">Direct</p>
                        <p className="text-sm font-medium text-slate-800">{worker.phone}</p>
                      </div>
                      <div className="border-t border-slate-100 pt-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-0.5">Emergency Contact</p>
                        <p className="text-sm font-medium text-slate-800">{worker.emergency}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Schedule tab ── */}
                <TabsContent value="schedule" className="space-y-4">
                  <MiniCalendar />

                  {/* Upcoming shifts */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <Calendar className="w-4 h-4 text-[#00D15A]" />
                      <span className="text-sm font-semibold text-slate-700">Upcoming Shifts</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {worker.upcomingShifts.map((s, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{s.crew}</p>
                          </div>
                          <span className="text-sm font-medium text-[#00D15A] bg-[#00D15A]/10 px-3 py-1 rounded-lg">
                            {s.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attendance log with date range selector */}
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00D15A]" />
                        <span className="text-sm font-semibold text-slate-700">Attendance Log</span>
                      </div>
                      <Select value={scheduleRange} onValueChange={(v) => v && setScheduleRange(v)}>
                        <SelectTrigger className="h-7 text-xs border-slate-200 rounded-lg bg-white w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="this-week">This Week</SelectItem>
                          <SelectItem value="last-week">Last Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50/50 border-b border-slate-100">
                            {['Day', 'Check In', 'Check Out', 'Hours', 'Breaks'].map(h => (
                              <th key={h} className="text-left px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((row, i) => (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-2.5 font-medium text-slate-700">{row.day}</td>
                              <td className="px-3 py-2.5 font-mono text-slate-600">{row.checkIn}</td>
                              <td className="px-3 py-2.5 font-mono text-slate-600">{row.checkOut}</td>
                              <td className="px-3 py-2.5">
                                <span className={cn(
                                  'px-2 py-0.5 rounded text-[10px] font-semibold',
                                  row.status === 'active'    ? 'bg-[#00D15A]/10 text-[#00D15A]' :
                                  row.status === 'scheduled' ? 'bg-slate-100 text-slate-500' :
                                  row.status === 'off'       ? 'bg-slate-100 text-slate-400 italic' :
                                  'bg-white text-slate-700',
                                )}>
                                  {row.hours}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-slate-500">
                                {row.breaks > 0 ? `${row.breaks}×` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Weekly totals */}
                    <div className="grid grid-cols-3 gap-3 p-4 border-t border-slate-100 bg-slate-50/30">
                      {(scheduleRange === 'this-week'
                        ? [{ label: 'Hours Logged', value: '7h 54m' }, { label: 'Shifts Done', value: '1 / 5' }, { label: 'Breaks', value: '4' }]
                        : [{ label: 'Hours Logged', value: '45h 54m'}, { label: 'Shifts Done', value: '6 / 6' }, { label: 'Breaks', value: '16' }]
                      ).map(({ label, value }) => (
                        <div key={label} className="text-center bg-white rounded-lg py-2.5 border border-slate-100">
                          <p className="text-sm font-bold text-slate-900">{value}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* ── Incidents tab ── */}
                <TabsContent value="incidents" className="space-y-1">
                  {worker.incidents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-[#00D15A]/10 flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6 text-[#00D15A]" />
                      </div>
                      <p className="text-sm font-semibold text-slate-800">No incidents on record</p>
                      <p className="text-xs text-slate-400 mt-1">This worker has a clean safety history.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline spine */}
                      <div className="absolute left-5 top-3 bottom-3 w-px bg-slate-200" />

                      {worker.incidents.map((inc, i) => {
                        const { icon: IncIcon, cls } = INCIDENT_ICON[inc.severity]
                        return (
                          <div key={i} className="relative flex gap-4 pb-5">
                            {/* Icon on spine */}
                            <div className="flex-shrink-0 w-10 flex items-start justify-center pt-0.5">
                              <div className="bg-white border-2 border-slate-200 rounded-full p-1 z-10">
                                <IncIcon className={cn('w-3.5 h-3.5', cls)} />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm font-bold text-slate-900">{inc.type}</p>
                                <span className={cn(
                                  'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                                  inc.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                  inc.severity === 'danger'   ? 'bg-red-50 text-red-700'  :
                                  inc.severity === 'warning'  ? 'bg-orange-50 text-orange-700' :
                                  'bg-amber-50 text-amber-700',
                                )}>
                                  {RISK_LABEL[inc.severity]}
                                </span>
                              </div>
                              <p className="text-[10px] font-medium text-slate-400 mb-2">{inc.date}</p>
                              <p className="text-xs text-slate-600 mb-2">{inc.note}</p>
                              <div className="bg-[#00D15A]/5 border border-[#00D15A]/15 rounded-lg p-2">
                                <div className="flex items-center gap-1 mb-0.5">
                                  <CheckCircle2 className="w-3 h-3 text-[#00D15A]" />
                                  <span className="text-[10px] font-bold text-[#00D15A] uppercase">Resolution</span>
                                </div>
                                <p className="text-xs text-slate-600">{inc.resolution}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Joined: {worker.joined} · {worker.nationality}</span>
                <span>Last updated: just now</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

/* ══════════════════════════════════════════════════════════════════
   TIMELINE VIEW
══════════════════════════════════════════════════════════════════ */
function TimelineView({ sites, collapsed, onToggle, nowH, onWorkerClick }: {
  sites: Site[]
  collapsed: Set<string>
  onToggle: (id: string) => void
  nowH: number
  onWorkerClick: (w: Worker) => void
}) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-200 bg-white"
         style={{ maxHeight: 'calc(100vh - 220px)' }}>

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 grid grid-cols-12 bg-white border-b border-slate-200">
        <div className="col-span-4 flex items-center px-4 h-10 border-r border-slate-200">
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Resource</span>
        </div>
        <div className="col-span-8 relative h-10 overflow-hidden">
          {TL_HOURS.map((h, i) => {
            const isFirst = i === 0
            const isLast  = i === TL_HOURS.length - 1
            return (
              <div
                key={h}
                className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap"
                style={{
                  left: pct(h),
                  transform: `translateX(${isFirst ? '2px' : isLast ? 'calc(-100% - 2px)' : '-50%'}) translateY(-50%)`,
                }}
              >
                <span className="text-[10px] text-slate-400 font-medium">
                  {String(h).padStart(2, '0')}:00
                </span>
              </div>
            )
          })}
          {nowH > TL_START && nowH < TL_END && (
            <div className="absolute top-1.5 -translate-x-1/2" style={{ left: pct(nowH) }}>
              <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-200 rounded px-1 py-0.5 leading-none">
                NOW
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Rows ── */}
      {sites.map(site => {
        const siteRU        = rollup(site.crews.flatMap(c => c.workers))
        const siteCollapsed = collapsed.has(site.id)

        return (
          <div key={site.id}>
            {/* Site row */}
            <div className="grid grid-cols-12 h-10 bg-slate-50 border-b border-slate-200">
              <button
                className="col-span-4 flex items-center gap-2 px-3 border-r border-slate-200 w-full text-left hover:bg-slate-100/60 transition-colors"
                onClick={() => onToggle(site.id)}
              >
                {siteCollapsed
                  ? <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  : <ChevronDown  className="w-4 h-4 text-slate-400 flex-shrink-0" />
                }
                <MapPin className="w-3.5 h-3.5 text-[#00D15A] flex-shrink-0" />
                <span className="text-sm font-bold text-slate-800 truncate">{site.name}</span>
                <span className="ml-1 text-[10px] text-slate-400 truncate flex-shrink-0">{site.location}</span>
              </button>
              <div className="col-span-8 relative">
                <HourGridLines />
                <NowLine nowH={nowH} />
                {siteRU && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-slate-500/25 border border-slate-400/30"
                    style={{ left: pct(siteRU.start), width: `${pctN(siteRU.end) - pctN(siteRU.start)}%` }}
                  />
                )}
              </div>
            </div>

            {!siteCollapsed && site.crews.map(crew => {
              const crewRU        = rollup(crew.workers)
              const crewCollapsed = collapsed.has(crew.id)

              return (
                <div key={crew.id}>
                  {/* Crew row */}
                  <div className="grid grid-cols-12 h-9 bg-white border-b border-slate-100">
                    <button
                      className="col-span-4 flex items-center gap-2 pl-8 pr-3 border-r border-slate-200 w-full text-left hover:bg-slate-50 transition-colors"
                      onClick={() => onToggle(crew.id)}
                    >
                      {crewCollapsed
                        ? <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        : <ChevronDown  className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      }
                      <span className="text-sm font-semibold text-slate-600">{crew.name}</span>
                      <span className="ml-auto bg-slate-100 text-slate-500 text-[10px] font-semibold rounded-full px-2 py-0.5 flex-shrink-0">
                        {crew.workers.length}
                      </span>
                    </button>
                    <div className="col-span-8 relative">
                      <HourGridLines />
                      <NowLine nowH={nowH} />
                      {crewRU && (
                        <div
                          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-slate-400/40"
                          style={{ left: pct(crewRU.start), width: `${pctN(crewRU.end) - pctN(crewRU.start)}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Worker rows */}
                  {!crewCollapsed && crew.workers.map(w => (
                    <div
                      key={w.id}
                      className="grid grid-cols-12 border-b border-slate-100 hover:bg-slate-50/60 transition-colors cursor-pointer"
                      style={{ height: 52 }}
                      onClick={() => onWorkerClick(w)}
                    >
                      <div className="col-span-4 flex items-center gap-2.5 pl-14 pr-3 border-r border-slate-200">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                          AVATAR_BG[w.shift],
                        )}>
                          {w.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-slate-800 truncate">{w.name}</div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-slate-400">{w.badgeId}</span>
                            <span className={cn('text-[10px] font-semibold', SHIFT_TEXT[w.shift])}>
                              · {SHIFT_LABEL[w.shift]}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className={cn('w-1.5 h-1.5 rounded-full', RISK_DOT[w.heatRisk])} />
                          <span className={cn('text-[11px] font-bold', RISK_TEXT[w.heatRisk])}>
                            {w.heatIndex}°
                          </span>
                        </div>
                      </div>

                      <div className="col-span-8 relative">
                        <HourGridLines />
                        <NowLine nowH={nowH} />
                        {w.schedule.length === 0 ? (
                          <div className="absolute inset-x-2 border border-dashed border-slate-200 rounded"
                               style={{ top: 14, bottom: 14 }} />
                        ) : (
                          w.schedule.map((block, i) => {
                            const left  = pctN(block.start)
                            const width = pctN(block.end) - left
                            return (
                              <div
                                key={i}
                                className={cn(
                                  'absolute top-1/2 -translate-y-1/2 rounded',
                                  block.type === 'working' ? 'bg-[#00D15A]' : 'bg-amber-300',
                                )}
                                style={{ left: `${left}%`, width: `${Math.max(0.4, width)}%`, height: 22 }}
                              >
                                {block.hasIncident && (
                                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-2.5 w-2.5">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white" />
                                  </span>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )
      })}

      {/* Legend */}
      <div className="flex items-center gap-5 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
        {[
          { color: 'bg-[#00D15A]', label: 'Working' },
          { color: 'bg-amber-300', label: 'On Break' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={cn('w-6 h-2.5 rounded', color)} />
            <span className="text-[11px] text-slate-500">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-2.5 rounded border border-dashed border-slate-300" />
          <span className="text-[11px] text-slate-500">Off Site</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white" />
          <span className="text-[11px] text-slate-500">Heat Incident</span>
        </div>
        <div className="flex items-center gap-1.5 ml-1">
          <div className="w-px h-4 bg-red-400/70" />
          <span className="text-[11px] text-slate-500">Now</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-2 rounded-full bg-slate-400/30 border border-slate-400/30" />
          <span className="text-[11px] text-slate-500">Crew span</span>
        </div>
        <span className="ml-auto text-[11px] text-slate-400 italic">Click any worker row to open profile</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   LIST VIEW
══════════════════════════════════════════════════════════════════ */
function ListView({
  workers,
  onWorkerClick,
  onMessage,
  onViewTimeline,
}: {
  workers: Worker[]
  onWorkerClick: (w: Worker) => void
  onMessage: (w: Worker) => void
  onViewTimeline: (w: Worker) => void
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {['Worker', 'Job Title', 'Site / Crew', 'Shift Status', 'Heat Risk', 'Last Check-in', ''].map((h, i) => (
              <th key={i} className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {workers.map(w => (
            <tr
              key={w.id}
              className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => onWorkerClick(w)}
            >
              {/* Worker: name + id + zone */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                    AVATAR_BG[w.shift],
                  )}>
                    {w.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-slate-800 leading-tight">{w.name}</p>
                      <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {workerLang(w.nationality).code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono">{w.badgeId}</span>
                      <span className="mx-1">·</span>
                      {w.zone}
                    </p>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 text-slate-600 text-xs">{w.jobTitle}</td>

              {/* Site / Crew */}
              <td className="px-4 py-3">
                <p className="text-xs font-medium text-slate-700">{w.site}</p>
                <p className="text-[11px] text-slate-400">{w.crew}</p>
              </td>

              {/* Shift status pill */}
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1',
                  SHIFT_PILL[w.shift],
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', SHIFT_DOT[w.shift])} />
                  {SHIFT_LABEL[w.shift]}
                </span>
              </td>

              {/* Heat Risk: colored temperature pill */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', RISK_DOT[w.heatRisk])} />
                  <span className={cn(
                    'px-2 py-1 rounded-md text-xs font-bold',
                    RISK_PILL[w.heatRisk],
                  )}>
                    {w.heatIndex}°C
                  </span>
                  <span className={cn('text-[11px] font-medium', RISK_TEXT[w.heatRisk])}>
                    {RISK_LABEL[w.heatRisk]}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-xs text-slate-500">{w.lastCheckin}</td>

              {/* Actions menu — stop propagation so row click doesn't fire */}
              <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors outline-none"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom" className="w-44">
                    <DropdownMenuItem onClick={() => onMessage(w)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Send Message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewTimeline(w)}>
                      <Calendar className="w-4 h-4 mr-2" />
                      View Timeline
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onWorkerClick(w)}>
                      View Profile
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════════ */
function WorkersPageInner() {
  const searchParams = useSearchParams()
  const [view,            setView]           = useState<'timeline' | 'list'>('timeline')
  const [collapsed,       setCollapsed]      = useState<Set<string>>(new Set())
  const [dateOffset,      setDateOffset]     = useState(0)
  const [selectedWorker,  setSelectedWorker] = useState<Worker | null>(null)
  const [profileTab,      setProfileTab]     = useState<string>('overview')
  const [messagingWorker, setMessagingWorker] = useState<Worker | null>(null)

  function openProfile(w: Worker, tab = 'overview') {
    setProfileTab(tab)
    setSelectedWorker(w)
  }

  // Auto-open worker profile when navigated from search (?worker=HG-0541)
  useEffect(() => {
    const badgeId = searchParams.get('worker')
    if (!badgeId) return
    const allWorkers = SITES.flatMap(s => s.crews.flatMap(c => c.workers))
    const match = allWorkers.find(w => w.badgeId.toLowerCase() === badgeId.toLowerCase())
    if (match) openProfile(match)
  }, [searchParams])
  function openMessage(w: Worker) {
    setMessagingWorker(w)
  }

  function toggle(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allWorkers = SITES.flatMap(s => s.crews.flatMap(c => c.workers))
  const total   = allWorkers.length
  const onShift = allWorkers.filter(w => w.shift === 'on_shift').length
  const onBreak = allWorkers.filter(w => w.shift === 'on_break').length
  const alerts  = allWorkers.filter(w => w.shift === 'alert').length
  const offSite = allWorkers.filter(w => w.shift === 'off_site').length

  const base    = new Date(2026, 3, 7)
  const display = new Date(base)
  display.setDate(base.getDate() + dateOffset)
  const isToday  = dateOffset === 0
  const dateLabel = isToday
    ? `Today · ${display.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    : display.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  const nowH = new Date().getHours() + new Date().getMinutes() / 60

  return (
    <div className="flex flex-col gap-4 p-6">

      {/* ── Page header ── */}
      <h1 className="text-2xl font-bold text-slate-900">Worker Roster &amp; Scheduling</h1>

      {/* ── Top control bar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <StatBadge
            icon={<Users className="w-3.5 h-3.5" />}
            label="Total" value={total} cls="bg-slate-100 text-slate-700"
          />
          <StatBadge
            icon={<div className="w-2 h-2 rounded-full bg-[#00D15A]" />}
            label="On Shift" value={onShift} cls="bg-[#00D15A]/10 text-[#00D15A]"
          />
          <StatBadge
            icon={<div className="w-2 h-2 rounded-full bg-amber-400" />}
            label="On Break" value={onBreak} cls="bg-amber-50 text-amber-700"
          />
          <StatBadge
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
            label="Alert" value={alerts} cls="bg-red-50 text-red-700"
          />
          <StatBadge
            icon={<div className="w-2 h-2 rounded-full bg-slate-400" />}
            label="Off Site" value={offSite} cls="bg-slate-100 text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Date navigator */}
          <div className="flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => setDateOffset(d => d - 1)}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDateOffset(0)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                isToday ? 'bg-[#00D15A]/10 text-[#00D15A]' : 'text-slate-700 hover:bg-slate-50',
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
              {dateLabel}
            </button>
            <button
              onClick={() => setDateOffset(d => d + 1)}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            {([
              { val: 'timeline', icon: <BarChart2 className="w-3.5 h-3.5" />, label: 'Timeline' },
              { val: 'list',     icon: <List       className="w-3.5 h-3.5" />, label: 'List'     },
            ] as const).map(({ val, icon, label }) => (
              <button
                key={val}
                onClick={() => setView(val)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
                  view === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      {view === 'timeline' ? (
        <TimelineView
          sites={SITES}
          collapsed={collapsed}
          onToggle={toggle}
          nowH={nowH}
          onWorkerClick={w => openProfile(w)}
        />
      ) : (
        <ListView
          workers={allWorkers}
          onWorkerClick={w => openProfile(w)}
          onMessage={openMessage}
          onViewTimeline={w => openProfile(w, 'schedule')}
        />
      )}

      {/* ── Worker Profile Sheet ── */}
      <WorkerProfileSheet
        worker={selectedWorker}
        onClose={() => setSelectedWorker(null)}
        defaultTab={profileTab}
        onMessage={openMessage}
      />

      {/* ── Messaging Dialog ── */}
      <MessagingDialog
        worker={messagingWorker}
        onClose={() => setMessagingWorker(null)}
      />
    </div>
  )
}

export default function WorkersPage() {
  return (
    <Suspense>
      <WorkersPageInner />
    </Suspense>
  )
}
