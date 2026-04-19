'use client'

import Link from 'next/link'
import {
  User, Mail, Phone, MapPin, Building2, Hash,
  ShieldCheck, CalendarCheck, Edit3, ExternalLink, Upload,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CERTS = [
  { name: 'OSHA 30-Hour Construction',       issued: '14 Mar 2023', expiry: '14 Mar 2026', valid: true  },
  { name: 'Advanced First Aid & CPR',         issued: '02 Jan 2024', expiry: '02 Jan 2026', valid: true  },
  { name: 'Confined Space Entry Supervisor',  issued: '19 Jun 2022', expiry: '19 Jun 2025', valid: false },
  { name: 'ISO 45001 Lead Auditor',           issued: '08 Sep 2023', expiry: '08 Sep 2026', valid: true  },
  { name: 'UAE MOHRE Heat Safety Officer',    issued: '01 Apr 2024', expiry: '01 Apr 2027', valid: true  },
]

const ZONES = [
  { site: 'Palm Jebel Ali Site A', zones: ['Zone A', 'Zone B', 'Zone C — Spine North'] },
  { site: 'Expo City Site',        zones: ['Zone D', 'Zone E'] },
]

export default function ProfilePage() {
  return (
    <div className="max-w-[1100px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal details, credentials, and site assignments.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ── Left: Identity card ───────────────────────────────── */}
        <div className="col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">

            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center gap-3 pb-5 border-b border-gray-100">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={undefined} />
                  <AvatarFallback className="bg-[#0B281F] text-[#00D15A] text-2xl font-bold">ME</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#00D15A] rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">Mohaned Elahwal</p>
                <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 mt-1">
                  Site Supervisor
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-3.5">
              {[
                { icon: Hash,      label: 'Employee ID',   value: 'EMP-00142'              },
                { icon: Mail,      label: 'Email',         value: 'mohaned@heatguard.ae'    },
                { icon: Phone,     label: 'Phone',         value: '+971 50 234 5678'        },
                { icon: Building2, label: 'Department',    value: 'HSE & Site Operations'  },
                { icon: MapPin,    label: 'Base Location', value: 'Palm Jebel Ali, Dubai'  },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0B281F] hover:bg-[#0d3325] text-white text-sm font-semibold transition-colors cursor-pointer mt-2">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </div>

        {/* ── Right: Certs + Zones ──────────────────────────────── */}
        <div className="col-span-8 space-y-5">

          {/* Certifications */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Safety Certifications</h2>
                <p className="text-xs text-gray-400 mt-0.5">{CERTS.filter(c => c.valid).length} active · {CERTS.filter(c => !c.valid).length} expired</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => console.log('Open upload modal')}
              >
                <Upload className="w-4 h-4" /> Upload Certificate
              </Button>
            </div>
            <div className="space-y-2.5">
              {CERTS.map(cert => (
                <div key={cert.name} className={cn(
                  'flex items-center gap-4 px-4 py-3 rounded-2xl border',
                  cert.valid ? 'bg-gray-50 border-gray-100' : 'bg-red-50/50 border-red-100'
                )}>
                  <div className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                    cert.valid ? 'bg-[#E3FAED]' : 'bg-red-100'
                  )}>
                    <ShieldCheck className={cn('w-4 h-4', cert.valid ? 'text-[#00D15A]' : 'text-red-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{cert.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Issued {cert.issued}</p>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-gray-400">Expires</p>
                      <p className="text-xs font-bold text-gray-700">{cert.expiry}</p>
                    </div>
                    <span className={cn(
                      'text-[10px] font-bold px-2.5 py-1 rounded-full border',
                      cert.valid
                        ? 'bg-[#E3FAED] text-[#007A38] border-[#00D15A]/20'
                        : 'bg-red-50 text-red-600 border-red-200'
                    )}>
                      {cert.valid ? 'Valid' : 'Expired'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Zones */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Assigned Zones</h2>
              <Link href="/dashboard/map" className="flex items-center gap-1.5 text-xs font-semibold text-[#007A38] hover:underline">
                <ExternalLink className="w-3.5 h-3.5" /> View on Map
              </Link>
            </div>
            <div className="space-y-3">
              {ZONES.map(({ site, zones }) => (
                <div key={site} className="bg-gray-50 rounded-2xl border border-gray-100 p-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#00D15A]" />
                    <p className="text-sm font-bold text-gray-800">{site}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {zones.map(z => (
                      <span key={z} className="text-xs font-semibold px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                        {z}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
