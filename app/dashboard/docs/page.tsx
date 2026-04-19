'use client'

import { useState, useMemo } from 'react'
import {
  Search, LayoutGrid, MapPin, Users, AlertTriangle,
  Stethoscope, ShieldCheck, ChevronLeft, ArrowRight,
  BookOpen, Info, Lightbulb, AlertOctagon, TriangleAlert,
  CheckCircle2, Clock, ChevronRight, Zap, Eye, X,
  Wrench, Cpu, Plug,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Design tokens per article ─────────────────────────────────────

type ArticleColor = {
  accent:     string   // hex
  bg:         string   // tailwind bg class (light tint)
  border:     string   // tailwind border class
  text:       string   // tailwind text class (strong)
  iconBg:     string   // tailwind bg class for icon chip
  badge:      string   // full tailwind for small badge
}

const COLORS: Record<string, ArticleColor> = {
  dashboard: {
    accent:  '#00D15A',
    bg:      'bg-[#E3FAED]',
    border:  'border-[#00D15A]/30',
    text:    'text-[#007A38]',
    iconBg:  'bg-[#E3FAED]',
    badge:   'bg-[#E3FAED] text-[#007A38] border border-[#00D15A]/30',
  },
  map: {
    accent:  '#3B82F6',
    bg:      'bg-blue-50',
    border:  'border-blue-200',
    text:    'text-blue-700',
    iconBg:  'bg-blue-50',
    badge:   'bg-blue-50 text-blue-700 border border-blue-200',
  },
  roster: {
    accent:  '#8B5CF6',
    bg:      'bg-violet-50',
    border:  'border-violet-200',
    text:    'text-violet-700',
    iconBg:  'bg-violet-50',
    badge:   'bg-violet-50 text-violet-700 border border-violet-200',
  },
  incidents: {
    accent:  '#EF4444',
    bg:      'bg-red-50',
    border:  'border-red-200',
    text:    'text-red-700',
    iconBg:  'bg-red-50',
    badge:   'bg-red-50 text-red-700 border border-red-200',
  },
  'tele-triage': {
    accent:  '#0EA5E9',
    bg:      'bg-sky-50',
    border:  'border-sky-200',
    text:    'text-sky-700',
    iconBg:  'bg-sky-50',
    badge:   'bg-sky-50 text-sky-700 border border-sky-200',
  },
  'platform-access': {
    accent:  '#F97316',
    bg:      'bg-orange-50',
    border:  'border-orange-200',
    text:    'text-orange-700',
    iconBg:  'bg-orange-50',
    badge:   'bg-orange-50 text-orange-700 border border-orange-200',
  },
  toolbox: {
    accent:  '#F59E0B',
    bg:      'bg-amber-50',
    border:  'border-amber-200',
    text:    'text-amber-700',
    iconBg:  'bg-amber-50',
    badge:   'bg-amber-50 text-amber-700 border border-amber-200',
  },
  'iot-fleet': {
    accent:  '#06B6D4',
    bg:      'bg-cyan-50',
    border:  'border-cyan-200',
    text:    'text-cyan-700',
    iconBg:  'bg-cyan-50',
    badge:   'bg-cyan-50 text-cyan-700 border border-cyan-200',
  },
  integrations: {
    accent:  '#6366F1',
    bg:      'bg-indigo-50',
    border:  'border-indigo-200',
    text:    'text-indigo-700',
    iconBg:  'bg-indigo-50',
    badge:   'bg-indigo-50 text-indigo-700 border border-indigo-200',
  },
}

// ── Primitive content components ──────────────────────────────────

type CalloutType = 'tip' | 'info' | 'warning' | 'danger'

const CALLOUT_CONFIG: Record<CalloutType, {
  icon:       React.ElementType
  container:  string
  iconClass:  string
  titleClass: string
  bodyClass:  string
}> = {
  tip: {
    icon:       Lightbulb,
    container:  'bg-[#E3FAED] border border-[#00D15A]/30',
    iconClass:  'text-[#00D15A]',
    titleClass: 'text-[#007A38]',
    bodyClass:  'text-[#007A38]/80',
  },
  info: {
    icon:       Info,
    container:  'bg-blue-50 border border-blue-200',
    iconClass:  'text-blue-500',
    titleClass: 'text-blue-800',
    bodyClass:  'text-blue-700',
  },
  warning: {
    icon:       TriangleAlert,
    container:  'bg-amber-50 border border-amber-200',
    iconClass:  'text-amber-500',
    titleClass: 'text-amber-800',
    bodyClass:  'text-amber-700',
  },
  danger: {
    icon:       AlertOctagon,
    container:  'bg-red-50 border border-red-200',
    iconClass:  'text-red-500',
    titleClass: 'text-red-800',
    bodyClass:  'text-red-700',
  },
}

function Callout({ type, title, children }: { type: CalloutType; title: string; children: React.ReactNode }) {
  const c = CALLOUT_CONFIG[type]
  const Icon = c.icon
  return (
    <div className={cn('rounded-xl px-4 py-4 flex gap-3', c.container)}>
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', c.iconClass)} />
      <div>
        <p className={cn('text-xs font-bold uppercase tracking-wider mb-1', c.titleClass)}>{title}</p>
        <div className={cn('text-sm leading-relaxed', c.bodyClass)}>{children}</div>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-2 mb-4">{children}</h2>
  )
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-slate-800 mb-2">{children}</h3>
}

function Body({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-slate-600 leading-relaxed', className)}>{children}</p>
}

function StepList({ steps }: { steps: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-0.5">{step.title}</p>
            <div className="text-sm text-slate-600 leading-relaxed">{step.body}</div>
          </div>
        </li>
      ))}
    </ol>
  )
}

