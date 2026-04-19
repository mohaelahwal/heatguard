'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import {
  useJsApiLoader,
  GoogleMap,
  Circle,
  Marker,
  Polyline,
} from '@react-google-maps/api'
import {
  MapPin,
  X,
  AlertTriangle,
  Navigation,
  CheckCircle2,
  Thermometer,
  Users,
  Wind,
  Building2,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────

type Risk = 'safe' | 'caution' | 'critical'
type FilterKey = 'workers' | 'medical' | 'cooling'

interface Worker {
  id: string
  name: string
  badge: string
  wbgt: number
  risk: Risk
  role: string
  crew: string
  position: google.maps.LatLngLiteral
}

interface Infra {
  id: string
  name: string
  type: 'medical' | 'cooling'
  description: string
  position: google.maps.LatLngLiteral
}

interface Toast {
  id: number
  message: string
  icon: 'success' | 'alert'
}

interface ActiveRoute {
  from: google.maps.LatLngLiteral
  to: google.maps.LatLngLiteral
  tentName: string
}

type HoverItem =
  | { type: 'worker'; data: Worker }
  | { type: 'infra';  data: Infra  }

// ── Site configuration ────────────────────────────────────────────
const SITE_CONFIG: Record<string, { name: string; lat: number; lng: number }> = {
  'palm-jebel': { name: 'Palm Jebel Ali (CT-452-JBL)', lat: 24.985056, lng: 55.027472 },
  'jabal-ali':  { name: 'Jabal Ali (ET-355-SWT)',       lat: 25.014528, lng: 54.983972 },
}

// ── Role pools ────────────────────────────────────────────────────
const ROLES: Record<Risk, string[]> = {
  critical: ['Scaffold Erector', 'Concrete Finisher', 'Heavy Equipment Operator', 'Asphalt Worker'],
  caution:  ['Structural Steel Worker', 'Welder', 'Pipefitter', 'Mason'],
  safe:     ['HVAC Technician', 'Electrician', 'Tile Installer', 'Site Inspector'],
}
function pickRole(risk: Risk) {
  const list = ROLES[risk]
  return list[Math.floor(Math.random() * list.length)]
}

// ── Data generator (called per site) ─────────────────────────────
function generateSiteData(lat: number, lng: number) {
  function scatter(spread = 0.004): google.maps.LatLngLiteral {
    return {
      lat: lat + (Math.random() - 0.5) * spread,
      lng: lng + (Math.random() - 0.5) * spread,
    }
  }

  const workers: Worker[] = [
    { id: 'w01', name: 'Ahmed Al-Rashid',     badge: 'W-1042', wbgt: 39, risk: 'critical', role: pickRole('critical'), crew: 'Crew Alpha',   position: scatter() },
    { id: 'w02', name: 'Mohammad Hassan',     badge: 'W-1078', wbgt: 33, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Bravo',   position: scatter() },
    { id: 'w03', name: 'Carlos Rivera',       badge: 'W-1091', wbgt: 31, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Alpha',   position: scatter() },
    { id: 'w04', name: 'Ibrahim Khalil',      badge: 'W-1055', wbgt: 38, risk: 'critical', role: pickRole('critical'), crew: 'Crew Charlie', position: scatter() },
    { id: 'w05', name: 'Raj Kumar',           badge: 'W-1103', wbgt: 34, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Bravo',   position: scatter() },
    { id: 'w06', name: 'Omar Abdullah',       badge: 'W-1066', wbgt: 27, risk: 'safe',     role: pickRole('safe'),     crew: 'Crew Charlie', position: scatter() },
    { id: 'w07', name: 'Farrukh Tashkentov', badge: 'W-1118', wbgt: 35, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Alpha',   position: scatter() },
    { id: 'w08', name: 'Bongani Dlamini',     badge: 'W-1087', wbgt: 41, risk: 'critical', role: pickRole('critical'), crew: 'Crew Charlie', position: scatter() },
    { id: 'w09', name: 'Tariq Al-Mansoori',  badge: 'W-1132', wbgt: 32, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Bravo',   position: scatter() },
    { id: 'w10', name: 'Diego Herrera',       badge: 'W-1201', wbgt: 33, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Bravo',   position: scatter() },
    { id: 'w11', name: 'Pradeep Singh',       badge: 'W-1205', wbgt: 37, risk: 'critical', role: pickRole('critical'), crew: 'Crew Alpha',   position: scatter() },
    { id: 'w12', name: 'Luca Ferrari',        badge: 'W-1207', wbgt: 28, risk: 'safe',     role: pickRole('safe'),     crew: 'Crew Charlie', position: scatter() },
    { id: 'w13', name: 'Andrés Vargas',       badge: 'W-1211', wbgt: 32, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Bravo',   position: scatter() },
    { id: 'w14', name: 'Mehmet Yilmaz',       badge: 'W-1215', wbgt: 34, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Alpha',   position: scatter() },
    { id: 'w15', name: 'Hassan Al-Zaabi',     badge: 'W-1301', wbgt: 31, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Charlie', position: scatter() },
    { id: 'w16', name: 'Kwame Asante',        badge: 'W-1303', wbgt: 40, risk: 'critical', role: pickRole('critical'), crew: 'Crew Bravo',   position: scatter() },
    { id: 'w17', name: 'Nguyen Van Minh',     badge: 'W-1305', wbgt: 33, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Alpha',   position: scatter() },
    { id: 'w18', name: 'Roberto Costa',       badge: 'W-1309', wbgt: 30, risk: 'caution',  role: pickRole('caution'),  crew: 'Crew Charlie', position: scatter() },
    { id: 'w19', name: 'Ali Mohammed Obaid',  badge: 'W-1401', wbgt: 26, risk: 'safe',     role: pickRole('safe'),     crew: 'Crew Bravo',   position: scatter() },
    { id: 'w20', name: 'Yusuf Al-Hamdan',    badge: 'W-1403', wbgt: 29, risk: 'safe',     role: pickRole('safe'),     crew: 'Crew Charlie', position: scatter() },
  ]

  const infra: Infra[] = [
    { id: 'med1', name: 'Medical Post Alpha', type: 'medical', description: 'First Aid · Paramedic on duty · AED station', position: scatter() },
    { id: 'med2', name: 'Medical Post Bravo', type: 'medical', description: 'First Aid · Nurse on duty · AED station',     position: scatter() },
    { id: 'ct1',  name: 'Cooling Tent A',     type: 'cooling', description: 'AC · Water Dispensers · 40 seats',            position: scatter() },
    { id: 'ct2',  name: 'Cooling Tent B',     type: 'cooling', description: 'AC · Water Dispensers · 30 seats',            position: scatter() },
    { id: 'ct3',  name: 'Cooling Tent C',     type: 'cooling', description: 'AC · Water Dispensers · 25 seats',            position: scatter() },
  ]

  return { workers, infra }
}

// ── Style maps ────────────────────────────────────────────────────

const RISK_COLOR: Record<Risk, string> = {
  safe:     '#00D15A',
  caution:  '#F97316',
  critical: '#EF4444',
}

const RISK_BG: Record<Risk, string> = {
  safe:     'bg-emerald-50 text-emerald-700 border-emerald-200',
  caution:  'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
}

const SITE_IDS = Object.keys(SITE_CONFIG)

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry',            stylers: [{ color: '#eef2ee' }] },
  { elementType: 'labels.icon',         stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill',    stylers: [{ color: '#4a6652' }] },
  { elementType: 'labels.text.stroke',  stylers: [{ color: '#eef2ee' }] },
  { featureType: 'road',       elementType: 'geometry',        stylers: [{ color: '#dce8dc' }] },
  { featureType: 'road',       elementType: 'geometry.stroke', stylers: [{ color: '#cddacd' }] },
  { featureType: 'road.highway', elementType: 'geometry',      stylers: [{ color: '#c8dac8' }] },
  { featureType: 'water',      elementType: 'geometry',        stylers: [{ color: '#8fc4d4' }] },
  { featureType: 'water',      elementType: 'labels.text.fill',stylers: [{ color: '#4a7a8a' }] },
  { featureType: 'poi',        stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',    stylers: [{ visibility: 'off' }] },
]

// ── Helpers ───────────────────────────────────────────────────────

function dist(a: google.maps.LatLngLiteral, b: google.maps.LatLngLiteral) {
  return Math.sqrt((a.lat - b.lat) ** 2 + (a.lng - b.lng) ** 2)
}

function nearestCoolingTent(worker: Worker): Infra {
  const tents = INFRA.filter(i => i.type === 'cooling')
  return tents.reduce((best, tent) =>
    dist(worker.position, tent.position) < dist(worker.position, best.position) ? tent : best
  )
}

function makeWorkerIcon(risk: Risk): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor: RISK_COLOR[risk],
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2.5,
  }
}

function makeInfraIcon(type: 'medical' | 'cooling'): google.maps.Icon {
  const isMedical = type === 'medical'
  const bg     = isMedical ? '#DC2626' : '#1D4ED8'
  const stroke = isMedical ? '#fca5a5' : '#93c5fd'
  const label  = isMedical ? '✚' : '❄'
  const fontSize = isMedical ? 15 : 13
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill="${bg}" stroke="${stroke}" stroke-width="2.5"/>
    <text x="20" y="26" text-anchor="middle" font-size="${fontSize}" font-weight="bold" fill="white" font-family="Arial,sans-serif">${label}</text>
  </svg>`
  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 20),
  }
}

// ── Hover Tooltip (fixed, follows cursor) ─────────────────────────

function HoverTooltip({
  item,
  pos,
}: {
  item: HoverItem
  pos: { x: number; y: number }
}) {
  // Offset so tooltip doesn't cover the marker
  const left = pos.x + 16
  const top  = pos.y - 70

  if (item.type === 'worker') {
    const w = item.data
    const riskColor = RISK_COLOR[w.risk]
    const riskLabel = w.risk.charAt(0).toUpperCase() + w.risk.slice(1)
    return (
      <div
        className="fixed z-[9999] pointer-events-none select-none"
        style={{ left, top }}
      >
        <div className="rounded-xl bg-[#0C2A1F] border border-white/10 shadow-2xl overflow-hidden w-52">
          {/* Top accent bar */}
          <div className="h-1 w-full" style={{ backgroundColor: riskColor }} />
          <div className="px-3 py-2.5">
            {/* Risk badge + WBGT */}
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide"
                style={{ color: riskColor }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: riskColor }}
                />
                {riskLabel}
              </span>
              <span
                className="text-[13px] font-black"
                style={{ color: riskColor }}
              >
                {w.wbgt}°C
              </span>
            </div>
            {/* Name + badge */}
            <p className="text-white text-[12px] font-bold leading-tight">{w.name}</p>
            <p className="text-white/40 text-[10px] mt-0.5">{w.badge} · {w.crew}</p>
          </div>
        </div>
        {/* Caret */}
        <div
          className="w-2 h-2 rotate-45 -mt-1 ml-3 shadow"
          style={{ backgroundColor: '#0C2A1F' }}
        />
      </div>
    )
  }

  // Infra tooltip
  const infra = item.data
  const isMedical = infra.type === 'medical'
  const bg = isMedical ? '#DC2626' : '#1D4ED8'
  return (
    <div
      className="fixed z-[9999] pointer-events-none select-none"
      style={{ left, top }}
    >
      <div className="rounded-xl bg-white border border-gray-200 shadow-2xl overflow-hidden w-52">
        <div className="h-1 w-full" style={{ backgroundColor: bg }} />
        <div className="px-3 py-2.5">
          <p
            className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
            style={{ color: bg }}
          >
            {isMedical ? 'Medical Post' : 'Cooling Tent'}
          </p>
          <p className="text-gray-900 text-[12px] font-bold leading-tight">{infra.name}</p>
          <p className="text-gray-400 text-[10px] mt-1 leading-snug">{infra.description}</p>
        </div>
      </div>
      <div
        className="w-2 h-2 rotate-45 -mt-1 ml-3"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }}
      />
    </div>
  )
}

// ── Filter Toggle ─────────────────────────────────────────────────

function FilterToggle({
  label,
  icon,
  active,
  color,
  onClick,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border',
        active
          ? 'text-white border-transparent shadow-sm'
          : 'bg-white/60 text-gray-500 border-gray-200 hover:bg-white'
      )}
      style={active ? { backgroundColor: color, borderColor: color } : undefined}
    >
      {icon}
      {label}
    </button>
  )
}

// ── Worker Info Panel (click) ─────────────────────────────────────

function WorkerInfoPanel({
  worker,
  onClose,
  onBreakAlert,
  onRouteToCooling,
}: {
  worker: Worker
  onClose: () => void
  onBreakAlert: (w: Worker) => void
  onRouteToCooling: (w: Worker) => void
}) {
  const wbgtColor = RISK_COLOR[worker.risk]

  return (
    <div className="absolute bottom-5 left-5 z-10 w-72 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-4 pb-3" style={{ backgroundColor: '#0C2A1F' }}>
        <div>
          <p className="text-[11px] font-semibold text-[#00D15A] uppercase tracking-wide mb-0.5">{worker.badge}</p>
          <h3 className="text-[15px] font-bold text-white leading-tight">{worker.name}</h3>
          <p className="text-xs text-[#00D15A] font-medium mt-0.5">{worker.role}</p>
          <p className="text-[11px] text-slate-300 mt-0.5">{worker.crew}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors -mt-0.5 -mr-0.5 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-100">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: wbgtColor + '18' }}
        >
          <Thermometer className="w-5 h-5" style={{ color: wbgtColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400 mb-0.5">WBGT Reading</p>
          <p className="text-2xl font-black leading-none" style={{ color: wbgtColor }}>
            {worker.wbgt}°C
          </p>
        </div>
        <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold border', RISK_BG[worker.risk])}>
          {worker.risk.charAt(0).toUpperCase() + worker.risk.slice(1)}
        </span>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        <button
          onClick={() => onBreakAlert(worker)}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#EF4444' }}
        >
          <AlertTriangle className="w-4 h-4" />
          Send Immediate Break Alert
        </button>
        <button
          onClick={() => onRouteToCooling(worker)}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#1D4ED8' }}
        >
          <Navigation className="w-4 h-4" />
          Route to Nearest Cooling Tent
        </button>
      </div>
    </div>
  )
}

// ── Infra Panel (click) ───────────────────────────────────────────

function InfraPanel({ infra, onClose }: { infra: Infra; onClose: () => void }) {
  const isMedical = infra.type === 'medical'
  return (
    <div className="absolute bottom-5 left-5 z-10 w-64 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: isMedical ? '#DC2626' : '#1D4ED8' }}
      >
        <div>
          <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-0.5">
            {isMedical ? 'Medical Site' : 'Cooling Tent'}
          </p>
          <h3 className="text-[14px] font-bold text-white leading-tight">{infra.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="text-[12px] text-gray-500">{infra.description}</p>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────────

function ToastItem({ toast }: { toast: Toast }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0C2A1F] text-white text-[12px] font-semibold shadow-xl border border-white/10 max-w-[280px]">
      <span
        className={cn(
          'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
          toast.icon === 'success' ? 'bg-[#00D15A]' : 'bg-orange-500'
        )}
      >
        {toast.icon === 'success'
          ? <CheckCircle2 className="w-3 h-3 text-white" />
          : <AlertTriangle className="w-3 h-3 text-white" />}
      </span>
      {toast.message}
    </div>
  )
}

// ── Map states ────────────────────────────────────────────────────

function MapError() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#eef2ee] gap-3">
      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
        <MapPin className="w-6 h-6 text-gray-300" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-500">Map unavailable</p>
        <p className="text-xs text-gray-400 mt-0.5">Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local</p>
      </div>
    </div>
  )
}

function MapLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#eef2ee]">
      <div className="w-8 h-8 border-2 border-[#00D15A] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Legend ────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="absolute bottom-5 right-5 z-10 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 shadow-lg px-3 py-2.5 flex flex-col gap-1.5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Legend</p>
      {[
        { color: '#00D15A', label: 'Safe (WBGT < 30°C)' },
        { color: '#F97316', label: 'Caution (30–35°C)' },
        { color: '#EF4444', label: 'Critical (> 35°C)' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-[11px] text-gray-600">{label}</span>
        </div>
      ))}
      <div className="border-t border-gray-100 my-0.5" />
      {[
        { color: '#DC2626', label: 'Medical Post' },
        { color: '#1D4ED8', label: 'Cooling Tent' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full shrink-0 border-2" style={{ backgroundColor: color, borderColor: color }} />
          <span className="text-[11px] text-gray-600">{label}</span>
        </div>
      ))}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────

export default function LiveMapPage() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    id: 'heatguard-map',
  })

  const [filters, setFilters] = useState<Record<FilterKey, boolean>>({
    workers:   true,
    medical:   true,
    cooling:   true,
  })
  const [selectedSiteId, setSelectedSiteId] = useState('palm-jebel')
  const [siteDropOpen, setSiteDropOpen]     = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [selectedInfra, setSelectedInfra]   = useState<Infra | null>(null)
  const [activeRoute, setActiveRoute]       = useState<ActiveRoute | null>(null)
  const [toasts, setToasts]                 = useState<Toast[]>([])

  // Hover tooltip state
  const [hoveredItem, setHoveredItem] = useState<HoverItem | null>(null)
  const [mousePos,    setMousePos]    = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-dismiss toasts
  useEffect(() => {
    if (toasts.length === 0) return
    const timer = setTimeout(() => setToasts(prev => prev.slice(1)), 3500)
    return () => clearTimeout(timer)
  }, [toasts])

  function addToast(message: string, icon: 'success' | 'alert' = 'success') {
    setToasts(prev => [...prev, { id: Date.now(), message, icon }])
  }

  function toggleFilter(key: FilterKey) {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleBreakAlert(worker: Worker) {
    addToast(`Break alert sent to ${worker.name.split(' ')[0]}`, 'alert')
    setSelectedWorker(null)
  }

  function handleRouteToCooling(worker: Worker) {
    const tent = nearestCoolingTent(worker)
    setActiveRoute({ from: worker.position, to: tent.position, tentName: tent.name })
    addToast(`Routing ${worker.name.split(' ')[0]} → ${tent.name}`, 'success')
    setSelectedWorker(null)
  }

  const onMapClick = useCallback(() => {
    setSelectedWorker(null)
    setSelectedInfra(null)
  }, [])

  // Track mouse position continuously via native mousemove on the container.
  // Also hook GoogleMap's onMouseMove so we capture events inside the map canvas.
  function handleContainerMouseMove(e: React.MouseEvent) {
    setMousePos({ x: e.clientX, y: e.clientY })
  }

  function handleMapMouseMove(e: google.maps.MapMouseEvent) {
    if (e.domEvent) {
      const de = e.domEvent as MouseEvent
      setMousePos({ x: de.clientX, y: de.clientY })
    }
  }

  // Memoize icon objects (require Maps API to be loaded)
  const workerIcons = useMemo(() => {
    if (!isLoaded) return null
    return {
      safe:     makeWorkerIcon('safe'),
      caution:  makeWorkerIcon('caution'),
      critical: makeWorkerIcon('critical'),
    }
  }, [isLoaded])

  const infraIcons = useMemo(() => {
    if (!isLoaded) return null
    return {
      medical: makeInfraIcon('medical'),
      cooling: makeInfraIcon('cooling'),
    }
  }, [isLoaded])

  const activeSite = SITE_CONFIG[selectedSiteId]
  const siteCenter: google.maps.LatLngLiteral = { lat: activeSite.lat, lng: activeSite.lng }

  const { workers: WORKERS, infra: INFRA } = useMemo(
    () => generateSiteData(activeSite.lat, activeSite.lng),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedSiteId]
  )

  const criticalCount = WORKERS.filter(w => w.risk === 'critical').length
  const cautionCount  = WORKERS.filter(w => w.risk === 'caution').length

  return (
    <div
      ref={containerRef}
      className="-m-5 lg:-m-6 relative overflow-hidden"
      style={{ height: 'calc(100vh - 56px)' }}
      onMouseMove={handleContainerMouseMove}
    >
      {/* ── Map ───────────────────────────────────────────────── */}
      {loadError && <MapError />}
      {!isLoaded && !loadError && <MapLoader />}

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={siteCenter}
          zoom={16}
          options={{
            styles: MAP_STYLES,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
            gestureHandling: 'greedy',
          }}
          onClick={onMapClick}
          onMouseMove={handleMapMouseMove}
        >
          {/* Heat Zone */}
          <Circle
            center={siteCenter}
            radius={900}
            options={{
              strokeColor:   '#EF4444',
              strokeOpacity: 0.35,
              strokeWeight:  2,
              fillColor:     '#EF4444',
              fillOpacity:   0.09,
            }}
          />

          {/* Workers */}
          {filters.workers && workerIcons && WORKERS.map(worker => (
            <Marker
              key={worker.id}
              position={worker.position}
              icon={workerIcons[worker.risk]}
              zIndex={worker.risk === 'critical' ? 30 : worker.risk === 'caution' ? 20 : 10}
              onMouseOver={(e) => {
                if (e.domEvent) {
                  const de = e.domEvent as MouseEvent
                  setMousePos({ x: de.clientX, y: de.clientY })
                }
                setHoveredItem({ type: 'worker', data: worker })
              }}
              onMouseOut={() => setHoveredItem(null)}
              onClick={() => {
                setSelectedWorker(worker)
                setSelectedInfra(null)
              }}
            />
          ))}

          {/* Infrastructure */}
          {infraIcons && INFRA.map(infra => {
            const visible = infra.type === 'medical' ? filters.medical : filters.cooling
            if (!visible) return null
            return (
              <Marker
                key={infra.id}
                position={infra.position}
                icon={infraIcons[infra.type]}
                zIndex={5}
                onMouseOver={(e) => {
                  if (e.domEvent) {
                    const de = e.domEvent as MouseEvent
                    setMousePos({ x: de.clientX, y: de.clientY })
                  }
                  setHoveredItem({ type: 'infra', data: infra })
                }}
                onMouseOut={() => setHoveredItem(null)}
                onClick={() => {
                  setSelectedInfra(infra)
                  setSelectedWorker(null)
                  setActiveRoute(null)
                }}
              />
            )
          })}

          {/* Routing Polyline */}
          {activeRoute && (
            <Polyline
              path={[activeRoute.from, activeRoute.to]}
              options={{
                strokeColor:   '#00D15A',
                strokeWeight:  3,
                strokeOpacity: 0.85,
                icons: [{
                  icon: {
                    path:         google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale:        4,
                    fillColor:    '#00D15A',
                    fillOpacity:  1,
                    strokeColor:  '#00D15A',
                    strokeWeight: 1,
                  },
                  offset: '50%',
                }],
              }}
            />
          )}
        </GoogleMap>
      )}

      {/* ── Floating Control Panel ─────────────────────────── */}
      <div className="absolute top-4 left-4 z-10 w-64 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl border border-gray-200/80 overflow-hidden">
        {/* Header */}
        <div className="px-4 pt-4 pb-3" style={{ backgroundColor: '#0C2A1F' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00D15A]/20 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-[#00D15A]" />
              </div>
              <h2 className="text-[14px] font-bold text-white">Live Site Map</h2>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#00D15A]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A] animate-pulse" />
              LIVE
            </span>
          </div>

          {/* Site Selector */}
          <div className="relative">
            <button
              onClick={() => setSiteDropOpen(v => !v)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-white text-[12px] font-medium hover:bg-white/15 transition-colors outline-none"
            >
              <span className="truncate text-left">{activeSite.name}</span>
              <ChevronDown className={cn('w-3.5 h-3.5 shrink-0 text-white/50 transition-transform', siteDropOpen && 'rotate-180')} />
            </button>
            {siteDropOpen && (
              <div className="absolute top-full mt-1.5 left-0 right-0 rounded-xl bg-[#0e3326] border border-white/10 shadow-xl z-20 overflow-hidden">
                {SITE_IDS.map(id => (
                  <button
                    key={id}
                    onClick={() => { setSelectedSiteId(id); setSiteDropOpen(false); setSelectedWorker(null); setSelectedInfra(null) }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-[12px] font-medium transition-colors',
                      id === selectedSiteId
                        ? 'text-[#00D15A] bg-[#00D15A]/10'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {SITE_CONFIG[id].name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          {[
            { label: 'Total',    value: WORKERS.length, color: 'text-gray-800' },
            { label: 'Caution',  value: cautionCount,   color: 'text-orange-600' },
            { label: 'Critical', value: criticalCount,  color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex flex-col items-center py-2.5 px-1">
              <span className={cn('text-lg font-black leading-none', color)}>{value}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="px-3 py-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Layer Filters</p>
          <div className="flex flex-wrap gap-1.5">
            <FilterToggle label="Workers"   icon={<Users     className="w-3 h-3" />} active={filters.workers}   color="#0C2A1F" onClick={() => toggleFilter('workers')}   />
            <FilterToggle label="Medical"   icon={<Building2 className="w-3 h-3" />} active={filters.medical}   color="#DC2626" onClick={() => toggleFilter('medical')}   />
            <FilterToggle label="Cooling"   icon={<Wind      className="w-3 h-3" />} active={filters.cooling}   color="#1D4ED8" onClick={() => toggleFilter('cooling')}   />
          </div>
        </div>

        {/* Active route indicator */}
        {activeRoute && (
          <div className="mx-3 mb-3 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-700 truncate">
                Route → {activeRoute.tentName}
              </span>
            </div>
            <button
              onClick={() => setActiveRoute(null)}
              className="shrink-0 text-emerald-400 hover:text-emerald-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Worker Info Panel (click) ──────────────────────── */}
      {selectedWorker && (
        <WorkerInfoPanel
          worker={selectedWorker}
          onClose={() => setSelectedWorker(null)}
          onBreakAlert={handleBreakAlert}
          onRouteToCooling={handleRouteToCooling}
        />
      )}

      {/* ── Infra Panel (click) ────────────────────────────── */}
      {selectedInfra && !selectedWorker && (
        <InfraPanel
          infra={selectedInfra}
          onClose={() => setSelectedInfra(null)}
        />
      )}

      {/* ── Legend ────────────────────────────────────────── */}
      <Legend />

      {/* ── Toasts ────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>

      {/* ── Hover Tooltip (fixed, follows cursor, above all) ── */}
      {hoveredItem && !selectedWorker && !selectedInfra && (
        <HoverTooltip item={hoveredItem} pos={mousePos} />
      )}
    </div>
  )
}
