'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Phone, MessageSquare, ChevronRight, X, Send, PhoneOff, Check, CheckCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'

const INCIDENTS = [
  {
    id: 'INC-001',
    name: 'George Adam',
    badge: 'GA-0203',
    type: 'Heat Exhaustion',
    severity: 'critical' as const,
    location: 'Zone B-4',
    time: '09:12',
    status: 'pending',
  },
  {
    id: 'INC-002',
    name: 'Vinay Barad',
    badge: 'VB-0144',
    type: 'Dizziness Reported',
    severity: 'high' as const,
    location: 'Zone A-2',
    time: '09:34',
    status: 'reviewing',
  },
  {
    id: 'INC-003',
    name: 'Indira Comar',
    badge: 'IC-0089',
    type: 'High Heat Index',
    severity: 'warning' as const,
    location: 'Zone C-1',
    time: '09:51',
    status: 'monitoring',
  },
].sort((a, b) => {
  const order = { critical: 0, high: 1, warning: 2 }
  return order[a.severity] - order[b.severity]
})

type Incident = typeof INCIDENTS[number]

const severityConfig = {
  critical: {
    pill: 'bg-red-100 text-red-700',
    dot:  'bg-[#FF3B30]',
    ring: 'ring-red-100',
    label: 'Critical',
    avatar: 'bg-red-100 text-red-700',
  },
  high: {
    pill: 'bg-orange-100 text-orange-700',
    dot:  'bg-[#FF6B00]',
    ring: 'ring-orange-100',
    label: 'High',
    avatar: 'bg-orange-100 text-orange-700',
  },
  warning: {
    pill: 'bg-amber-100 text-amber-700',
    dot:  'bg-[#FFCC00]',
    ring: 'ring-amber-100',
    label: 'Warning',
    avatar: 'bg-amber-100 text-amber-700',
  },
}

const statusConfig: Record<string, string> = {
  pending:    'bg-red-50 text-red-600',
  reviewing:  'bg-orange-50 text-orange-600',
  monitoring: 'bg-amber-50 text-amber-600',
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('')
}

function WorkerAvatar({ name }: { name: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#0B281F] text-[#00D15A] flex items-center justify-center text-xs font-bold shrink-0">
      {initials(name)}
    </div>
  )
}

