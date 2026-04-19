'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import {
  Plus, MoreHorizontal, ShieldCheck, UserX, UserCheck, Pencil, Loader2, CheckCircle2, AlertTriangle,
} from 'lucide-react'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'

type Role   = 'Owner' | 'Support' | 'Sales'
type Status = 'Active' | 'Revoked'

interface Admin {
  id:        string
  name:      string
  email:     string
  role:      Role
  status:    Status
  lastLogin: string
}

const INITIAL_ADMINS: Admin[] = [
  { id: 'a1', name: 'Mohamed Al Rashid', email: 'moha@heatguard.ae',    role: 'Owner',   status: 'Active',  lastLogin: '2026-04-04 09:12' },
  { id: 'a2', name: 'Sara Al Mansoori',  email: 'sara@heatguard.ae',    role: 'Support', status: 'Active',  lastLogin: '2026-04-03 14:45' },
  { id: 'a3', name: 'Khalid Nasser',     email: 'khalid@heatguard.ae',  role: 'Sales',   status: 'Active',  lastLogin: '2026-04-02 11:30' },
  { id: 'a4', name: 'Layla Ibrahim',     email: 'layla@heatguard.ae',   role: 'Support', status: 'Revoked', lastLogin: '2026-03-15 08:00' },
  { id: 'a5', name: 'Omar Farouq',       email: 'omar@heatguard.ae',    role: 'Sales',   status: 'Active',  lastLogin: '2026-04-01 17:22' },
]

/* ─── Inline Toast ────────────────────────────────────────────────── */
interface ToastMsg { id: number; text: string }

function Toast({ msg, onDone }: { msg: ToastMsg; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 shadow-lg">
      <CheckCircle2 className="size-4 shrink-0" />
      {msg.text}
    </div>
  )
}

