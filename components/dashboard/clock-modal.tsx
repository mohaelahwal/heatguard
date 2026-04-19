'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'

/* ── Database logging shell ──────────────────────────────────────────
   Schema expects: id, user_id, action_type, timestamp
   This data is restricted to Admin / Manager view only.
────────────────────────────────────────────────────────────────────── */
async function logTimeAction(
  action: 'clock_in' | 'break_start' | 'break_end' | 'clock_out',
  _userId?: string
) {
  // const supabase = createClient()
  // await supabase.from('time_entries').insert({
  //   user_id:     _userId,
  //   action_type: action,
  //   timestamp:   new Date().toISOString(),
  // })
  console.log('[logTimeAction]', action, new Date().toISOString())
}

/* ── Ring constants ──────────────────────────────────────────────── */
const SHIFT_SECS  = 9 * 3600            // 9-hour reference shift
const RING_R      = 108
const RING_STROKE = 13
const CIRCUMF     = 2 * Math.PI * RING_R
const SVG_SIZE    = (RING_R + RING_STROKE) * 2 + 12
const SVG_CENTER  = SVG_SIZE / 2

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatTime(secs: number) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

type Step        = 'pin' | 'active'
type ShiftStatus = 'clocked_in' | 'on_break'

const NUMPAD = ['1','2','3','4','5','6','7','8','9','','0','⌫']