function DefList({ items }: { items: { term: string; def: React.ReactNode; accent?: string }[] }) {
  return (
    <dl className="space-y-3">
      {items.map(({ term, def, accent }) => (
        <div key={term} className="flex gap-3">
          <div
            className="w-1 rounded-full shrink-0 mt-1"
            style={{ backgroundColor: accent ?? '#CBD5E1', minHeight: '100%', alignSelf: 'stretch' }}
          />
          <div>
            <dt className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">{term}</dt>
            <dd className="text-sm text-slate-600 leading-relaxed">{def}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border"
      style={{ backgroundColor: color + '18', borderColor: color + '40', color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/60">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-600 leading-relaxed">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ArticleSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('space-y-4', className)}>{children}</section>
}

// ── Article data ──────────────────────────────────────────────────

interface Article {
  id:         string
  title:      string
  icon:       React.ElementType
  shortDesc:  string
  readTime:   string
  tag:        string
  content:    React.ReactNode
}

const articles: Article[] = [
  // ── 1. Dashboard ─────────────────────────────────────────────────
  {
    id:        'dashboard',
    title:     'Main Dashboard',
    icon:      LayoutGrid,
    shortDesc: 'Master the heat stress KPIs, live monitoring feed, incident log chart, and AI-powered predictive weather forecast.',
    readTime:  '6 min read',
    tag:       'Core Feature',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="tip" title="Quick Summary">
            The Main Dashboard is your operational nerve center. Every metric updates in real time
            from field wearables and on-site weather sensors — no manual refresh needed.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>KPI Cards at a Glance</SectionHeading>
          <Body>
            Four primary KPI cards sit at the top of the dashboard. Each is color-coded to your
            site's risk thresholds and links directly to the relevant detail module.
          </Body>
          <DataTable
            headers={['Card', 'What It Shows', 'Threshold']}
            rows={[
              [
                <span className="font-semibold text-slate-800">Active Workers</span>,
                'Workers currently on shift with a live wearable heartbeat. Workers offline for 90+ seconds drop from this count and are flagged.',
                'N/A — informational',
              ],
              [
                <span className="font-semibold text-slate-800">Open Incidents</span>,
                'Unresolved alerts: SOS activations, heat-threshold breaches, and missed hydration check-ins.',
                <StatusPill label="Any &gt; 0 is actionable" color="#F97316" />,
              ],
              [
                <span className="font-semibold text-slate-800">Compliance Score</span>,
                'Percentage of workers who completed all daily mandatory protocols: hydration log, WBGT acknowledgement, rest-break sign-off.',
                <div className="flex gap-1.5 flex-wrap">
                  <StatusPill label="≥ 90% Target" color="#00D15A" />
                  <StatusPill label="Current: 91.4%" color="#00D15A" />
                </div>,
              ],
              [
                <span className="font-semibold text-slate-800">Peak WBGT</span>,
                'Highest Wet Bulb Globe Temperature reading across all active monitoring zones this shift.',
                <div className="flex gap-1.5 flex-wrap">
                  <StatusPill label="≥ 33°C Caution" color="#F97316" />
                  <StatusPill label="≥ 38°C Critical" color="#EF4444" />
                </div>,
              ],
            ]}
          />
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Live Monitoring Feed</SectionHeading>
          <Body>
            The Live Monitoring section displays a real-time scrollable list of all workers on shift,
            sorted by heat-stress severity. Critical workers appear first so supervisors can act
            without scrolling.
          </Body>
          <div className="grid grid-cols-3 gap-3">
            {[
              { status: 'Critical', color: '#EF4444', desc: 'WBGT > 38°C. Cooling tent routing or break alert required immediately.' },
              { status: 'Caution',  color: '#F97316', desc: 'WBGT 32–38°C. Hydration reminder sent automatically to wearable.' },
              { status: 'Safe',     color: '#00D15A', desc: 'WBGT < 32°C. Worker is within safe operating parameters.' },
            ].map(({ status, color, desc }) => (
              <div key={status} className="rounded-xl border p-3 space-y-1.5" style={{ borderColor: color + '40', backgroundColor: color + '08' }}>
                <StatusPill label={status} color={color} />
                <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <Callout type="warning" title="Blinking Red Dot">
            A blinking red dot on a worker row means their wearable heartbeat has not updated in
            the past 3 minutes. This is not automatically an SOS — it may be a connectivity gap —
            but it requires manual verification by the nearest crew lead.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Incident Log Chart</SectionHeading>
          <Body>
            A 7-day bar chart below the KPI cards visualizes incident volume broken down by
            severity category per day. Hover any bar to see the split: SOS activations, heat-threshold
            breaches, and medical referrals. This trend view is the fastest way to identify
            whether heat incidents are increasing day-over-day.
          </Body>
          <Callout type="info" title="Using the Chart for Scheduling">
            Cross-reference the chart's high-incident days against your shift schedule to identify
            whether heavy-labor tasks are being scheduled during peak afternoon heat windows.
            Redistributing those tasks to 06:00–09:00 windows can reduce incident volume by 30–50%.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Predictive Analytics &amp; Weather Forecast</SectionHeading>
          <Body>
            The Predictive Analytics widget combines a localized weather API feed with HeatGuard's
            proprietary heat-load model to forecast WBGT conditions for the next 6 hours in
            30-minute intervals. A shaded risk band on the chart marks predicted high-risk windows.
          </Body>
          <StepList steps={[
            {
              title: 'Forecast is generated at shift start (05:30)',
              body: 'The model pulls the latest GFS weather data and cross-references historical site incident rates for the same weather conditions.',
            },
            {
              title: 'Risk windows are highlighted automatically',
              body: 'If the model predicts a Critical WBGT window within the next 2 hours, the widget turns amber and a pre-drafted supervisor alert appears — ready to send to all crew leads in one tap.',
            },
            {
              title: 'Forecast re-runs every 30 minutes',
              body: 'As the day progresses and conditions change, the forecast updates. If a previously Safe window upgrades to Caution, affected schedule blocks in the Worker Roster are automatically re-colored.',
            },
          ]} />
        </ArticleSection>
      </div>
    ),
  },

  // ── 2. Live Site Map ──────────────────────────────────────────────
  {
    id:        'map',
    title:     'Live Site Map',
    icon:      MapPin,
    shortDesc: 'Multi-site switching, worker pin color codes, job role intelligence, heat zone radius, and layer filters.',
    readTime:  '7 min read',
    tag:       'Core Feature',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="tip" title="Quick Summary">
            The Live Site Map is the geographic view of your entire workforce in real time.
            Switch between active sites, click any pin to open a worker detail panel, and route
            workers to the nearest cooling tent — all without leaving the map.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Site Selector</SectionHeading>
          <Body>
            The dropdown in the top-left control panel lets you switch between your active
            construction sites. Switching a site pans the map, regenerates worker positions
            around the new GPS anchor, and re-centers the Heat Zone circle — all in a single
            interaction.
          </Body>
          <DataTable
            headers={['Site', 'GPS Anchor', 'Status']}
            rows={[
              [
                <span className="font-semibold text-slate-800">Palm Jebel Ali (CT-452-JBL)</span>,
                '24°59\'06.2"N 55°01\'38.9"E',
                <StatusPill label="Active" color="#00D15A" />,
              ],
              [
                <span className="font-semibold text-slate-800">Jabal Ali (ET-355-SWT)</span>,
                '25°00\'52.3"N 54°59\'02.3"E',
                <StatusPill label="Active" color="#00D15A" />,
              ],
            ]}
          />
          <Callout type="info" title="On Site Switch">
            Any open worker info panels or infrastructure panels are automatically closed when
            you switch sites, preventing stale data from a previous site appearing on the new
            site's map.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Worker Pin Color Codes</SectionHeading>
          <Body>
            Every worker on the map is represented by a circular colored pin derived from their
            wearable's live WBGT reading. The color system is identical to the dashboard's
            status system for consistency.
          </Body>
          <div className="space-y-3">
            {[
              {
                color:  '#00D15A',
                label:  'Safe',
                range:  'WBGT < 32°C',
                action: 'No intervention needed. Worker is within safe operating parameters.',
                roles:  'HVAC Technician, Electrician, Tile Installer, Site Inspector',
              },
              {
                color:  '#F97316',
                label:  'Caution',
                range:  'WBGT 32–38°C',
                action: 'Elevated risk. A hydration reminder has been sent automatically to the worker\'s wearable. Monitor closely and prepare to escalate.',
                roles:  'Structural Steel Worker, Welder, Pipefitter, Mason',
              },
              {
                color:  '#EF4444',
                label:  'Critical',
                range:  'WBGT > 38°C',
                action: 'Immediate action required. An alert has been auto-raised in Incidents. Use "Route to Cooling Tent" from the worker panel.',
                roles:  'Scaffold Erector, Concrete Finisher, Heavy Equipment Operator, Asphalt Worker',
              },
            ].map(item => (
              <div
                key={item.label}
                className="rounded-xl border p-4 space-y-2"
                style={{ borderColor: item.color + '40', backgroundColor: item.color + '08' }}
              >
                <div className="flex items-center justify-between">
                  <StatusPill label={item.label} color={item.color} />
                  <span className="text-[11px] font-mono text-slate-500">{item.range}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed"><strong>Action:</strong> {item.action}</p>
                <p className="text-xs text-slate-500 leading-relaxed"><strong>Typical roles:</strong> {item.roles}</p>
              </div>
            ))}
          </div>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Job Role Intelligence</SectionHeading>
          <Body>
            Each worker pin is linked to an intelligently assigned job role that correlates with
            their heat-stress status. This reflects the real-world relationship between physical
            job intensity and heat exposure — it is not a random assignment.
          </Body>
          <Callout type="tip" title="Why This Matters">
            When a Critical pin is clicked and shows "Scaffold Erector," the supervisor
            immediately understands the physical context — sustained exertion at height in
            direct sunlight — without needing to call the crew lead. Context accelerates the
            right response.
          </Callout>
          <Body>
            Clicking any worker pin opens the Worker Info Panel in the bottom-left corner.
            The panel header shows: badge number, full name, job role (color-coded green),
            and crew assignment (slate). From the panel you can:
          </Body>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Zap,          label: 'Send Break Alert',       desc: 'Dispatches an immediate push notification to the worker\'s wearable device.' },
              { icon: MapPin,       label: 'Route to Cooling Tent',  desc: 'Draws a routing line on the map to the nearest cooling tent and logs the action.' },
              { icon: Eye,          label: 'View WBGT History',      desc: 'Shows the worker\'s rolling 2-hour WBGT chart.' },
              { icon: AlertTriangle,label: 'Raise Incident',         desc: 'Manually escalates to an Incident record if the situation warrants formal documentation.' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">{label}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Heat Zone &amp; Layer Filters</SectionHeading>
          <DefList items={[
            {
              term:   'Heat Zone Circle',
              accent: '#EF4444',
              def:    'A red translucent circle (900m radius) centered on the site GPS anchor. It is always visible and moves automatically when you switch sites. This is a visual advisory — workers outside it are not automatically safe, it simply marks the primary sensor density perimeter.',
            },
            {
              term:   'Workers Layer',
              accent: '#0C2A1F',
              def:    'Toggles all worker pins on or off. Useful when you only need to locate infrastructure assets without visual noise from 20+ worker pins.',
            },
            {
              term:   'Medical Layer',
              accent: '#DC2626',
              def:    'Toggles Medical Post markers (red). Each marker popup shows the post name, staffing (Paramedic / Nurse), and AED station availability.',
            },
            {
              term:   'Cooling Layer',
              accent: '#1D4ED8',
              def:    'Toggles Cooling Tent markers (blue). Each marker popup shows tent name, capacity (seats), and AC + water dispenser status.',
            },
          ]} />
        </ArticleSection>
      </div>
    ),
  },

  // ── 3. Worker Roster ─────────────────────────────────────────────
  {
    id:        'roster',
    title:     'Worker Roster',
    icon:      Users,
    shortDesc: 'Daily schedules, WBGT tracking charts, hydration log compliance, and wearable device status per worker.',
    readTime:  '5 min read',
    tag:       'People Management',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="tip" title="Quick Summary">
            The Worker Roster is the personnel management layer of HeatGuard. Unlike the Live Map
            (spatially oriented), the Roster is task and schedule oriented — it answers
            "what should this worker be doing, and are they doing it safely?"
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Daily Schedule View</SectionHeading>
          <Body>
            Each worker row expands to show a day-view timeline of planned tasks, blocked into
            heat-risk periods based on the Predictive Analytics forecast.
          </Body>
          <div className="space-y-2">
            {[
              { color: '#00D15A', label: 'Safe Window',    desc: 'Task is scheduled during a WBGT-safe period. No intervention needed.' },
              { color: '#F97316', label: 'Caution Window', desc: 'Task falls within a predicted Caution window. Supervisor sign-off recommended.' },
              { color: '#EF4444', label: 'High-Risk Block',desc: 'Task is scheduled during a Critical window. Requires explicit supervisor approval before the shift begins.' },
            ].map(({ color, label, desc }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border" style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                <div>
                  <span className="text-xs font-semibold text-slate-800">{label}: </span>
                  <span className="text-xs text-slate-600">{desc}</span>
                </div>
              </div>
            ))}
          </div>
          <Callout type="warning" title="Dynamic Re-Coloring">
            When the Predictive Analytics forecast changes mid-shift, previously green schedule
            blocks may re-color to amber or red. Supervisors receive an in-app push notification
            listing the affected workers and tasks.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>WBGT Tracking Chart</SectionHeading>
          <Body>
            The WBGT chart for each worker shows a rolling 8-hour line graph of their personal
            heat exposure, aggregated from their HeatGuard wearable band at 5-minute intervals.
          </Body>
          <DataTable
            headers={['Chart Element', 'Meaning']}
            rows={[
              ['Blue line', 'Worker\'s personal WBGT readings from wearable'],
              ['Orange dashed line at 32°C', 'Caution threshold — exposure above this triggers hydration reminders'],
              ['Red dashed line at 38°C', 'Critical threshold — exposure above this raises an automatic incident'],
              ['Red shaded region', 'Period where worker exceeded the Critical threshold'],
              ['Grey shaded region', 'Rest break — WBGT readings paused'],
            ]}
          />
          <Callout type="info" title="Exporting for Compliance">
            Click the download icon in the chart toolbar to export a worker's full WBGT history
            as a CSV. This is the primary document required for UAE MOHRE heat safety incident
            investigations and insurance claims.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Hydration Log &amp; Compliance</SectionHeading>
          <Body>
            Workers log hydration check-ins every 45 minutes via their wearable device.
            The Hydration Log bar chart tracks compliance through the shift.
          </Body>
          <div className="space-y-2">
            {[
              { color: '#00D15A', label: 'Full green bar',    desc: 'Confirmed check-in within the 45-minute window.' },
              { color: '#F97316', label: 'Partial amber bar', desc: 'Late check-in (5–15 minutes past window). Logged but flagged.' },
              { color: '#EF4444', label: 'Empty red bar',     desc: 'Missed check-in. A compliance flag is raised and the site Compliance Score is reduced.' },
            ].map(({ color, label, desc }) => (
              <div key={label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border" style={{ borderColor: color + '40', backgroundColor: color + '10' }}>
                <div className="w-10 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-700"><strong>{label}:</strong> {desc}</span>
              </div>
            ))}
          </div>
          <Callout type="tip" title="Manual Override">
            Supervisors can manually override a missed check-in with a written justification
            (e.g., "Worker in confined space, radio unavailable"). All overrides are logged with
            a timestamp and the supervisor's employee ID for full audit trail.
          </Callout>
        </ArticleSection>
      </div>
    ),
  },

  // ── 4. Incidents ─────────────────────────────────────────────────
  {
    id:        'incidents',
    title:     'Incidents & SOS',
    icon:      AlertTriangle,
    shortDesc: 'Bento-box incident detail layout, the emergency dispatch button, location splits, and hydration panels.',
    readTime:  '6 min read',
    tag:       'Emergency Response',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="danger" title="Emergency Module">
            This module governs emergency response. Dispatch actions are irreversible once sent.
            Ensure all information in the Incident Detail view is reviewed before triggering
            the red Dispatch button.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Incident Severity Levels</SectionHeading>
          <DataTable
            headers={['Level', 'Trigger', 'Auto Action', 'SLA']}
            rows={[
              [
                <StatusPill label="P1 — Critical" color="#EF4444" />,
                'SOS button on wearable, WBGT > 40°C, or loss of consciousness reported',
                'Immediate push to on-duty medic + site manager. Incident record created.',
                '< 2 min response',
              ],
              [
                <StatusPill label="P2 — High" color="#F97316" />,
                'WBGT > 38°C for > 10 consecutive minutes',
                'Push to crew lead. Incident record created. Cooling tent routing auto-suggested.',
                '< 5 min response',
              ],
              [
                <StatusPill label="P3 — Medium" color="#EAB308" />,
                '3 consecutive missed hydration check-ins',
                'Compliance flag raised. Supervisor dashboard notification.',
                '< 15 min response',
              ],
              [
                <StatusPill label="P4 — Low" color="#94A3B8" />,
                'Single missed check-in or late WBGT acknowledgement',
                'Compliance score deducted. No push notification.',
                'End of shift review',
              ],
            ]}
          />
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Bento-Box Incident Detail View</SectionHeading>
          <Body>
            Clicking an incident opens a multi-panel Bento-box layout — all critical information
            visible without scrolling. The four panels are:
          </Body>
          <div className="grid grid-cols-2 gap-3">
            {[
              { pos: 'Top-left (large)',   title: 'Worker Identity',      desc: 'Name, badge, crew, job role, and real-time WBGT with a color-coded severity ring.' },
              { pos: 'Top-right (split)',  title: 'Location + History',   desc: 'Left: last known GPS coordinates on a miniature map. Right: 2-hour WBGT chart leading up to the incident.' },
              { pos: 'Bottom-left',        title: 'Hydration Compliance', desc: 'Last 5 check-in timestamps, on-time vs. missed status, and current hydration streak.' },
              { pos: 'Bottom-right',       title: 'Incident Metadata',    desc: 'Auto-generated incident ID, severity, time of trigger, assigned responder, and resolution status.' },
            ].map(({ pos, title, desc }) => (
              <div key={pos} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{pos}</p>
                <p className="text-xs font-bold text-slate-800 mb-1">{title}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Dispatch Emergency Responder</SectionHeading>
          <Callout type="danger" title="One-Tap Action — Cannot Be Undone">
            The red "Dispatch Emergency Responder" button requires a single deliberate click.
            There is no confirmation dialog — in genuine heat-stress emergencies, seconds matter.
          </Callout>
          <Body className="mt-2">
            Pressing the button triggers three simultaneous server-side actions:
          </Body>
          <StepList steps={[
            {
              title: 'Priority push notification sent',
              body: 'The on-site Medic assigned to the worker\'s zone receives a push notification containing: worker name, GPS coordinates, current WBGT reading, and incident ID. This notification bypasses Do Not Disturb settings on iOS and Android.',
            },
            {
              title: 'Incident status updated',
              body: 'The incident transitions from "Open" → "Responder Dispatched" in real time across all supervisor dashboards. Any supervisor viewing the incident sees the status change without refreshing.',
            },
            {
              title: 'Dispatch timer begins',
              body: 'A visible countdown starts from the moment of dispatch. If no "Arrived on Scene" confirmation is logged within 8 minutes, an automatic escalation alert is sent to the site manager and the HSE officer.',
            },
          ]} />
        </ArticleSection>
      </div>
    ),
  },

  // ── 5. Tele-Triage ───────────────────────────────────────────────
  {
    id:        'tele-triage',
    title:     'Tele-Triage',
    icon:      Stethoscope,
    shortDesc: 'Virtual clinic operations, patient queue management, video assessment workflow, and emergency dispatch confirmation.',
    readTime:  '5 min read',
    tag:       'Clinical',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="tip" title="Quick Summary">
            Tele-Triage is HeatGuard's virtual medical clinic. It connects field workers
            experiencing symptoms directly to qualified clinicians via live video and biometric
            data — eliminating the need to transport a worker off-site for initial assessment.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Patient Queue</SectionHeading>
          <Body>
            Workers enter the queue by pressing the medical-alert button on their HeatGuard
            wearable. The platform immediately transmits their WBGT reading, estimated heart
            rate, GPS coordinates, and chief complaint to the attending nurse's Tele-Triage panel.
          </Body>
          <DataTable
            headers={['Queue Priority', 'Color', 'Trigger Criteria']}
            rows={[
              [
                <span className="font-semibold text-slate-800">Immediate</span>,
                <StatusPill label="Red" color="#EF4444" />,
                'WBGT > 40°C or loss of consciousness reported',
              ],
              [
                <span className="font-semibold text-slate-800">Urgent</span>,
                <StatusPill label="Amber" color="#F97316" />,
                'Symptomatic but ambulatory (dizziness, nausea, cramps)',
              ],
              [
                <span className="font-semibold text-slate-800">Routine</span>,
                <StatusPill label="Green" color="#00D15A" />,
                'Hydration concern or minor discomfort — not compromising function',
              ],
            ]}
          />
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Video Assessment Workflow</SectionHeading>
          <StepList steps={[
            {
              title: 'Click "Start Session"',
              body: 'A low-bandwidth video call initiates to the worker\'s supervisor\'s tablet or the shared site iPad. The session targets < 200kbps to ensure reliability in areas with limited 4G signal.',
            },
            {
              title: 'Conduct structured visual assessment',
              body: 'The nurse checks for heat exhaustion signs: confusion, sweating cessation, skin color changes. The side panel shows the worker\'s live biometric feed simultaneously.',
            },
            {
              title: 'Complete the assessment form',
              body: 'Fill in the structured fields: orientation check (person, place, time), symptom severity sliders (1–10), and free-text clinical notes. All data is auto-saved to the worker\'s incident record.',
            },
            {
              title: 'Select an outcome',
              body: 'Choose from: Cleared to Return to Work, Move to Cooling Tent (non-emergency), or Escalate to Emergency Dispatch. Only the third option opens the Confirm Emergency Dispatch modal.',
            },
          ]} />
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Confirm Emergency Dispatch Modal</SectionHeading>
          <Body>
            Unlike the Incidents module's single-click dispatch, the Tele-Triage dispatch
            requires explicit confirmation. This deliberate friction exists because Tele-Triage
            sessions often involve workers who are anxious but not in clinical danger — a false
            dispatch wastes critical emergency resources.
          </Body>
          <Callout type="info" title="Responder Type Selection">
            The modal requires selecting the type of response: <strong>First Aid Responder</strong>,
            <strong> On-Site Medic</strong>, or <strong>Off-Site Ambulance</strong>. This selection
            determines which notification chain is triggered and which responder receives the
            dispatch alert with the worker's GPS coordinates.
          </Callout>
        </ArticleSection>
      </div>
    ),
  },

  // ── 6. Platform Access ────────────────────────────────────────────
  {
    id:        'platform-access',
    title:     'Platform Access & Roles',
    icon:      ShieldCheck,
    shortDesc: 'Role definitions, assigning work sites, crew groups, and individual workers to platform admins.',
    readTime:  '6 min read',
    tag:       'Administration',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="info" title="Access Control Philosophy">
            HeatGuard uses a need-to-know data access pattern. Super Admins define the exact
            scope of what each admin can see and do. Over-privileged users are a security and
            privacy risk — assign the minimum scope needed.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Role Definitions</SectionHeading>
          <DataTable
            headers={['Role', 'Data Scope', 'Can Do', 'Cannot Do']}
            rows={[
              [
                <div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">Super Admin</span>
                </div>,
                'All sites, all workers, all data',
                'Invite users, change roles, access billing, manage integrations',
                '—',
              ],
              [
                <div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Site Supervisor</span>
                </div>,
                'Assigned Work Site(s) only',
                'View/act on workers, incidents, compliance reports within scope',
                'Billing, platform-wide user management',
              ],
              [
                <div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Medic</span>
                </div>,
                'Assigned Work Groups only',
                'Tele-Triage, patient queues, medical records, clinical notes',
                'Schedules, non-medical dispatch, compliance reports',
              ],
            ]}
          />
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Edit Assignments — Three-Layer Scope</SectionHeading>
          <Body>
            Open the three-dot menu on any admin row in the Platform Access table and select
            "Edit Assignments" to define that admin's exact platform scope. The modal contains
            three independent assignment layers:
          </Body>
          <div className="space-y-4">
            {[
              {
                num:   '01',
                title: 'Work Site Assignment',
                color: '#F97316',
                desc:  'A dropdown with options: All Sites, Palm Jebel Ali (CT-452-JBL), or Jabal Ali (ET-355-SWT). Site scope determines which Live Map view and which incident feed the admin sees.',
                tip:   'Restrict Site Supervisors to a single site. Grant All Sites only to HSE officers who need a cross-site compliance view.',
              },
              {
                num:   '02',
                title: 'Work Group Assignment',
                color: '#8B5CF6',
                desc:  'Crew-level pill toggles: Crew Alpha, Crew Bravo, Scaffolders, Medic Team. An admin with specific Work Group assignments only sees workers from those crews in the Roster and Live Map.',
                tip:   'Medics should only be assigned to the Work Group(s) whose workers they clinically manage.',
              },
              {
                num:   '03',
                title: 'Individual Worker Assignment',
                color: '#3B82F6',
                desc:  'A searchable worker selector for highly granular access control. Useful for project-specific health monitors who should only see a specific subset of workers regardless of crew assignment.',
                tip:   'Individual assignments are additive — if a worker is in an assigned crew AND individually assigned, they are still seen only once.',
              },
            ].map(({ num, title, color, desc, tip }) => (
              <div key={num} className="flex gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-[11px] font-bold"
                  style={{ backgroundColor: color }}
                >
                  {num}
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-900">{title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
                  <div className="flex items-start gap-1.5 pt-0.5">
                    <Lightbulb className="w-3 h-3 text-[#00D15A] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#007A38] leading-relaxed">{tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Callout type="tip" title="Scope is Additive">
            An admin's effective scope is the union of all three layers. Saving assignments takes
            effect immediately — the admin's data view updates on their next API request with no
            re-login required. A success toast confirms the save.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Two-Factor Authentication</SectionHeading>
          <Body>
            The Platform Access table displays each admin's 2FA enrollment status as either
            Enabled or Off. Super Admins can enforce 2FA organization-wide from the
            Organization Settings tab.
          </Body>
          <Callout type="warning" title="2FA Lockout on Enforcement">
            Once 2FA is enforced organization-wide, any admin without it enabled will be locked
            out at their next login and presented with the mandatory enrollment flow. Notify
            affected users before enabling enforcement to avoid disrupting active shift monitoring.
          </Callout>
        </ArticleSection>
      </div>
    ),
  },

  // ── 7. Toolbox Command Center ─────────────────────────────────────
  {
    id:        'toolbox',
    title:     'Toolbox Command Center',
    icon:      Wrench,
    shortDesc: 'Pre-shift briefings, MSDS sheets, emergency protocol library, toolbox talks, and crew task allocation — all in one command surface.',
    readTime:  '6 min read',
    tag:       'Operations',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="tip" title="Quick Summary">
            The Toolbox Command Center is the operational nerve center for site supervisors.
            It consolidates every pre-shift safety resource — briefings, chemical sheets, heat
            protocols, and crew assignments — into a single, searchable panel accessible before
            boots hit the ground.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>What's in the Toolbox</SectionHeading>
          <Body>
            The Toolbox is organized into five resource categories. Each category is searchable
            and filterable by site, crew, and task type.
          </Body>
          <DataTable
            headers={['Category', 'What It Contains', 'Who Uses It']}
            rows={[
              [
                <span className="font-semibold text-slate-800">Pre-Shift Briefings</span>,
                'Structured digital sign-off sheets covering today\'s WBGT forecast, work zone heat risk ratings, mandatory rest schedules, and emergency muster points.',
                'Site Supervisors, Crew Leads',
              ],
              [
                <span className="font-semibold text-slate-800">MSDS / SDS Sheets</span>,
                'Material Safety Data Sheets for all chemicals on site. Searchable by product name, CAS number, or supplier. Auto-linked to active work zones.',
                'HSE Officers, Medics',
              ],
              [
                <span className="font-semibold text-slate-800">Emergency Protocols</span>,
                'Step-by-step heat stroke response, mass-casualty triage, site evacuation maps, and emergency contact trees — all printable in one click.',
                'All roles',
              ],
              [
                <span className="font-semibold text-slate-800">Toolbox Talks</span>,
                'A library of 60+ HSE micro-briefings (3–5 min each). Topics include hydration discipline, wearable device usage, and buddy-check procedures.',
                'Site Supervisors, Crew Leads',
              ],
              [
                <span className="font-semibold text-slate-800">Task Allocation</span>,
                'Crew-level work assignment board. Assign specific heavy-labor tasks to time windows that avoid predicted Critical WBGT periods.',
                'Site Supervisors',
              ],
            ]}
          />
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Running a Pre-Shift Briefing</SectionHeading>
          <Body>
            Pre-Shift Briefings must be completed before any worker logs their first heat
            reading of the day. The platform blocks wearable activation until the assigned
            crew lead marks the briefing complete.
          </Body>
          <StepList steps={[
            {
              title: 'Open today\'s briefing template',
              body: 'Navigate to Toolbox → Pre-Shift Briefings. A new template is auto-generated each day at 04:30 using that morning\'s WBGT forecast, site-specific risk scores, and any carry-over incidents from the previous shift.',
            },
            {
              title: 'Review heat risk rating with the crew',
              body: 'The template opens with a color-coded WBGT risk banner for the shift window. Walk the crew through any amber or red zones and confirm which work areas are cleared for activity.',
            },
            {
              title: 'Confirm rest and hydration schedule',
              body: 'The system recommends a rest schedule based on today\'s forecast. Supervisors can accept the recommendation or override individual time blocks — overrides are logged and auditable.',
            },
            {
              title: 'Collect digital sign-offs',
              body: 'Each worker signs via the HeatGuard mobile app. Unsigned workers appear as "Pending" in the briefing status panel. Workers cannot complete wearable pairing until their signature is captured.',
            },
            {
              title: 'Submit and archive',
              body: 'Tap "Complete Briefing." The signed record is timestamped, encrypted, and stored in the compliance archive for 7 years — automatically satisfying OSHA 29 CFR 1910.132 and UAE MOHRE heat work regulations.',
            },
          ]} />
          <Callout type="warning" title="Briefing Expiry">
            Pre-Shift Briefings expire at 11:59 PM on the day they are created. If a night
            shift starts after midnight, a new briefing must be generated for that shift — the
            previous day's completion record does not carry over.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Toolbox Talks Library</SectionHeading>
          <Body>
            Toolbox Talks are short, scripted safety micro-briefings. Each talk has a
            duration, a recommended audience, and a knowledge-check quiz that can be
            optionally enabled for compliance tracking.
          </Body>
          <DataTable
            headers={['Talk Topic', 'Duration', 'Recommended Cadence']}
            rows={[
              ['Heat Stroke Recognition & First Response', '4 min', 'Weekly in summer months'],
              ['Hydration Science — Why Water Isn\'t Enough', '3 min', 'Monthly'],
              ['Buddy Check Procedures', '5 min', 'Start of every new work gang'],
              ['Wearable Device Care & Battery Management', '3 min', 'Quarterly or after device incident'],
              ['Emergency Muster & Evacuation Drill', '8 min', 'Monthly'],
              ['WBGT Explained — What the Numbers Mean', '4 min', 'Onboarding only'],
            ]}
          />
          <Callout type="info" title="Scheduling a Talk">
            Talks can be pre-scheduled to appear automatically in tomorrow's Pre-Shift Briefing
            template. Open any talk → tap "Schedule" → choose the date and target crew. The talk
            becomes a required section in that day's briefing.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Task Allocation &amp; Heat-Aware Scheduling</SectionHeading>
          <Body>
            The Task Allocation board overlays your crew's work assignments against today's
            predicted WBGT curve, flagging any high-labor tasks scheduled during predicted
            Critical windows.
          </Body>
          <DefList items={[
            {
              term: 'Heat-Safe Windows',
              def:  'Time blocks where predicted WBGT is below 32°C. Heavy tasks (concrete pouring, scaffolding erection) should be concentrated here — typically 05:30–09:00.',
              accent: '#00D15A',
            },
            {
              term: 'Elevated Windows',
              def:  'WBGT 32–38°C. Moderate-intensity tasks only. Mandatory 15-min rest per 45-min work cycle. Wearables will prompt workers automatically.',
              accent: '#F97316',
            },
            {
              term: 'Critical Windows',
              def:  'WBGT ≥ 38°C. No heavy or moderate tasks permitted. Only inspection, documentation, and shade-based work allowed. The platform will block wearable green status for any worker attempting heavy-task sign-off.',
              accent: '#EF4444',
            },
          ]} />
        </ArticleSection>
      </div>
    ),
  },

  // ── 8. IoT Device Fleet Management ───────────────────────────────
  {
    id:        'iot-fleet',
    title:     'IoT Device Fleet Management',
    icon:      Cpu,
    shortDesc: 'Wearable device registry, battery & signal health dashboard, pairing new devices, over-the-air firmware updates, and decommissioning.',
    readTime:  '7 min read',
    tag:       'Hardware',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="tip" title="Quick Summary">
            IoT Device Fleet Management gives you a live view of every wearable on your site:
            battery level, signal strength, firmware version, and assignment status. Pair new
            devices in under 90 seconds and push OTA firmware updates to the entire fleet
            in one operation.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Fleet Health Dashboard</SectionHeading>
          <Body>
            The Fleet Dashboard opens with a summary row showing total registered devices,
            devices active on shift, devices low on battery, and devices with no recent heartbeat.
            Below the summary, each device appears as a card with live telemetry.
          </Body>
          <DataTable
            headers={['Indicator', 'Meaning', 'Action Required']}
            rows={[
              [
                <StatusPill label="Online" color="#00D15A" />,
                'Device heartbeat received within the last 90 seconds',
                'None',
              ],
              [
                <StatusPill label="Idle" color="#94A3B8" />,
                'Device is powered on but worker has not started a shift session',
                'Confirm worker has checked in via app',
              ],
              [
                <StatusPill label="Low Battery" color="#F97316" />,
                'Battery below 20%. Device will auto-transmit a low-battery alert to the assigned supervisor.',
                'Deploy replacement device before next shift segment',
              ],
              [
                <StatusPill label="Signal Weak" color="#F59E0B" />,
                'RSSI below threshold — device is at the edge of mesh coverage',
                'Check nearest mesh gateway. Worker may need to move closer to a repeater node.',
              ],
              [
                <StatusPill label="No Heartbeat" color="#EF4444" />,
                'No data received for 3+ minutes. Device may be powered off, damaged, or out of mesh range.',
                'Supervisor must physically locate worker. Treat as potential incident until confirmed safe.',
              ],
              [
                <StatusPill label="Firmware Update" color="#6366F1" />,
                'An OTA firmware update is pending or in progress',
                'Do not power off the device. Update completes in 2–4 minutes.',
              ],
            ]}
          />
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Pairing a New Wearable</SectionHeading>
          <Body>
            New HeatGuard wearables arrive pre-provisioned with a device certificate.
            Pairing is a two-step process: physical NFC tap, then platform assignment.
            The entire flow takes under 90 seconds.
          </Body>
          <StepList steps={[
            {
              title: 'Power on the device',
              body: 'Hold the power button for 3 seconds until the LED pulses cyan — this indicates Bluetooth and NFC are in pairing mode. The device will remain in pairing mode for 5 minutes before returning to idle.',
            },
            {
              title: 'Open Fleet Management → "Pair New Device"',
              body: 'On the web dashboard, navigate to IoT Device Fleet → tap "Pair New Device" in the top-right corner. A QR code and NFC-ready prompt will appear.',
            },
            {
              title: 'Tap the device to a pairing tablet or scan the QR code',
              body: 'Hold the wearable\'s NFC zone (back panel) to the site pairing tablet, OR open the HeatGuard mobile app on any enrolled supervisor device and scan the QR code. The device ID and certificate fingerprint will appear on screen for confirmation.',
            },
            {
              title: 'Assign to a worker profile',
              body: 'Select the worker from the searchable dropdown. The platform cross-checks the worker\'s pre-shift briefing status and active certifications before confirming assignment.',
            },
            {
              title: 'Confirm and activate',
              body: 'Tap "Confirm Pairing." The device LED turns solid green. The worker now appears on the Live Site Map with a cyan "New Device" badge for the first 15 minutes of the shift.',
            },
          ]} />
          <Callout type="info" title="Bulk Pairing">
            For new site deployments or crew expansions, use "Bulk Pair" mode. Pre-import
            a worker CSV, then pair devices sequentially — each tap auto-assigns to the next
            worker in the import list. Bulk pairing supports up to 50 devices in a single session.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Over-the-Air Firmware Updates</SectionHeading>
          <Body>
            HeatGuard releases firmware updates approximately once per quarter. Updates include
            sensor calibration improvements, battery optimization, and new biometric detection
            algorithms. OTA updates are delivered automatically but can also be triggered manually.
          </Body>
          <DefList items={[
            {
              term: 'Automatic Updates',
              def:  'Updates are pushed to all devices during the overnight window (02:00–04:00 site local time) when no active shift is registered. The update downloads to flash storage first; the device reboots to apply only after confirming no active heartbeat session.',
              accent: '#06B6D4',
            },
            {
              term: 'Manual Force Update',
              def:  'Go to Fleet Management → select one or more devices → "Push Firmware Update." A confirmation modal shows the target version, estimated update time (2–4 min), and warns if any selected devices are currently active on a shift.',
              accent: '#06B6D4',
            },
            {
              term: 'Rollback',
              def:  'If a firmware version causes sensor anomalies, Super Admins can roll back individual devices or the full fleet to the previous stable version from the Firmware History tab.',
              accent: '#06B6D4',
            },
          ]} />
          <Callout type="danger" title="Never Update During Active Shifts">
            Forcing a firmware update on a device with an active shift session will terminate
            the biometric stream for 2–4 minutes. During this window, the device sends no
            heartbeat and will appear as "No Heartbeat" on the Live Map — potentially triggering
            false welfare checks. Schedule all manual updates during non-shift hours.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Decommissioning a Device</SectionHeading>
          <Body>
            Devices that are damaged, lost, or end-of-life should be decommissioned immediately
            to prevent stale data from appearing on the Live Map.
          </Body>
          <StepList steps={[
            {
              title: 'Open the device record in Fleet Management',
              body: 'Search by serial number or scan the device barcode. Open the device card.',
            },
            {
              title: 'Select "Decommission Device"',
              body: 'Choose a decommission reason: Damaged, Lost/Stolen, End of Life, or Recalled. This reason is stored in the audit log.',
            },
            {
              title: 'Revoke device certificate',
              body: 'Confirming decommission immediately revokes the device\'s TLS certificate. Even if the device powers on, it cannot transmit data to the platform. The device ID is retired and cannot be reassigned.',
            },
          ]} />
        </ArticleSection>
      </div>
    ),
  },

  // ── 9. Field Workers (IoT Fleet) > Integrations & Sync ───────────
  {
    id:        'integrations',
    title:     'Integrations & Sync',
    icon:      Plug,
    shortDesc: 'HR system imports, ERP workforce data, biometric sync cadence, third-party PPE platforms, and API webhook configuration.',
    readTime:  '5 min read',
    tag:       'Integration',
    content: (
      <div className="space-y-8">
        <ArticleSection>
          <Callout type="tip" title="Quick Summary">
            HeatGuard connects to your existing HR, ERP, and PPE platforms so worker profiles,
            certifications, and shift data stay in sync automatically. Integrations are
            configured per-site and can be tested in a sandbox environment before going live.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Available Integrations</SectionHeading>
          <DataTable
            headers={['Integration', 'Data Direction', 'Sync Type', 'Status']}
            rows={[
              [
                <span className="font-semibold text-slate-800">SAP SuccessFactors</span>,
                'HR → HeatGuard',
                'Scheduled (every 4 hrs)',
                <StatusPill label="GA" color="#00D15A" />,
              ],
              [
                <span className="font-semibold text-slate-800">Oracle HCM Cloud</span>,
                'HR → HeatGuard',
                'Webhook (real-time)',
                <StatusPill label="GA" color="#00D15A" />,
              ],
              [
                <span className="font-semibold text-slate-800">BambooHR</span>,
                'HR → HeatGuard',
                'Scheduled (daily)',
                <StatusPill label="GA" color="#00D15A" />,
              ],
              [
                <span className="font-semibold text-slate-800">Procore (ERP)</span>,
                'ERP → HeatGuard',
                'Scheduled (per shift)',
                <StatusPill label="GA" color="#00D15A" />,
              ],
              [
                <span className="font-semibold text-slate-800">Honeywell Connected PPE</span>,
                'PPE → HeatGuard',
                'Real-time stream',
                <StatusPill label="Beta" color="#6366F1" />,
              ],
              [
                <span className="font-semibold text-slate-800">Custom Webhook / REST API</span>,
                'Bidirectional',
                'Push (event-driven)',
                <StatusPill label="GA" color="#00D15A" />,
              ],
            ]}
          />
          <Callout type="info" title="Integration Sandbox">
            Every integration can be toggled to "Sandbox Mode" in Settings → Integrations.
            In sandbox mode, incoming data is validated and previewed but not committed to
            live worker profiles — ideal for testing a new HR connector before activating it.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Connecting a New HR Integration</SectionHeading>
          <StepList steps={[
            {
              title: 'Go to Settings → Integrations → "Add New"',
              body: 'Select your HR platform from the integration catalog. Each connector has its own documentation link with the exact API scopes and permissions required in your HR system.',
            },
            {
              title: 'Authorize HeatGuard in your HR platform',
              body: 'For OAuth2-based integrations (SAP, Oracle, BambooHR): you will be redirected to your HR provider\'s authorization page. Grant read access to employee records, employment status, and org unit hierarchy.',
            },
            {
              title: 'Configure field mapping',
              body: 'Map your HR system\'s field names to HeatGuard\'s worker profile schema. Required mappings: Employee ID → Worker ID, First Name, Last Name, Role/Job Title, Department → Crew Assignment, and Site → Work Site.',
            },
            {
              title: 'Run a test sync',
              body: 'Tap "Test Sync." HeatGuard pulls the first 10 worker records and displays a preview table showing what will be created or updated. Verify the mapping is correct before proceeding.',
            },
            {
              title: 'Activate the integration',
              body: 'Toggle the integration to "Active." The first full sync runs immediately. Subsequent syncs follow the configured schedule. A sync log is available under the integration card showing each run\'s record count and any mapping errors.',
            },
          ]} />
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Synced Worker Profile Fields</SectionHeading>
          <Body>
            These are the fields HeatGuard reads from your HR system. Fields marked as
            Required must be present on every worker record for the sync to succeed.
          </Body>
          <DefList items={[
            {
              term: 'Worker ID (Required)',
              def:  'Your HR system\'s unique employee identifier. Used as the deduplication key — if a Worker ID already exists in HeatGuard, the record is updated rather than duplicated.',
              accent: '#6366F1',
            },
            {
              term: 'Full Name (Required)',
              def:  'First and last name. Used in all worker-facing views, incident reports, and compliance records.',
              accent: '#6366F1',
            },
            {
              term: 'Job Title',
              def:  'Synchronized to the Worker\'s profile and shown on the Live Map worker info panel. Used by the heat-risk engine to apply appropriate WBGT thresholds based on labor intensity.',
              accent: '#6366F1',
            },
            {
              term: 'Crew / Department',
              def:  'Maps to a HeatGuard Work Group. Workers are automatically added to the correct crew on the Live Map and assigned the crew\'s briefing template.',
              accent: '#6366F1',
            },
            {
              term: 'Employment Status',
              def:  'Active employees are synced as active workers. Terminated or on-leave employees are automatically deactivated — their wearable pairings are suspended and they no longer appear in compliance counts.',
              accent: '#6366F1',
            },
            {
              term: 'Emergency Contact',
              def:  'Name and phone number. Pre-populated into the Tele-Triage emergency dispatch modal so nurses don\'t need to look this up during an incident.',
              accent: '#6366F1',
            },
            {
              term: 'Medical History',
              def:  'Pre-existing conditions relevant to heat-stress risk — e.g. hypertension, diabetes, cardiovascular conditions, prior heat illness episodes. Synced from occupational health records and surfaced exclusively to assigned Medics and nurses during Tele-Triage sessions. This field is never visible to site supervisors or crew leads.',
              accent: '#6366F1',
            },
          ]} />
          <Callout type="warning" title="PII Handling">
            Worker profile data from HR integrations is classified as Personally Identifiable
            Information (PII). HeatGuard encrypts all synced fields at rest (AES-256) and in
            transit (TLS 1.3). Do not map fields containing passport numbers, national IDs,
            or salary data — these are blocked by the platform's field allowlist and will
            cause sync errors if attempted.
          </Callout>
        </ArticleSection>

        <ArticleSection>
          <SectionHeading>Webhook Configuration (Custom Integrations)</SectionHeading>
          <Body>
            For systems not covered by a native connector, HeatGuard provides a REST API
            and outbound webhook system. Webhooks deliver real-time event payloads to any
            HTTPS endpoint you control.
          </Body>
          <DataTable
            headers={['Event', 'Trigger', 'Payload Includes']}
            rows={[
              [
                'worker.status_changed',
                'Worker heat-risk status transitions (Safe → Caution → Critical)',
                'Worker ID, old status, new status, WBGT reading, GPS coordinates, timestamp',
              ],
              [
                'incident.created',
                'New incident opened (SOS, heat breach, missed check-in)',
                'Incident ID, severity, worker ID, incident type, site ID, timestamp',
              ],
              [
                'incident.resolved',
                'Incident marked resolved by supervisor',
                'Incident ID, resolved_by, resolution notes, duration (open → closed)',
              ],
              [
                'device.no_heartbeat',
                'Wearable heartbeat silent for 3+ minutes',
                'Device serial, worker ID, last seen timestamp, GPS last known',
              ],
              [
                'briefing.completed',
                'Pre-Shift Briefing marked complete by crew lead',
                'Briefing ID, crew, worker sign-off count, unsigned workers list, timestamp',
              ],
            ]}
          />
          <Callout type="info" title="Webhook Security">
            Every webhook request includes an <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">X-HeatGuard-Signature</code> header —
            an HMAC-SHA256 of the payload body signed with your webhook secret. Always verify
            this signature server-side before processing the payload.
          </Callout>
        </ArticleSection>
      </div>
    ),
  },
]

// ── Sub-components ────────────────────────────────────────────────

function ArticleCard({ article, onClick }: { article: Article; onClick: () => void }) {
  const c    = COLORS[article.id]
  const Icon = article.icon
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 overflow-hidden"
    >
      {/* Color bar */}
      <div className="h-1 w-full" style={{ backgroundColor: c.accent }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.iconBg)}>
            <Icon className="w-5 h-5" style={{ color: c.accent }} />
          </div>
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', c.badge)}>
            {article.tag}
          </span>
        </div>

        {/* Title + desc */}
        <h3 className="text-sm font-bold text-slate-900 mb-1.5">{article.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">{article.shortDesc}</p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            {article.readTime}
          </div>
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold group-hover:gap-2 transition-all"
            style={{ color: c.accent }}
          >
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </button>
  )
}

// ── Hub View ──────────────────────────────────────────────────────

function HubView({
  onSelect,
  searchQuery,
  onSearch,
}: {
  onSelect:    (a: Article) => void
  searchQuery: string
  onSearch:    (q: string) => void
}) {
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return articles
    return articles.filter(
      a =>
        a.title.toLowerCase().includes(q) ||
        a.shortDesc.toLowerCase().includes(q) ||
        a.tag.toLowerCase().includes(q)
    )
  }, [searchQuery])

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E3FAED] border border-[#00D15A]/30 mb-5">
          <BookOpen className="w-3.5 h-3.5 text-[#00D15A]" />
          <span className="text-[11px] font-bold text-[#007A38] uppercase tracking-wider">HeatGuard Docs</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Support Center</h1>
        <p className="text-slate-500 mt-2 text-base max-w-md mx-auto">
          Platform documentation, feature guides, and operational procedures for your team.
        </p>

        {/* Search */}
        <div className="relative mt-8 max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles, features, workflows..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-12 pr-10 py-4 rounded-2xl border border-slate-200 bg-white text-slate-800 text-sm placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00D15A]/30 focus:border-[#00D15A]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-6 mt-6">
          {[
            { label: 'Articles',  value: articles.length },
            { label: 'Features',  value: '18+' },
            { label: 'Modules',   value: '9' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="p-8">
        {searchQuery && (
          <p className="text-sm text-slate-500 mb-4">
            {filtered.length === 0
              ? `No articles found for "${searchQuery}"`
              : `${filtered.length} article${filtered.length !== 1 ? 's' : ''} matching "${searchQuery}"`}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No articles match your search.</p>
            <button onClick={() => onSearch('')} className="mt-3 text-sm text-[#00D15A] font-semibold hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <>
            {!searchQuery && (
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                All Documentation
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(article => (
                <ArticleCard key={article.id} article={article} onClick={() => onSelect(article)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Article View ──────────────────────────────────────────────────

function ArticleView({
  active,
  onSelect,
  onBack,
}: {
  active:   Article
  onSelect: (a: Article) => void
  onBack:   () => void
}) {
  const c = COLORS[active.id]

  return (
    <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col overflow-hidden">
        {/* Back button */}
        <div className="px-4 py-3.5 border-b border-slate-200">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Help Center
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          <p className="px-4 pt-2 pb-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            Documentation
          </p>
          {articles.map(a => {
            const isActive = a.id === active.id
            const Icon     = a.icon
            const ac       = COLORS[a.id]
            return (
              <button
                key={a.id}
                onClick={() => onSelect(a)}
                className={cn(
                  'w-full text-left flex items-center gap-2.5 px-3 py-2.5 mx-1 rounded-lg text-xs transition-all',
                  isActive
                    ? 'font-bold text-slate-900 bg-white shadow-sm border border-slate-200'
                    : 'font-medium text-slate-500 hover:text-slate-800 hover:bg-white/60',
                )}
                style={{ width: 'calc(100% - 8px)' }}
              >
                {/* Active accent bar */}
                <div
                  className="w-0.5 h-4 rounded-full shrink-0 transition-all"
                  style={{ backgroundColor: isActive ? ac.accent : 'transparent' }}
                />
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: isActive ? ac.accent : undefined }}
                />
                <span className="truncate">{a.title}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto shrink-0 text-slate-400" />}
              </button>
            )
          })}
        </nav>

        {/* Bottom promo */}
        <div className="p-3 border-t border-slate-200">
          <div className="bg-[#E3FAED] rounded-xl p-3 text-center">
            <p className="text-[10px] font-bold text-[#007A38] mb-0.5">Need direct support?</p>
            <p className="text-[10px] text-[#007A38]/70 mb-2">Our HSE specialists are available 24/7 during site hours.</p>
            <button className="w-full py-1.5 rounded-lg bg-[#00D15A] text-white text-[10px] font-bold hover:bg-[#00b84f] transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        {/* Article header banner */}
        <div
          className="px-8 py-6 border-b"
          style={{ backgroundColor: c.accent + '0C', borderColor: c.accent + '25' }}
        >
          <div className="max-w-3xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3">
              <button onClick={onBack} className="hover:text-slate-700 transition-colors">Help Center</button>
              <ChevronRight className="w-3 h-3" />
              <span style={{ color: c.accent }} className="font-semibold">{active.title}</span>
            </div>

            {/* Title row */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: c.accent + '20' }}
              >
                <active.icon className="w-5 h-5" style={{ color: c.accent }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">{active.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', c.badge)}>
                    {active.tag}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />{active.readTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="max-w-3xl">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              {active.content}
            </div>

            {/* Next article */}
            {(() => {
              const idx  = articles.findIndex(a => a.id === active.id)
              const next = articles[idx + 1]
              if (!next) return null
              const nc   = COLORS[next.id]
              return (
                <button
                  onClick={() => onSelect(next)}
                  className="mt-6 w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Up Next</p>
                    <p className="text-sm font-bold text-slate-800">{next.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{next.readTime}</p>
                  </div>
                  <ArrowRight
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0"
                    style={{ color: nc.accent }}
                  />
                </button>
              )
            })()}
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Page root ─────────────────────────────────────────────────────

export default function DocsPage({ embedded = false }: { embedded?: boolean }) {
  const [activeArticle, setActiveArticle] = useState<Article | null>(null)
  const [searchQuery,   setSearchQuery]   = useState('')

  function handleSelect(a: Article) {
    setActiveArticle(a)
    setSearchQuery('')
    // Scroll article content back to top
    setTimeout(() => {
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  }

  return (
    <div
      className={embedded
        ? 'flex flex-col rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white'
        : '-m-5 lg:-m-6 flex flex-col'
      }
      style={{ height: embedded ? 'calc(100vh - 220px)' : 'calc(100vh - 56px)' }}
    >
      {activeArticle ? (
        <ArticleView
          active={activeArticle}
          onSelect={handleSelect}
          onBack={() => setActiveArticle(null)}
        />
      ) : (
        <div className="overflow-y-auto flex-1">
          <HubView
            onSelect={handleSelect}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
          />
        </div>
      )}
    </div>
  )
}
