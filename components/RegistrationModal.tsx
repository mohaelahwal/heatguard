'use client'

import { useState } from 'react'
import { CheckCircle, Star, X, CheckCircle2 } from 'lucide-react'
import { HeatGuardLogo } from '@/components/HeatGuardLogo'
import { cn } from '@/lib/utils'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { Textarea } from '@/components/ui/textarea'

type Step = 1 | 2 | 3

interface FormData {
  name: string
  company: string
  email: string
  phone: string
  teamSize: string
  challenge: string
  tier: string
}

const FREE_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']

function isFreemail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase() ?? ''
  return FREE_DOMAINS.includes(domain)
}

const EMPTY_FORM: FormData = {
  name: '', company: '', email: '', phone: '', teamSize: '', challenge: '', tier: '',
}

const GCC_CHECKS = [
  'Arabic or English demo',
  'UAE Hosted',
  'Includes insurer and HSE view',
]

const INPUT_CLS =
  'w-full h-11 rounded-xl bg-white/10 border border-white/20 px-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-[#00D15A]/50 focus:border-[#00D15A]/60 transition'

const LABEL_CLS = 'block text-white/70 text-xs font-semibold uppercase tracking-wider mb-1.5'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export function RegistrationModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState<Step>(1)
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function handleClose() {
    onClose()
    setTimeout(() => {
      setStep(1)
      setFormData(EMPTY_FORM)
      setErrors({})
    }, 300)
  }

  function handleInfoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const fd = new FormData(e.currentTarget)
    const name      = (fd.get('name')      as string || '').trim()
    const company   = (fd.get('company')   as string || '').trim()
    const email     = (fd.get('email')     as string || '').trim()
    const phone     = (fd.get('phone')     as string || '').trim()
    const teamSize  = (fd.get('teamSize')  as string || '').trim()
    const challenge = (fd.get('challenge') as string || '').trim()

    const newErrors: Record<string, string> = {}
    if (!name)      newErrors.name      = 'Full Name is required'
    if (!company)   newErrors.company   = 'Company Name is required'
    if (!email)     newErrors.email     = 'Company Email is required'
    else if (isFreemail(email)) newErrors.email = 'Please use a valid corporate email address'
    if (!phone)     newErrors.phone     = 'Phone Number is required'
    if (!teamSize)  newErrors.teamSize  = 'Please select a team size'
    if (!challenge) newErrors.challenge = 'Please describe your heat safety challenge'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setFormData(prev => ({ ...prev, name, company, email, phone, teamSize, challenge }))
    setStep(2)
  }

  async function handleSelectTier(tier: string) {
    const final = { ...formData, tier }
    setFormData(final)

    const res = await fetch('/api/send-demo', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(final),
    })

    if (!res.ok) {
      setErrors({ submit: 'Something went wrong. Please try again.' })
      return
    }

    setStep(3)
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogPrimitive.Portal>

        {/* Backdrop */}
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-200" />

        {/* Popup */}
        <DialogPrimitive.Popup
          className={cn(
            'fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-full max-w-[calc(100%-2rem)] outline-none',
            'data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95',
            'data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            'duration-300 transition-all',
            step === 1 ? 'sm:max-w-7xl'
            : step === 2 ? 'sm:max-w-5xl'
            : 'sm:max-w-md'
          )}
        >

          {/* ══════════════════════════════════════════════════
              STEP 1 — Split-view dossier
          ══════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="flex min-h-[600px] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

              {/* ── Left: Form ─────────────────────────────── */}
              <div
                className="flex-1 flex flex-col p-10 overflow-y-auto"
                style={{ background: 'linear-gradient(135deg, rgba(39, 78, 59, 1), rgba(13, 31, 23, 1))' }}
              >
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-5">
                    <HeatGuardLogo className="w-6 h-6" />
                    <span className="text-sm font-bold tracking-widest text-[#00D15A] uppercase">HEATGUARD<sup className="text-[8px] align-super normal-case">®</sup></span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white leading-tight tracking-tight max-w-xs">
                    LET&apos;S SAVE LIVES, CUT COSTS AND STAY COMPLIANT.
                  </h2>
                  <p className="text-white/40 text-sm mt-3">
                    Trusted by leading GCC contractors and HSE teams.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleInfoSubmit} className="flex flex-col gap-4 flex-1" noValidate>

                  {/* Row 1: Name + Company */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-name" className={LABEL_CLS}>Full Name</label>
                      <input
                        id="reg-name"
                        name="name"
                        type="text"
                        placeholder="Ahmed Al-Mansouri"
                        autoComplete="name"
                        className={cn(INPUT_CLS, errors.name && 'border-red-400 focus:ring-red-400/50 focus:border-red-400')}
                      />
                      {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="reg-company" className={LABEL_CLS}>Company Name</label>
                      <input
                        id="reg-company"
                        name="company"
                        type="text"
                        placeholder="ALEC Construction LLC"
                        className={cn(INPUT_CLS, errors.company && 'border-red-400 focus:ring-red-400/50 focus:border-red-400')}
                      />
                      {errors.company && <p className="text-red-400 text-xs mt-1">{errors.company}</p>}
                    </div>
                  </div>

                  {/* Row 2: Email + Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="reg-email" className={LABEL_CLS}>Company Email</label>
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        placeholder="ahmed@alec.ae"
                        autoComplete="email"
                        className={cn(INPUT_CLS, errors.email && 'border-red-400 focus:ring-red-400/50 focus:border-red-400')}
                      />
                      {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="reg-phone" className={LABEL_CLS}>Phone Number</label>
                      <input
                        id="reg-phone"
                        name="phone"
                        type="tel"
                        placeholder="+971 50 123 4567"
                        autoComplete="tel"
                        className={cn(INPUT_CLS, errors.phone && 'border-red-400 focus:ring-red-400/50 focus:border-red-400')}
                      />
                      {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Row 3: Team Size */}
                  <div>
                    <label htmlFor="reg-team" className={LABEL_CLS}>Team Size / Workers</label>
                    <div className="relative">
                      <select
                        id="reg-team"
                        name="teamSize"
                        defaultValue=""
                        className={cn(
                          INPUT_CLS,
                          'appearance-none cursor-pointer pr-10',
                          '[&>option]:bg-[#0d1f17] [&>option]:text-white',
                          errors.teamSize && 'border-red-400 focus:ring-red-400/50 focus:border-red-400'
                        )}
                      >
                        <option value="" disabled className="text-white/40">Select team size</option>
                        <option value="1-50">1 – 50 workers</option>
                        <option value="50-200">50 – 200 workers</option>
                        <option value="200-500">200 – 500 workers</option>
                        <option value="500+">500+ workers</option>
                      </select>
                      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {errors.teamSize && <p className="text-red-400 text-xs mt-1">{errors.teamSize}</p>}
                  </div>

                  {/* Row 4: Challenge textarea */}
                  <div className="flex-1 flex flex-col">
                    <label htmlFor="reg-challenge" className={LABEL_CLS}>Tell us your current heat safety challenge</label>
                    <Textarea
                      id="reg-challenge"
                      name="challenge"
                      placeholder="e.g. We have 300 outdoor workers across 4 sites in Dubai with no real-time monitoring..."
                      className={cn(
                        'flex-1 min-h-[90px] resize-none rounded-xl bg-white/10 border border-white/20 px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D15A]/50 focus-visible:border-[#00D15A]/60 transition',
                        errors.challenge && 'border-red-400 focus-visible:ring-red-400/50 focus-visible:border-red-400'
                      )}
                    />
                    {errors.challenge && <p className="text-red-400 text-xs mt-1">{errors.challenge}</p>}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="w-full h-12 bg-[#00D15A] hover:bg-[#00c254] text-white rounded-xl font-bold text-sm tracking-wide shadow-[0_4px_24px_rgba(0,209,90,0.35)] hover:shadow-[0_4px_32px_rgba(0,209,90,0.5)] transition-all duration-200"
                  >
                    Request My Demo
                  </button>

                  <p className="text-center text-white/30 text-xs">
                    Already have an account?{' '}
                    <button type="button" onClick={handleClose} className="text-[#00D15A]/80 hover:text-[#00D15A] font-semibold transition-colors">
                      Sign In
                    </button>
                  </p>
                </form>
              </div>

              {/* ── Right: Image panel ──────────────────────── */}
              <div
                className="hidden lg:flex w-[45%] flex-shrink-0 relative flex-col"
                style={{
                  backgroundImage: 'url(https://heatguard.ae/wp-content/themes/yootheme/cache/58/modal-bg-min-58ab8225.webp)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />

                {/* Close button — top right */}
                <DialogPrimitive.Close
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </DialogPrimitive.Close>

                {/* GCC checklist — top right below close */}
                <div className="absolute top-16 right-4 z-10">
                  <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-3.5 space-y-2.5">
                    {GCC_CHECKS.map(item => (
                      <div key={item} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00D15A] flex-shrink-0" />
                        <span className="text-white/90 text-xs font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Central HeatGuard watermark */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <div className="text-center select-none" style={{ opacity: 0.32 }}>
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
                      <HeatGuardLogo className="w-12 h-12" />
                    </div>
                    <p className="text-white text-3xl font-extrabold tracking-tight">HeatGuard</p>
                    <p className="text-white text-xs font-semibold tracking-widest uppercase mt-1">Workforce Heat Safety</p>
                  </div>
                </div>
              </div>

              {/* Close for non-lg (when image panel hidden) */}
              <DialogPrimitive.Close
                className="lg:hidden absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </DialogPrimitive.Close>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 2 — Tier selection
          ══════════════════════════════════════════════════ */}
          {step === 2 && (
            <div
              className="rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-10 relative"
              style={{ background: 'linear-gradient(135deg, rgba(39, 78, 59, 1), rgba(13, 31, 23, 1))' }}
            >
              {/* Close */}
              <DialogPrimitive.Close
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </DialogPrimitive.Close>

              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <HeatGuardLogo className="w-6 h-6" />
                <span className="text-sm font-bold tracking-widest text-[#00D15A] uppercase">HEATGUARD<sup className="text-[8px] align-super normal-case">®</sup></span>
              </div>
              <div className="text-center mb-9 mt-4">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Choose Your Plan</h2>
                <p className="text-white/45 text-sm mt-2">Select the tier that fits your workforce</p>
                {errors.submit && (
                  <p className="mt-3 text-red-400 text-sm font-medium">{errors.submit}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Tier 1 — Demo */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col hover:bg-white/8 hover:border-white/20 transition-all duration-200">
                  <div className="mb-5">
                    <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-2">Tier 1 — Demo</p>
                    <p className="text-4xl font-extrabold text-white">Free</p>
                    <p className="text-white/45 text-sm mt-1.5">3 Day Trial</p>
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {['Up to 10 workers', 'Basic heat monitoring', 'Email support'].map(f => (
                      <li key={f} className="text-white/55 text-sm flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00D15A]/60 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSelectTier('Demo — 3 Day Trial')}
                    className="w-full h-11 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/8 transition-colors"
                  >
                    Start Free Pilot
                  </button>
                </div>

                {/* Tier 2 — Pro */}
                <div className="bg-white/5 border-2 border-[#00D15A] rounded-2xl p-7 flex flex-col relative shadow-[0_0_40px_rgba(0,209,90,0.18)]">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00D15A] text-white text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                    <Star className="w-3 h-3 fill-white" /> Most Popular
                  </div>
                  <div className="mb-5 mt-2">
                    <p className="text-xs font-bold text-[#00D15A] uppercase tracking-widest mb-2">Tier 2 — Pro</p>
                    <p className="text-4xl font-extrabold text-white">$18–25</p>
                    <p className="text-white/45 text-sm mt-1.5">per worker / month</p>
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {['Unlimited workers', 'Real-time WBGT monitoring', 'Incident & triage management', 'Priority support'].map(f => (
                      <li key={f} className="text-white/70 text-sm flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00D15A] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSelectTier('Pro — $18–25/worker/month')}
                    className="w-full h-11 rounded-xl bg-[#00D15A] hover:bg-[#00c254] text-white text-sm font-bold transition-colors shadow-[0_4px_20px_rgba(0,209,90,0.35)]"
                  >
                    Request Access
                  </button>
                </div>

                {/* Tier 3 — Enterprise */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-7 flex flex-col hover:bg-white/8 hover:border-white/20 transition-all duration-200">
                  <div className="mb-5">
                    <p className="text-xs font-bold text-white/35 uppercase tracking-widest mb-2">Tier 3 — Enterprise</p>
                    <p className="text-4xl font-extrabold text-white">$30–45</p>
                    <p className="text-white/45 text-sm mt-1.5">per worker / month</p>
                  </div>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {['Everything in Pro', 'Multi-site management', 'Custom SLA & compliance exports', 'Dedicated account manager'].map(f => (
                      <li key={f} className="text-white/55 text-sm flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00D15A]/60 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleSelectTier('Enterprise — $30–45/worker/month')}
                    className="w-full h-11 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/8 transition-colors"
                  >
                    Contact Sales
                  </button>
                </div>

              </div>

              <p className="text-center text-white/25 text-xs mt-8">
                No credit card required for Demo tier. All pricing in USD.
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
              STEP 3 — Success
          ══════════════════════════════════════════════════ */}
          {step === 3 && (
            <div
              className="rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] p-10 text-center relative"
              style={{ background: 'linear-gradient(135deg, rgba(39, 78, 59, 1), rgba(13, 31, 23, 1))' }}
            >
              {/* Close */}
              <DialogPrimitive.Close
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </DialogPrimitive.Close>

              <div className="w-20 h-20 bg-[#00D15A]/15 rounded-full flex items-center justify-center mx-auto mb-5 ring-2 ring-[#00D15A]/30">
                <CheckCircle className="w-10 h-10 text-[#00D15A] animate-bounce" />
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-2">Request Received</h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto mb-7">
                Our enterprise team will contact{' '}
                <span className="font-semibold text-white/80">{formData.company}</span> shortly to complete onboarding.
              </p>

              <div className="bg-white/8 border border-white/10 rounded-2xl px-5 py-4 mb-7 text-left space-y-2">
                <p className="text-xs text-white/35 uppercase tracking-widest font-semibold mb-3">Request Summary</p>
                {[
                  ['Name', formData.name],
                  ['Company', formData.company],
                  ['Email', formData.email],
                  ['Phone', formData.phone],
                  ['Team Size', formData.teamSize],
                  ['Plan', formData.tier],
                ].map(([label, val]) => val && (
                  <p key={label} className="text-sm text-white/60">
                    <span className="text-white/35">{label}: </span>
                    <span className="text-white/80">{val}</span>
                  </p>
                ))}
              </div>

              <button
                onClick={handleClose}
                className="w-full h-12 bg-[#00D15A] hover:bg-[#00c254] text-white rounded-xl font-bold text-sm shadow-[0_4px_24px_rgba(0,209,90,0.35)] transition-all duration-200"
              >
                Return to Login
              </button>
            </div>
          )}

        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
