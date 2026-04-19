'use client'

import { Droplet } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface HydrationEntry {
  time: string
  amount: number
  missing?: boolean
}

export function HydrationChart({ data, className }: { data: HydrationEntry[]; className?: string }) {
  const total = data.reduce((s, e) => s + e.amount, 0)
  const max   = Math.max(...data.filter(e => !e.missing).map(e => e.amount))

  return (
    <div className={cn('bg-white border border-slate-200 rounded-xl p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Droplet className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-slate-800">Hydration Log (Today)</span>
        </div>
        <span className="text-xs font-semibold text-blue-500">
          Total: {(total / 1000).toFixed(1)}L
        </span>
      </div>
      <div className="h-24 flex items-end justify-between gap-1.5 pt-2">
        {data.map((entry) => (
          <div key={entry.time} className="group relative flex flex-col items-center gap-1 flex-1 h-full justify-end">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 shadow-lg">
              {entry.missing ? 'No log recorded' : `${entry.amount} ml`}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
            </div>
            {/* Bar or missing line */}
            {entry.missing ? (
              <div className="w-full h-0.5 bg-red-400 rounded-sm" />
            ) : (
              <div
                className="w-full bg-blue-400 hover:bg-blue-500 rounded-t-md transition-colors"
                style={{ height: `${Math.round((entry.amount / max) * 100)}%` }}
              />
            )}
            <span className={cn('text-[9px] whitespace-nowrap', entry.missing ? 'text-red-400' : 'text-slate-400')}>
              {entry.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
