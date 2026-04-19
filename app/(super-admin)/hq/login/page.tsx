'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Zap, Lock, TriangleAlert } from 'lucide-react'
import { loginAdmin } from '@/lib/actions/admin-auth'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const initialState = { error: '' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-10 bg-[#00D15A] hover:bg-[#00B84F] text-black font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Authenticating…' : 'Authenticate'}
    </Button>
  )
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAdmin, initialState)
  const [showRecovery, setShowRecovery] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">

      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#00D15A]/10 border border-[#00D15A]/20 flex items-center justify-center mb-4">
            <Zap className="w-5 h-5 text-[#00D15A]" />
          </div>
          <p className="text-[11px] font-bold text-[#00D15A] tracking-widest uppercase">
            HeatGuard HQ
          </p>
        </div>

        <Card className="bg-zinc-900 border-zinc-800 ring-0 gap-0">

          <CardHeader className="pb-5 border-b border-zinc-800">
            <CardTitle className="text-white text-lg font-bold">
              Admin Authentication
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs mt-1 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Authorized Personnel Only
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            <form action={formAction} className="space-y-4">

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-400 text-xs font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@heatguard.ae"
                  autoComplete="email"
                  required
                  className="bg-zinc-950 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-[#00D15A]/40 focus-visible:border-[#00D15A]/60 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-zinc-400 text-xs font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="bg-zinc-950 border-zinc-700 text-zinc-50 placeholder:text-zinc-600 focus-visible:ring-[#00D15A]/40 focus-visible:border-[#00D15A]/60 h-10"
                />
              </div>

              {/* Auth error */}
              {state?.error && (
                <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {state.error}
                </p>
              )}

              <SubmitButton />

              {/* Forgot password */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowRecovery(v => !v)}
                  className="text-[11px] text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Recovery notice */}
              {showRecovery && (
                <div className="flex gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-3">
                  <TriangleAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-300 leading-relaxed">
                    <span className="font-bold">Security Notice:</span> Super Admin credentials cannot be reset externally. Please contact the DevOps team for a manual database override.
                  </p>
                </div>
              )}

            </form>
          </CardContent>

        </Card>

        <p className="text-center text-[10px] text-zinc-700 mt-6">
          This panel is restricted to HeatGuard internal staff.
        </p>

      </div>
    </div>
  )
}
