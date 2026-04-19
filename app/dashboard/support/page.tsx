'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Send, ChevronDown, Phone, Mail, MessageSquare,
  Wifi, Battery, Cpu, ShieldAlert, RefreshCw,
} from 'lucide-react'

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
type Priority = typeof PRIORITIES[number]

const PRIORITY_COLORS: Record<Priority, string> = {
  Low:      'text-gray-600',
  Medium:   'text-blue-600',
  High:     'text-amber-600',
  Critical: 'text-red-600',
}

interface FAQ {
  q: string
  a: string
  icon: React.ElementType
}

const FAQS: FAQ[] = [
  {
    icon: Cpu,
    q: 'How do I pair a new worker band?',
    a: 'Navigate to Settings → IoT & Hardware → click "Pair New Wearable". Put the HG-Band into pairing mode by holding the side button for 3 seconds until the LED pulses blue. Select the device in the list, enter the worker\'s badge ID, and confirm. The band will appear as Active within 60 seconds.',
  },
  {
    icon: Wifi,
    q: 'What happens if a band goes offline?',
    a: 'If a band loses connection for more than 2 minutes, it triggers an automatic "Device Offline" alert to the site supervisor. The worker\'s last known GPS position is retained. Check that the band is within 100m of a site gateway. You can force-reconnect from the IoT Fleet Management page.',
  },
  {
    icon: Battery,
    q: 'Why is the battery draining faster than expected?',
    a: 'High ambient temperatures above 45°C increase sensor polling frequency, which reduces battery life. Ensure the band is on firmware v3.2.1+, which introduced adaptive polling. Bands should be charged during the midday break (12:30–15:00) to maintain full-shift coverage.',
  },
  {
    icon: ShieldAlert,
    q: 'A worker\'s heat alert was a false positive. How do I dismiss it?',
    a: 'Go to the Incidents page, find the alert, and click "Acknowledge". Select "False Positive — Equipment Error" as the reason. This flags the reading in the audit log and suppresses future alerts for that band for 15 minutes while a recalibration runs automatically.',
  },
  {
    icon: RefreshCw,
    q: 'How do I push a firmware update to all devices?',
    a: 'From Settings → IoT & Hardware, use the filter to select all devices on firmware versions below v3.2.1. Click "Update Selected". Updates are pushed over-the-air via the site gateway and install automatically during a charging cycle. Expect 5–10 minutes per device.',
  },
  {
    icon: MessageSquare,
    q: 'Can workers receive messages without a smartphone?',
    a: 'Yes. The HG-Band supports haptic alerts and a single-line LED ticker for short system messages (up to 40 characters). For full message functionality, workers need the HeatGuard mobile PWA installed on their phone, which works on any iOS 15+ or Android 10+ device.',
  },
]

export default function SupportPage() {
  const [subject,     setSubject]     = useState('')
  const [priority,    setPriority]    = useState<Priority>('Medium')
  const [description, setDescription] = useState('')
  const [submitted,   setSubmitted]   = useState(false)
  const [openFAQ,     setOpenFAQ]     = useState<number | null>(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Help &amp; Support</h1>
        <p className="text-sm text-gray-500 mt-1">Submit a support ticket or browse common troubleshooting guides.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ── Left: Ticket form ─────────────────────────────────── */}
        <div className="col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-900 mb-5">Submit a Support Ticket</h2>

            {submitted ? (
              <div className="flex flex-col items-center text-center gap-3 py-8">
                <div className="w-14 h-14 rounded-2xl bg-[#E3FAED] flex items-center justify-center">
                  <Send className="w-6 h-6 text-[#00D15A]" />
                </div>
                <p className="text-base font-bold text-gray-900">Ticket Submitted</p>
                <p className="text-sm text-gray-500 max-w-[240px]">Our IT team will respond within 2 business hours. Check your email for a confirmation.</p>
                <button
                  onClick={() => { setSubmitted(false); setSubject(''); setDescription('') }}
                  className="mt-2 text-xs font-semibold text-[#007A38] hover:underline cursor-pointer"
                >
                  Submit another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Subject</label>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. HG-Band-092 not syncing"
                    className="w-full h-10 px-3.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 outline-none focus:border-[#00D15A] focus:ring-2 focus:ring-[#00D15A]/15 transition-all"
                  />
                </div>

                {/* Priority */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Priority</label>
                  <div className="relative">
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value as Priority)}
                      className={cn(
                        'w-full h-10 pl-3.5 pr-9 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold outline-none focus:border-[#00D15A] focus:ring-2 focus:ring-[#00D15A]/15 transition-all appearance-none cursor-pointer',
                        PRIORITY_COLORS[priority]
                      )}
                    >
                      {PRIORITIES.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600">Description</label>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail. Include device IDs, error messages, and steps to reproduce."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 outline-none focus:border-[#00D15A] focus:ring-2 focus:ring-[#00D15A]/15 transition-all resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#0B281F] hover:bg-[#0d3325] text-white text-sm font-semibold transition-colors cursor-pointer shadow-md shadow-[#0B281F]/20"
                >
                  <Send className="w-4 h-4" /> Submit to IT
                </button>
              </form>
            )}
          </div>

          {/* Emergency hotline */}
          <div className="bg-[#0B281F] rounded-3xl p-6 space-y-4">
            <p className="text-xs font-bold text-[#00D15A] uppercase tracking-widest">Emergency Support</p>
            <p className="text-sm text-white/80 leading-relaxed">
              For critical hardware failures affecting live worker safety, contact our 24/7 emergency line directly.
            </p>
            <div className="space-y-2.5">
              <a href="tel:+97142001234" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                <Phone className="w-4 h-4 text-[#00D15A]" />
                <div>
                  <p className="text-xs text-white/50 font-medium">Emergency Hotline</p>
                  <p className="text-sm font-bold text-white">+971 4 200 1234</p>
                </div>
              </a>
              <a href="mailto:emergency@heatguard.ai" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors cursor-pointer">
                <Mail className="w-4 h-4 text-[#00D15A]" />
                <div>
                  <p className="text-xs text-white/50 font-medium">Priority Email</p>
                  <p className="text-sm font-bold text-white">emergency@heatguard.ai</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* ── Right: FAQs ───────────────────────────────────────── */}
        <div className="col-span-7">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-bold text-gray-900 mb-5">Common FAQs</h2>

            <div className="space-y-2">
              {FAQS.map((faq, i) => {
                const isOpen = openFAQ === i
                const Icon = faq.icon
                return (
                  <div
                    key={i}
                    className={cn(
                      'rounded-2xl border transition-all overflow-hidden',
                      isOpen ? 'border-[#00D15A]/30 bg-[#E3FAED]/40' : 'border-gray-100 bg-gray-50'
                    )}
                  >
                    <button
                      onClick={() => setOpenFAQ(isOpen ? null : i)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left cursor-pointer"
                    >
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                        isOpen ? 'bg-[#E3FAED]' : 'bg-white border border-gray-200'
                      )}>
                        <Icon className={cn('w-3.5 h-3.5', isOpen ? 'text-[#00D15A]' : 'text-gray-400')} />
                      </div>
                      <span className={cn('flex-1 text-sm font-semibold leading-snug', isOpen ? 'text-[#0B281F]' : 'text-gray-800')}>
                        {faq.q}
                      </span>
                      <ChevronDown className={cn(
                        'w-4 h-4 flex-shrink-0 transition-transform',
                        isOpen ? 'rotate-180 text-[#00D15A]' : 'text-gray-300'
                      )} />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="pl-10">
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
