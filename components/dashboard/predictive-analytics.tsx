'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendingDown, Wind, Loader2 } from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────────── */
interface HourlyPoint {
  hour:       string   // "14:00"
  temp:       number   // °C
  efficiency: number   // 0-100
  humidity:   number   // %
}

/* ── Worker efficiency model ────────────────────────────────────── */
// Based on OSHA heat stress research:
// Efficiency drops ~3.5% per °C above 26°C, floored at 20%
function workerEfficiency(tempC: number, humidity: number): number {
  const heatIndex = tempC + (humidity / 100) * (tempC - 14.5) * 0.4
  const drop = Math.max(0, heatIndex - 26) * 3.5
  return Math.round(Math.max(20, 100 - drop))
}

/* ── Open-Meteo fetcher (Dubai) ─────────────────────────────────── */
async function fetchForecast(): Promise<HourlyPoint[]> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    '?latitude=25.2048&longitude=55.2708' +
    '&hourly=temperature_2m,relative_humidity_2m' +
    '&forecast_days=1' +
    '&timezone=Asia%2FDubai'

  const res = await fetch(url, { next: { revalidate: 900 } })
  if (!res.ok) throw new Error('Open-Meteo fetch failed')

  const json = await res.json()
  const { time, temperature_2m, relative_humidity_2m } = json.hourly as {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
  }

  // Current hour index
  const nowHour = new Date().getHours()
  const startIdx = time.findIndex(t => {
    const h = new Date(t).getHours()
    return h >= nowHour
  })
  const from = startIdx === -1 ? 0 : startIdx

  return time.slice(from, from + 12).map((t, i) => {
    const idx   = from + i
    const temp  = Math.round(temperature_2m[idx] * 10) / 10
    const hum   = relative_humidity_2m[idx]
    const label = new Date(t).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
      timeZone: 'Asia/Dubai',
    })
    return {
      hour:       label,
      temp,
      efficiency: workerEfficiency(temp, hum),
      humidity:   hum,
    }
  })
}

/* ── Custom Tooltip ─────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  label?: string
  payload?: Array<{ name: string; value: number; color: string }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 text-xs">
      <p className="font-semibold text-gray-700 mb-1.5">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name}:</span>
          <span className="font-semibold text-gray-800">
            {p.value}{p.name === 'Temp (°C)' ? '°C' : '%'}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Component ──────────────────────────────────────────────────── */
export function PredictiveAnalyticsCard() {
  const [data,    setData]    = useState<HourlyPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    fetchForecast()
      .then(setData)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  // Summary stats from data
  const peakTemp = data.length ? Math.max(...data.map(d => d.temp))    : null
  const minEff   = data.length ? Math.min(...data.map(d => d.efficiency)) : null
  const avgHum   = data.length
    ? Math.round(data.reduce((s, d) => s + d.humidity, 0) / data.length)
    : null

  return (
    /* Gradient border wrapper */
    <div className="p-[2px] bg-gradient-to-br from-[#3E84F6] to-blue-300 rounded-3xl shadow-sm">
    <div className="bg-white rounded-[22px] p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1 mr-3">
          <div className="flex items-center gap-1.5 mb-1">
            {/* Gemini 4-point star logo */}
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Gemini AI" role="img">
              <path d="M14 2C14 2 15.8 9.2 20.8 14C15.8 18.8 14 26 14 26C14 26 12.2 18.8 7.2 14C12.2 9.2 14 2 14 2Z" fill="url(#gem-v)"/>
              <path d="M2 14C2 14 9.2 12.2 14 7.2C18.8 12.2 26 14 26 14C26 14 18.8 15.8 14 20.8C9.2 15.8 2 14 2 14Z" fill="url(#gem-h)"/>
              <defs>
                <linearGradient id="gem-v" x1="14" y1="2" x2="14" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4285F4"/>
                  <stop offset="1" stopColor="#8B5CF6"/>
                </linearGradient>
                <linearGradient id="gem-h" x1="2" y1="14" x2="26" y2="14" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA"/>
                  <stop offset="1" stopColor="#A78BFA"/>
                </linearGradient>
              </defs>
            </svg>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
              Predictive Analysis
            </p>
          </div>
          <h2 className="text-[15px] font-bold text-[#0E1B18] truncate">
            Weather &amp; Efficiency Forecast
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5 whitespace-nowrap">
            Next 12 hrs · Dubai · Open-Meteo
          </p>
        </div>

        {/* Summary pills — single row, no wrap */}
        {!loading && !error && (
          <div className="flex gap-1.5 flex-shrink-0">
            {peakTemp !== null && (
              <span className="flex items-center gap-1 px-2 py-1 bg-[#FFF7ED] rounded-full text-[10px] font-semibold text-orange-700 whitespace-nowrap">
                <TrendingDown className="w-3 h-3" />
                {peakTemp}°C
              </span>
            )}
            {minEff !== null && (
              <span
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap"
                style={{
                  background: minEff < 50 ? '#FEF2F2' : minEff < 70 ? '#FFF7ED' : '#F0FDF4',
                  color:      minEff < 50 ? '#DC2626' : minEff < 70 ? '#C2410C' : '#16A34A',
                }}
              >
                {minEff}% eff.
              </span>
            )}
          </div>
        )}
      </div>

      {/* Chart area */}
      {loading && (
        <div className="h-[155px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#00D15A] animate-spin" />
        </div>
      )}

      {error && (
        <div className="h-[155px] flex items-center justify-center text-sm text-gray-400">
          Unable to load forecast data
        </div>
      )}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height={155}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />

            <XAxis
              dataKey="hour"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />

            {/* Left Y: temperature */}
            <YAxis
              yAxisId="temp"
              orientation="left"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              unit="°"
            />

            {/* Right Y: efficiency */}
            <YAxis
              yAxisId="eff"
              orientation="right"
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              unit="%"
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 10, paddingTop: 8, color: '#6B7280' }}
            />

            <Line
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              name="Temp (°C)"
              stroke="#FF6B00"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#FF6B00' }}
            />

            <Line
              yAxisId="eff"
              type="monotone"
              dataKey="efficiency"
              name="Worker Efficiency (%)"
              stroke="#00D15A"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: '#00D15A' }}
              strokeDasharray="5 3"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
    </div>
  )
}
