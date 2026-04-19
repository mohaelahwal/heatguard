'use client'

import { PieChart, Pie, Cell } from 'recharts'

const WBGT     = 40.5
const HUMIDITY = 68
const AQI      = 72

/* ── Gauge config ────────────────────────────────────────────────── */
// Scale 10 °C → 60 °C  (total range = 50 units)
const GAUGE_DATA = [
  { value: 20, color: '#00D15A' }, // Safe    10–30 °C
  { value: 10, color: '#F97316' }, // Warning 30–40 °C
  { value: 20, color: '#EF4444' }, // Extreme 40–60 °C
]
const TOTAL        = 50
const NEEDLE_VALUE = WBGT - 10   // 30.5 — offset from scale start (10 °C)

const CX = 140
const CY = 140
const IR = 76
const OR = 118

/* ── Needle math ─────────────────────────────────────────────────── */
const RADIAN = Math.PI / 180
const ang    = 180 * (1 - NEEDLE_VALUE / TOTAL)
const sin    = Math.sin(-RADIAN * ang)
const cos    = Math.cos(-RADIAN * ang)
const len    = (IR + 2 * OR) / 3
const NR     = 5                            // base circle radius
const xba    = CX + NR * sin
const yba    = CY - NR * cos
const xbb    = CX - NR * sin
const ybb    = CY + NR * cos
const xp     = CX + len * cos
const yp     = CY + len * sin

/* ── Status label ────────────────────────────────────────────────── */
function gaugeLabel(v: number) {
  if (v >= 46) return { text: 'CRITICAL', color: '#9B1C1C' }
  if (v >= 41) return { text: 'DANGER',   color: '#FF3B30' }
  if (v >= 35) return { text: 'WARNING',  color: '#FF6B00' }
  return              { text: 'CAUTION',  color: '#FFCC00' }
}
const { text: labelText, color: labelColor } = gaugeLabel(WBGT)

/* ── Component ───────────────────────────────────────────────────── */
export function HeatStressWidget() {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
      {/* Welcome */}
      <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold">
        Good Morning,
      </p>
      <h2 className="text-xl font-bold text-gray-900 mb-0.5">Hey Mohaned 👋</h2>
      <p className="text-xs text-gray-400 mb-5">Safety snapshot for today.</p>

      {/* Section title */}
      <p className="text-xs font-semibold text-gray-600 text-center mb-1 uppercase tracking-wide">
        Heat Stress Index
      </p>

      {/* Gauge */}
      <div className="flex justify-center">
        <div className="relative w-[280px] h-[152px]">
          <PieChart width={280} height={152}>
            {/* Coloured arc segments */}
            <Pie
              data={GAUGE_DATA}
              cx={CX}
              cy={CY}
              startAngle={180}
              endAngle={0}
              innerRadius={IR}
              outerRadius={OR}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive={false}
            >
              {GAUGE_DATA.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>

            {/* Needle */}
            <circle cx={CX} cy={CY} r={NR} fill="#374151" />
            <path
              d={`M ${xba} ${yba} L ${xbb} ${ybb} L ${xp} ${yp} Z`}
              fill="#374151"
            />

            {/* Edge labels */}
            <text x={10}  y={148} textAnchor="start" fill="#9CA3AF" fontSize={10} fontWeight={500}>10°C</text>
            <text x={270} y={148} textAnchor="end"   fill="#9CA3AF" fontSize={10} fontWeight={500}>60°C</text>
          </PieChart>

          {/* Centre reading */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none">
            <div className="bg-white/90 rounded-2xl px-5 py-2 shadow-sm flex flex-col items-center">
              <span className="text-2xl font-bold leading-none" style={{ color: 'rgb(255, 107, 0)' }}>{WBGT}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">°C WBGT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status badge */}
      <p
        className="text-center text-xs font-bold tracking-widest mt-1 mb-5"
        style={{ color: labelColor }}
      >
        ● {labelText}
      </p>

      {/* WBGT / Humidity / AQI blocks */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-red-700 font-bold uppercase tracking-wide mb-1">WBGT</p>
          <p className="text-lg font-bold text-red-700 leading-none">{WBGT}</p>
          <p className="text-[10px] text-red-500 mt-0.5">°C</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">Humidity</p>
          <p className="text-lg font-bold text-gray-900 leading-none">{HUMIDITY}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">%</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">AQI</p>
          <p className="text-lg font-bold leading-none" style={{ color: '#FF6B00' }}>{AQI}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">moderate</p>
        </div>
      </div>
    </div>
  )
}
