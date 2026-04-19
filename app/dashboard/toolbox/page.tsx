'use client'

import { useState } from 'react'
import {
  ShieldCheck, BookOpen, Users, TrendingDown,
  Sparkles, Play, ChevronRight, Zap, Plus, Trash2,
  FileText, BarChart2,
} from 'lucide-react'

/* ─── Mock Data ───────────────────────────────────────────────────── */
type WorkGroup = {
  id: number
  name: string
  industry: 'Construction' | 'O&G' | 'Mining'
  workerCount: number
  moduleName: string
  completedCount: number
  isRequired: boolean
}

const WORK_GROUPS: WorkGroup[] = [
  {
    id: 1,
    name: 'MEP (HVAC / Electrical)',
    industry: 'Construction',
    workerCount: 32,
    moduleName: 'Electrical Safety in High Temps',
    completedCount: 28,
    isRequired: true,
  },
  {
    id: 2,
    name: 'Civil & Groundworks',
    industry: 'Construction',
    workerCount: 45,
    moduleName: 'Shoring & Trench Safety',
    completedCount: 40,
    isRequired: true,
  },
  {
    id: 3,
    name: 'Heavy Equipment Operators',
    industry: 'Construction',
    workerCount: 15,
    moduleName: 'Heat Index Monitoring from Cabins',
    completedCount: 15,
    isRequired: false,
  },
  {
    id: 4,
    name: 'Pipefitting & Welding',
    industry: 'O&G',
    workerCount: 18,
    moduleName: 'Confined Space & Fume Exposure',
    completedCount: 12,
    isRequired: true,
  },
  {
    id: 5,
    name: 'Drilling & Blasting',
    industry: 'Mining',
    workerCount: 22,
    moduleName: 'Blast Zone Heat Protocol',
    completedCount: 18,
    isRequired: true,
  },
]

const INDUSTRY_BADGE: Record<WorkGroup['industry'], string> = {
  'Construction': 'bg-blue-100 text-blue-700 border border-blue-200',
  'O&G':          'bg-orange-100 text-orange-700 border border-orange-200',
  'Mining':       'bg-rose-100 text-rose-700 border border-rose-200',
}

