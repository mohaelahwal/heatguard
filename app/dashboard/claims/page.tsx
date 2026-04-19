'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Download,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Upload,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ToastMsg {
  id: number
  message: string
}

interface Claim {
  id:           string
  worker:       string
  badge:        string
  incident:     string
  date:         string
  amount:       string
  coverage:     string
  insurer:      string
  status:       'pending' | 'reviewing' | 'approved' | 'rejected'
  daysOpen:     number
  docsComplete: boolean
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CLAIMS: Claim[] = [
  {
    id:           'CLM-2024-041',
    worker:       'Rajesh Kumar',
    badge:        '#0047',
    incident:     'Heat Stroke — Zone B',
    date:         '18 Mar 2026',
    amount:       'AED 12,400',
    coverage:     'AED 9,920',
    insurer:      'AXA Insurance Gulf',
    status:       'pending',
    daysOpen:     13,
    docsComplete: false,
  },
  {
    id:           'CLM-2024-040',
    worker:       'Ahmad Al-Farsi',
    badge:        '#0023',
    incident:     'Heat Exhaustion — Zone A',
    date:         '14 Mar 2026',
    amount:       'AED 8,750',
    coverage:     'AED 7,000',
    insurer:      'ADNIC',
    status:       'approved',
    daysOpen:     17,
    docsComplete: true,
  },
  {
    id:           'CLM-2024-039',
    worker:       'Carlos Mendez',
    badge:        '#0061',
    incident:     'Fall — Construction Level 4',
    date:         '09 Mar 2026',
    amount:       'AED 22,100',
    coverage:     'AED 18,785',
    insurer:      'AXA Insurance Gulf',
    status:       'reviewing',
    daysOpen:     22,
    docsComplete: true,
  },
  {
    id:           'CLM-2024-038',
    worker:       'Mohammed Al-Rashid',
    badge:        '#0038',
    incident:     'Heat Stress — Rooftop Zone',
    date:         '03 Mar 2026',
    amount:       'AED 6,200',
    coverage:     'AED 0',
    insurer:      'Oman Re Insurance',
    status:       'rejected',
    daysOpen:     28,
    docsComplete: false,
  },
  {
    id:           'CLM-2024-037',
    worker:       'Priya Sharma',
    badge:        '#0055',
    incident:     'SOS — Medical Emergency',
    date:         '28 Feb 2026',
    amount:       'AED 31,800',
    coverage:     'AED 27,030',
    insurer:      'ADNIC',
    status:       'approved',
    daysOpen:     31,
    docsComplete: true,
  },
  {
    id:           'CLM-2024-036',
    worker:       'Yusuf Ibrahim',
    badge:        '#0029',
    incident:     'Heat Exhaustion — Zone C',
    date:         '22 Feb 2026',
    amount:       'AED 9,500',
    coverage:     'AED 7,600',
    insurer:      'AXA Insurance Gulf',
    status:       'pending',
    daysOpen:     37,
    docsComplete: false,
  },
]

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bg:    'bg-yellow-100',
    text:  'text-yellow-700',
  },
  reviewing: {
    label: 'Under Review',
    bg:    'bg-blue-100',
    text:  'text-blue-700',
  },
  approved: {
    label: 'Approved',
    bg:    'bg-green-100',
    text:  'text-green-700',
  },
  rejected: {
    label: 'Rejected',
    bg:    'bg-red-100',
    text:  'text-red-700',
  },
}

const INSURERS = [
  {
    name:     'AXA Insurance Gulf',
    lastSync: '12 mins ago',
    pending:  2,
  },
  {
    name:     'ADNIC',
    lastSync: '34 mins ago',
    pending:  2,
  },
  {
    name:     'Daman Health',
    lastSync: '1 hr ago',
    pending:  0,
  },
]

// ── Toast ─────────────────────────────────────────────────────────────────────

function Toast({
  id,
  message,
  onDismiss,
}: {
  id: number
  message: string
  onDismiss: (id: number) => void
}) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(id), 3500)
    return () => clearTimeout(t)
  }, [id, onDismiss])

  return (
    <div
      role="alert"
      className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgb(0,0,0,0.12)] border border-gray-100 max-w-sm animate-in slide-in-from-right duration-300"
    >
      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="w-4 h-4 text-[#00D15A]" />
      </div>
      <p className="text-sm font-medium text-gray-900 flex-1">{message}</p>
      <button
        onClick={() => onDismiss(id)}
        className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        aria-label="Dismiss"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Insurer Portal Modal ───────────────────────────────────────────────────────

