'use client'

import { useState, useEffect, useTransition, useRef } from 'react'
import { ArrowLeft, Plus, CheckCircle2, XCircle, UserCircle2 } from 'lucide-react'
import Link from 'next/link'
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
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { createDashboardUser, type NewUser } from '@/lib/actions/create-dashboard-user'
import type { Entity, Tier } from '../page'

/* ── Mock entity data ────────────────────────────────────────────── */
const ENTITY_MAP: Record<string, Entity> = {
  ent_01: { id: 'ent_01', name: 'Emaar Properties',    license: 'UAE-TR-90210', users: 284, tier: 'Enterprise', status: 'Active'    },
  ent_02: { id: 'ent_02', name: 'Nakheel',              license: 'UAE-TR-44812', users: 196, tier: 'Enterprise', status: 'Active'    },
  ent_03: { id: 'ent_03', name: 'Aldar Properties',     license: 'UAE-AD-11034', users: 153, tier: 'Pro',        status: 'Active'    },
  ent_04: { id: 'ent_04', name: 'DAMAC Holdings',       license: 'UAE-TR-70099', users:  87, tier: 'Pro',        status: 'Suspended' },
  ent_05: { id: 'ent_05', name: 'Meraas Holding',       license: 'UAE-TR-52341', users:  61, tier: 'Pro',        status: 'Active'    },
  ent_06: { id: 'ent_06', name: 'Sobha Realty',         license: 'UAE-DU-38817', users:  14, tier: 'Demo',       status: 'Demo - 3 Days Left' },
  ent_07: { id: 'ent_07', name: 'Binghatti Developers', license: 'UAE-DU-29004', users:   8, tier: 'Demo',       status: 'Demo - 3 Days Left' },
  ent_08: { id: 'ent_08', name: 'Five Holdings',        license: 'UAE-TR-61100', users:   0, tier: 'Demo',       status: 'Demo Expired'       },
}

interface DashboardUser {
  id:     string
  name:   string
  email:  string
  role:   'Manager' | 'Supervisor' | 'Medic'
  status: 'Active' | 'Inactive'
}

const ENTITY_USERS: Record<string, DashboardUser[]> = {
  ent_01: [
    { id: 'u1', name: 'Ahmed Al-Rashid',   email: 'ahmed.rashid@emaar.ae',   role: 'Manager',    status: 'Active'   },
    { id: 'u2', name: 'Sarah Johnson',      email: 'sarah.j@emaar.ae',        role: 'Supervisor', status: 'Active'   },
    { id: 'u3', name: 'Mohammed Al-Farsi', email: 'moh.farsi@emaar.ae',      role: 'Medic',      status: 'Active'   },
    { id: 'u4', name: 'Priya Nair',         email: 'priya.n@emaar.ae',        role: 'Supervisor', status: 'Inactive' },
  ],
  ent_02: [
    { id: 'u5', name: 'Khalid Al-Nuaimi',  email: 'khalid@nakheel.ae',       role: 'Manager',    status: 'Active'   },
    { id: 'u6', name: 'Lena Hofmann',       email: 'lena.h@nakheel.ae',       role: 'Medic',      status: 'Active'   },
  ],
  ent_03: [
    { id: 'u7', name: 'Omar Habtoor',       email: 'omar@aldar.ae',           role: 'Manager',    status: 'Active'   },
    { id: 'u8', name: 'Fatima Al-Mazrouei',email: 'fatima@aldar.ae',         role: 'Supervisor', status: 'Active'   },
    { id: 'u9', name: 'James Thornton',     email: 'james.t@aldar.ae',        role: 'Medic',      status: 'Active'   },
  ],
}

