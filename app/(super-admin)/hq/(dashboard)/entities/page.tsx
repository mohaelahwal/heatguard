'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Plus, Trash2, PauseCircle, Users, Building2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import {
  Table, TableHeader, TableRow, TableHead,
  TableBody, TableCell,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

/* ── Chart data ──────────────────────────────────────────────────── */
const INCIDENT_DATA = [
  { day: 'Mar 23', prevented: 34, occurrences: 2  },
  { day: 'Mar 24', prevented: 41, occurrences: 3  },
  { day: 'Mar 25', prevented: 29, occurrences: 1  },
  { day: 'Mar 26', prevented: 52, occurrences: 7  },
  { day: 'Mar 27', prevented: 38, occurrences: 10 },
  { day: 'Mar 28', prevented: 22, occurrences: 4  },
  { day: 'Mar 29', prevented: 17, occurrences: 1  },
  { day: 'Mar 30', prevented: 44, occurrences: 6  },
  { day: 'Mar 31', prevented: 58, occurrences: 10 },
  { day: 'Apr 1',  prevented: 47, occurrences: 8  },
  { day: 'Apr 2',  prevented: 33, occurrences: 3  },
  { day: 'Apr 3',  prevented: 61, occurrences: 9  },
  { day: 'Apr 4',  prevented: 49, occurrences: 5  },
  { day: 'Apr 5',  prevented: 55, occurrences: 2  },
]

