'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
  Building2,
  Cpu,
  Users,
  Plug,
  BookOpen,
  Plus,
  UserPlus,
  Wifi,
  WifiOff,
  ShieldCheck,
  ShieldOff,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Globe,
  MapPin,
  Phone,
  Clock,
  Zap,
  HardHat,
  Fingerprint,
  Database,
  Settings2,
  Search,
  ChevronDown,
  RefreshCw,
  MoreHorizontal,
  User,
  KeyRound,
  Ban,
  Pencil,
  Unlink,
  Watch,
  Activity,
  Heart,
  CheckCircle,
  X,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import DocsPage from '@/app/dashboard/docs/page'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'organization' | 'iot' | 'team' | 'integrations' | 'docs'

interface Device {
  id:       string
  worker:   string
  badge:    string
  battery:  number
  firmware: string
  status:   'active' | 'offline' | 'charging'
}

type Role = 'super_admin' | 'site_supervisor' | 'medic'
type Intensity = 'Heavy' | 'Moderate' | 'Light'

interface TeamMember {
  name:       string
  email:      string
  site:       string
  group:      string
  role:       Role
  twoFA:      boolean
  lastActive: string
}

interface WorkGroup {
  id:         string
  name:       string
  industry:   string
  headcount:  number
  intensity:  Intensity
  moduleName: string
  color:      string
  iconBg:     string
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const DEVICES: Device[] = [
  { id: 'HG-Band-092', worker: 'Rajesh Kumar',       badge: '#0047', battery: 82,  firmware: 'v3.2.1', status: 'active'   },
  { id: 'HG-Band-041', worker: 'Yusuf Ibrahim',      badge: '#0029', battery: 61,  firmware: 'v3.2.1', status: 'active'   },
  { id: 'HG-Band-117', worker: 'Binu Mathew',        badge: '#0071', battery: 14,  firmware: 'v3.1.9', status: 'active'   },
  { id: 'HG-Band-203', worker: 'Farrukh Tashkentov', badge: '#0083', battery: 95,  firmware: 'v3.2.1', status: 'charging' },
  { id: 'HG-Band-058', worker: 'Priya Sharma',       badge: '#0055', battery: 3,   firmware: 'v3.1.8', status: 'offline'  },
  { id: 'HG-Band-077', worker: 'George Adam',        badge: '#0203', battery: 48,  firmware: 'v3.2.1', status: 'active'   },
  { id: 'HG-Band-134', worker: 'Vinay Barad',        badge: '#0144', battery: 27,  firmware: 'v3.2.0', status: 'active'   },
  { id: 'HG-Band-009', worker: 'Indira Comar',       badge: '#0089', battery: 71,  firmware: 'v3.2.1', status: 'active'   },
]

const TEAM: TeamMember[] = [
  { name: 'Rajesh Kumar',       email: 'rajesh@site.ae',   site: 'Palm Jebel Ali A',    group: 'Civil & Groundworks',       role: 'site_supervisor', twoFA: true,  lastActive: '2m ago'   },
  { name: 'Yusuf Ibrahim',      email: 'yusuf@site.ae',    site: 'Palm Jebel Ali A',    group: 'MEP (HVAC / Electrical)',    role: 'medic',           twoFA: true,  lastActive: '5m ago'   },
  { name: 'Binu Mathew',        email: 'binu@site.ae',     site: 'Expo City Site',       group: 'Pipefitting & Welding',     role: 'site_supervisor', twoFA: false, lastActive: '18m ago'  },
  { name: 'Farrukh Tashkentov', email: 'farrukh@site.ae', site: 'Dubai Creek Harbour',  group: 'Heavy Equipment Operators', role: 'site_supervisor', twoFA: true,  lastActive: '1h ago'   },
  { name: 'Priya Sharma',       email: 'priya@site.ae',    site: 'Expo City Site',       group: 'Civil & Groundworks',       role: 'medic',           twoFA: true,  lastActive: '2h ago'   },
  { name: 'George Adam',        email: 'george@site.ae',   site: 'Palm Jebel Ali A',    group: 'Scaffolders',               role: 'site_supervisor', twoFA: false, lastActive: '3h ago'   },
  { name: 'Vinay Barad',        email: 'vinay@site.ae',    site: 'Dubai Creek Harbour',  group: 'Drilling & Blasting',       role: 'medic',           twoFA: true,  lastActive: 'Yesterday'},
  { name: 'Indira Comar',       email: 'indira@site.ae',   site: 'Saadiyat Cultural',    group: 'MEP (HVAC / Electrical)',   role: 'medic',           twoFA: false, lastActive: 'Yesterday'},
]

const WORK_GROUPS: WorkGroup[] = [
  { id: 'civil',       name: 'Civil & Groundworks',       industry: 'Construction', headcount: 45, intensity: 'Heavy',    moduleName: 'Shoring & Trench Safety',            color: 'text-amber-700',  iconBg: 'bg-amber-100'  },
  { id: 'mep',         name: 'MEP (HVAC / Electrical)',   industry: 'Construction', headcount: 32, intensity: 'Moderate', moduleName: 'Electrical Safety in High Temps',    color: 'text-blue-700',   iconBg: 'bg-blue-100'   },
  { id: 'heavy',       name: 'Heavy Equipment Operators', industry: 'Construction', headcount: 15, intensity: 'Moderate', moduleName: 'Heat Index Monitoring from Cabins',  color: 'text-violet-700', iconBg: 'bg-violet-100' },
  { id: 'scaffolders', name: 'Scaffolders',               industry: 'Construction', headcount: 28, intensity: 'Heavy',    moduleName: 'Working at Heights in Heat',         color: 'text-orange-700', iconBg: 'bg-orange-100' },
  { id: 'pipefitting', name: 'Pipefitting & Welding',     industry: 'O&G',          headcount: 18, intensity: 'Heavy',    moduleName: 'Confined Space & Fume Exposure',     color: 'text-rose-700',   iconBg: 'bg-rose-100'   },
  { id: 'drilling',    name: 'Drilling & Blasting',       industry: 'Mining',       headcount: 22, intensity: 'Heavy',    moduleName: 'Blast Zone Heat Protocol',           color: 'text-red-700',    iconBg: 'bg-red-100'    },
]

const INTENSITY_BADGE: Record<Intensity, string> = {
  Heavy:    'bg-red-100 text-red-700 border border-red-200',
  Moderate: 'bg-amber-100 text-amber-700 border border-amber-200',
  Light:    'bg-green-100 text-green-700 border border-green-200',
}

const ALL_GROUPS = ['All Groups', ...Array.from(new Set(TEAM.map(w => w.group)))]

type WearableStatus = 'Active' | 'Charging' | 'Offline'

interface FieldWorker {
  name:           string
  employeeId:     string
  site:           string
  group:          string
  wearableStatus: WearableStatus
}

const FIELD_WORKERS: FieldWorker[] = [
  { name: 'Ahmad Al-Rashidi',    employeeId: 'EMP-4092', site: 'Palm Jebel Ali A',    group: 'Civil & Groundworks',       wearableStatus: 'Active'   },
  { name: 'Suresh Nair',         employeeId: 'EMP-4093', site: 'Palm Jebel Ali A',    group: 'MEP (HVAC / Electrical)',    wearableStatus: 'Active'   },
  { name: 'Mohammed Al-Yafei',   employeeId: 'EMP-4094', site: 'Expo City Site',       group: 'Civil & Groundworks',       wearableStatus: 'Charging' },
  { name: 'Pradeep Sreenivasan', employeeId: 'EMP-4095', site: 'Dubai Creek Harbour',  group: 'Scaffolders',               wearableStatus: 'Active'   },
  { name: 'Khalid Al-Mutairi',   employeeId: 'EMP-4096', site: 'Palm Jebel Ali A',    group: 'Heavy Equipment Operators', wearableStatus: 'Offline'  },
  { name: 'Ravi Shankar',        employeeId: 'EMP-4097', site: 'Expo City Site',       group: 'Pipefitting & Welding',     wearableStatus: 'Active'   },
  { name: 'Jose Fernandez',      employeeId: 'EMP-4098', site: 'Dubai Creek Harbour',  group: 'Drilling & Blasting',       wearableStatus: 'Active'   },
  { name: 'Tariq Hussain',       employeeId: 'EMP-4099', site: 'Saadiyat Cultural',    group: 'Civil & Groundworks',       wearableStatus: 'Active'   },
]

const WEARABLE_BADGE: Record<WearableStatus, string> = {
  Active:   'bg-[#E3FAED] text-[#007A38] border-[#00D15A]/20',
  Charging: 'bg-blue-50 text-blue-700 border-blue-200',
  Offline:  'bg-red-50 text-red-600 border-red-100',
}

// ── Sub-components ────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<Role, { label: string; classes: string }> = {
  super_admin:     { label: 'Super Admin',     classes: 'bg-purple-100 text-purple-700 border-purple-200' },
  site_supervisor: { label: 'Site Supervisor', classes: 'bg-blue-100   text-blue-700   border-blue-200'   },
  medic:           { label: 'Medic',           classes: 'bg-green-100  text-green-700  border-green-200'  },
}