function InsurerPortalModal({
  open,
  onClose,
  onToast,
}: {
  open: boolean
  onClose: () => void
  onToast: (msg: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        showCloseButton
        className="sm:max-w-[42rem] shadow-2xl p-0 gap-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-gray-100 gap-1">
          <DialogTitle className="text-base font-bold text-gray-900">
            Insurer Integration Portals
          </DialogTitle>
          <p className="text-xs text-gray-400">
            Manage external portal connections and batch claim syncing.
          </p>
        </DialogHeader>

        {/* Insurer list */}
        <div className="p-6 space-y-3">
          {INSURERS.map((ins) => (
            <div
              key={ins.name}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4"
            >
              {/* Logo placeholder */}
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{ins.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A] flex-shrink-0" />
                  <span className="text-[11px] text-[#00D15A] font-semibold">
                    API Connected
                  </span>
                  <span className="text-[11px] text-gray-400">
                    · Last sync {ins.lastSync}
                  </span>
                </div>
                {ins.pending > 0 && (
                  <span className="mt-1.5 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                    {ins.pending} claim{ins.pending > 1 ? 's' : ''} pending sync
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => onToast(`Syncing pending claims with ${ins.name}…`)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-[#00D15A] text-white hover:bg-green-600 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sync Pending Claims
                </button>
                <button
                  onClick={() => onToast(`Opening ${ins.name} portal…`)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open Portal
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="-mx-0 px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end rounded-b-xl">
          <DialogClose
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Claim Details Modal ────────────────────────────────────────────────────────

const DOCS = [
  { label: 'Emirates ID Copy',       required: true },
  { label: 'Hospital Medical Report', required: true },
  { label: 'AI Heat Incident Log',    required: false },
]

function ClaimDetailsModal({
  claim,
  onClose,
  onToast,
}: {
  claim: Claim | null
  onClose: () => void
  onToast: (msg: string) => void
}) {
  if (!claim) return null
  const cfg = STATUS_CONFIG[claim.status]

  const docStatuses = DOCS.map((doc) => ({
    label:    doc.label,
    present:  doc.required || claim.docsComplete,
  }))

  return (
    <Dialog open={!!claim} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent
        showCloseButton
        className="sm:max-w-[42rem] shadow-2xl p-0 gap-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4 pr-6">
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                {claim.worker}
              </DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {claim.badge} · {claim.id}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">

          {/* Section 1 — Financials */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Financial Summary
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Total Claim Amount
                </p>
                <p className="text-2xl font-bold text-gray-900 tabular-nums">{claim.amount}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Submitted by employer</p>
              </div>
              <div className="rounded-2xl bg-gray-50 border border-gray-100 px-5 py-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Expected Coverage
                </p>
                <p className={`text-2xl font-bold tabular-nums ${claim.status === 'rejected' ? 'text-red-500' : 'text-[#00D15A]'}`}>
                  {claim.coverage}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {claim.status === 'rejected' ? 'Claim rejected' : 'Est. insurer payout'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 — Incident Link */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Linked Incident
            </p>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-100 border border-gray-200 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-700 truncate">
                    Linked to: {claim.incident}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Filed {claim.date} · {claim.insurer}</p>
                </div>
              </div>
              <button
                onClick={() => onToast('Opening incident report…')}
                className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer flex-shrink-0"
              >
                <FileText className="w-3 h-3" />
                View Report
              </button>
            </div>
          </div>

          {/* Section 3 — Document Checklist */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Document Checklist
            </p>
            <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {docStatuses.map((doc) => (
                <div key={doc.label} className="flex items-center gap-3 px-5 py-3 bg-white">
                  {doc.present ? (
                    <CheckCircle className="w-4 h-4 text-[#00D15A] flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                  <p className={`text-sm font-medium flex-1 ${doc.present ? 'text-gray-700' : 'text-gray-900'}`}>
                    {doc.label}
                  </p>
                  {doc.present ? (
                    <span className="text-[11px] font-semibold text-[#00D15A] bg-green-50 px-2 py-0.5 rounded-full">
                      Uploaded
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Missing
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-3 rounded-b-xl">
          {!claim.docsComplete ? (
            <button
              onClick={() => onToast('Opening document upload…')}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl bg-[#00D15A] text-white hover:bg-green-600 transition-colors cursor-pointer shadow-md shadow-[#00D15A]/20"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Missing Docs
            </button>
          ) : (
            <div />
          )}
          <DialogClose className="text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            Close
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ClaimsPage() {
  const [toasts,        setToasts]        = useState<ToastMsg[]>([])
  const [insurerOpen,   setInsurerOpen]   = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)

  const addToast = useCallback((message: string) => {
    setToasts((prev) => [...prev, { id: Date.now(), message }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Toasts */}
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} message={t.message} onDismiss={removeToast} />
      ))}

      {/* Modals */}
      <InsurerPortalModal
        open={insurerOpen}
        onClose={() => setInsurerOpen(false)}
        onToast={addToast}
      />
      <ClaimDetailsModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
        onToast={addToast}
      />

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Claims &amp; Insurance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Worker compensation · Insurer integrations · Payout tracking · Palm Jebel Ali Site A
          </p>
        </div>
        <button
          onClick={() => addToast('Generating claims report…')}
          className="flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* ── Executive ROI — Financial Impact (MTD) ───────────────────────────── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Financial Impact (Month-to-Date)
        </p>
        <div className="grid grid-cols-2 gap-5">

          {/* Card 1 — Total Claims Cost (red / spending) */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-600">
                Total Claims Cost
                <span className="block text-xs text-gray-400 font-normal mt-0.5">
                  Company Liability · MTD
                </span>
              </p>
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-red-500" />
              </div>
            </div>

            <p className="text-4xl font-bold text-red-600 tabular-nums tracking-tight">
              AED 142,500
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-red-400">
                <TrendingUp className="w-3.5 h-3.5" />
                ↑ 4.2% vs last month
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                  Paid Out
                </p>
                <p className="text-sm font-bold text-gray-900 tabular-nums mt-0.5">AED 89,200</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                  Pending
                </p>
                <p className="text-sm font-bold text-gray-900 tabular-nums mt-0.5">AED 41,700</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                  Disputed
                </p>
                <p className="text-sm font-bold text-gray-900 tabular-nums mt-0.5">AED 11,600</p>
              </div>
            </div>
          </div>

          {/* Card 2 — HeatGuard Savings (green / win) */}
          <div className="bg-gradient-to-br from-white to-[#E3FAED] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-[#00D15A]/30">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-gray-600">
                HeatGuard Estimated Savings
                <span className="block text-xs text-gray-400 font-normal mt-0.5">
                  Incidents prevented · MTD
                </span>
              </p>
              <div className="w-10 h-10 rounded-xl bg-[#00D15A]/15 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#00D15A]" />
              </div>
            </div>

            <p className="text-4xl font-bold text-[#00D15A] tabular-nums tracking-tight">
              AED 385,000
            </p>

            <div className="mt-3 flex flex-col gap-1">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#00D15A]">
                <TrendingUp className="w-3.5 h-3.5" />
                ↑ 12.5% vs last month
              </span>
              <p className="text-xs text-gray-400">
                Based on 18 critical heat incidents prevented
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-[#00D15A]/20 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                  SOS Averted
                </p>
                <p className="text-sm font-bold text-gray-900 tabular-nums mt-0.5">7 events</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                  Breaks Enforced
                </p>
                <p className="text-sm font-bold text-gray-900 tabular-nums mt-0.5">142 breaks</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                  ROI Ratio
                </p>
                <p className="text-sm font-bold text-[#00D15A] tabular-nums mt-0.5">2.7×</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 4 Operational Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-5">

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Active Claims
            </p>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">6</p>
          <p className="text-xs text-gray-400 mt-1">3 pending · 1 reviewing</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Pending Payouts
            </p>
            <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">AED 41.7k</p>
          <p className="text-xs text-gray-400 mt-1">Awaiting insurer approval</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Avg Resolution
            </p>
            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#00D15A]" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">18 days</p>
          <p className="text-xs text-gray-400 mt-1">↓ 3 days vs last quarter</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Rejected Claims
            </p>
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 tabular-nums">1</p>
          <p className="text-xs text-gray-400 mt-1">Documentation missing</p>
        </div>

      </div>

      {/* ── Claims Table ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Claims Register</h2>
            <p className="text-xs text-gray-400 mt-0.5">All open and recent claims · Site A</p>
          </div>
          <button
            onClick={() => setInsurerOpen(true)}
            className="flex items-center gap-2 bg-[#00D15A] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-green-600 transition-colors duration-150 cursor-pointer shadow-lg shadow-[#00D15A]/30"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Insurer Portal
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Claim ID', 'Worker', 'Incident', 'Date Filed', 'Amount', 'Insurer', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLAIMS.map((claim) => {
                const cfg = STATUS_CONFIG[claim.status]
                return (
                  <tr
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-50 last:border-0"
                  >
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-mono text-gray-500">{claim.id}</span>
                    </td>
                    <td className="py-3.5 px-5">
                      <p className="text-sm font-semibold text-gray-900">{claim.worker}</p>
                      <p className="text-[11px] text-gray-400">{claim.badge}</p>
                    </td>
                    <td className="py-3.5 px-5 text-sm text-gray-600 max-w-[200px] truncate">
                      {claim.incident}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-500 whitespace-nowrap">
                      {claim.date}
                    </td>
                    <td className="py-3.5 px-5 text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                      {claim.amount}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-500 whitespace-nowrap">
                      {claim.insurer}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div
                        aria-label={`Open claim ${claim.id}`}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-50 text-xs text-gray-400">
          Showing {CLAIMS.length} claims · {CLAIMS.filter(c => c.status === 'approved').length} approved · {CLAIMS.filter(c => c.status === 'pending' || c.status === 'reviewing').length} in progress · {CLAIMS.filter(c => c.status === 'rejected').length} rejected
        </div>
      </div>

    </div>
  )
}