/* ─── Badges ──────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: Status }) {
  return status === 'Active'
    ? <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">Active</span>
    : <span className="inline-flex items-center rounded-full bg-red-500/15    px-2.5 py-0.5 text-xs font-medium text-red-400">Revoked</span>
}

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    Owner:   'bg-violet-500/15 text-violet-400',
    Support: 'bg-blue-500/15   text-blue-400',
    Sales:   'bg-amber-500/15  text-amber-400',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[role]}`}>
      {role}
    </span>
  )
}

/* ─── Invite Modal ────────────────────────────────────────────────── */
function InviteModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open:         boolean
  onOpenChange: (v: boolean) => void
  onSuccess:    (admin: Admin) => void
}) {
  const [email,   setEmail]   = useState('')
  const [role,    setRole]    = useState<Role>('Support')
  const [error,   setError]   = useState('')
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) { setEmail(''); setRole('Support'); setError('') }
    else       setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Enter a valid email address.'); return }
    setError('')

    startTransition(async () => {
      // Simulate network delay
      await new Promise(r => setTimeout(r, 900))
      onSuccess({
        id:        `a_${Date.now()}`,
        name:      trimmed.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        email:     trimmed,
        role,
        status:    'Active',
        lastLogin: 'Never',
      })
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-50 sm:max-w-md [&_button[aria-label='Close']]:text-zinc-400 [&_button[aria-label='Close']]:hover:text-zinc-50">
        <DialogHeader>
          <DialogTitle className="text-zinc-50 text-base font-semibold">Invite Admin</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Send an invitation to grant HQ panel access.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</label>
            <Input
              ref={inputRef}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@heatguard.ae"
              type="email"
              className="bg-zinc-900 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-zinc-50 hover:bg-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-50">
                <SelectItem value="Owner"   className="focus:bg-zinc-800">Owner</SelectItem>
                <SelectItem value="Support" className="focus:bg-zinc-800">Support</SelectItem>
                <SelectItem value="Sales"   className="focus:bg-zinc-800">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60"
            >
              {pending
                ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Inviting…</>
                : 'Send Invite'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Edit Role Modal ─────────────────────────────────────────────── */
function EditRoleModal({
  admin,
  open,
  onOpenChange,
  onSuccess,
}: {
  admin:        Admin | null
  open:         boolean
  onOpenChange: (v: boolean) => void
  onSuccess:    (id: string, role: Role) => void
}) {
  const [role,    setRole]    = useState<Role>('Support')
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (open && admin) setRole(admin.role)
  }, [open, admin])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!admin) return
    startTransition(async () => {
      await new Promise(r => setTimeout(r, 700))
      onSuccess(admin.id, role)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-50 sm:max-w-sm [&_button[aria-label='Close']]:text-zinc-400 [&_button[aria-label='Close']]:hover:text-zinc-50">
        <DialogHeader>
          <DialogTitle className="text-zinc-50 text-base font-semibold">Edit Role</DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Update role for <span className="text-zinc-200 font-medium">{admin?.email}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-zinc-50 hover:bg-zinc-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-50">
              <SelectItem value="Owner"   className="focus:bg-zinc-800">Owner</SelectItem>
              <SelectItem value="Support" className="focus:bg-zinc-800">Support</SelectItem>
              <SelectItem value="Sales"   className="focus:bg-zinc-800">Sales</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-3">
            <Button
              type="button" variant="outline"
              onClick={() => onOpenChange(false)} disabled={pending}
              className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60">
              {pending ? <><Loader2 className="mr-2 size-3.5 animate-spin" />Saving…</> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Confirm Modal ───────────────────────────────────────────────── */
function ConfirmModal({
  admin,
  open,
  onOpenChange,
  onConfirm,
}: {
  admin:        Admin | null
  open:         boolean
  onOpenChange: (v: boolean) => void
  onConfirm:    () => void
}) {
  const isRevoking = admin?.status === 'Active'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-50 sm:max-w-sm [&_button[aria-label='Close']]:text-zinc-400 [&_button[aria-label='Close']]:hover:text-zinc-50">
        <DialogHeader>
          <div className={`mx-auto mb-3 flex size-11 items-center justify-center rounded-full ${isRevoking ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
            {isRevoking
              ? <AlertTriangle className="size-5 text-red-400" />
              : <ShieldCheck   className="size-5 text-emerald-400" />}
          </div>
          <DialogTitle className="text-center text-zinc-50 text-base font-semibold">
            {isRevoking ? 'Revoke Access?' : 'Restore Access?'}
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400 text-sm">
            {isRevoking
              ? <>Are you sure you want to revoke access for{' '}
                  <span className="font-medium text-zinc-200">{admin?.name}</span>?{' '}
                  They will be immediately logged out.</>
              : <>Are you sure you want to restore access for{' '}
                  <span className="font-medium text-zinc-200">{admin?.name}</span>?</>}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800 hover:text-zinc-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={`flex-1 text-white ${isRevoking
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-emerald-600 hover:bg-emerald-500'}`}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function GlobalAdminsPage() {
  const [admins,        setAdmins]        = useState<Admin[]>(INITIAL_ADMINS)
  const [inviteOpen,    setInviteOpen]    = useState(false)
  const [editTarget,    setEditTarget]    = useState<Admin | null>(null)
  const [editOpen,      setEditOpen]      = useState(false)
  const [adminToModify, setAdminToModify] = useState<Admin | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [toasts,        setToasts]        = useState<ToastMsg[]>([])

  function pushToast(text: string) {
    const id = Date.now()
    setToasts(t => [...t, { id, text }])
  }

  function handleInviteSuccess(admin: Admin) {
    setAdmins(prev => [admin, ...prev])
    pushToast(`Invite sent to ${admin.email}`)
  }

  function handleEditSuccess(id: string, role: Role) {
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, role } : a))
    pushToast('Role updated successfully')
  }

  function openConfirm(admin: Admin) {
    setAdminToModify(admin)
    setTimeout(() => setIsConfirmOpen(true), 0)
  }

  function handleConfirmToggle() {
    if (!adminToModify) return
    const isRevoking = adminToModify.status === 'Active'
    setAdmins(prev =>
      prev.map(a => a.id === adminToModify.id
        ? { ...a, status: isRevoking ? 'Revoked' : 'Active' }
        : a
      )
    )
    pushToast(isRevoking ? `Access revoked for ${adminToModify.name}` : `Access restored for ${adminToModify.name}`)
    setIsConfirmOpen(false)
    setAdminToModify(null)
  }

  function openEdit(admin: Admin) {
    setEditTarget(admin)
    setTimeout(() => setEditOpen(true), 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-50">Global Admins</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Manage internal HeatGuard staff access to this HQ panel.</p>
        </div>
        <Button
          onClick={() => setInviteOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
        >
          <Plus className="size-4" />
          Invite Admin
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Last Login</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {admins.map(admin => (
              <tr key={admin.id} className="hover:bg-zinc-900/50 transition-colors">
                <td className="px-5 py-3.5 font-medium text-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0">
                      {admin.name.charAt(0)}
                    </div>
                    {admin.name}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-zinc-400">{admin.email}</td>
                <td className="px-5 py-3.5"><RoleBadge role={admin.role} /></td>
                <td className="px-5 py-3.5"><StatusBadge status={admin.status} /></td>
                <td className="px-5 py-3.5 text-zinc-400 tabular-nums">{admin.lastLogin}</td>
                <td className="px-5 py-3.5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm"
                        className="size-7 p-0 text-zinc-400 hover:text-zinc-50 hover:bg-zinc-800">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700 text-zinc-50 min-w-40">
                      <DropdownMenuItem
                        onClick={() => openEdit(admin)}
                        className="gap-2 focus:bg-zinc-800 cursor-pointer"
                      >
                        <Pencil className="size-3.5 text-zinc-400" />
                        Edit Role
                      </DropdownMenuItem>
                      {admin.status === 'Active' ? (
                        <DropdownMenuItem
                          onClick={() => openConfirm(admin)}
                          className="gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                        >
                          <UserX className="size-3.5" />
                          Revoke Access
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => openConfirm(admin)}
                          className="gap-2 text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer"
                        >
                          <UserCheck className="size-3.5" />
                          Restore Access
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <InviteModal
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onSuccess={handleInviteSuccess}
      />
      <EditRoleModal
        admin={editTarget}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={handleEditSuccess}
      />
      <ConfirmModal
        admin={adminToModify}
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={handleConfirmToggle}
      />

      {/* Toast stack */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <Toast key={t.id} msg={t} onDone={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </div>
  )
}
