'use client'

import { PieChart, Pie, Cell } from 'recharts'
import { Users, AlertTriangle, ShieldCheck } from 'lucide-react'

/* ── Active Workers ──────────────────────────────────────────── */
export function ActiveWorkersCard() {
  const active = 250
  const total = 276
  const pct = Math.round((active / total) * 100)

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">Active Workers</p>
        <span className="w-9 h-9 rounded-xl bg-[#00D15A]/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-[#00D15A]" />
        </span>
      </div>
      <div>
        <span className="text-4xl font-bold text-gray-900">{active}</span>
        <span className="text-base text-gray-400 ml-1">/ {total}</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#00D15A] rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">{pct}% on-site today</p>
    </div>
  )
}

/* ── Open Incidents ──────────────────────────────────────────── */
export function OpenIncidentsStatCard() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">Open Incidents</p>
        <span className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-red-500">3</span>
        <span className="text-sm text-gray-400 mb-1">active</span>
      </div>
      <div className="flex gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">
          1 critical
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
          2 high
        </span>
      </div>
      <p className="text-xs text-gray-400">Requires immediate attention</p>
    </div>
  )
}

/* ── Compliance Score (with donut) ───────────────────────────── */
const COMPLIANCE = 91.4
const TARGET     = 90
const donutData  = [{ value: COMPLIANCE }, { value: 100 - COMPLIANCE }]

export function ComplianceScoreCard() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm font-semibold text-gray-500 mb-4">Compliance Score</p>

      <div className="flex items-center gap-5">
        {/* 360° Donut */}
        <div className="relative w-[72px] h-[72px] shrink-0">
          <PieChart width={72} height={72}>
            <Pie
              data={donutData}
              cx={36}
              cy={36}
              startAngle={90}
              endAngle={-270}
              innerRadius={24}
              outerRadius={34}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill="#3B82F6" />
              <Cell fill="#F3F4F6" />
            </Pie>
          </PieChart>
        </div>

        {/* Text stats */}
        <div>
          <p className="text-3xl font-bold text-gray-900 tabular-nums leading-none">
            {COMPLIANCE.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Site Average</p>

          <div className="mt-2">
            <p className="text-base font-bold text-blue-500 tabular-nums leading-none">
              {TARGET}%
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Target</p>
          </div>
        </div>
      </div>
    </div>
  )
}