/* ── Toast ───────────────────────────────────────────────────────── */
function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      role="alert"
      className="fixed top-5 right-5 z-[200] flex items-center gap-3 bg-zinc-900 border border-zinc-700 rounded-2xl p-4 shadow-2xl max-w-sm animate-in slide-in-from-right duration-300"
    >
      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="w-4 h-4 text-[#00D15A]" />
      </div>
      <p className="text-sm font-medium text-zinc-100 flex-1">{message}</p>
      <button onClick={onDismiss} className="text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer">
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ── Add User Modal ──────────────────────────────────────────────── */
function AddUserModal({
  entityId, open, onOpenChange, onSuccess,
}: {
  entityId:     string
  open:         boolean
  onOpenChange: (v: boolean) => void
  onSuccess:    (user: NewUser) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error,     setError]        = useState('')
  const [role,      setRole]         = useState('manager')
  const formRef = useRef<HTMLFormElement>(null)

  // Reset form state when modal closes
  useEffect(() => {
    if (!open) {
      setError('')
      setRole('manager')
      formRef.current?.reset()
    }
  }, [open])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Ensure the controlled role value is in FormData
    formData.set('role', role)

    startTransition(async () => {
      const result = await createDashboardUser(formData)
      if (!result.success) {
        setError(result.error)
        return
      }
      // Deliver the real user object — no placeholder rows
      onSuccess(result.user)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-zinc-900 border border-zinc-800 text-zinc-50 p-0 overflow-hidden gap-0"
      >
        {/* Header */}
        <div className="border-b border-zinc-800 px-5 py-4">
          <DialogTitle className="text-zinc-50 font-bold text-base leading-none">
            Create Dashboard User
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs mt-1">
            This user will be able to log in to the HeatGuard dashboard.
          </DialogDescription>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit}>
          <input type="hidden" name="entityId" value={entityId} />

          <div className="px-5 py-5 space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-zinc-400 text-xs font-medium">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Ahmed Al-Rashid"
                required
                className="bg-zinc-950 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 h-9 focus-visible:ring-[#00D15A]/30 focus-visible:border-[#00D15A]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="userEmail" className="text-zinc-400 text-xs font-medium">Email</Label>
              <Input
                id="userEmail"
                name="email"
                type="email"
                placeholder="user@company.ae"
                required
                className="bg-zinc-950 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 h-9 focus-visible:ring-[#00D15A]/30 focus-visible:border-[#00D15A]/50"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-zinc-400 text-xs font-medium">Temporary Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                required
                className="bg-zinc-950 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 h-9 focus-visible:ring-[#00D15A]/30 focus-visible:border-[#00D15A]/50"
              />
              <p className="text-[10px] text-zinc-600">User will be prompted to change this on first login.</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-zinc-400 text-xs font-medium">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full h-9 bg-zinc-950 border-zinc-700 text-zinc-200 focus-visible:ring-[#00D15A]/30">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                  <SelectItem value="manager"    className="focus:bg-zinc-800 focus:text-zinc-50">Manager</SelectItem>
                  <SelectItem value="supervisor" className="focus:bg-zinc-800 focus:text-zinc-50">Supervisor</SelectItem>
                  <SelectItem value="medic"      className="focus:bg-zinc-800 focus:text-zinc-50">Medic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                {error}
              </p>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="bg-zinc-950/60 border-t border-zinc-800 px-5 py-3.5 flex-row justify-end gap-2 rounded-none">
            <DialogClose
              render={
                <Button
                  variant="outline"
                  className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50 h-8 text-sm"
                />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#00D15A] hover:bg-[#00B84F] text-black font-bold h-8 text-sm disabled:opacity-50"
            >
              {isPending ? 'Creating…' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ── Role & status badges ────────────────────────────────────────── */
function RoleBadge({ role }: { role: DashboardUser['role'] }) {
  const cls =
    role === 'Manager'    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
    role === 'Supervisor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'       :
                            'bg-teal-500/10 text-teal-400 border-teal-500/20'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide ${cls}`}>
      {role}
    </span>
  )
}

const TIER_OPTIONS: { value: Tier; label: string }[] = [
  { value: 'Enterprise', label: 'Enterprise' },
  { value: 'Pro',        label: 'Pro' },
  { value: 'Demo',       label: 'Demo' },
]

/* ── Page ────────────────────────────────────────────────────────── */
export default function EntityDetailsPage({ params }: { params: { id: string } }) {
  const entity = ENTITY_MAP[params.id]

  const [tier,          setTier]          = useState<Tier>(entity?.tier ?? 'Demo')
  const [users,         setUsers]         = useState<DashboardUser[]>(ENTITY_USERS[params.id] ?? [])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [showToast,     setShowToast]     = useState(false)

  function handleUserCreated(user: NewUser) {
    setUsers(prev => [user, ...prev])
    setShowToast(true)
  }

  if (!entity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <p className="text-zinc-400 text-sm">Entity not found.</p>
        <Link href="/hq/entities" className="text-xs text-[#00D15A] hover:underline">
          ← Back to Entities
        </Link>
      </div>
    )
  }

  return (
    <>
      {showToast && (
        <SuccessToast
          message="User created successfully. They can now log in to the HeatGuard dashboard."
          onDismiss={() => setShowToast(false)}
        />
      )}

      <div className="space-y-6">

        {/* Back nav */}
        <Link
          href="/hq/entities"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Entities
        </Link>

        {/* Entity profile card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-6">
          <div className="flex items-start justify-between gap-4">

            {/* Left: identity */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-lg font-bold text-zinc-300 flex-shrink-0">
                {entity.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-50">{entity.name}</h1>
                <p className="text-xs font-mono text-zinc-500 mt-0.5">{entity.license}</p>
              </div>
            </div>

            {/* Right: tier selector */}
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                Subscription Tier
              </span>
              <Select value={tier} onValueChange={(v) => setTier(v as Tier)}>
                <SelectTrigger className="h-8 bg-zinc-900 border-zinc-700 text-zinc-200 min-w-[130px] focus-visible:ring-[#00D15A]/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                  {TIER_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value} className="focus:bg-zinc-800 focus:text-zinc-50">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-5 border-t border-zinc-800">
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-1">Active Users</p>
              <p className="text-2xl font-bold text-zinc-100 tabular-nums">{entity.users}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-1">Status</p>
              <p className="text-sm font-semibold text-zinc-200 mt-1">{entity.status}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold mb-1">License</p>
              <p className="text-sm font-mono text-zinc-400 mt-1">{entity.license}</p>
            </div>
          </div>
        </div>

        {/* Users section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-zinc-50">Dashboard Users</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''} provisioned</p>
            </div>
            <Button
              onClick={() => setIsAddUserOpen(true)}
              className="bg-white text-black hover:bg-zinc-200 font-semibold text-sm h-8 px-3 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Dashboard User
            </Button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 overflow-hidden">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <UserCircle2 className="w-8 h-8 text-zinc-700" />
                <p className="text-sm text-zinc-600">No users provisioned yet.</p>
                <button
                  onClick={() => setIsAddUserOpen(true)}
                  className="text-xs text-[#00D15A] hover:underline mt-1 cursor-pointer"
                >
                  Create the first user
                </button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-500 font-semibold text-[11px] uppercase tracking-widest pl-5">
                      Name
                    </TableHead>
                    <TableHead className="text-zinc-500 font-semibold text-[11px] uppercase tracking-widest">
                      Email
                    </TableHead>
                    <TableHead className="text-zinc-500 font-semibold text-[11px] uppercase tracking-widest">
                      Role
                    </TableHead>
                    <TableHead className="text-zinc-500 font-semibold text-[11px] uppercase tracking-widest">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.filter(u => u?.name && u?.email).map((user, i) => (
                    <TableRow
                      key={user.id}
                      className={`border-zinc-800 hover:bg-zinc-800/40 transition-colors ${
                        i % 2 === 0 ? 'bg-transparent' : 'bg-zinc-900/30'
                      }`}
                    >
                      <TableCell className="pl-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 flex-shrink-0">
                            {user.name?.charAt(0) ?? '?'}
                          </div>
                          <span className="text-sm font-medium text-zinc-100">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <span className="text-xs text-zinc-400">{user.email}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell className="py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          user.status === 'Active' ? 'text-green-400' : 'text-zinc-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'Active' ? 'bg-green-400' : 'bg-zinc-600'
                          }`} />
                          {user.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

      </div>

      {/* Add User modal */}
      <AddUserModal
        entityId={entity.id}
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSuccess={(user) => handleUserCreated(user)}
      />
    </>
  )
}
