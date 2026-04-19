'use client'

import { useJsApiLoader, GoogleMap, Circle, Marker } from '@react-google-maps/api'
import { Users, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react'

const CENTER  = { lat: 25.0111, lng: 54.9897 }

const MARKERS = [
  { lat: 25.0125, lng: 54.9880, color: '#00D15A' },
  { lat: 25.0100, lng: 54.9910, color: '#00D15A' },
  { lat: 25.0118, lng: 54.9920, color: '#FF6B00' },
  { lat: 25.0095, lng: 54.9870, color: '#00D15A' },
  { lat: 25.0135, lng: 54.9905, color: '#00D15A' },
  { lat: 25.0108, lng: 54.9888, color: '#FF6B00' },
  { lat: 25.0122, lng: 54.9895, color: '#00D15A' },
]

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',            stylers: [{ color: '#f5f5f5' }] },
  { elementType: 'labels.icon',         stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#616161' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'road',  elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9d8e0' }] },
  { featureType: 'poi',   stylers: [{ visibility: 'off' }] },
]

const KPIS = [
  {
    label: 'Active Workers',
    value: '250',
    sub:   '/ 276',
    icon:  Users,
    iconBg: 'bg-[#00D15A]/15',
    iconColor: 'text-[#00D15A]',
    valueColor: 'text-gray-900',
  },
  {
    label: 'Open Incidents',
    value: '3',
    sub:   'active',
    icon:  AlertTriangle,
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    valueColor: 'text-red-500',
  },
  {
    label: 'Compliance',
    value: '91.4%',
    sub:   'target 90%',
    icon:  ShieldCheck,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    valueColor: 'text-blue-600',
  },
]

export function MapKpiBlock() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    id: 'heatguard-map',
  })

  return (
    <div className="relative rounded-3xl overflow-hidden min-h-[460px] shadow-sm border border-gray-100">

      {/* ── Map background ───────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full">
        {loadError && (
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-2">
            <MapPin className="w-8 h-8 text-gray-300" />
            <p className="text-xs text-gray-400">Map unavailable</p>
          </div>
        )}
        {!isLoaded && !loadError && (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-[#00D15A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={CENTER}
            zoom={14}
            options={{
              styles: MAP_STYLES,
              disableDefaultUI: true,
              gestureHandling: 'none',
              keyboardShortcuts: false,
            }}
          >
            {/* High heat zone */}
            <Circle
              center={CENTER}
              radius={420}
              options={{
                strokeColor:  '#FF3B30',
                strokeOpacity: 0.5,
                strokeWeight:  2,
                fillColor:    '#FF3B30',
                fillOpacity:   0.13,
              }}
            />
            {/* Worker markers */}
            {MARKERS.map((m, i) => (
              <Marker
                key={i}
                position={{ lat: m.lat, lng: m.lng }}
                icon={{
                  path:         google.maps.SymbolPath.CIRCLE,
                  scale:        7,
                  fillColor:    m.color,
                  fillOpacity:  1,
                  strokeColor:  '#ffffff',
                  strokeWeight: 2,
                }}
              />
            ))}
          </GoogleMap>
        )}
      </div>

      {/* ── Bottom gradient scrim so bottom content stays readable ─ */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/10 to-transparent pointer-events-none z-[1]" />

      {/* ── KPI cards row ────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-10 flex gap-3">
        {KPIS.map(kpi => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="flex-1 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center gap-3"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${kpi.iconBg}`}>
                <Icon className={`w-4 h-4 ${kpi.iconColor}`} />
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 leading-none mb-1">{kpi.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold tabular-nums leading-none ${kpi.valueColor}`}>{kpi.value}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{kpi.sub}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Floating map label badge ─────────────────────────────── */}
      <div className="absolute top-[108px] left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3.5 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.10)] flex items-center gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-[#00D15A]" />
          <div>
            <p className="text-xs font-bold text-gray-900 leading-none">Site Heat Map</p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Palm Jebel Ali · Real-time zones</p>
          </div>
          <span className="flex items-center gap-1 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A] animate-pulse" />
            <span className="text-[10px] font-bold text-[#00D15A]">Live</span>
          </span>
        </div>
      </div>

    </div>
  )
}