function CustomTooltip({ active, payload, label }: {
  active?:  boolean
  payload?: { name: string; value: number; color: string }[]
  label?:   string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg shadow-2xl min-w-[140px]">
      <p className="text-zinc-400 text-xs mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-baseline gap-2">
          <span className="inline-block size-1.5 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: p.color }} />
          <div>
            <p className="text-white text-lg font-bold leading-none">{p.value}</p>
            <p className="text-zinc-500 text-[10px] mt-0.5">{p.name}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Types & mock data ───────────────────────────────────────────── */
export type Tier   = 'Enterprise' | 'Pro' | 'Demo'
export type Status = 'Active' | 'Suspended' | 'Demo - 3 Days Left' | 'Demo Expired'

export interface Entity {
  id:      string
  name:    string
  license: string
  users:   number
  tier:    Tier
  status:  Status
}

const INITIAL_ENTITIES: Entity[] = [
  { id: 'ent_01', name: 'Emaar Properties',    license: 'UAE-TR-90210', users: 284, tier: 'Enterprise', status: 'Active'             },
  { id: 'ent_02', name: 'Nakheel',              license: 'UAE-TR-44812', users: 196, tier: 'Enterprise', status: 'Active'             },
  { id: 'ent_03', name: 'Aldar Properties',     license: 'UAE-AD-11034', users: 153, tier: 'Pro',        status: 'Active'             },
  { id: 'ent_04', name: 'DAMAC Holdings',       license: 'UAE-TR-70099', users:  87, tier: 'Pro',        status: 'Suspended'          },
  { id: 'ent_05', name: 'Meraas Holding',       license: 'UAE-TR-52341', users:  61, tier: 'Pro',        status: 'Active'             },
  { id: 'ent_06', name: 'Sobha Realty',         license: 'UAE-DU-38817', users:  14, tier: 'Demo',       status: 'Demo - 3 Days Left' },
  { id: 'ent_07', name: 'Binghatti Developers', license: 'UAE-DU-29004', users:   8, tier: 'Demo',       status: 'Demo - 3 Days Left' },
  { id: 'ent_08', name: 'Five Holdings',        license: 'UAE-TR-61100', users:   0, tier: 'Demo',       status: 'Demo Expired'       },
]

/* ── Badges ──────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  const cls =
    status === 'Active'        ? 'bg-green-500/10 text-green-400 border-green-500/20'  :
    status === 'Suspended' || status === 'Demo Expired'
                               ? 'bg-red-500/10 text-red-400 border-red-500/20'        :
                                 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide ${cls}`}>
      {status}
    </span>
  )
}

function TierBadge({ tier }: { tier: Tier }) {
  const cls =
    tier === 'Enterprise' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
    tier === 'Pro'        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'       :
                            'bg-zinc-500/10 text-zinc-400 border-zinc-600/30'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide ${cls}`}>
      {tier}
    </span>
  )
}

/* ── Delete Modal ────────────────────────────────────────────────── */
function DeleteModal({
  entity, open, onOpenChange, onConfirm,
}: {
  entity:        Entity | null
  open:          boolean
  onOpenChange:  (v: boolean) => void
  onConfirm:     () => void
}) {
  const [confirmName, setConfirmName] = useState('')

  useEffect(() => {
    if (!open) setConfirmName('')
  }, [open])

  if (!entity) return null
  const canDelete = confirmName === entity.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-[#0A1915]/95 backdrop-blur-xl border border-white/10 text-gray-100 p-0 overflow-hidden gap-0"
      >
        {/* Red header strip */}
        <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <DialogTitle className="text-red-400 font-bold text-base leading-none">
              Delete Entity
            </DialogTitle>
            <DialogDescription className="text-red-400/60 text-xs mt-0.5">
              This action is permanent and cannot be undone.
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            <span className="font-semibold text-white">Warning:</span> This will permanently wipe
            all IoT data, heat readings, and users associated with this entity.
          </p>

          <div className="space-y-1.5">
            <Label className="text-gray-400 text-xs font-medium">
              Type <span className="font-bold text-white">{entity.name}</span> to confirm
            </Label>
            <Input
              value={confirmName}
              onChange={e => setConfirmName(e.target.value)}
              placeholder={entity.name}
              className="bg-white/5 border-white/10 text-gray-100 placeholder:text-gray-600 h-9 focus-visible:ring-red-500/30 focus-visible:border-red-500/50"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-black/20 border-t border-white/5 px-5 py-3.5 flex-row justify-end gap-2 rounded-none">
          <DialogClose
            render={
              <Button
                variant="outline"
                className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white h-8 text-sm"
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            onClick={onConfirm}
            disabled={!canDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold h-8 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Suspend Modal ───────────────────────────────────────────────── */
function SuspendModal({
  entity, open, onOpenChange, onConfirm,
}: {
  entity:        Entity | null
  open:          boolean
  onOpenChange:  (v: boolean) => void
  onConfirm:     () => void
}) {
  if (!entity) return null
  const isAlreadySuspended = entity.status === 'Suspended'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-[#0A1915]/95 backdrop-blur-xl border border-white/10 text-gray-100 p-0 overflow-hidden gap-0"
      >
        {/* Orange header strip */}
        <div className="bg-orange-500/10 border-b border-orange-500/20 px-5 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center flex-shrink-0">
            <PauseCircle className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <DialogTitle className="text-orange-400 font-bold text-base leading-none">
              {isAlreadySuspended ? 'Reactivate Entity' : 'Suspend Entity'}
            </DialogTitle>
            <DialogDescription className="text-orange-400/60 text-xs mt-0.5">
              {entity.name}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-sm text-gray-300 leading-relaxed">
            {isAlreadySuspended
              ? `Reactivating will restore full dashboard access for all users at ${entity.name}.`
              : `Suspending will immediately lock out all ${entity.users} users at ${entity.name}. Their data is preserved and access can be restored at any time.`
            }
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-black/20 border-t border-white/5 px-5 py-3.5 flex-row justify-end gap-2 rounded-none">
          <DialogClose
            render={
              <Button
                variant="outline"
                className="bg-transparent border-white/10 text-gray-300 hover:bg-white/10 hover:text-white h-8 text-sm"
              />
            }
          >
            Cancel
          </DialogClose>
          <Button
            onClick={onConfirm}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-8 text-sm"
          >
            {isAlreadySuspended ? 'Yes, Reactivate' : 'Yes, Suspend'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ── Row actions ─────────────────────────────────────────────────── */
function EntityActions({
  entity, onDelete, onSuspend,
}: {
  entity:    Entity
  onDelete:  (e: Entity) => void
  onSuspend: (e: Entity) => void
}) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Entity actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-48 bg-[#0A1915]/95 backdrop-blur-xl border border-white/10 text-gray-300 shadow-xl"
      >
        <DropdownMenuItem
          className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer"
          onClick={() => router.push(`/hq/entities/${entity.id}`)}
        >
          View &amp; Edit Details
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer"
          onClick={() => router.push(`/hq/entities/${entity.id}`)}
        >
          Manage Users
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="text-orange-400 focus:bg-orange-500/10 focus:text-orange-300 cursor-pointer"
          onClick={() => onSuspend(entity)}
        >
          {entity.status === 'Suspended' ? 'Reactivate Entity' : 'Suspend Entity'}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
          onClick={() => onDelete(entity)}
        >
          Delete Entity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function EntitiesPage() {
  const [entities,        setEntities]        = useState<Entity[]>(INITIAL_ENTITIES)
  const [selectedEntity,  setSelectedEntity]  = useState<Entity | null>(null)
  const [isDeleteOpen,    setIsDeleteOpen]     = useState(false)
  const [isSuspendOpen,   setIsSuspendOpen]    = useState(false)
  const [tierFilter,      setTierFilter]       = useState('All')

  const filteredEntities = tierFilter === 'All'
    ? entities
    : entities.filter(e => e.tier === tierFilter)

  function handleDeleteOpen(entity: Entity) {
    setSelectedEntity(entity)
    setIsDeleteOpen(true)
  }

  function handleSuspendOpen(entity: Entity) {
    setSelectedEntity(entity)
    setIsSuspendOpen(true)
  }

  function handleDeleteConfirm() {
    if (!selectedEntity) return
    setEntities(prev => prev.filter(e => e.id !== selectedEntity.id))
    setIsDeleteOpen(false)
    setSelectedEntity(null)
  }

  function handleSuspendConfirm() {
    if (!selectedEntity) return
    setEntities(prev => prev.map(e =>
      e.id === selectedEntity.id
        ? { ...e, status: e.status === 'Suspended' ? 'Active' : 'Suspended' }
        : e
    ))
    setIsSuspendOpen(false)
    setSelectedEntity(null)
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Clients',            value: '8',     sub: 'Registered entities',    icon: Building2, iconBg: 'bg-blue-500/10',    iconClr: 'text-blue-400'    },
          { label: 'Total Monitored Workers',  value: '1,245', sub: 'Across all active sites', icon: Users,     iconBg: 'bg-[#00D15A]/10',   iconClr: 'text-[#00D15A]'   },
          { label: 'Active Sites',             value: '12',    sub: 'Currently operational',   icon: MapPin,    iconBg: 'bg-violet-500/10',  iconClr: 'text-violet-400'  },
        ].map(({ label, value, sub, icon: Icon, iconBg, iconClr }) => (
          <div key={label} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,209,90,0.05)] p-5 hover:bg-white/[0.08] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">{label}</span>
              <div className={`rounded-lg p-2 ${iconBg}`}>
                <Icon className={`size-4 ${iconClr}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Incident Prevention Chart */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,209,90,0.05)] p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-white tracking-wide">Platform-Wide Incident Prevention vs Occurrences</h2>
          <p className="text-xs text-gray-500 mt-0.5">Last 14 days</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={INCIDENT_DATA} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="day"
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#71717a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              cursor={{ stroke: '#ea580c', strokeWidth: 32, strokeOpacity: 0.15 }}
              content={<CustomTooltip />}
            />
            <Line
              type="monotone"
              dataKey="prevented"
              name="Prevented by HeatGuard"
              stroke="#ffffff"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#ea580c', stroke: '#09090b', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="occurrences"
              name="Incidents Occurred"
              stroke="#52525b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex items-center gap-6 mt-3 pl-1">
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 h-0.5 rounded bg-white" />
            <span className="text-xs text-gray-400">Prevented by HeatGuard</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-5 border-t border-dashed border-zinc-600" />
            <span className="text-xs text-gray-400">Incidents Occurred</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#00D15A]/60 uppercase tracking-widest mb-1">
            Super Admin
          </p>
          <h1 className="text-2xl font-semibold text-white tracking-wide">Client Entities</h1>
          <p className="text-sm text-gray-500 mt-1">
            {entities.length} registered companies · {entities.filter(e => e.status === 'Active').length} active
          </p>
        </div>

        <Button className="bg-[#00D15A] text-black hover:bg-[#00e664] shadow-[0_0_20px_rgba(0,209,90,0.4)] border-none rounded-full px-6 font-semibold text-sm h-9 gap-2 transition-all duration-200">
          <Plus className="w-4 h-4" />
          Onboard New Entity
        </Button>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 font-medium">Filter by tier</span>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="h-8 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 backdrop-blur-sm text-xs transition-all duration-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#0A1915]/95 backdrop-blur-xl border-white/10 text-gray-200">
            <SelectItem value="All"        className="focus:bg-white/10 text-xs">All Tiers</SelectItem>
            <SelectItem value="Enterprise" className="focus:bg-white/10 text-xs">Enterprise</SelectItem>
            <SelectItem value="Pro"        className="focus:bg-white/10 text-xs">Pro</SelectItem>
            <SelectItem value="Demo"       className="focus:bg-white/10 text-xs">Demo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,209,90,0.05)] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-widest pl-5 w-[240px]">
                Entity
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-widest">
                License No.
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-widest text-right">
                Active Users
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-widest">
                Tier
              </TableHead>
              <TableHead className="text-gray-500 font-semibold text-xs uppercase tracking-widest">
                Status
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredEntities.map((entity, i) => (
              <TableRow
                key={entity.id}
                className={`border-white/5 hover:bg-white/5 transition-colors duration-150 ${
                  i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'
                }`}
              >
                <TableCell className="pl-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-gray-300">
                      {entity.name.charAt(0)}
                    </div>
                    <span className="font-medium text-white text-sm">{entity.name}</span>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="font-mono text-xs text-gray-400">{entity.license}</span>
                </TableCell>
                <TableCell className="py-3.5 text-right">
                  <span className="text-sm font-semibold text-gray-200 tabular-nums">
                    {entity.users.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  <TierBadge tier={entity.tier} />
                </TableCell>
                <TableCell className="py-3.5">
                  <StatusBadge status={entity.status} />
                </TableCell>
                <TableCell className="py-3.5 pr-3">
                  <EntityActions
                    entity={entity}
                    onDelete={handleDeleteOpen}
                    onSuspend={handleSuspendOpen}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-[11px] text-gray-600 mt-3 pl-1">
        Showing {filteredEntities.length} of {entities.length} entities
        {tierFilter !== 'All' && <span className="text-gray-700"> · filtered by {tierFilter}</span>}
      </p>

      {/* Modals */}
      <DeleteModal
        entity={selectedEntity}
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
      />
      <SuspendModal
        entity={selectedEntity}
        open={isSuspendOpen}
        onOpenChange={setIsSuspendOpen}
        onConfirm={handleSuspendConfirm}
      />
    </div>
  )
}