function BatteryBar({ level }: { level: number }) {
  const low = level < 20
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', low ? 'bg-[#FF3B30]' : 'bg-[#00D15A]')}
          style={{ width: `${level}%` }}
        />
      </div>
      <span className={cn('text-xs font-semibold tabular-nums', low ? 'text-red-600' : 'text-gray-600')}>
        {level}%
      </span>
    </div>
  )
}

// ── Tab Contents ──────────────────────────────────────────────────────────────

function OrganizationTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Organization Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your company profile, site details, and regional configuration.</p>
      </div>

      {/* Company profile */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h3 className="text-sm font-bold text-gray-800">Company Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Company Name',    value: 'Al-Futtaim Engineering', icon: Building2 },
            { label: 'Primary Contact', value: '+971 4 223 1400',        icon: Phone     },
            { label: 'Website',         value: 'alfuttaim.ae',           icon: Globe     },
            { label: 'Timezone',        value: 'GST (UTC+4)',            icon: Clock     },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" /> {label}
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 font-medium">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active sites */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Active Sites</h3>
          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#00D15A] text-white hover:bg-green-600 transition-colors cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Add Site
          </button>
        </div>
        <div className="space-y-2.5">
          {[
            { name: 'Palm Jebel Ali Site A', workers: 300, status: 'active'   },
            { name: 'Expo City Site',        workers: 180, status: 'active'   },
            { name: 'Dubai Creek Harbour',   workers: 240, status: 'active'   },
            { name: 'Saadiyat Cultural District', workers: 95, status: 'setup'},
          ].map(site => (
            <div key={site.name} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-100">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{site.name}</p>
                <p className="text-xs text-gray-400">{site.workers} workers enrolled</p>
              </div>
              <span className={cn(
                'text-[10px] font-bold px-2.5 py-1 rounded-full border',
                site.status === 'active'
                  ? 'bg-[#E3FAED] text-[#007A38] border-[#00D15A]/20'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              )}>
                {site.status === 'active' ? 'Active' : 'Setup'}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const PAIRING_DEVICES = [
  { id: 'kenzen',   name: 'Kenzen',      sub: 'Heat Monitor', logo: 'https://kenzen.com/wp-content/uploads/2025/06/cropped-KCI-Logo-Icon-Medium-Gray-150x150.png' },
  { id: 'equivital',name: 'Equivital',   sub: 'LifeMonitor',  logo: 'https://media.licdn.com/dms/image/v2/C4D0BAQEJi1jKEaVpwQ/company-logo_200_200/company-logo_200_200/0/1630552829536/equivitalglobal_logo?e=2147483647&v=beta&t=OBKUufFn55PAxz0gNwadGvgE6SoEU7ZEAt0FvyxyqxA' },
  { id: 'garmin',   name: 'Garmin',      sub: 'Industrial',   logo: 'https://cdn.iconscout.com/icon/free/png-256/free-garmin-logo-icon-svg-download-png-3032371.png?f=webp' },
  { id: 'apple',    name: 'Apple Watch', sub: 'Series 9',     logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
  { id: 'polar',    name: 'Polar',       sub: 'Chest Strap',  logo: 'https://flow.polar.com/flow-ui-mono/static/image/apple-touch-icon.70ac45ad.png' },
  { id: 'whoop',    name: 'WHOOP',       sub: '4.0 Band',     logo: 'https://logosandtypes.com/wp-content/uploads/2025/04/whoop.svg' },
]

const ASSIGN_WORKERS = [
  'Ahmad Al-Rashidi',
  'Suresh Nair',
  'Mohammed Al-Yafei',
  'Pradeep Sreenivasan',
  'Ravi Shankar',
  'Jose Fernandez',
]

function PairWearableModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step,           setStep]           = useState(1)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [assignTo,       setAssignTo]       = useState('')
  const [successToast,   setSuccessToast]   = useState(false)

  // Auto-advance from scanning → found after 3s
  useEffect(() => {
    if (step !== 2) return
    const t = setTimeout(() => setStep(3), 3000)
    return () => clearTimeout(t)
  }, [step])

  function reset() {
    setStep(1)
    setSelectedDevice(null)
    setAssignTo('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleComplete() {
    handleClose()
    setSuccessToast(true)
    setTimeout(() => setSuccessToast(false), 3500)
  }

  const deviceLabel = PAIRING_DEVICES.find(d => d.id === selectedDevice)?.name ?? ''

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl" showCloseButton={false}>

          {/* ── Step 1: Select device ── */}
          {step === 1 && (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <DialogTitle className="text-base font-bold text-gray-900">Connect Hardware</DialogTitle>
                <p className="text-xs text-gray-500 mt-1">Select the device type you want to provision.</p>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-3 gap-3">
                  {PAIRING_DEVICES.map(({ id, name, sub, logo }) => (
                    <button
                      key={id}
                      onClick={() => { setSelectedDevice(id); setStep(2) }}
                      className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-slate-200 bg-white hover:ring-2 hover:ring-[#00D15A] hover:shadow-md transition-all cursor-pointer text-center"
                    >
                      <img src={logo} alt={name} className="h-10 w-auto object-contain mb-0 mx-auto" />
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-center text-gray-400 mt-5">
                  Don't see your device?{' '}
                  <span className="text-[#00D15A] cursor-pointer hover:underline">Request an integration</span>
                </p>
              </div>
              <div className="px-6 pb-5 flex justify-end">
                <button onClick={handleClose} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  Cancel
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Scanning ── */}
          {step === 2 && (
            <div className="flex flex-col items-center px-6 py-10 gap-6">
              <DialogTitle className="text-base font-bold text-gray-900">Searching for Devices…</DialogTitle>
              {/* Radar animation */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <span className="absolute w-40 h-40 rounded-full border border-[#00D15A]/20 animate-ping [animation-duration:2s]" />
                <span className="absolute w-28 h-28 rounded-full border border-[#00D15A]/30 animate-ping [animation-duration:2s] [animation-delay:0.4s]" />
                <span className="absolute w-20 h-20 rounded-full bg-[#00D15A]/10 animate-pulse" />
                <span className="absolute w-12 h-12 rounded-full bg-[#00D15A]/20 animate-pulse [animation-delay:0.2s]" />
                <div className="relative w-8 h-8 rounded-full bg-[#00D15A] flex items-center justify-center shadow-lg shadow-[#00D15A]/40">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700">Scanning for <span className="text-[#00D15A]">{deviceLabel}</span> devices</p>
                <p className="text-xs text-gray-400 mt-1">Broadcasting Bluetooth LE signal…</p>
              </div>
              <div className="flex gap-1.5">
                {[0, 0.2, 0.4].map(d => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#00D15A] animate-bounce" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
              <button onClick={handleClose} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                Cancel
              </button>
            </div>
          )}

          {/* ── Step 3: Found + Assign ── */}
          {step === 3 && (
            <>
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <DialogTitle className="text-base font-bold text-gray-900">Device Found</DialogTitle>
                <p className="text-xs text-gray-500 mt-1">Review and assign the discovered device.</p>
              </div>
              <div className="px-6 py-5 space-y-5">
                {/* Success card */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#E3FAED] border border-[#00D15A]/30">
                  <div className="w-10 h-10 rounded-xl bg-[#00D15A] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#00D15A]/30">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#007A38]">{deviceLabel} Device Discovered</p>
                    <p className="text-[11px] text-[#00A347] font-mono mt-0.5">MAC: 00:1A:2B:3C:4D:5E</p>
                  </div>
                </div>

                {/* Assign worker */}
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-2">
                    Assign to Worker
                  </label>
                  <select
                    value={assignTo}
                    onChange={e => setAssignTo(e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#00D15A] focus:ring-2 focus:ring-[#00D15A]/20 transition-all bg-white text-gray-700"
                  >
                    <option value="" disabled>Select a worker…</option>
                    {ASSIGN_WORKERS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                {/* Complete button */}
                <button
                  onClick={handleComplete}
                  disabled={!assignTo}
                  className="w-full py-3 rounded-xl bg-[#00D15A] hover:bg-[#33FF85] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A1F16] text-sm font-bold transition-colors shadow-md shadow-[#00D15A]/25"
                >
                  Complete Provisioning
                </button>

                <button onClick={handleClose} className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors text-center">
                  Cancel
                </button>
              </div>
            </>
          )}

        </DialogContent>
      </Dialog>

      {/* Success toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#0A1F16] text-white text-sm font-semibold px-5 py-3.5 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle className="w-4 h-4 text-[#00D15A]" />
          {deviceLabel} successfully provisioned
        </div>
      )}
    </>
  )
}

function IoTTab() {
  const [isPairingOpen, setIsPairingOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">IoT Device Fleet Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Monitor, configure, and pair wearable sensors across all sites.</p>
        </div>
        <button
          onClick={() => setIsPairingOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#00D15A] text-white hover:bg-green-600 transition-colors shadow-md shadow-[#00D15A]/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Pair New Wearable
        </button>
      </div>

      <PairWearableModal open={isPairingOpen} onClose={() => setIsPairingOpen(false)} />

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#E3FAED] flex items-center justify-center">
            <Wifi className="w-5 h-5 text-[#00D15A]" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900 tabular-nums">250<span className="text-sm font-medium text-gray-400">/300</span></p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Active Wearables</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-red-600 tabular-nums">12</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Low Battery Alerts</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#E3FAED] flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#00D15A]" />
          </div>
          <div>
            <p className="text-sm font-black text-[#007A38] tabular-nums">Online</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Gateway Status</p>
          </div>
        </div>
      </div>

      {/* Device table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Registered Devices</h3>
          <span className="text-xs text-gray-400">{DEVICES.length} devices</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['Device ID', 'Assigned Worker', 'Battery', 'Firmware', 'Status'].map(col => (
                <th key={col} className="px-5 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {DEVICES.map(device => (
              <tr key={device.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="text-xs font-bold font-mono text-gray-800">{device.id}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{device.worker}</p>
                    <p className="text-[10px] text-gray-400">{device.badge}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <BatteryBar level={device.battery} />
                </td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-mono text-gray-500">{device.firmware}</span>
                </td>
                <td className="px-5 py-3.5">
                  {device.status === 'active' && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#007A38] bg-[#E3FAED] border border-[#00D15A]/20 px-2.5 py-1 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A]" /> Active
                    </span>
                  )}
                  {device.status === 'charging' && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full w-fit">
                      <Zap className="w-2.5 h-2.5" /> Charging
                    </span>
                  )}
                  {device.status === 'offline' && (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full w-fit">
                      <WifiOff className="w-2.5 h-2.5" /> Offline
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Team Sub-tabs ─────────────────────────────────────────────────────────────

// ── Shared form field helpers ─────────────────────────────────────────────────

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">{label}</label>
      {children}
    </div>
  )
}

const INPUT_CLS = "w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 focus:border-[#00D15A]"
const SELECT_CLS = "w-full appearance-none pl-3.5 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 focus:border-[#00D15A] cursor-pointer"

// ── Add Worker Modal ──────────────────────────────────────────────────────────

function AddWorkerModal({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold text-slate-900">Add Field Worker</DialogTitle>
          <DialogClose className="text-slate-400 hover:text-slate-700 transition-colors" />
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name">
              <input type="text" placeholder="e.g. Rajesh Kumar" className={INPUT_CLS} />
            </FormField>
            <FormField label="Employee ID">
              <input type="text" placeholder="e.g. EMP-4100" className={INPUT_CLS} />
            </FormField>
          </div>
          <FormField label="Assign to Site">
            <div className="relative">
              <select className={SELECT_CLS}>
                <option value="" disabled>Select site…</option>
                <option>Palm Jebel Ali A</option>
                <option>Expo City Site</option>
                <option>Dubai Creek Harbour</option>
                <option>Saadiyat Cultural District</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </FormField>
          <FormField label="Assign to Work Group">
            <div className="relative">
              <select className={SELECT_CLS}>
                <option value="" disabled>Select group…</option>
                <option>Civil &amp; Groundworks</option>
                <option>MEP (HVAC / Electrical)</option>
                <option>Scaffolders</option>
                <option>Heavy Equipment Operators</option>
                <option>Pipefitting &amp; Welding</option>
                <option>Drilling &amp; Blasting</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </FormField>
          <FormField label="Link Wearable MAC Address (Optional)">
            <input type="text" placeholder="e.g. AA:BB:CC:DD:EE:FF" className={INPUT_CLS} />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <DialogClose className="text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl px-5 py-2.5 hover:bg-white transition-colors cursor-pointer">
            Cancel
          </DialogClose>
          <button
            onClick={() => { onOpenChange(false); onSaved() }}
            className="flex items-center gap-2 text-sm font-bold text-white rounded-xl px-6 py-2.5 transition-all hover:opacity-90"
            style={{ backgroundColor: '#00D15A', boxShadow: '0 4px 16px rgba(0,209,90,0.3)' }}
          >
            Save Worker
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Directory sub-tab ─────────────────────────────────────────────────────────

// ── Row action menus ──────────────────────────────────────────────────────────

function WorkerRowMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors outline-none">
        <MoreHorizontal className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-lg p-1">
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
          <User className="w-3.5 h-3.5" /> View Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
          <Pencil className="w-3.5 h-3.5" /> Edit Group / Site
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
          <Unlink className="w-3.5 h-3.5" /> Unlink Wearable
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 border-slate-100" />
        <DropdownMenuItem variant="destructive" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-red-50">
          <Ban className="w-3.5 h-3.5" /> Suspend / Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function AdminRowMenu({ onAssign }: { onAssign: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors outline-none">
        <MoreHorizontal className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-lg p-1">
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
          <User className="w-3.5 h-3.5" /> View Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50"
          onClick={onAssign}
        >
          <UserPlus className="w-3.5 h-3.5" /> Edit Assignments
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-50">
          <KeyRound className="w-3.5 h-3.5" /> Reset Password
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 border-slate-100" />
        <DropdownMenuItem variant="destructive" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-red-50">
          <Ban className="w-3.5 h-3.5" /> Suspend Access
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Field Workers directory (Directory sub-tab) ───────────────────────────────

function FieldWorkerDirectoryTab() {
  const [search,        setSearch]        = useState('')
  const [groupFilter,   setGroupFilter]   = useState('All Groups')
  const [addWorkerOpen, setAddWorkerOpen] = useState(false)
  const [toast,         setToast]         = useState(false)

  function showToast() { setToast(true); setTimeout(() => setToast(false), 3500) }

  const filtered = FIELD_WORKERS.filter(w => {
    const q = search.toLowerCase()
    return (w.name.toLowerCase().includes(q) || w.employeeId.toLowerCase().includes(q)) &&
           (groupFilter === 'All Groups' || w.group === groupFilter)
  })

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#00D15A]/30 rounded-2xl px-5 py-3.5 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-[#00D15A] flex-shrink-0" />
          <p className="text-sm font-semibold text-slate-800">Worker added successfully.</p>
        </div>
      )}
      <AddWorkerModal open={addWorkerOpen} onOpenChange={setAddWorkerOpen} onSaved={showToast} />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 focus:border-[#00D15A] w-56"
            />
          </div>
          <div className="relative">
            <select
              value={groupFilter}
              onChange={e => setGroupFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 focus:border-[#00D15A] cursor-pointer"
            >
              {ALL_GROUPS.map(g => <option key={g}>{g}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <button
          onClick={() => setAddWorkerOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white cursor-pointer whitespace-nowrap transition-all hover:opacity-90"
          style={{ backgroundColor: '#00D15A', boxShadow: '0 4px 16px rgba(0,209,90,0.25)' }}
        >
          <Plus className="w-4 h-4" /> Add Worker
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Field Workers (IoT Fleet)</h3>
          <span className="text-xs text-slate-400">{filtered.length} workers</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Name', 'Employee ID', 'Assigned Site', 'Work Group', 'Wearable Status', ''].map((col, i) => (
                <th key={i} className={cn('px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider', !col && 'w-12')}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">No workers match your filters.</td></tr>
            ) : filtered.map(w => {
              const initials = w.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              return (
                <tr key={w.employeeId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0B281F] text-[#00D15A] flex items-center justify-center text-[10px] font-bold flex-shrink-0">{initials}</div>
                      <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{w.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono font-semibold text-slate-600">{w.employeeId}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      <span className="text-xs text-slate-600 font-medium">{w.site}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-600">{w.group}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn('inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border', WEARABLE_BADGE[w.wearableStatus])}>
                      {w.wearableStatus === 'Active'   && <span className="w-1.5 h-1.5 rounded-full bg-[#00D15A]" />}
                      {w.wearableStatus === 'Charging' && <Zap className="w-2.5 h-2.5" />}
                      {w.wearableStatus === 'Offline'  && <WifiOff className="w-2.5 h-2.5" />}
                      {w.wearableStatus}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <WorkerRowMenu />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Platform Admins table (top-level tab) ─────────────────────────────────────

const ASSIGN_GROUPS = ['Crew Alpha', 'Crew Bravo', 'Scaffolders', 'Medic Team']
const MOCK_ASSIGNED_WORKERS = ['Rajesh Kumar', 'Pradeep Singh', 'Omar Abdullah']

function AssignmentModal({
  open,
  onOpenChange,
  admin,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  admin: TeamMember | null
  onSaved: () => void
}) {
  const [site, setSite]           = useState('all')
  const [groups, setGroups]       = useState<string[]>(['Crew Alpha', 'Crew Bravo'])
  const [workerSearch, setWorkerSearch] = useState('')
  const [workers, setWorkers]     = useState<string[]>(MOCK_ASSIGNED_WORKERS)

  function toggleGroup(g: string) {
    setGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  }

  function removeWorker(w: string) {
    setWorkers(prev => prev.filter(x => x !== w))
  }

  if (!admin) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-slate-900">Manage Assignments</DialogTitle>
          <p className="text-sm text-slate-400 mt-0.5">Define platform scope for <span className="font-semibold text-slate-700">{admin.name}</span></p>
        </DialogHeader>

        <div className="space-y-5 mt-2">

          {/* Section 1: Work Site */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned Work Site</label>
            <Select value={site} onValueChange={setSite}>
              <SelectTrigger className="w-full rounded-xl border-slate-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="palm-jebel">Palm Jebel Ali (CT-452-JBL)</SelectItem>
                <SelectItem value="jabal-ali">Jabal Ali (ET-355-SWT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Section 2: Work Groups */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Assigned Work Groups</label>
            <div className="flex flex-wrap gap-2">
              {ASSIGN_GROUPS.map(g => {
                const active = groups.includes(g)
                return (
                  <button
                    key={g}
                    onClick={() => toggleGroup(g)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all',
                      active
                        ? 'bg-[#00D15A]/20 border-[#00D15A] text-[#00D15A]'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                    )}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Individual Workers */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Assign Specific Workers</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search by worker name or ID..."
                value={workerSearch}
                onChange={e => setWorkerSearch(e.target.value)}
                className="pl-9 rounded-xl text-sm border-slate-200"
              />
            </div>
            {workers.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Assigned Workers</p>
                <div className="flex flex-wrap gap-2">
                  {workers.map(w => (
                    <Badge key={w} variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1 text-xs font-medium">
                      {w}
                      <button onClick={() => removeWorker(w)} className="rounded-full hover:bg-slate-300 p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => { onOpenChange(false); onSaved() }}
          className="mt-4 w-full py-2.5 rounded-xl bg-[#00D15A] hover:bg-[#00b84f] text-white text-sm font-bold transition-colors"
        >
          Save Assignments
        </button>
      </DialogContent>
    </Dialog>
  )
}

function PlatformAdminsTab() {
  const [search,          setSearch]          = useState('')
  const [isAssignOpen,    setIsAssignOpen]    = useState(false)
  const [selectedAdmin,   setSelectedAdmin]   = useState<TeamMember | null>(null)
  const [toast,           setToast]           = useState(false)

  function openAssign(admin: TeamMember) {
    setSelectedAdmin(admin)
    setIsAssignOpen(true)
  }

  function handleSaved() {
    setToast(true)
    setTimeout(() => setToast(false), 3500)
  }

  const filtered = TEAM.filter(m => {
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 focus:border-[#00D15A] w-64"
          />
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl bg-[#0B281F] text-white hover:bg-[#0d3325] transition-colors cursor-pointer whitespace-nowrap">
          <UserPlus className="w-4 h-4" /> Invite Admin
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Platform Access (Admins)</h3>
          <span className="text-xs text-slate-400">{filtered.length} members</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Name', 'Email', 'Role', '2FA', 'Last Active', ''].map((col, i) => (
                <th key={i} className={cn('px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider', !col && 'w-12')}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">No admins match your search.</td></tr>
            ) : filtered.map(m => {
              const role     = ROLE_CONFIG[m.role]
              const initials = m.name.split(' ').map(n => n[0]).join('').slice(0, 2)
              return (
                <tr key={m.email} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0B281F] text-[#00D15A] flex items-center justify-center text-[10px] font-bold flex-shrink-0">{initials}</div>
                      <span className="text-xs font-semibold text-slate-800 whitespace-nowrap">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-300 flex-shrink-0" />
                      <span className="text-xs text-slate-500">{m.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full border', role.classes)}>{role.label}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {m.twoFA
                      ? <span className="flex items-center gap-1 text-[10px] font-bold text-[#007A38]"><ShieldCheck className="w-3.5 h-3.5" /> Enabled</span>
                      : <span className="flex items-center gap-1 text-[10px] font-bold text-red-500"><ShieldOff className="w-3.5 h-3.5" /> Off</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400">{m.lastActive}</span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <AdminRowMenu onAssign={() => openAssign(m)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <AssignmentModal
        open={isAssignOpen}
        onOpenChange={setIsAssignOpen}
        admin={selectedAdmin}
        onSaved={handleSaved}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#0C2A1F] text-white text-sm font-semibold rounded-2xl shadow-2xl border border-white/10">
          <CheckCircle2 className="w-4 h-4 text-[#00D15A] shrink-0" />
          Assignments saved successfully
        </div>
      )}
    </div>
  )
}

function CreateWorkGroupModal({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-bold text-slate-900">Create Work Group</DialogTitle>
          <DialogClose className="text-slate-400 hover:text-slate-700 transition-colors" />
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          <FormField label="Group Name">
            <input type="text" placeholder="e.g. Formwork Carpenters" className={INPUT_CLS} />
          </FormField>
          <FormField label="Labor Intensity">
            <div className="relative">
              <select className={SELECT_CLS}>
                <option value="" disabled>Select intensity…</option>
                <option value="light">Light — minimal physical exertion</option>
                <option value="moderate">Moderate — regular physical tasks</option>
                <option value="heavy">Heavy — sustained heavy labour</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </FormField>
          <FormField label="Description (Optional)">
            <textarea
              rows={3}
              placeholder="Describe the typical tasks and heat risk context for this group…"
              className={cn(INPUT_CLS, 'resize-none')}
            />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <DialogClose className="text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl px-5 py-2.5 hover:bg-white transition-colors cursor-pointer">
            Cancel
          </DialogClose>
          <button
            onClick={() => { onOpenChange(false); onSaved() }}
            className="text-sm font-bold text-white rounded-xl px-6 py-2.5 transition-all hover:opacity-90"
            style={{ backgroundColor: '#00D15A', boxShadow: '0 4px 16px rgba(0,209,90,0.3)' }}
          >
            Create Group
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function WorkGroupsSubTab() {
  const [createOpen, setCreateOpen] = useState(false)
  const [toast,      setToast]      = useState(false)

  function showToast() {
    setToast(true)
    setTimeout(() => setToast(false), 3500)
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#00D15A]/30 rounded-2xl px-5 py-3.5 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-[#00D15A] flex-shrink-0" />
          <p className="text-sm font-semibold text-slate-800">Work group created successfully.</p>
        </div>
      )}
      <CreateWorkGroupModal open={createOpen} onOpenChange={setCreateOpen} onSaved={showToast} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Work groups determine heat algorithm weights and module assignments per crew type.</p>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl text-white cursor-pointer whitespace-nowrap transition-all hover:opacity-90"
          style={{ backgroundColor: '#00D15A', boxShadow: '0 4px 16px rgba(0,209,90,0.25)' }}
        >
          <Plus className="w-4 h-4" /> Create Work Group
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {WORK_GROUPS.map(group => (
          <div key={group.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', group.iconBg)}>
                <HardHat className={cn('w-5 h-5', group.color)} />
              </div>
              <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full', INTENSITY_BADGE[group.intensity])}>
                {group.intensity} Labor
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#007a35] transition-colors">{group.name}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">{group.industry}</p>
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
              <span className="font-semibold text-slate-600">Module: </span>{group.moduleName}
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-700">{group.headcount} workers</span>
              </div>
              <button className="text-[11px] font-semibold text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors">
                Edit Group
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProcoreSyncModal({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onImport: () => void
}) {
  const [tradeMapping,    setTradeMapping]    = useState('')
  const [companyMapping,  setCompanyMapping]  = useState('')
  const [subcontMapping,  setSubcontMapping]  = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-base font-bold text-slate-900">Map Procore Data</DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">Map Procore fields to HeatGuard fields before importing 142 workers.</p>
          </div>
          <DialogClose className="text-slate-400 hover:text-slate-700 transition-colors" />
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-2 gap-4 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Procore Field</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">HeatGuard Field</p>
          </div>

          {/* Row 1: Trade → Work Group */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-700">Trade</p>
              <p className="text-[10px] text-slate-400">e.g. Civil, MEP, Scaffolding</p>
            </div>
            <div className="relative">
              <select value={tradeMapping} onChange={e => setTradeMapping(e.target.value)} className={SELECT_CLS}>
                <option value="" disabled>Select mapping…</option>
                <option>Work Group</option>
                <option>Labor Intensity</option>
                <option>Skip / Ignore</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: Company → Site */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-700">Company / Vendor</p>
              <p className="text-[10px] text-slate-400">e.g. Al-Futtaim, Nakheel</p>
            </div>
            <div className="relative">
              <select value={companyMapping} onChange={e => setCompanyMapping(e.target.value)} className={SELECT_CLS}>
                <option value="" disabled>Select mapping…</option>
                <option>Assigned Site</option>
                <option>Subcontractor Tag</option>
                <option>Skip / Ignore</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 3: Subcontractor → Tag */}
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-slate-700">Subcontractor Name</p>
              <p className="text-[10px] text-slate-400">e.g. Drake & Scull</p>
            </div>
            <div className="relative">
              <select value={subcontMapping} onChange={e => setSubcontMapping(e.target.value)} className={SELECT_CLS}>
                <option value="" disabled>Select mapping…</option>
                <option>Subcontractor Tag</option>
                <option>Skip / Ignore</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#E3FAED] border border-[#00D15A]/25 rounded-xl px-4 py-3 flex items-center gap-3">
            <RefreshCw className="w-4 h-4 text-[#007a35] flex-shrink-0" />
            <p className="text-xs text-[#007a35]">
              <span className="font-bold">142 workers</span> from Procore will be created in HeatGuard using the mapping above.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <DialogClose className="text-sm font-semibold text-slate-600 border border-slate-300 rounded-xl px-5 py-2.5 hover:bg-white transition-colors cursor-pointer">
            Cancel
          </DialogClose>
          <button
            onClick={() => { onOpenChange(false); onImport() }}
            className="flex items-center gap-2 text-sm font-bold text-white rounded-xl px-6 py-2.5 transition-all hover:opacity-90"
            style={{ backgroundColor: '#00D15A', boxShadow: '0 4px 16px rgba(0,209,90,0.3)' }}
          >
            <Zap className="w-4 h-4" /> Confirm &amp; Import 142 Workers
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function IntegrationsSyncSubTab() {
  const [syncGroup,    setSyncGroup]    = useState('')
  const [syncOpen,     setSyncOpen]     = useState(false)
  const [importToast,  setImportToast]  = useState(false)

  function showImportToast() {
    setImportToast(true)
    setTimeout(() => setImportToast(false), 3500)
  }

  return (
    <div className="space-y-6">
      {importToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-[#00D15A]/30 rounded-2xl px-5 py-3.5 shadow-xl">
          <CheckCircle2 className="w-5 h-5 text-[#00D15A] flex-shrink-0" />
          <p className="text-sm font-semibold text-slate-800">142 workers imported successfully.</p>
        </div>
      )}
      <ProcoreSyncModal open={syncOpen} onOpenChange={setSyncOpen} onImport={showImportToast} />

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Connected Sources</h3>
          <p className="text-xs text-slate-500 mt-0.5">Link your project management and attendance systems to auto-import worker directories.</p>
        </div>

        {/* Procore — shown as connected, pending sync */}
        <div className="bg-white border border-[#00D15A]/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <HardHat className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-bold text-slate-900">Procore</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Connected
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">142 Pending Import</span>
                </div>
                <p className="text-sm text-slate-500 mb-3">Sync Project Directory &amp; Crew Lists from your Procore projects into HeatGuard work groups.</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#00D15A]" /> OAuth 2.0</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#00D15A]" /> Live directory pull</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#00D15A]" /> Role mapping</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => setSyncOpen(true)}
                className="text-sm font-bold text-white rounded-xl px-5 py-2.5 transition-all hover:opacity-90 whitespace-nowrap"
                style={{ backgroundColor: '#00D15A', boxShadow: '0 4px 16px rgba(0,209,90,0.3)' }}
              >
                Start Sync
              </button>
              <button className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">Disconnect</button>
            </div>
          </div>
        </div>

        {/* Oracle Primavera */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <Database className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-bold text-slate-900">Oracle Primavera P6</p>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Not Connected</span>
                </div>
                <p className="text-sm text-slate-500 mb-3">Import Resource Allocations &amp; Schedules to pre-populate worker rosters per project phase.</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-300" /> REST API Key</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-300" /> Schedule import</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-300" /> Resource mapping</span>
                </div>
              </div>
            </div>
            <button className="shrink-0 text-sm font-semibold text-slate-700 border border-slate-300 rounded-xl px-5 py-2.5 hover:bg-slate-50 transition-colors whitespace-nowrap">Add API Key</button>
          </div>
        </div>

        {/* Biometric */}
        <div className="bg-white border border-[#00D15A]/30 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Fingerprint className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-base font-bold text-slate-900">Biometric Site Access</p>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Connected
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-1">Live check-in sync via Webhook / IP — ZKTeco &amp; Suprema hardware.</p>
                <p className="text-xs text-slate-400 mb-3">Last synced: <span className="font-semibold text-slate-600">2 minutes ago</span> · 847 events today</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#00D15A]" /> Webhook active</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#00D15A]" /> Real-time check-in</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#00D15A]" /> Auto site assignment</span>
                </div>
              </div>
            </div>
            <button className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl px-4 py-2.5 hover:bg-slate-50 transition-colors whitespace-nowrap">
              <Settings2 className="w-4 h-4" /> Manage
            </button>
          </div>
        </div>
      </div>

      {/* Sync Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sync Configuration</h3>
            <p className="text-xs text-slate-500 mt-0.5">Review and commit pending imports from connected sources.</p>
          </div>
          <span className="flex items-center gap-1.5 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Pending Sync
          </span>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4 bg-[#E3FAED] border border-[#00D15A]/25 rounded-xl px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-[#00D15A]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <RefreshCw className="w-4 h-4 text-[#007a35]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#004d22]">Found 142 new workers in Procore.</p>
              <p className="text-xs text-[#007a35] mt-0.5">These records were detected during the last scheduled pull. Assign them to a HeatGuard Work Group before committing.</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block">Assign incoming workers to HeatGuard Group</label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <select
                  value={syncGroup}
                  onChange={e => setSyncGroup(e.target.value)}
                  className="w-full appearance-none pl-4 pr-8 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 focus:border-[#00D15A] cursor-pointer"
                >
                  <option value="" disabled>Select Group…</option>
                  {WORK_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-xs text-slate-400">Workers can be reassigned individually after import.</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Preview — First 3 of 142</p>
            <div className="space-y-2">
              {[
                { name: 'Ahmad Al-Rashidi',   trade: 'Foreman',               id: 'PRO-8821' },
                { name: 'Suresh Nair',        trade: 'Structural Ironworker',  id: 'PRO-8822' },
                { name: 'Mohammed Al-Yafei', trade: 'Concrete Finisher',      id: 'PRO-8823' },
              ].map(w => (
                <div key={w.id} className="flex items-center justify-between bg-white border border-slate-100 rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                      {w.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{w.name}</p>
                      <p className="text-[10px] text-slate-400">{w.trade}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{w.id}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2.5 text-center">+ 139 more workers pending review</p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              className="flex items-center gap-2 text-sm font-bold text-white rounded-xl px-6 py-3 transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: '#00D15A', boxShadow: '0 4px 20px rgba(0,209,90,0.35)' }}
            >
              <Zap className="w-4 h-4" /> Review &amp; Commit Sync
            </button>
            <button className="text-sm font-semibold text-slate-500 rounded-xl px-5 py-3 hover:bg-slate-100 transition-colors">Dismiss</button>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Need a custom API integration?{' '}
        <a href="mailto:enterprise@heatguard.ai" className="text-[#007a35] font-semibold hover:underline">Contact our enterprise support team.</a>
      </p>
    </div>
  )
}

// ── Team Tab (tabbed) ─────────────────────────────────────────────────────────

function TeamTab() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Team &amp; Roster Management</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage platform users, work groups, and third-party data integrations across all sites.</p>
      </div>

      {/* ── Top-level tabs: Field Workers | Platform Admins ── */}
      <Tabs defaultValue="field-workers">
        <TabsList className="bg-slate-100 border border-slate-200 p-1 rounded-xl h-auto gap-1">
          <TabsTrigger value="field-workers" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[active]:bg-white data-[active]:text-slate-900 data-[active]:shadow-sm aria-[selected=true]:bg-white aria-[selected=true]:text-slate-900 aria-[selected=true]:shadow-sm">
            Field Workers (IoT Fleet)
          </TabsTrigger>
          <TabsTrigger value="platform-admins" className="rounded-lg px-6 py-2.5 text-sm font-semibold data-[active]:bg-white data-[active]:text-slate-900 data-[active]:shadow-sm aria-[selected=true]:bg-white aria-[selected=true]:text-slate-900 aria-[selected=true]:shadow-sm">
            Platform Access (Admins)
          </TabsTrigger>
        </TabsList>

        {/* ── Field Workers tab: has its own sub-tabs ── */}
        <TabsContent value="field-workers" className="mt-5">
          <Tabs defaultValue="directory">
            {/* Secondary sub-tab bar — underline style */}
            <TabsList className="flex w-full justify-start rounded-none border-b border-slate-200 bg-transparent p-0 h-auto mb-5">
              {([
                ['directory',    'Directory'],
                ['groups',       'Work Groups'],
                ['integrations', 'Integrations & Sync'],
              ] as const).map(([val, label]) => (
                <TabsTrigger
                  key={val}
                  value={val}
                  className="relative rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 bg-transparent outline-none focus-visible:ring-0 data-[active]:border-[#00D15A] data-[active]:text-slate-900 data-[active]:bg-transparent data-[active]:shadow-none aria-[selected=true]:border-[#00D15A] aria-[selected=true]:text-slate-900 aria-[selected=true]:bg-transparent aria-[selected=true]:shadow-none"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="directory">    <FieldWorkerDirectoryTab /></TabsContent>
            <TabsContent value="groups">       <WorkGroupsSubTab /></TabsContent>
            <TabsContent value="integrations"> <IntegrationsSyncSubTab /></TabsContent>
          </Tabs>
        </TabsContent>

        {/* ── Platform Admins tab: simple, no sub-tabs ── */}
        <TabsContent value="platform-admins" className="mt-5">
          <PlatformAdminsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IntegrationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-500 mt-0.5">Connect HeatGuard to external platforms, insurance portals, and data pipelines.</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { name: 'AXA Insurance Gulf',    desc: 'Auto-submit claims and sync incident reports',        connected: true  },
          { name: 'ADNIC',                 desc: 'Real-time claim status and policy verification',      connected: true  },
          { name: 'Daman Health',          desc: 'Worker health plan integration and pre-auth',         connected: true  },
          { name: 'Oracle HCM',            desc: 'Sync worker roster and employment records',           connected: false },
          { name: 'Dubai Municipality API',desc: 'Live WBGT and weather data feed',                    connected: true  },
          { name: 'Twilio',                desc: 'SMS alerts and emergency worker notifications',       connected: false },
          { name: 'Google Workspace',      desc: 'SSO, calendar sync for shift schedules',             connected: false },
          { name: 'Gemini AI',             desc: 'AI environmental log, subtitle, and triage assist',  connected: true  },
        ].map(integration => (
          <div
            key={integration.name}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4"
          >
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              integration.connected ? 'bg-[#E3FAED]' : 'bg-gray-100'
            )}>
              <Plug className={cn('w-5 h-5', integration.connected ? 'text-[#00D15A]' : 'text-gray-400')} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{integration.name}</p>
                {integration.connected
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-[#00D15A] flex-shrink-0" />
                  : null
                }
              </div>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{integration.desc}</p>
            </div>
            <button className={cn(
              'text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer flex-shrink-0',
              integration.connected
                ? 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                : 'border-[#00D15A]/30 bg-[#E3FAED] text-[#007A38] hover:bg-green-100'
            )}>
              {integration.connected ? 'Configure' : 'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'organization', label: 'Organization',   icon: Building2, desc: 'Profile & sites'     },
  { id: 'iot',          label: 'IoT & Hardware',  icon: Cpu,       desc: 'Devices & sensors'   },
  { id: 'team',         label: 'Team & Roles',    icon: Users,     desc: 'Users & permissions' },
  { id: 'integrations', label: 'Integrations',   icon: Plug,      desc: 'Connected platforms' },
  { id: 'docs',         label: 'Documentation',  icon: BookOpen,  desc: 'Help center & guides' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('iot')

  return (
    <div className="max-w-[1400px] w-full mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your HeatGuard workspace, devices, and team.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ── Left Nav ───────────────────────────────────────────────────── */}
        <div className="col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Settings Menu</p>
            </div>
            <nav className="p-2 space-y-0.5">
              {NAV_ITEMS.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer',
                    activeTab === id
                      ? 'bg-[#0B281F] text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                    activeTab === id ? 'bg-[#00D15A]/20' : 'bg-gray-100'
                  )}>
                    <Icon className={cn('w-4 h-4', activeTab === id ? 'text-[#00D15A]' : 'text-gray-500')} />
                  </div>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-semibold', activeTab === id ? 'text-white' : 'text-gray-800')}>
                      {label}
                    </p>
                    <p className={cn('text-[10px] truncate', activeTab === id ? 'text-[#00D15A]/70' : 'text-gray-400')}>
                      {desc}
                    </p>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ── Main Content ───────────────────────────────────────────────── */}
        <div className="col-span-9">
          {activeTab === 'organization'  && <OrganizationTab />}
          {activeTab === 'iot'           && <IoTTab />}
          {activeTab === 'team'          && <TeamTab />}
          {activeTab === 'integrations'  && <IntegrationsTab />}
          {activeTab === 'docs'          && <DocsPage embedded />}
        </div>

      </div>
    </div>
  )
}
