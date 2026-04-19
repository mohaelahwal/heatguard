'use client'

import { useState } from 'react'
import {
  TrendingUp, AlertTriangle, BarChart3, MoreHorizontal,
  Download, Eye, Send, CheckCircle2, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

/* ─── Types ───────────────────────────────────────────────────────── */
type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue'

interface Invoice {
  id:       string
  client:   string
  amount:   number
  date:     string
  status:   InvoiceStatus
}

/* ─── Mock Data ───────────────────────────────────────────────────── */
const INVOICES: Invoice[] = [
  { id: 'INV-2026-0041', client: 'Al Habtoor Group',      amount: 12400, date: '2026-04-01', status: 'Paid'    },
  { id: 'INV-2026-0040', client: 'Emaar Properties',      amount:  8750, date: '2026-04-01', status: 'Pending' },
  { id: 'INV-2026-0039', client: 'ALEC Construction',     amount: 15200, date: '2026-03-28', status: 'Paid'    },
  { id: 'INV-2026-0038', client: 'Arabtec Holdings',      amount:  6300, date: '2026-03-25', status: 'Overdue' },
  { id: 'INV-2026-0037', client: 'Drake & Scull',         amount:  9100, date: '2026-03-20', status: 'Paid'    },
  { id: 'INV-2026-0036', client: 'Gulf Contractors',      amount:  4800, date: '2026-03-18', status: 'Overdue' },
  { id: 'INV-2026-0035', client: 'Al Naboodah Group',     amount: 11500, date: '2026-03-15', status: 'Pending' },
  { id: 'INV-2026-0034', client: 'Khansaheb Civil Eng.',  amount:  7200, date: '2026-03-10', status: 'Paid'    },
]

/* ─── Inline Toast ────────────────────────────────────────────────── */
interface ToastMsg { id: number; text: string; type?: 'success' | 'info' }

function useToasts() {
  const [toasts, setToasts] = useState<ToastMsg[]>([])
  function push(text: string, type: ToastMsg['type'] = 'success') {
    const id = Date.now()
    setToasts(t => [...t, { id, text, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }
  return { toasts, push }
}

/* ─── KPI Card ────────────────────────────────────────────────────── */
function KpiCard({
  title, value, sub, icon, iconColor,
}: {
  title:     string
  value:     string
  sub:       React.ReactNode
  icon:      React.ReactNode
  iconColor: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">{title}</span>
        <div className={`rounded-lg p-2 ${iconColor}`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-zinc-50 tracking-tight">{value}</p>
        <div className="mt-1 text-sm">{sub}</div>
      </div>
    </div>
  )
}

/* ─── Status Badge ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const styles: Record<InvoiceStatus, string> = {
    Paid:    'bg-emerald-500/15 text-emerald-400',
    Pending: 'bg-amber-500/15  text-amber-400',
    Overdue: 'bg-red-500/15    text-red-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

/* ─── Row Actions ─────────────────────────────────────────────────── */
function InvoiceActions({
  invoice,
  onDownload,
  onViewDetails,
  onSendReminder,
}: {
  invoice:       Invoice
  onDownload:    (inv: Invoice) => void
  onViewDetails: (inv: Invoice) => void
  onSendReminder:(inv: Invoice) => void
}) {
  const canRemind = invoice.status === 'Pending' || invoice.status === 'Overdue'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm"
          className="size-7 p-0 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 text-zinc-50 min-w-44">
        <DropdownMenuItem
          onClick={() => onDownload(invoice)}
          className="gap-2 focus:bg-zinc-800 cursor-pointer"
        >
          <Download className="size-3.5 text-zinc-400" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onViewDetails(invoice)}
          className="gap-2 focus:bg-zinc-800 cursor-pointer"
        >
          <Eye className="size-3.5 text-zinc-400" />
          View Details
        </DropdownMenuItem>
        {canRemind && (
          <DropdownMenuItem
            onClick={() => onSendReminder(invoice)}
            className="gap-2 text-amber-400 focus:bg-amber-500/10 focus:text-amber-400 cursor-pointer"
          >
            <Send className="size-3.5" />
            Send Reminder
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(INVOICES)
  const { toasts, push }        = useToasts()

  const mrr            = 142500
  const outstanding    = invoices.filter(i => i.status !== 'Paid').reduce((s, i) => s + i.amount, 0)
  const activeSubCount = 124

  function handleDownload(inv: Invoice) {
    push(`Downloading ${inv.id}…`, 'info')
  }

  function handleViewDetails(inv: Invoice) {
    push(`Viewing details for ${inv.id}`, 'info')
  }

  function handleSendReminder(inv: Invoice) {
    push(`Reminder sent to ${inv.client}`, 'success')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-50">Billing</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Platform-wide revenue and invoice tracking.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Monthly Recurring Revenue"
          value={`$${mrr.toLocaleString()}`}
          icon={<TrendingUp className="size-4 text-emerald-400" />}
          iconColor="bg-emerald-500/10"
          sub={
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <TrendingUp className="size-3.5" />
              +12% vs last month
            </span>
          }
        />
        <KpiCard
          title="Outstanding Invoices"
          value={`$${outstanding.toLocaleString()}`}
          icon={<AlertTriangle className="size-4 text-amber-400" />}
          iconColor="bg-amber-500/10"
          sub={
            <span className="flex items-center gap-1 text-amber-400">
              <AlertTriangle className="size-3.5" />
              {invoices.filter(i => i.status !== 'Paid').length} invoice{invoices.filter(i => i.status !== 'Paid').length !== 1 ? 's' : ''} pending or overdue
            </span>
          }
        />
        <KpiCard
          title="Active Subscriptions"
          value={activeSubCount.toString()}
          icon={<BarChart3 className="size-4 text-blue-400" />}
          iconColor="bg-blue-500/10"
          sub={
            <span className="text-zinc-400">
              <span className="text-blue-400 font-medium">78</span> Enterprise&nbsp;&nbsp;
              <span className="text-zinc-500">·</span>&nbsp;&nbsp;
              <span className="text-violet-400 font-medium">46</span> Pro
            </span>
          }
        />
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">Recent Transactions</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Invoice ID</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Client Entity</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Issue Date</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-5 py-3.5 font-mono text-xs text-zinc-300">{inv.id}</td>
                <td className="px-5 py-3.5 font-medium text-zinc-100">{inv.client}</td>
                <td className="px-5 py-3.5 text-zinc-300 tabular-nums">${inv.amount.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{inv.date}</td>
                <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  <InvoiceActions
                    invoice={inv}
                    onDownload={handleDownload}
                    onViewDetails={handleViewDetails}
                    onSendReminder={handleSendReminder}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-lg ${
              t.type === 'info'
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            <CheckCircle2 className="size-4 shrink-0" />
            {t.text}
          </div>
        ))}
      </div>
    </div>
  )
}
