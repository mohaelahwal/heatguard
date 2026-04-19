'use client'

import { cn } from '@/lib/utils'
import {
  FileText, Download, ExternalLink,
  Cpu, ShieldCheck, BookOpen, ClipboardList,
} from 'lucide-react'

type DocCategory = 'hardware' | 'compliance' | 'sop' | 'training'

interface Doc {
  title:    string
  desc:     string
  type:     string
  size:     string
  updated:  string
  category: DocCategory
}

const CATEGORY_CONFIG: Record<DocCategory, { label: string; icon: React.ElementType; bg: string; icon_color: string }> = {
  hardware:   { label: 'Hardware Manuals',    icon: Cpu,           bg: 'bg-blue-50',   icon_color: 'text-blue-500'    },
  compliance: { label: 'MOHRE Compliance',    icon: ShieldCheck,   bg: 'bg-[#E3FAED]', icon_color: 'text-[#00D15A]'   },
  sop:        { label: 'Internal SOPs',       icon: ClipboardList, bg: 'bg-purple-50', icon_color: 'text-purple-500'  },
  training:   { label: 'Training Resources',  icon: BookOpen,      bg: 'bg-amber-50',  icon_color: 'text-amber-500'   },
}

const DOCS: Doc[] = [
  // Hardware
  {
    title:   'HeatGuard IoT Band — Setup & Pairing Guide',
    desc:    'Step-by-step guide to activating, pairing, and calibrating the HG-Band sensor.',
    type:    'PDF',
    size:    '3.2 MB',
    updated: '12 May 2025',
    category:'hardware',
  },
  {
    title:   'Site Gateway Installation Manual v2.1',
    desc:    'LoRa gateway mounting, firmware flashing, and network configuration.',
    type:    'PDF',
    size:    '5.8 MB',
    updated: '03 Jan 2025',
    category:'hardware',
  },
  {
    title:   'HG-Band Firmware Release Notes v3.2.1',
    desc:    'Changelog, known issues, and OTA update procedure for the latest firmware.',
    type:    'PDF',
    size:    '820 KB',
    updated: '28 Jun 2025',
    category:'hardware',
  },
  // Compliance
  {
    title:   'UAE Midday Break Rules 2026 — MOHRE Circular',
    desc:    'Official MOHRE regulation mandating outdoor work suspension 12:30–15:00, June–September.',
    type:    'PDF',
    size:    '1.1 MB',
    updated: '01 Apr 2026',
    category:'compliance',
  },
  {
    title:   'ISO 45001:2018 — HSE Management System Checklist',
    desc:    'Internal audit checklist aligned with ISO 45001 occupational health and safety requirements.',
    type:    'XLSX',
    size:    '640 KB',
    updated: '15 Feb 2025',
    category:'compliance',
  },
  {
    title:   'HeatGuard SOC 2 Type II Report — Summary',
    desc:    'Executive summary of our security and availability audit for enterprise procurement.',
    type:    'PDF',
    size:    '2.4 MB',
    updated: '22 Mar 2025',
    category:'compliance',
  },
  // SOPs
  {
    title:   'SOP-001: Heat Stroke Emergency Response Protocol',
    desc:    'Immediate actions, chain of command, and hospital handover procedures for heat stroke incidents.',
    type:    'PDF',
    size:    '980 KB',
    updated: '10 Jun 2025',
    category:'sop',
  },
  {
    title:   'SOP-002: Worker Wearable Non-Compliance Procedure',
    desc:    'Steps to take when a worker refuses to wear or removes their HG-Band on site.',
    type:    'PDF',
    size:    '560 KB',
    updated: '05 May 2025',
    category:'sop',
  },
  {
    title:   'SOP-003: Insurance Claim Submission Workflow',
    desc:    'End-to-end process for submitting, tracking, and appealing worker injury claims via HeatGuard.',
    type:    'PDF',
    size:    '1.3 MB',
    updated: '19 Apr 2025',
    category:'sop',
  },
  // Training
  {
    title:   'Heat Safety Awareness — Worker Induction Slides',
    desc:    'PowerPoint deck for new worker onboarding. Covers WBGT, symptoms, and emergency contacts.',
    type:    'PPTX',
    size:    '7.6 MB',
    updated: '01 Jun 2025',
    category:'training',
  },
  {
    title:   'Supervisor Dashboard — Video Walkthrough',
    desc:    'Recorded 18-minute walkthrough of the HeatGuard manager dashboard for new supervisors.',
    type:    'MP4',
    size:    '142 MB',
    updated: '14 Jun 2025',
    category:'training',
  },
]

const grouped = DOCS.reduce<Record<DocCategory, Doc[]>>((acc, doc) => {
  if (!acc[doc.category]) acc[doc.category] = []
  acc[doc.category].push(doc)
  return acc
}, {} as Record<DocCategory, Doc[]>)

const TYPE_COLORS: Record<string, string> = {
  PDF:  'bg-red-50  text-red-600  border-red-100',
  XLSX: 'bg-green-50 text-green-700 border-green-100',
  PPTX: 'bg-orange-50 text-orange-600 border-orange-100',
  MP4:  'bg-blue-50 text-blue-600 border-blue-100',
}

export default function DocumentationPage() {
  return (
    <div className="max-w-[1000px] mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Documentation</h1>
        <p className="text-sm text-gray-500 mt-1">Hardware manuals, regulatory guides, SOPs, and training resources.</p>
      </div>

      {(Object.entries(grouped) as [DocCategory, Doc[]][]).map(([category, docs]) => {
        const cfg = CATEGORY_CONFIG[category]
        const CategoryIcon = cfg.icon
        return (
          <div key={category} className="space-y-3">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', cfg.bg)}>
                <CategoryIcon className={cn('w-4 h-4', cfg.icon_color)} />
              </div>
              <h2 className="text-sm font-bold text-gray-900">{cfg.label}</h2>
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">{docs.length} documents</span>
            </div>

            {/* Doc cards */}
            <div className="grid grid-cols-1 gap-2.5">
              {docs.map(doc => (
                <div
                  key={doc.title}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all"
                >
                  {/* File icon */}
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{doc.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-1">{doc.desc}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md border', TYPE_COLORS[doc.type] ?? 'bg-gray-50 text-gray-600 border-gray-200')}>
                        {doc.type}
                      </span>
                      <span className="text-[10px] text-gray-400">{doc.size}</span>
                      <span className="text-[10px] text-gray-400">Updated {doc.updated}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer">
                      <ExternalLink className="w-3.5 h-3.5" /> View
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#0B281F] hover:bg-[#0d3325] text-white transition-colors cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
