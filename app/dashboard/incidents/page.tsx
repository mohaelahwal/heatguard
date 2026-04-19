'use client'

import { useState, useMemo } from 'react'
import {
  MapPin, Clock, User, Phone, Video,
  CheckCircle2, XCircle, Mic, MicOff, VideoOff, PhoneOff,
  Activity, Thermometer, Wind, ChevronRight, Radio,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api'
import { HydrationChart, type HydrationEntry } from '@/components/HydrationChart'
import { DispatchModal } from '@/components/DispatchModal'

// ── Types ─────────────────────────────────────────────────────────────────────

type IncidentType = 'SOS' | 'Heat Stress' | 'Fall'
type IncidentStatus = 'Open' | 'Acknowledged' | 'Resolved'

interface Incident {
  id: string
  time: string
  worker: string
  badge: string
  crew: string
  type: IncidentType
  status: IncidentStatus
  zone: string
  gps: string
  lat: number
  lng: number
  notes: string
  wbgt: number
  heartRate: number
  hydrationLog: HydrationEntry[]
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    time: '08:42',
    worker: 'Khaled Saeed',
    badge: '#0047',
    crew: 'Crew Alpha',
    type: 'SOS',
    status: 'Open',
    zone: 'Zone B — Spine North',
    gps: '24.9786° N, 55.0051° E',
    lat: 24.9786,
    lng: 55.0051,
    notes: 'Worker triggered SOS manually. Reported dizziness and chest tightness. No response to radio check.',
    wbgt: 41.2,
    heartRate: 134,
    hydrationLog: [
      { time: '06:00', amount: 150 }, { time: '07:00', amount: 180 },
      { time: '08:00', amount: 120 }, { time: '09:00', amount: 0, missing: true },
      { time: '10:00', amount: 0, missing: true },
    ],
  },
  {
    id: 'INC-002',
    time: '09:15',
    worker: 'Ahmad Al-Farsi',
    badge: '#0023',
    crew: 'Crew Bravo',
    type: 'Heat Stress',
    status: 'Open',
    zone: 'Zone A — West Frond',
    gps: '24.9712° N, 54.9961° E',
    lat: 24.9712,
    lng: 54.9961,
    notes: 'Wearable flagged core temp above threshold (38.9°C). Worker stopped responding to app prompts.',
    wbgt: 43.8,
    heartRate: 128,
    hydrationLog: [
      { time: '06:00', amount: 100 }, { time: '07:00', amount: 140 },
      { time: '08:00', amount: 110 }, { time: '09:00', amount: 160 },
      { time: '10:00', amount: 0, missing: true },
    ],
  },
  {
    id: 'INC-003',
    time: '07:30',
    worker: 'Carlos Mendez',
    badge: '#0061',
    crew: 'Crew Delta',
    type: 'Fall',
    status: 'Acknowledged',
    zone: 'Zone C — Scaffold Bay 3',
    gps: '24.9649° N, 55.0038° E',
    lat: 24.9649,
    lng: 55.0038,
    notes: 'Accelerometer detected hard fall event. Worker is conscious. Nurse dispatched for assessment.',
    wbgt: 38.5,
    heartRate: 112,
    hydrationLog: [
      { time: '06:00', amount: 250 }, { time: '07:00', amount: 380 },
      { time: '08:00', amount: 320 }, { time: '09:00', amount: 290 },
      { time: '10:00', amount: 260 },
    ],
  },
  {
    id: 'INC-004',
    time: '10:00',
    worker: 'Mohammed Al-Rashid',
    badge: '#0082',
    crew: 'Crew Alpha',
    type: 'Heat Stress',
    status: 'Acknowledged',
    zone: 'Zone D — East Frond',
    gps: '24.9731° N, 55.0118° E',
    lat: 24.9731,
    lng: 55.0118,
    notes: 'Reported headache and nausea after extended sun exposure. Break scheduled. Under observation.',
    wbgt: 39.4,
    heartRate: 119,
    hydrationLog: [
      { time: '06:00', amount: 300 }, { time: '07:00', amount: 420 },
      { time: '08:00', amount: 380 }, { time: '09:00', amount: 350 },
      { time: '10:00', amount: 200 },
    ],
  },
  {
    id: 'INC-005',
    time: '06:15',
    worker: 'Pradeep Singh',
    badge: '#0039',
    crew: 'Crew Charlie',
    type: 'SOS',
    status: 'Resolved',
    zone: 'Zone B — Spine Mid',
    gps: '24.9768° N, 55.0055° E',
    lat: 24.9768,
    lng: 55.0055,
    notes: 'False positive SOS — device button accidentally triggered. Worker confirmed safe after video triage.',
    wbgt: 36.1,
    heartRate: 88,
    hydrationLog: [
      { time: '06:00', amount: 350 }, { time: '07:00', amount: 480 },
      { time: '08:00', amount: 440 }, { time: '09:00', amount: 400 },
      { time: '10:00', amount: 360 },
    ],
  },
  {
    id: 'INC-006',
    time: '05:48',
    worker: 'Liu Wei',
    badge: '#0054',
    crew: 'Crew Bravo',
    type: 'Heat Stress',
    status: 'Resolved',
    zone: 'Zone A — West Frond',
    gps: '24.9668° N, 54.9932° E',
    lat: 24.9668,
    lng: 54.9932,
    notes: 'Worker completed mandatory cooling break and re-hydration. Vitals normalised. Cleared to resume.',
    wbgt: 34.7,
    heartRate: 82,
    hydrationLog: [
      { time: '05:48', amount: 400 }, { time: '06:30', amount: 500 },
      { time: '07:30', amount: 460 }, { time: '08:30', amount: 420 },
      { time: '09:30', amount: 380 },
    ],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function typeConfig(type: IncidentType) {
  switch (type) {
    case 'SOS':
      return { bg: 'bg-red-100', text: 'text-[#FF3B30]', dot: 'bg-[#FF3B30]' }
    case 'Heat Stress':
      return { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-500' }
    case 'Fall':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' }
  }
}

function statusConfig(status: IncidentStatus) {
  switch (status) {
    case 'Open':
      return { bg: 'bg-red-100', text: 'text-[#FF3B30]', label: 'Open' }
    case 'Acknowledged':
      return { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Acknowledged' }
    case 'Resolved':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved' }
  }
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
}

// ── Incident Mini-Map ──────────────────────────────────────────────────────────

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  gestureHandling: 'none',
  keyboardShortcuts: false,
  styles: [
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
}

function IncidentMiniMap({ lat, lng }: { lat: number; lng: number }) {
  const { isLoaded } = useJsApiLoader({
    id: 'heatguard-map',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  })

  const center = useMemo(() => ({ lat, lng }), [lat, lng])

  const redMarkerIcon = useMemo((): google.maps.Symbol | undefined => {
    if (!isLoaded) return undefined
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: '#FF3B30',
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: 9,
    }
  }, [isLoaded])

  if (!isLoaded) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-gray-100 animate-pulse" style={{ height: 140 }} />
    )
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gray-200" style={{ height: 140 }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={16}
        options={MAP_OPTIONS}
      >
        <Marker position={center} icon={redMarkerIcon} />
      </GoogleMap>
    </div>
  )
}

// ── Video Modal ────────────────────────────────────────────────────────────────

function VideoModal({
  incident,
  open,
  onClose,
}: {
  incident: Incident
  open: boolean
  onClose: () => void
}) {
  const [muted, setMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="w-full max-w-[70vw] p-0 overflow-hidden rounded-2xl border-0 bg-[#0C2A1F] shadow-2xl">
        <DialogTitle className="sr-only">Tele-Triage Video Call — {incident.worker}</DialogTitle>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a4a36]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF3B30]" />
              </span>
              <span className="text-[#FF3B30] text-xs font-bold uppercase tracking-wider">Live Triage</span>
            </div>
            <span className="text-[#1a4a36] text-xs">|</span>
            <span className="text-white text-sm font-semibold">{incident.worker}</span>
            <span className="text-[#A3B8AF] text-xs">{incident.id} · {incident.zone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#00D15A]/10 text-[#00D15A] text-xs font-medium px-2.5 py-1 rounded-full">
              Encrypted · End-to-End
            </span>
          </div>
        </div>

        {/* ── Video Grid ── */}
        <div className="grid grid-cols-2 gap-0 relative" style={{ height: '420px' }}>

          {/* Nurse Feed */}
          <div className="relative overflow-hidden border-r border-[#1a4a36]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.istockphoto.com/id/2169046941/photo/beautiful-arab-nurse-wearing-hijab-portrait-in-the-city.jpg?s=612x612&w=0&k=20&c=KSncNXwmngZ7jKJk8QT0xu3nbi25NyrfdaF9_4WrFeQ="
              alt="Nurse video feed"
              className="w-full h-full object-cover object-top"
              draggable={false}
              referrerPolicy="no-referrer"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Label */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#00D15A]/20 border border-[#00D15A]/40 flex items-center justify-center">
                <span className="text-[#00D15A] text-[10px] font-bold">NR</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-none">Nurse Rashida</p>
                <p className="text-white/60 text-[10px]">Medical Station 1</p>
              </div>
            </div>
            {/* Mic indicator */}
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
              <Mic className="w-3 h-3 text-[#00D15A]" />
              <span className="text-white text-[10px]">Active</span>
            </div>
          </div>

          {/* Worker Feed */}
          <div className="relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.gettyimages.com/id/1444134386/video/tired-factory-worker-resting.jpg?s=640x640&k=20&c=JAqpjjpGbrkkUjNvSlorCnCidPd_5nhMypm2IOWZ6wM="
              alt="Worker video feed"
              className="w-full h-full object-cover"
              style={{ filter: camOff ? 'brightness(0.1)' : 'none', transition: 'filter 0.3s' }}
              draggable={false}
              referrerPolicy="no-referrer"
            />
            {/* Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Cam-off overlay */}
            {camOff && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-2">
                    <span className="text-gray-300 text-xl font-bold">{initials(incident.worker)}</span>
                  </div>
                  <p className="text-gray-400 text-xs">Camera off</p>
                </div>
              </div>
            )}

            {/* Live Vitals Panel — overlaid top-right */}
            <div className="absolute top-3 right-3 bg-[#0C2A1F]/90 backdrop-blur-sm rounded-2xl p-3 border border-[#1a4a36] min-w-[165px]">
              <p className="text-[#A3B8AF] text-[10px] font-bold uppercase tracking-wider mb-2.5">Live Wearable Data</p>

              {/* Heart Rate — pulsing */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-[#FF3B30]" />
                  <span className="text-[#A3B8AF] text-[10px]">Heart Rate</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[#FF3B30] text-sm font-bold tabular-nums motion-safe:animate-pulse">
                    {incident.heartRate}
                  </span>
                  <span className="text-[#A3B8AF] text-[9px]">BPM</span>
                </div>
              </div>

              {/* Core Temp */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Thermometer className="w-3 h-3 text-orange-400" />
                  <span className="text-[#A3B8AF] text-[10px]">Core Temp</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-orange-400 text-sm font-bold tabular-nums">38.5</span>
                  <span className="text-[#A3B8AF] text-[9px]">°C</span>
                </div>
              </div>

              {/* SpO2 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-blue-400" />
                  <span className="text-[#A3B8AF] text-[10px]">SpO₂</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-blue-400 text-sm font-bold tabular-nums">96</span>
                  <span className="text-[#A3B8AF] text-[9px]">%</span>
                </div>
              </div>

              {/* WBGT */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-[#FFCC00]" />
                  <span className="text-[#A3B8AF] text-[10px]">WBGT</span>
                </div>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[#FFCC00] text-sm font-bold tabular-nums">{incident.wbgt}</span>
                  <span className="text-[#A3B8AF] text-[9px]">°C</span>
                </div>
              </div>
            </div>

            {/* Worker label */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{initials(incident.worker)}</span>
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-none">{incident.worker}</p>
                <p className="text-white/60 text-[10px]">{incident.badge} · {incident.zone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Call Controls ── */}
        <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-[#1a4a36]">
          {/* Mute */}
          <button
            onClick={() => setMuted(m => !m)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              muted ? 'bg-gray-600 text-white' : 'bg-[#1a4a36] text-[#A3B8AF] hover:bg-[#0f3728] hover:text-white'
            }`}
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Camera */}
          <button
            onClick={() => setCamOff(c => !c)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              camOff ? 'bg-gray-600 text-white' : 'bg-[#1a4a36] text-[#A3B8AF] hover:bg-[#0f3728] hover:text-white'
            }`}
            aria-label={camOff ? 'Enable camera' : 'Disable camera'}
          >
            {camOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          {/* Spacer label */}
          <div className="flex-1 text-center">
            <p className="text-[#A3B8AF] text-xs">Triage in progress · {incident.id}</p>
          </div>

          {/* End Call */}
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-[#FF3B30] text-white font-semibold px-5 py-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg shadow-red-500/40 cursor-pointer"
            aria-label="End call"
          >
            <PhoneOff className="w-4 h-4" />
            End Call
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function IncidentsPage() {
  const [selected, setSelected] = useState<Incident>(INCIDENTS[0])
  const [filter, setFilter] = useState<IncidentStatus | 'All'>('All')
  const [showVideo, setShowVideo] = useState(false)
  const [isDispatchOpen, setIsDispatchOpen] = useState(false)
  const [localStatus, setLocalStatus] = useState<Record<string, IncidentStatus>>({})

  const getStatus = (inc: Incident): IncidentStatus =>
    localStatus[inc.id] ?? inc.status

  const filtered = filter === 'All'
    ? INCIDENTS
    : INCIDENTS.filter(inc => getStatus(inc) === filter)

  function acknowledge(inc: Incident) {
    if (getStatus(inc) === 'Open') {
      setLocalStatus(prev => ({ ...prev, [inc.id]: 'Acknowledged' }))
    }
  }

  function resolve(inc: Incident) {
    setLocalStatus(prev => ({ ...prev, [inc.id]: 'Resolved' }))
  }

  const statusOf = getStatus(selected)
  const typeCfg  = typeConfig(selected.type)
  const stsCfg   = statusConfig(statusOf)

  const filters: Array<IncidentStatus | 'All'> = ['All', 'Open', 'Acknowledged', 'Resolved']
  const openCount = INCIDENTS.filter(i => getStatus(i) === 'Open').length

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Incidents &amp; SOS</h1>
          <p className="text-gray-500 text-sm mt-0.5">Palm Jebel Ali — real-time incident command</p>
        </div>
        {openCount > 0 && (
          <div className="flex items-center gap-2 bg-[#FFF1F0] border border-[#FFCDD0] rounded-full px-4 py-2">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF3B30] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF3B30]" />
            </span>
            <span className="text-[#FF3B30] text-sm font-bold tabular-nums">{openCount}</span>
            <span className="text-[#FF3B30] text-xs font-medium">Open {openCount === 1 ? 'Incident' : 'Incidents'}</span>
          </div>
        )}
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ══ LEFT: Incident Queue (col-span-7) ══ */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">

          {/* Filter chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  filter === f
                    ? 'bg-[#0C2A1F] text-white shadow-sm'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {f}
                {f !== 'All' && (
                  <span className={`ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                    filter === f ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {INCIDENTS.filter(inc => getStatus(inc) === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table card */}
          <section className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {filter === 'All' ? 'All Incidents' : `${filter} Incidents`}
              </h2>
              <span className="text-gray-400 text-xs tabular-nums">{filtered.length} records</span>
            </div>

            {filtered.length === 0 ? (
              <div className="py-14 text-center">
                <CheckCircle2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No {filter.toLowerCase()} incidents</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th scope="col" className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pt-4 px-5">ID</th>
                      <th scope="col" className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pt-4 px-3">Time</th>
                      <th scope="col" className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pt-4 px-3">Worker</th>
                      <th scope="col" className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pt-4 px-3">Type</th>
                      <th scope="col" className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider pb-3 pt-4 px-3">Status</th>
                      <th scope="col" className="pb-3 pt-4 px-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inc) => {
                      const isSelected = selected.id === inc.id
                      const tcfg = typeConfig(inc.type)
                      const scfg = statusConfig(getStatus(inc))
                      return (
                        <tr
                          key={inc.id}
                          onClick={() => setSelected(inc)}
                          className={`transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${
                            isSelected ? 'bg-[#F0FDF4]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3.5 px-5">
                            <span className="text-xs font-mono font-bold text-gray-700">{inc.id}</span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <Clock className="w-3 h-3" />
                              {inc.time}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 flex-shrink-0">
                                {initials(inc.worker)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 leading-none">{inc.worker}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{inc.badge}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${tcfg.bg} ${tcfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${tcfg.dot}`} />
                              {inc.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${scfg.bg} ${scfg.text}`}>
                              {scfg.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? 'text-[#00D15A]' : 'text-gray-300'}`} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* ══ RIGHT: Detail & Action Panel (col-span-5) ══ */}
        <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-6">
          {/* border-2 border-[rgb(0,209,90)] per design request */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-[rgb(0,209,90)] overflow-hidden">

            {/* Panel header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-gray-900">Incident Detail</h2>
                <span className="text-gray-300 text-xs font-mono">{selected.id}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${stsCfg.bg} ${stsCfg.text}`}>
                {stsCfg.label}
              </span>
            </div>

            <div className="p-5 space-y-4">

              {/* Worker info */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#F0FDF4] flex items-center justify-center font-bold text-[#00D15A] text-sm flex-shrink-0">
                  {initials(selected.worker)}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 leading-none">{selected.worker}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{selected.badge} · {selected.crew}</p>
                </div>
                <div className="ml-auto text-right">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${typeCfg.bg} ${typeCfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${typeCfg.dot}`} />
                    {selected.type}
                  </span>
                </div>
              </div>

              {/* Bento: Timestamp + WBGT + Location | Hydration Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
                {/* Left: stats + location */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F7F9F8] rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Timestamp</p>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-900 tabular-nums">Today, {selected.time}</span>
                      </div>
                    </div>
                    <div className="bg-[#F7F9F8] rounded-xl p-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">WBGT</p>
                      <span className="text-sm font-bold tabular-nums text-[#FF6B00]">{selected.wbgt}°C</span>
                    </div>
                  </div>
                  <div className="bg-[#F7F9F8] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Location</p>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#00D15A] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selected.zone}</p>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selected.gps}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Right: hydration chart */}
                <div className="lg:col-span-5 flex">
                  <HydrationChart data={selected.hydrationLog} className="h-full w-full" />
                </div>
              </div>

              {/* Live GPS Mini-Map */}
              <IncidentMiniMap key={selected.id} lat={selected.lat} lng={selected.lng} />

              {/* Notes */}
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Notes / Symptoms</p>
                <p className="text-sm text-gray-700 leading-relaxed bg-[#F7F9F8] rounded-xl p-3">
                  {selected.notes}
                </p>
              </div>

            </div>

            {/* Action buttons */}
            <div className="px-5 pb-5 flex flex-col gap-2.5">

              {/* Join Triage Call */}
              <button
                onClick={() => statusOf === 'Open' && setShowVideo(true)}
                disabled={statusOf !== 'Open'}
                className={`w-full font-semibold py-3.5 px-5 rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg ${
                  statusOf === 'Open'
                    ? 'bg-[#0C2A1F] text-white hover:bg-[#0f3728] cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Video className={`w-4 h-4 ${statusOf === 'Open' ? 'text-[#00D15A]' : 'text-gray-400'}`} />
                Join Active Triage Call
              </button>

              {/* Secondary actions row */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => acknowledge(selected)}
                  disabled={statusOf !== 'Open'}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                    statusOf === 'Open'
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Acknowledge
                </button>

                <button
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  Dispatch
                </button>

                <button
                  onClick={() => resolve(selected)}
                  disabled={statusOf === 'Resolved'}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-full text-xs font-semibold transition-colors ${
                    statusOf !== 'Resolved'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Resolve
                </button>
              </div>

              {/* SOS-only: prominent dispatch alert */}
              {selected.type === 'SOS' && statusOf === 'Open' && (
                <button
                  onClick={() => setIsDispatchOpen(true)}
                  className="w-full bg-[#FF3B30] text-white font-bold py-3 px-5 rounded-full shadow-lg shadow-red-500/40 motion-safe:animate-pulse flex items-center justify-center gap-2 cursor-pointer hover:bg-red-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Dispatch Emergency Responder
                </button>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* ── Video Modal ── */}
      <VideoModal
        incident={selected}
        open={showVideo}
        onClose={() => setShowVideo(false)}
      />

      {/* ── Dispatch Modal ── */}
      <DispatchModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        patient={{
          name:      selected.worker,
          badge:     selected.badge,
          zone:      selected.zone,
          gps:       selected.gps,
          wbgt:      selected.wbgt,
          heartRate: selected.heartRate,
          type:      selected.type,
        }}
      />

    </div>
  )
}