/* ── Voice Call Modal ─────────────────────────────────────────────── */
function VoiceCallModal({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  return (
    <Dialog open={!!incident} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="max-w-sm p-0 overflow-hidden rounded-3xl border-0"
        showCloseButton={false}
      >
        {incident && (
          <div
            className="flex flex-col items-center px-8 pt-10 pb-8 text-white"
            style={{ background: 'linear-gradient(160deg, #0A1F16 0%, #00421D 60%, #005c28 100%)' }}
          >
            {/* Header */}
            <DialogTitle className="sr-only">Voice Call — {incident.name}</DialogTitle>
            <p className="text-xs text-emerald-400/80 uppercase tracking-widest font-semibold mb-6">
              Voice Call
            </p>

            {/* Pulsing avatar */}
            <div className="relative mb-6">
              <span className="absolute inset-0 rounded-full bg-[#00D15A]/20 animate-ping" />
              <span className="absolute inset-[-8px] rounded-full bg-[#00D15A]/10 animate-ping [animation-delay:0.3s]" />
              <div className={cn(
                'relative w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ring-4 ring-white/20',
                severityConfig[incident.severity].avatar,
              )}>
                {initials(incident.name)}
              </div>
            </div>

            {/* Name + status */}
            <h2 className="text-xl font-bold text-white">{incident.name}</h2>
            <p className="text-sm text-emerald-300/80 mt-1 mb-2">{incident.badge} · {incident.location}</p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-300 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Connecting…
            </div>

            {/* Audio waveform */}
            <div className="flex items-end gap-1 h-8 mb-8">
              {[3, 6, 10, 14, 10, 16, 8, 14, 10, 6, 3].map((h, i) => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-emerald-400/60"
                  style={{
                    height: `${h}px`,
                    animation: `pulse 1.2s ease-in-out ${(i * 0.1).toFixed(1)}s infinite alternate`,
                  }}
                />
              ))}
            </div>

            {/* End Call button */}
            <button
              onClick={onClose}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center shadow-lg"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
            <p className="text-xs text-white/40 mt-3">Tap to end call</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* ── Messaging Modal ─────────────────────────────────────────────── */
const QUICK_REPLIES = [
  'We are sending help now',
  'Please stay in the shade',
  'Medical team is on the way',
  'Are you able to respond?',
]

type ChatMessage = { id: number; text: string; status: 'Delivered' | 'Seen' }

function MessagingModal({ incident, onClose }: { incident: Incident | null; onClose: () => void }) {
  const [msg,         setMsg]         = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
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
    <Dialog
      open={!!incident}
      onOpenChange={(open) => { if (!open) closeAndReset() }}
    >
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl" showCloseButton={false}>
        {incident && (
          <>
            {/* Header */}
            <div className="relative bg-[#00421D] px-5 py-4">
              <button
                onClick={closeAndReset}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-lg hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 pr-8">
                <div className={cn(
                  'relative w-11 h-11 rounded-full flex items-center justify-center text-base font-bold ring-2 ring-white/20',
                  severityConfig[incident.severity].avatar,
                )}>
                  {initials(incident.name)}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#00421D]" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-sm font-bold text-white leading-tight">
                    {incident.name}
                  </DialogTitle>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5 font-mono">{incident.badge} · {incident.location}</p>
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div
              className="px-5 py-5 flex flex-col gap-3 overflow-y-auto"
              style={{ background: 'linear-gradient(to bottom, #f8faf9, #f1f5f3)', minHeight: 120, maxHeight: 240 }}
            >
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 my-auto">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    Send a priority message to <span className="font-semibold text-slate-600">{incident.name.split(' ')[0]}</span>
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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Quick Replies
              </p>
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
                  placeholder={`Message ${incident.name.split(' ')[0]}…`}
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

/* ── Main Component ───────────────────────────────────────────────── */
export function OpenIncidentsList() {
  const [callingIncident,   setCallingIncident]   = useState<Incident | null>(null)
  const [messagingIncident, setMessagingIncident] = useState<Incident | null>(null)

  return (
    <>
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Open Incidents</h3>
            <p className="text-xs text-gray-400 mt-0.5">Requires action</p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-red-50 text-red-600 font-semibold rounded-full">
            3 open
          </span>
        </div>

        <div className="space-y-2">
          {INCIDENTS.map((inc) => {
            const { pill, dot, ring } = severityConfig[inc.severity]
            return (
              <div
                key={inc.id}
                className={cn(
                  'rounded-2xl p-3 bg-white space-y-2',
                  inc.severity === 'critical' ? 'ring-2 ring-red-300' : `ring-1 ${ring}`
                )}
              >
                {/* Header row */}
                <div className="flex items-center gap-2.5">
                  <WorkerAvatar name={inc.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{inc.name}</p>
                    <p className="text-[10px] text-gray-400">{inc.badge} · {inc.location}</p>
                  </div>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', pill, inc.severity === 'critical' && 'animate-pulse')}>
                    <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-1', dot)} />
                    {severityConfig[inc.severity].label}
                  </span>
                </div>

                {/* Incident details */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-700">{inc.type}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{inc.id} · {inc.time}</p>
                  </div>
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize', statusConfig[inc.status])}>
                    {inc.status}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setCallingIncident(inc)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1 rounded-xl bg-[#00D15A] text-white hover:bg-green-600 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    Call
                  </button>
                  <button
                    onClick={() => setMessagingIncident(inc)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-semibold py-1 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Message
                  </button>
                  <button className="w-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <VoiceCallModal   incident={callingIncident}   onClose={() => setCallingIncident(null)} />
      <MessagingModal   incident={messagingIncident} onClose={() => setMessagingIncident(null)} />
    </>
  )
}