/* ── Toast ───────────────────────────────────────────────────────── */
function ClockOutToast({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      role="alert"
      className="fixed top-5 right-5 z-[200] flex items-center gap-3 bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgb(0,0,0,0.12)] border border-gray-100 max-w-sm animate-in slide-in-from-right duration-300"
    >
      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
        <CheckCircle2 className="w-4 h-4 text-[#00D15A]" />
      </div>
      <p className="text-sm font-medium text-gray-900 flex-1">
        You have been clocked out of work.
      </p>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
        aria-label="Dismiss"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ── Props ───────────────────────────────────────────────────────── */
interface ClockModalProps {
  open:         boolean
  onOpenChange: (v: boolean) => void
  userName?:    string
  userId?:      string
}

/* ── Component ───────────────────────────────────────────────────── */
export function ClockModal({ open, onOpenChange, userName = 'Mohaned Elahwal', userId }: ClockModalProps) {
  const [step,           setStep]           = useState<Step>('pin')
  const [pin,            setPin]            = useState('')
  const [pinError,       setPinError]       = useState(false)
  const [shiftStatus,    setShiftStatus]    = useState<ShiftStatus>('clocked_in')
  const [secondsElapsed, setSecondsElapsed] = useState(0)
  const [showToast,      setShowToast]      = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  /* ── Timer ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (step === 'active' && shiftStatus === 'clocked_in') {
      timerRef.current = setInterval(() => setSecondsElapsed(s => s + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step, shiftStatus])

  /* ── Reset when modal closes ────────────────────────────────────── */
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep('pin')
        setPin('')
        setPinError(false)
        setShiftStatus('clocked_in')
        setSecondsElapsed(0)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [open])

  /* ── PIN input ──────────────────────────────────────────────────── */
  function handleKey(k: string) {
    if (k === '⌫') {
      setPin(p => p.slice(0, -1))
      setPinError(false)
      return
    }
    if (pin.length >= 4) return
    const next = pin + k
    setPin(next)
    if (next.length === 4) {
      setTimeout(() => {
        if (next === '1234') {
          logTimeAction('clock_in', userId)
          setStep('active')
          setPinError(false)
        } else {
          setPinError(true)
          setPin('')
        }
      }, 150)
    }
  }

  /* ── Break toggle ───────────────────────────────────────────────── */
  async function handleBreak() {
    if (shiftStatus === 'clocked_in') {
      await logTimeAction('break_start', userId)
      setShiftStatus('on_break')
    } else {
      await logTimeAction('break_end', userId)
      setShiftStatus('clocked_in')
    }
  }

  /* ── Clock out ──────────────────────────────────────────────────── */
  async function handleClockOut() {
    setShowToast(true)
    await logTimeAction('clock_out', userId)
    onOpenChange(false)
  }

  /* ── Ring render values ─────────────────────────────────────────── */
  const ringColor  = shiftStatus === 'on_break' ? '#F97316' : '#00D15A'
  const dashOffset = CIRCUMF * (1 - Math.min(secondsElapsed / SHIFT_SECS, 1))

  return (
    <>
    {showToast && <ClockOutToast onDismiss={() => setShowToast(false)} />}
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl gap-0">

        {step === 'pin' ? (
          /* ══════════════════════════════════════════════════════════
             VIEW 1 — PIN SCREEN
          ══════════════════════════════════════════════════════════ */
          <div className="flex flex-col items-center px-8 pt-8 pb-8 bg-[#0B281F]">

            {/* Brand icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#00D15A]/15 flex items-center justify-center mb-5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="2" x2="12" y2="22" stroke="#00D15A" strokeWidth="2.2" strokeLinecap="round"/>
                <line x1="2"  y1="12" x2="22" y2="12" stroke="#00D15A" strokeWidth="2.2" strokeLinecap="round"/>
                <line x1="5.2" y1="5.2" x2="18.8" y2="18.8" stroke="#00D15A" strokeWidth="2.2" strokeLinecap="round"/>
                <line x1="18.8" y1="5.2" x2="5.2" y2="18.8" stroke="#00D15A" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>

            <p className="text-[10px] font-semibold text-[#00D15A]/60 uppercase tracking-widest mb-1">
              Manager Authentication
            </p>
            <h2 className="text-lg font-bold text-white mb-7">Enter your PIN</h2>

            {/* PIN dot indicators */}
            <div className="flex gap-4 mb-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-150 ${
                    i < pin.length
                      ? pinError
                        ? 'bg-red-500 border-red-500'
                        : 'bg-[#00D15A] border-[#00D15A]'
                      : 'border-white/25 bg-transparent'
                  }`}
                />
              ))}
            </div>

            {/* Error */}
            <p className={`text-[11px] font-semibold text-red-400 mb-6 h-4 transition-opacity duration-150 ${pinError ? 'opacity-100' : 'opacity-0'}`}>
              Invalid PIN — try again
            </p>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {NUMPAD.map((k, i) => {
                if (k === '') return <div key={i} />
                return (
                  <button
                    key={i}
                    onClick={() => handleKey(k)}
                    className="h-[54px] rounded-2xl text-lg font-semibold text-white bg-white/10 hover:bg-white/20 active:scale-95 active:bg-white/25 transition-all duration-100"
                  >
                    {k}
                  </button>
                )
              })}
            </div>
          </div>

        ) : (
          /* ══════════════════════════════════════════════════════════
             VIEW 2 — ACTIVE TIMER SCREEN
          ══════════════════════════════════════════════════════════ */
          <div className="flex flex-col items-center bg-white px-8 pt-8 pb-8">

            {/* Status pill */}
            <div
              className="flex items-center gap-1.5 text-[11px] font-bold px-3.5 py-1 rounded-full mb-6"
              style={{
                background: shiftStatus === 'on_break' ? '#FFF7ED' : '#ECFDF5',
                color:      shiftStatus === 'on_break' ? '#C2410C' : '#16A34A',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: ringColor }}
              />
              {shiftStatus === 'on_break' ? 'On Break' : 'Shift Active'}
            </div>

            {/* SVG ring */}
            <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
              <svg width={SVG_SIZE} height={SVG_SIZE}>
                {/* Track */}
                <circle
                  cx={SVG_CENTER} cy={SVG_CENTER} r={RING_R}
                  fill="none"
                  stroke="#F3F4F6"
                  strokeWidth={RING_STROKE}
                />
                {/* Progress */}
                <circle
                  cx={SVG_CENTER} cy={SVG_CENTER} r={RING_R}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMF}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(-90 ${SVG_CENTER} ${SVG_CENTER})`}
                  style={{ transition: 'stroke-dashoffset 0.6s linear, stroke 0.4s ease' }}
                />
              </svg>

              {/* Centre time */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[26px] font-bold text-gray-900 tabular-nums tracking-tight leading-none">
                  {formatTime(secondsElapsed)}
                </span>
                <span className="text-[11px] text-gray-400 mt-1.5">
                  {shiftStatus === 'on_break' ? 'break elapsed' : 'shift duration'}
                </span>
              </div>
            </div>

            {/* User info */}
            <p className="text-[14px] font-bold text-gray-900 mt-4">{userName}</p>
            <p className="text-xs text-gray-400 mb-7">Site Supervisor · Palm Jebel Ali</p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={handleBreak}
                className="w-full h-12 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-[0.98]"
                style={{
                  background: shiftStatus === 'on_break' ? '#F97316' : '#FFF7ED',
                  color:      shiftStatus === 'on_break' ? '#fff'    : '#C2410C',
                }}
              >
                {shiftStatus === 'on_break' ? '▶  End Break' : '☕  Take Break'}
              </button>

              <button
                onClick={handleClockOut}
                className="w-full h-12 rounded-2xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-all duration-200 active:scale-[0.98]"
              >
                Clock Out
              </button>
            </div>
          </div>
        )}

      </DialogContent>
    </Dialog>
    </>
  )
}
