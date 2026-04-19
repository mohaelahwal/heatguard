'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { HeatGuardLogo } from '@/components/HeatGuardLogo'
import { loginDashboardUser, type LoginState } from '@/lib/actions/dashboard-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RegistrationModal } from '@/components/RegistrationModal'

const initialState: LoginState = { error: '' }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full h-11 bg-[#00D15A] hover:bg-[#00b84f] text-white rounded-full font-semibold mt-2 shadow-[0_4px_16px_rgba(0,209,90,0.3)] disabled:opacity-70"
    >
      {pending
        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin inline" />Signing in…</>
        : 'Sign In'}
    </Button>
  )
}

export default function LoginPage() {
  const [state, formAction]  = useFormState(loginDashboardUser, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0B281F] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <HeatGuardLogo className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white tracking-tight">HeatGuard<sup className="text-[10px] align-super">®</sup></h1>
          <p className="text-white/45 text-sm mt-1">Workforce Heat Safety Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-[1.25rem] font-semibold text-gray-900 leading-tight">Welcome back</h2>
          <p className="text-gray-400 text-sm mt-1 mb-6">Sign in to your account</p>

          {state.error && (
            <div
              role="alert"
              className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
            >
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4" noValidate>

            <div className="space-y-1.5">
              <label htmlFor="credential" className="block text-gray-700 text-sm font-medium">
                Email
              </label>
              <Input
                id="credential"
                name="credential"
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="h-11 rounded-xl pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <SubmitButton />

          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="text-[#00D15A] font-semibold hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>

      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  )
}
