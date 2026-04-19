'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Lock, Smartphone, Shield, Monitor, Globe,
  LogOut, Eye, EyeOff, CheckCircle2, AlertTriangle,
} from 'lucide-react'

const SESSIONS = [
  { device: 'MacBook Pro 16"',   location: 'Dubai, UAE',     browser: 'Chrome 124',  last: 'Active now', current: true  },
  { device: 'iPhone 15 Pro',     location: 'Abu Dhabi, UAE', browser: 'Safari iOS',  last: '2 hours ago',current: false },
  { device: 'Windows PC',        location: 'Sharjah, UAE',   browser: 'Edge 122',    last: '4 days ago', current: false },
]

export default function SecurityPage() {
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(true)

  return (
    <div className="max-w-[760px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your password, two-factor authentication, and active sessions.</p>
      </div>

      {/* ── Password ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Password Management</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last changed 3 months ago</p>
          </div>
        </div>

        <div className="space-y-3.5">
          {[
            { label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(v => !v) },
            { label: 'New Password',     show: showNew,     toggle: () => setShowNew(v => !v)     },
            { label: 'Confirm Password', show: showConfirm, toggle: () => setShowConfirm(v => !v) },
          ].map(({ label, show, toggle }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className="w-full h-10 pl-4 pr-10 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-300 outline-none focus:border-[#00D15A] focus:ring-2 focus:ring-[#00D15A]/15 transition-all"
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B281F] hover:bg-[#0d3325] text-white text-sm font-semibold transition-colors cursor-pointer">
          <Lock className="w-4 h-4" /> Update Password
        </button>
      </div>

      {/* ── 2FA ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E3FAED] flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-[#00D15A]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-xs text-gray-400 mt-0.5">Authenticator App (Google Authenticator)</p>
            </div>
          </div>

          {/* Toggle */}
          <button
            onClick={() => setTwoFAEnabled(v => !v)}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0',
              twoFAEnabled ? 'bg-[#00D15A]' : 'bg-gray-300'
            )}
          >
            <span className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              twoFAEnabled && 'translate-x-5'
            )} />
          </button>
        </div>

        {twoFAEnabled ? (
          <div className="flex items-start gap-3 px-4 py-3 bg-[#E3FAED] rounded-2xl border border-[#00D15A]/20">
            <CheckCircle2 className="w-4 h-4 text-[#00D15A] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#007A38]">2FA is active and protecting your account</p>
              <p className="text-xs text-[#00904a] mt-0.5">Your account requires a 6-digit code on each new login.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-amber-800">2FA is disabled. Your account is less secure.</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            View Recovery Codes
          </button>
          <button className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
            Reset Authenticator
          </button>
        </div>
      </div>

      {/* ── Sessions ───────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <Shield className="w-4 h-4 text-gray-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Active Sessions</h2>
              <p className="text-xs text-gray-400 mt-0.5">{SESSIONS.length} devices signed in</p>
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Revoke All Other Sessions
          </button>
        </div>

        <div className="space-y-2.5">
          {SESSIONS.map(session => (
            <div key={session.device} className={cn(
              'flex items-center gap-4 px-4 py-3.5 rounded-2xl border',
              session.current ? 'bg-[#E3FAED] border-[#00D15A]/25' : 'bg-gray-50 border-gray-100'
            )}>
              <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                {session.device.includes('iPhone') ? <Smartphone className="w-4 h-4 text-gray-500" /> : <Monitor className="w-4 h-4 text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{session.device}</p>
                  {session.current && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00D15A] text-white">Current</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Globe className="w-3 h-3 text-gray-400" />
                  <p className="text-xs text-gray-400">{session.location} · {session.browser}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold text-gray-500">{session.last}</p>
                {!session.current && (
                  <button className="text-[10px] font-bold text-red-500 hover:text-red-700 cursor-pointer mt-0.5">
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
