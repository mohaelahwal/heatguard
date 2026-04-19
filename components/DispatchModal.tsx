'use client'

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  Ambulance, CheckCircle2, AlertTriangle,
  MapPin, Loader2, Radio, Phone,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DispatchPatient {
  name:      string
  badge:     string
  zone:      string
  gps:       string
  wbgt:      number
  heartRate: number
  type?:     string  // e.g. 'SOS', 'Heat Stress', 'Fall'
}

type DispatchStep = 'confirm' | 'en_route' | 'arrived'

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

function diagnosisLabel(patient: DispatchPatient): string {
  if (patient.type === 'Fall')        return `Fall Detected — Physical Assessment Required`
  if (patient.type === 'Heat Stress') return `Heat Stress — Suspected Heat Stroke`
  return `SOS Alert — Emergency Response Required`
}

// ── Component ─────────────────────────────────────────────────────────────────

export function DispatchModal({
  isOpen,
  onClose,
  patient,
}: {
  isOpen:   boolean
  onClose:  () => void
  patient:  DispatchPatient | null
}) {
  const [step, setStep] = useState<DispatchStep>('confirm')
  const [eta,  setEta]  = useState(225) // 3:45 in seconds
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Countdown when en_route
  useEffect(() => {
    if (step === 'en_route' && eta > 0) {
      timerRef.current = setInterval(() => setEta(s => Math.max(0, s - 1)), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step, eta])

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => { setStep('confirm'); setEta(225) }, 300)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  const etaMin = String(Math.floor(eta / 60)).padStart(2, '0')
  const etaSec = String(eta % 60).padStart(2, '0')

  if (!patient) return null

  const ini = initials(patient.name)

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl p-0 gap-0 overflow-hidden shadow-2xl"
      >

        {/* ── VIEW 1: CONFIRM ──────────────────────────────────────── */}
        {step === 'confirm' && (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-7 pt-6 pb-5 border-b border-gray-100 bg-red-50">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Ambulance className="w-5 h-5 text-[#FF3B30]" />
              </div>
              <div>
                <h2 className="text-base font-black text-red-700 tracking-tight">
                  🚨 Confirm Emergency Dispatch
                </h2>
                <p className="text-xs text-red-500 mt-0.5">
                  This will alert Medic Unit Alpha-1 and log a dispatch event
                </p>
              </div>
            </div>

            {/* Body — 2 col */}
            <div className="grid grid-cols-2 divide-x divide-gray-100">

              {/* Left: patient details */}
              <div className="p-7 space-y-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient Details</p>

                {/* Worker card */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="w-12 h-12 rounded-2xl bg-[#0B281F] text-[#00D15A] flex items-center justify-center font-bold text-base flex-shrink-0">
                    {ini}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{patient.name}</p>
                    <p className="text-xs text-gray-400">{patient.badge} · {patient.zone}</p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="flex items-start gap-3 bg-red-50 rounded-2xl px-4 py-3.5 border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-wide mb-1">Critical Diagnosis</p>
                    <p className="text-sm font-bold text-red-700">🔴 {diagnosisLabel(patient)}</p>
                    <p className="text-xs text-red-500 mt-1">HR: {patient.heartRate} BPM · WBGT: {patient.wbgt}°C</p>
                  </div>
                </div>

                {/* GPS */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Exact GPS Coordinates</p>
                    <p className="text-sm font-bold text-gray-800 mt-0.5 font-mono">{patient.gps}</p>
                    <p className="text-xs text-gray-500">{patient.zone}</p>
                  </div>
                </div>

                {/* Unit info */}
                <div className="space-y-2">
                  {[
                    { label: 'Dispatch Unit', value: 'Medic Unit Alpha-1' },
                    { label: 'Paramedic',     value: 'Ahmed Ali' },
                    { label: 'ETA',           value: '~4 minutes' },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                      <span className="text-xs text-gray-400">{r.label}</span>
                      <span className="text-xs font-bold text-gray-800">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: SVG mini map */}
              <div className="p-7 flex flex-col gap-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Site Location</p>
                <div className="flex-1 bg-[#f0f4f0] rounded-2xl border border-gray-200 overflow-hidden relative min-h-[280px]">
                  <svg width="100%" height="100%" viewBox="0 0 280 280" xmlns="http://www.w3.org/2000/svg">
                    <rect width="280" height="280" fill="#eef2ee" />
                    <rect x="0" y="120" width="280" height="18" fill="#fff" opacity="0.7" />
                    <rect x="120" y="0" width="18" height="280" fill="#fff" opacity="0.7" />
                    <rect x="0" y="60" width="280" height="8" fill="#fff" opacity="0.4" />
                    <rect x="0" y="200" width="280" height="8" fill="#fff" opacity="0.4" />
                    <rect x="60" y="0" width="8" height="280" fill="#fff" opacity="0.4" />
                    <rect x="200" y="0" width="8" height="280" fill="#fff" opacity="0.4" />
                    <text x="30" y="100" fontSize="9" fill="#9CA3AF" fontWeight="600">Zone A</text>
                    <text x="160" y="100" fontSize="9" fill="#9CA3AF" fontWeight="600">Zone B</text>
                    <text x="30" y="200" fontSize="9" fill="#9CA3AF" fontWeight="600">Zone C</text>
                    <text x="160" y="200" fontSize="9" fill="#9CA3AF" fontWeight="600">Zone D</text>
                    <circle cx="180" cy="130" r="52" fill="#FF3B30" opacity="0.12" stroke="#FF3B30" strokeWidth="1.5" strokeDasharray="4 3" />
                    <circle cx="180" cy="130" r="11" fill="#FF3B30" />
                    <text x="180" y="134" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">{ini}</text>
                    <text x="180" y="154" textAnchor="middle" fontSize="8" fill="#FF3B30" fontWeight="700">{patient.badge}</text>
                  </svg>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/90 rounded-lg px-2.5 py-1.5 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-[#FF3B30]" />
                    <span className="text-[10px] font-semibold text-gray-600">{patient.name} · {patient.zone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('en_route')}
                className="flex-1 max-w-xs flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-sm font-black text-white bg-[#FF3B30] hover:bg-red-600 transition-colors cursor-pointer shadow-lg shadow-[#FF3B30]/40 animate-pulse hover:animate-none"
              >
                <Ambulance className="w-4 h-4" />
                CONFIRM &amp; DISPATCH AMBULANCE
              </button>
            </div>
          </>
        )}

        {/* ── VIEW 2: EN ROUTE ─────────────────────────────────────── */}
        {step === 'en_route' && (
          <>
            <div className="flex items-center justify-between px-7 pt-5 pb-4 border-b border-gray-100 bg-blue-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Ambulance className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <h2 className="text-base font-black text-blue-800 tracking-tight">
                      🚑 AMBULANCE DISPATCHED &amp; EN ROUTE
                    </h2>
                  </div>
                  <p className="text-xs text-blue-500 mt-0.5">Live tracking active · Medic Unit Alpha-1</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FF3B30]/10 px-3 py-1 rounded-full border border-[#FF3B30]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse" />
                <span className="text-[11px] font-bold text-[#FF3B30]">LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              <div className="px-7 py-4 flex flex-col items-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">ETA</p>
                <p className="text-4xl font-black tabular-nums text-blue-700 font-mono leading-none">{etaMin}:{etaSec}</p>
                <p className="text-[10px] text-gray-400 mt-1.5">minutes remaining</p>
              </div>
              <div className="px-7 py-4 flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Unit</p>
                <p className="text-sm font-bold text-gray-900">Medic Unit Alpha-1</p>
                <p className="text-xs text-gray-400 mt-0.5">Site Ambulance</p>
              </div>
              <div className="px-7 py-4 flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Paramedic</p>
                <p className="text-sm font-bold text-gray-900">Ahmed Ali</p>
                <p className="text-xs text-gray-400 mt-0.5">Certified Paramedic</p>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100">
              <div className="col-span-2 p-5">
                <div className="bg-[#eef2ee] rounded-2xl border border-gray-200 overflow-hidden h-[220px] relative">
                  <svg width="100%" height="100%" viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg">
                    <rect width="420" height="220" fill="#eef2ee" />
                    <rect x="0"   y="95"  width="420" height="16" fill="#fff" opacity="0.7" />
                    <rect x="180" y="0"   width="16"  height="220" fill="#fff" opacity="0.7" />
                    <rect x="0"   y="45"  width="420" height="7"  fill="#fff" opacity="0.4" />
                    <rect x="0"   y="165" width="420" height="7"  fill="#fff" opacity="0.4" />
                    <rect x="80"  y="0"   width="7"   height="220" fill="#fff" opacity="0.4" />
                    <rect x="310" y="0"   width="7"   height="220" fill="#fff" opacity="0.4" />
                    <text x="30"  y="82" fontSize="8" fill="#9CA3AF" fontWeight="600">Zone A</text>
                    <text x="220" y="82" fontSize="8" fill="#9CA3AF" fontWeight="600">Zone B</text>
                    <line x1="75" y1="155" x2="265" y2="103" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
                    <circle cx="265" cy="103" r="36" fill="#FF3B30" opacity="0.10" stroke="#FF3B30" strokeWidth="1.2" strokeDasharray="4 3" />
                    <circle cx="75" cy="155" r="14" fill="#3B82F6" />
                    <text x="75" y="159" textAnchor="middle" fontSize="11" fill="white">🚑</text>
                    <text x="75" y="178" textAnchor="middle" fontSize="7.5" fill="#3B82F6" fontWeight="700">Alpha-1</text>
                    <circle cx="265" cy="103" r="14" fill="#FF3B30" />
                    <text x="265" y="107" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">{ini}</text>
                    <text x="265" y="126" textAnchor="middle" fontSize="7.5" fill="#FF3B30" fontWeight="700">{patient.zone.split('—')[0].trim()}</text>
                  </svg>
                  <div className="absolute bottom-3 left-3 flex items-center gap-3 bg-white/90 rounded-xl px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-semibold text-gray-600">Ambulance</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#FF3B30]" />
                      <span className="text-[10px] font-semibold text-gray-600">Worker</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Rescue Timeline</p>
                <div className="flex flex-col gap-0">
                  {[
                    { label: 'Call Received',     sub: '14:02:11 GST', status: 'done'    },
                    { label: 'Unit Dispatched',    sub: '14:02:14 GST', status: 'done'    },
                    { label: `En Route to ${patient.zone.split('—')[0].trim()}`, sub: 'In progress…', status: 'active' },
                    { label: 'Arrived at Patient', sub: 'Pending',      status: 'pending' },
                  ].map((item, i) => (
                    <div key={item.label} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                          item.status === 'done'    && 'bg-[#00D15A]',
                          item.status === 'active'  && 'bg-blue-500',
                          item.status === 'pending' && 'bg-gray-100 border border-gray-200',
                        )}>
                          {item.status === 'done'    && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          {item.status === 'active'  && <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />}
                          {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-gray-300" />}
                        </div>
                        {i < 3 && <div className={cn('w-px flex-1 my-1', item.status === 'done' ? 'bg-[#00D15A]/40' : 'bg-gray-200')} style={{ minHeight: 28 }} />}
                      </div>
                      <div className="pb-5">
                        <p className={cn(
                          'text-xs font-bold leading-none',
                          item.status === 'done'    && 'text-gray-700',
                          item.status === 'active'  && 'text-blue-600',
                          item.status === 'pending' && 'text-gray-400',
                        )}>
                          {item.label}
                        </p>
                        <p className={cn('text-[10px] mt-0.5', item.status === 'active' ? 'text-blue-400' : 'text-gray-400')}>
                          {item.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-7 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 bg-white border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <div className="flex gap-2.5">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors cursor-pointer">
                  <Radio className="w-4 h-4" />
                  Open Radio Comms with Driver
                </button>
                <button
                  onClick={() => setStep('arrived')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#00D15A] hover:bg-green-600 transition-colors cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Arrived
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── VIEW 3: ARRIVED ──────────────────────────────────────── */}
        {step === 'arrived' && (
          <div className="flex flex-col items-center justify-center px-10 py-16 gap-5 text-center">
            <div className="w-20 h-20 rounded-full bg-[#E3FAED] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#00D15A]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Unit Arrived at Patient</h2>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Medic Unit Alpha-1 has arrived at {patient.zone}. Ahmed Ali is attending to {patient.name}.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#E3FAED] px-5 py-3 rounded-2xl border border-[#00D15A]/20">
              <Phone className="w-4 h-4 text-[#00D15A]" />
              <span className="text-sm font-bold text-[#007A38]">
                Response time: {String(Math.floor((225 - eta) / 60)).padStart(2, '0')}:{String((225 - eta) % 60).padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="mt-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#00D15A] hover:bg-green-600 transition-colors cursor-pointer shadow-md"
            >
              Close &amp; Log Incident
            </button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}
