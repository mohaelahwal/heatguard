import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { HeatStressWidget }        from '@/components/dashboard/heat-stress-widget'
import { LiveMonitoringCard }      from '@/components/dashboard/live-monitoring'
import { IncidentLogChart }        from '@/components/dashboard/incident-log-chart'
import { OpenIncidentsList }       from '@/components/dashboard/open-incidents-list'
import { PredictiveAnalyticsCard } from '@/components/dashboard/predictive-analytics'

export const metadata: Metadata = { title: 'Dashboard Overview' }

// Dynamically import the unified Map + KPI block (requires browser environment)
const MapKpiBlock = dynamic(
  () => import('@/components/dashboard/map-kpi-block').then(m => m.MapKpiBlock),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 min-h-[460px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00D15A] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
)

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

      {/* ── Left column (4) ─────────────────────────────────────── */}
      <div className="lg:col-span-4 flex flex-col gap-5 h-full">
        <HeatStressWidget />
        <LiveMonitoringCard />
      </div>

      {/* ── Middle column (4) ───────────────────────────────────── */}
      <div className="lg:col-span-4 flex flex-col gap-5 h-full">

        {/* Unified map + KPI block */}
        <MapKpiBlock />

        {/* Incident log chart */}
        <IncidentLogChart />

      </div>

      {/* ── Right column (4) ────────────────────────────────────── */}
      <div className="lg:col-span-4 flex flex-col gap-5 h-full">
        <OpenIncidentsList />
        <PredictiveAnalyticsCard />
      </div>

    </div>
  )
}
