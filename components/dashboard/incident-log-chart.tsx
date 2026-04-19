'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { month: 'Jan', recovered: 11, serious: 2, pending: 3 },
  { month: 'Feb', recovered: 14, serious: 1, pending: 4 },
  { month: 'Mar', recovered: 9,  serious: 3, pending: 2 },
  { month: 'Apr', recovered: 16, serious: 0, pending: 5 },
  { month: 'May', recovered: 12, serious: 2, pending: 3 },
  { month: 'Jun', recovered: 18, serious: 1, pending: 2 },
  { month: 'Jul', recovered: 22, serious: 4, pending: 6 },
  { month: 'Aug', recovered: 19, serious: 3, pending: 4 },
]

const LEGEND_MAP: Record<string, string> = {
  recovered: 'Recovered and Cleared',
  serious:   'Serious Injuries',
  pending:   'Pending Review',
}

function CustomLegend(props: { payload?: Array<{ color: string; dataKey: string }> }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center mt-2">
      {(props.payload ?? []).map((entry) => (
        <span key={entry.dataKey} className="flex items-center gap-1.5 text-xs text-gray-500">
          <span
            className="inline-block w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          {LEGEND_MAP[entry.dataKey] ?? entry.dataKey}
        </span>
      ))}
    </div>
  )
}

export function IncidentLogChart() {
  return (
    <div className="bg-[#E3FAED] rounded-3xl p-6 shadow-sm border-2 border-white">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Incident Log</h3>
          <p className="text-xs text-gray-600 mt-0.5">Monthly breakdown · Jan–Aug 2025</p>
        </div>
        <span className="text-xs px-3 py-1 bg-white/70 rounded-full text-gray-500 font-medium">
          2025
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={32} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#c2ebd4" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#6B7280' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#6B7280' }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0,209,90,0.08)' }}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid #F3F4F6',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
            formatter={(value, key) => [value, LEGEND_MAP[String(key)] ?? String(key)]}
          />
          <Legend content={<CustomLegend />} />
          <Bar dataKey="recovered" stackId="a" fill="#00D15A" radius={[0, 0, 0, 0]} />
          <Bar dataKey="serious"   stackId="a" fill="#FF3B30" radius={[0, 0, 0, 0]} />
          <Bar dataKey="pending"   stackId="a" fill="#FFCC00" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