/* ─── Custom Switch ───────────────────────────────────────────────── */
function Switch({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#00D15A]/40 ${
        checked ? 'bg-[#00D15A]' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

/* ─── Toggle Row ──────────────────────────────────────────────────── */
function ToggleRow({
  label,
  sub,
  checked,
  onChange,
}: {
  label: string
  sub?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-800">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  )
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function ToolboxPage() {
  const [activeGroupId,  setActiveGroupId]  = useState(2)
  const [enforceWatch,   setEnforceWatch]   = useState(true)
  const [requireCompletion, setRequireCompletion] = useState(true)
  const [quiz,           setQuiz]           = useState(false)
  const [recurring,      setRecurring]      = useState(false)

  const activeGroup = WORK_GROUPS.find(g => g.id === activeGroupId)!
  const totalWorkers = WORK_GROUPS.reduce((s, g) => s + g.workerCount, 0)

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 min-h-screen p-6 text-slate-900 font-sans">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-[#00D15A] uppercase tracking-widest mb-1">
            Safety Training
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Toolbox Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Weekly safety training for Construction · O&amp;G · Mining operations.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
          <span className="size-2 rounded-full bg-[#00D15A] animate-pulse" />
          {totalWorkers} workers enrolled
        </div>
      </div>

      {/* ── KPI Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* 1 — Compliance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-10 rounded-xl bg-[#E3FAED] flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5" style={{ color: '#00D15A' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">Training Compliance</p>
            <p className="text-2xl font-bold text-green-600 leading-none">93%</p>
            <p className="text-[10px] text-slate-400 mt-1">↑ vs 87% last week</p>
          </div>
        </div>

        {/* 2 — Modules */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-10 rounded-xl bg-[#E3FAED] flex items-center justify-center shrink-0">
            <BookOpen className="size-5" style={{ color: '#00D15A' }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">Required Modules</p>
            <p className="text-2xl font-bold text-slate-900 leading-none">13</p>
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '87%', backgroundColor: '#00D15A' }} />
            </div>
          </div>
        </div>

        {/* 3 — Coverage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-10 rounded-xl bg-[#E3FAED] flex items-center justify-center shrink-0">
            <Users className="size-5" style={{ color: '#00D15A' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">Worker Coverage</p>
            <p className="text-2xl font-bold text-green-600 leading-none">60%</p>
            <p className="text-[10px] text-slate-400 mt-1">Weekly target</p>
          </div>
        </div>

        {/* 4 — Reduction */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="size-10 rounded-xl bg-[#E3FAED] flex items-center justify-center shrink-0">
            <TrendingDown className="size-5" style={{ color: '#00D15A' }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 font-medium leading-none mb-1">Incident Reduction</p>
            <p className="text-2xl font-bold text-green-600 leading-none">−10%</p>
            <p className="text-[10px] text-slate-400 mt-1">Since implementation</p>
          </div>
        </div>

      </div>

      {/* ── Gemini AI Section ─────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50/70 to-white border border-blue-100 rounded-xl p-5 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left */}
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-100 to-violet-100 border border-indigo-200 rounded-full px-3 py-1">
                <Sparkles className="size-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 tracking-wide">Powered by Gemini</span>
              </div>
            </div>
            <h2 className="text-base font-bold text-slate-900 mb-1">AI-Predicted Toolbox Topics</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analyzing 7-day weather for construction site...{' '}
              <span className="font-semibold text-orange-600">Heatwave expected (43°C+)</span>, sandstorm possibility high.
            </p>
          </div>

          {/* Right — Topic list */}
          <div className="w-full space-y-2.5">
            {[
              {
                num: '01',
                topic: 'Heat Stress Prevention',
                badge: 'bg-red-100 text-red-700 border border-red-200',
                label: '⚠ Critical',
                desc: 'Fluid intake schedules, ORS thresholds, and supervisor checkpoints for 43°C+ conditions.',
              },
              {
                num: '02',
                topic: 'Respiratory Protection',
                badge: 'bg-amber-100 text-amber-700 border border-amber-200',
                label: '⚠ Warning',
                desc: 'Correct N95 fitting procedure, seal checks, and replacement cycles for poor air quality days.',
              },
              {
                num: '03',
                topic: 'Site Dust Management',
                badge: 'bg-green-100 text-green-700 border border-green-200',
                label: 'Standard',
                desc: 'Wetting agents, wind barriers, and dust suppression protocols for sandstorm conditions.',
              },
            ].map(({ num, topic, badge, label, desc }) => (
              <div key={num} className="flex items-start gap-3 bg-white border border-slate-100 rounded-lg px-4 py-3 shadow-sm">
                <span className="text-xs font-bold text-slate-300 tabular-nums mt-0.5 w-5 shrink-0">{num}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-semibold text-slate-900">{topic}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge}`}>{label}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left — Work Groups (col-span-5) ─────────────────────── */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Work Groups &amp; Modules</h2>
                <p className="text-xs text-slate-500 mt-0.5">Click a group to configure its module</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors">
                <Plus className="size-3.5" />
                Create New Group
              </button>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100">
              {WORK_GROUPS.map(group => {
                const isActive = group.id === activeGroupId
                const pct = Math.round((group.completedCount / group.workerCount) * 100)
                return (
                  <button
                    key={group.id}
                    onClick={() => setActiveGroupId(group.id)}
                    className={`w-full text-left px-4 py-3.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-[#E3FAED] border-l-4 border-l-[#00D15A]'
                        : 'bg-white border-l-4 border-l-transparent hover:border-l-[#00D15A]/40 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className={`text-sm font-bold ${isActive ? 'text-[#007a35]' : 'text-slate-900'}`}>
                            {group.name}
                          </span>
                          {group.isRequired && (
                            <span className="text-[9px] font-bold bg-[#00D15A]/15 text-[#007a35] border border-[#00D15A]/30 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              Required for Check-in
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{group.moduleName}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${INDUSTRY_BADGE[group.industry]}`}>
                          {group.industry}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-1 tabular-nums">{group.workerCount} workers</p>
                      </div>
                    </div>
                    {/* Progress */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: isActive ? '#00D15A' : '#a7f3c4' }}
                        />
                      </div>
                      <span className={`text-[10px] font-semibold tabular-nums ${isActive ? 'text-[#007a35]' : 'text-slate-400'}`}>
                        {group.completedCount}/{group.workerCount}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

          </div>
        </div>

        {/* ── Right — Video Config (col-span-7) ───────────────────── */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">

            {/* Header */}
            <div className="flex items-center gap-2 mb-5">
              <Play className="size-4" style={{ color: '#00D15A' }} />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Forced Video Module Configuration</h2>
                <p className="text-xs text-slate-500">{activeGroup.name}</p>
              </div>
            </div>

            {/* Module title input */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block mb-1.5">
                Module Title
              </label>
              <input
                type="text"
                defaultValue={activeGroup.moduleName}
                key={activeGroup.id}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 focus:border-[#00D15A]"
              />
            </div>

            {/* Video embed with overlay */}
            <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 mb-5">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  key={activeGroup.id}
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/n2s4ilh_Gvw"
                  title="Safety Training Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {/* Replace overlay button */}
              <button className="absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold bg-black/50 text-white backdrop-blur-sm rounded-lg px-3 py-1.5 hover:bg-black/70 transition-colors">
                <FileText className="size-3" />
                Replace Video
              </button>
            </div>

            {/* Toggles */}
            <div className="mb-5">
              <ToggleRow
                label="Enforce Full Watch Time (No Skipping)"
                sub="Workers cannot seek forward or close the video early"
                checked={enforceWatch}
                onChange={setEnforceWatch}
              />
              <ToggleRow
                label="Require Video Completion for Check-In Unlock"
                sub="App features are locked until training is completed"
                checked={requireCompletion}
                onChange={setRequireCompletion}
              />
              <ToggleRow
                label="Post-Video Compliance Quiz (3 Questions)"
                sub="Workers must pass a short quiz to confirm understanding"
                checked={quiz}
                onChange={setQuiz}
              />
              <ToggleRow
                label="Assign Recurring Schedule (Weekly, Mon)"
                sub="Automatically reassign this module every Monday"
                checked={recurring}
                onChange={setRecurring}
              />
            </div>

            {/* KPI box */}
            <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 mb-5 flex items-center gap-3">
              <BarChart2 className="size-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500 leading-none mb-0.5">Video Effectiveness KPI</p>
                <p className="text-sm font-bold text-slate-800">1.50% Average Time Spent</p>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 text-sm font-bold text-white rounded-full px-6 py-2.5 transition-all duration-200 hover:opacity-90 shadow-lg"
                style={{ backgroundColor: '#00D15A', boxShadow: '0 4px 20px rgba(0,209,90,0.3)' }}
              >
                <Zap className="size-4" />
                Publish &amp; Enforce
                <ChevronRight className="size-4 opacity-70" />
              </button>

              <button className="text-sm font-semibold text-slate-700 border border-slate-300 rounded-full px-5 py-2.5 hover:bg-slate-100 transition-colors">
                Save Draft
              </button>

              <button className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-red-600 rounded-full px-4 py-2.5 hover:bg-red-50 transition-colors">
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
