'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ClipboardList,
  ChevronDown,
} from 'lucide-react'

// Used only for inline tier updates (write via RLS-authenticated path)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const TIERS = [
  'Demo — 3 Day Trial',
  'Pro — $18–25/worker/month',
  'Enterprise — $30–45/worker/month',
]

type Status = 'pending' | 'active' | 'declined'

interface DemoRequest {
  id: string
  created_at: string
  name: string
  company: string
  email: string
  phone: string | null
  team_size: string | null
  tier: string | null
  status: Status
  expires_at: string | null
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
      status === 'pending'  && 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
      status === 'active'   && 'bg-[#00D15A]/15 text-[#00D15A] border border-[#00D15A]/20',
      status === 'declined' && 'bg-red-500/10 text-red-400 border border-red-500/20',
    )}>
      {status === 'pending'  && <Clock      className="w-3 h-3" />}
      {status === 'active'   && <CheckCircle2 className="w-3 h-3" />}
      {status === 'declined' && <XCircle    className="w-3 h-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function TierSelect({
  value,
  requestId,
  onSaved,
}: {
  value: string | null
  requestId: string
  onSaved: (id: string, tier: string) => void
}) {
  const [editing, setEditing]   = useState(false)
  const [selected, setSelected] = useState(value ?? '')
  const [saving, setSaving]     = useState(false)

  async function save() {
    setSaving(true)
    const { error } = await supabase
      .from('demo_requests')
      .update({ tier: selected })
      .eq('id', requestId)
    setSaving(false)
    if (!error) {
      onSaved(requestId, selected)
      setEditing(false)
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors group"
      >
        <span className="truncate max-w-[140px]">{value ?? '—'}</span>
        <ChevronDown className="w-3 h-3 text-gray-600 group-hover:text-gray-400 flex-shrink-0" />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={selected}
        onChange={e => setSelected(e.target.value)}
        className="text-xs bg-white/10 border border-white/15 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-[#00D15A]/50 cursor-pointer"
      >
        {TIERS.map(t => (
          <option key={t} value={t} className="bg-[#0A1915]">{t}</option>
        ))}
      </select>
      <button
        onClick={save}
        disabled={saving}
        className="text-xs px-2.5 py-1.5 bg-[#00D15A]/20 hover:bg-[#00D15A]/30 text-[#00D15A] rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {saving ? '…' : 'Save'}
      </button>
      <button
        onClick={() => { setSelected(value ?? ''); setEditing(false) }}
        className="text-xs px-2 py-1.5 text-gray-500 hover:text-gray-300 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function DemoRequestsPage() {
  const [rows, setRows]       = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing]   = useState<string | null>(null)
  const [toast, setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function fetchRows() {
    setLoading(true)
    try {
      const res = await fetch('/api/hq/demo-requests')
      if (res.ok) {
        const data = await res.json()
        setRows(data as DemoRequest[])
      }
    } catch (e) {
      console.error('Failed to fetch demo requests:', e)
    }
    setLoading(false)
  }

  useEffect(() => { fetchRows() }, [])

  async function approve(id: string) {
    const row = rows.find(r => r.id === id)
    if (!row) return

    setActing(id)
    try {
      const res = await fetch('/api/hq/approve-demo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ id, email: row.email, name: row.name, company: row.company, tier: row.tier }),
      })

      const json = await res.json()

      if (!res.ok) {
        showToast('error', json.error ?? 'Approval failed. Please try again.')
      } else {
        setRows(prev => prev.map(r =>
          r.id === id ? { ...r, status: 'active', expires_at: json.expiresAt } : r
        ))
        showToast('success', `Approved — welcome email sent to ${row.email}`)
      }
    } catch {
      showToast('error', 'Network error. Please try again.')
    }
    setActing(null)
  }

  async function decline(id: string) {
    setActing(id)
    const { error } = await supabase
      .from('demo_requests')
      .update({ status: 'declined' })
      .eq('id', id)

    if (!error) {
      setRows(prev => prev.map(r =>
        r.id === id ? { ...r, status: 'declined' } : r
      ))
    }
    setActing(null)
  }

  function onTierSaved(id: string, tier: string) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, tier } : r))
  }

  const pending  = rows.filter(r => r.status === 'pending').length
  const active   = rows.filter(r => r.status === 'active').length
  const declined = rows.filter(r => r.status === 'declined').length

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <ClipboardList className="w-5 h-5 text-[#00D15A]" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Super Admin</p>
          </div>
          <h1 className="text-2xl font-bold text-white">Demo Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Manage incoming demo and trial access requests</p>
        </div>
        <button
          onClick={fetchRows}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">Pending</p>
          <p className="text-3xl font-bold text-amber-300">{pending}</p>
        </div>
        <div className="bg-[#00D15A]/10 border border-[#00D15A]/20 rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold text-[#00D15A] uppercase tracking-widest mb-1">Active</p>
          <p className="text-3xl font-bold text-[#00D15A]">{active}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-1">Declined</p>
          <p className="text-3xl font-bold text-red-400">{declined}</p>
        </div>
      </div>

      {/* Table */}
      <div className="relative rounded-2xl overflow-hidden border border-white/8">

        {/* Gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D15A]/8 via-transparent to-transparent pointer-events-none" />

        <div className="relative overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                {['Date', 'Name', 'Company', 'Email', 'Phone', 'Team', 'Tier', 'Status', 'Expires', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-gray-600 text-sm">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00D15A]/40" />
                    Loading requests…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-12 text-center text-gray-600 text-sm">
                    No demo requests yet.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} className="hover:bg-white/3 transition-colors">

                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap text-xs">
                      {formatDate(row.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-white">{row.name}</p>
                    </td>

                    <td className="px-5 py-4 text-gray-300 whitespace-nowrap">
                      {row.company}
                    </td>

                    <td className="px-5 py-4">
                      <a href={`mailto:${row.email}`} className="text-[#00D15A]/80 hover:text-[#00D15A] transition-colors text-xs">
                        {row.email}
                      </a>
                    </td>

                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {row.phone ?? '—'}
                    </td>

                    <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">
                      {row.team_size ?? '—'}
                    </td>

                    <td className="px-5 py-4 min-w-[160px]">
                      <TierSelect value={row.tier} requestId={row.id} onSaved={onTierSaved} />
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={row.status} />
                    </td>

                    <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {row.expires_at ? formatDate(row.expires_at) : '—'}
                    </td>

                    <td className="px-5 py-4">
                      {row.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approve(row.id)}
                            disabled={acting === row.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#00D15A] bg-[#00D15A]/10 border border-[#00D15A]/20 rounded-lg hover:bg-[#00D15A]/20 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => decline(row.id)}
                            disabled={acting === row.id}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </div>
                      ) : row.status === 'active' ? (
                        <button
                          onClick={() => decline(row.id)}
                          disabled={acting === row.id}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => approve(row.id)}
                          disabled={acting === row.id}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                        >
                          Re-approve
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-gray-700 text-xs">
        HeatGuard HQ · Demo Access Management
      </p>

      {/* Toast notification */}
      {toast && (
        <div className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold transition-all',
          toast.type === 'success'
            ? 'bg-[#00D15A] text-white'
            : 'bg-red-500 text-white',
        )}>
          {toast.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <XCircle      className="w-4 h-4 flex-shrink-0" />}
          {toast.msg}
        </div>
      )}

    </div>
  )
}
