'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Clock, Building2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PendingRequest {
  name: string
  company: string
  email: string
  tier: string
  date: string
}

type RequestStatus = 'pending' | 'approved' | 'rejected'

interface RequestRow extends PendingRequest {
  id: string
  status: RequestStatus
}

// Seed mock data so the panel isn't empty on first load
const SEED_REQUESTS: RequestRow[] = [
  {
    id: 'seed-1',
    name: 'Mohammed Al-Rashid',
    company: 'BESIX Group UAE',
    email: 'mo.rashid@besixgroup.ae',
    tier: 'Enterprise — $30–45/worker/month',
    date: '2026-04-08T09:14:00.000Z',
    status: 'pending',
  },
  {
    id: 'seed-2',
    name: 'Sara Okonkwo',
    company: 'Arabtec Holding',
    email: 's.okonkwo@arabtec.ae',
    tier: 'Pro — $18–25/worker/month',
    date: '2026-04-09T14:33:00.000Z',
    status: 'pending',
  },
  {
    id: 'seed-3',
    name: 'James Whitfield',
    company: 'Khatib & Alami',
    email: 'j.whitfield@katb.ae',
    tier: 'Demo — 3 Day Trial',
    date: '2026-04-10T07:55:00.000Z',
    status: 'approved',
  },
]

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function TierBadge({ tier }: { tier: string }) {
  const isEnterprise = tier.toLowerCase().includes('enterprise')
  const isPro        = tier.toLowerCase().includes('pro')
  const isDemo       = tier.toLowerCase().includes('demo')

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
      isEnterprise && 'bg-purple-100 text-purple-700',
      isPro        && 'bg-emerald-100 text-emerald-700',
      isDemo       && 'bg-slate-100 text-slate-600',
    )}>
      {isEnterprise ? 'Enterprise' : isPro ? 'Pro' : 'Demo'}
    </span>
  )
}

function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      status === 'pending'  && 'bg-amber-100 text-amber-700',
      status === 'approved' && 'bg-emerald-100 text-emerald-700',
      status === 'rejected' && 'bg-red-100 text-red-600',
    )}>
      {status === 'pending'  && <Clock className="w-3 h-3" />}
      {status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'rejected' && <XCircle className="w-3 h-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

export default function EnterpriseRequestsPage() {
  const [rows, setRows] = useState<RequestRow[]>(SEED_REQUESTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Merge seed data with any dynamically submitted requests from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('pendingRequests') ?? '[]') as PendingRequest[]
      const dynamic: RequestRow[] = stored.map((r, i) => ({
        ...r,
        id: `dynamic-${i}`,
        status: 'pending',
        date: r.date ?? new Date().toISOString(),
      }))

      // Deduplicate by email — prefer dynamic over seed
      const emailsSeen = new Set(dynamic.map(r => r.email))
      const filtered   = SEED_REQUESTS.filter(r => !emailsSeen.has(r.email))

      setRows([...dynamic, ...filtered].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ))
    } catch {
      // keep seed data
    }
    setLoading(false)
  }, [])

  function updateStatus(id: string, status: RequestStatus) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const pending  = rows.filter(r => r.status === 'pending').length
  const approved = rows.filter(r => r.status === 'approved').length
  const rejected = rows.filter(r => r.status === 'rejected').length

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <Building2 className="w-5 h-5 text-slate-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Super Admin</p>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Enterprise Access Requests</h1>
            <p className="text-slate-500 text-sm mt-1">Review and action incoming enterprise registration requests</p>
          </div>
          <button
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 600)
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-amber-700">{pending}</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">Approved</p>
            <p className="text-3xl font-bold text-emerald-700">{approved}</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-1">Rejected</p>
            <p className="text-3xl font-bold text-red-600">{rejected}</p>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Company</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Email</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Requested Tier</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Loading requests…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                    No requests yet.
                  </td>
                </tr>
              ) : (
                rows.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">

                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {formatDate(row.date)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{row.name}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-slate-700">{row.company}</p>
                    </td>

                    <td className="px-5 py-4">
                      <a
                        href={`mailto:${row.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {row.email}
                      </a>
                    </td>

                    <td className="px-5 py-4">
                      <TierBadge tier={row.tier} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>

                    <td className="px-5 py-4">
                      {row.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateStatus(row.id, 'approved')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(row.id, 'rejected')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateStatus(row.id, 'pending')}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Undo
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-center text-slate-300 text-xs mt-6">
          HeatGuard HQ · Enterprise Access Management
        </p>

      </div>
    </div>
  )
}
