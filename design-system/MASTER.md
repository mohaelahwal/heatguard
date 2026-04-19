# HeatGuard Design System — MASTER.md
> Global Source of Truth for all UI/UX decisions across HeatGuard.
> Page-specific overrides live in `design-system/pages/[page].md` and take priority.

---

## 1. Design Tokens

### 1.1 Color Palette

| Token | Hex | Tailwind Class | Usage |
|-------|-----|----------------|-------|
| `brand-primary` | `#00D15A` | `bg-[#00D15A]` | Primary buttons, active nav, Safe badges, positive indicators |
| `brand-forest` | `#0B281F` | `bg-[#0B281F]` | Sidebar background, dark header bars |
| `brand-forest-light` | `#0f3728` | `bg-[#0f3728]` | Sidebar hover states |
| `brand-forest-border` | `#1a4a36` | `border-[#1a4a36]` | Sidebar section dividers |
| `surface-page` | `#F7F9F8` | `bg-[#F7F9F8]` | Main content area background |
| `surface-card` | `#FFFFFF` | `bg-white` | Card backgrounds |
| `danger` | `#FF3B30` | `bg-[#FF3B30]` | Critical alerts, SOS, heat danger |
| `danger-bg` | `#FFF1F0` | `bg-[#FFF1F0]` | Danger badge background |
| `danger-border` | `#FFCDD0` | `border-[#FFCDD0]` | Danger card borders |
| `warning` | `#FFCC00` | `bg-[#FFCC00]` | Caution states, medium heat alerts |
| `warning-bg` | `#FFFBEB` | `bg-[#FFFBEB]` | Warning badge background |
| `warning-border` | `#FDE68A` | `border-[#FDE68A]` | Warning card borders |
| `safe-bg` | `#F0FDF4` | `bg-[#F0FDF4]` | Safe badge background |
| `safe-border` | `#BBF7D0` | `border-[#BBF7D0]` | Safe card borders |
| `text-primary` | `#111827` | `text-gray-900` | Primary body text, headings |
| `text-secondary` | `#6B7280` | `text-gray-500` | Labels, timestamps, meta |
| `text-sidebar` | `#A3B8AF` | `text-[#A3B8AF]` | Inactive sidebar nav items |
| `text-sidebar-active` | `#FFFFFF` | `text-white` | Active sidebar nav items |
| `border-default` | `#E5E7EB` | `border-gray-200` | Default card/input borders |
| `border-light` | `#F3F4F6` | `border-gray-100` | Subtle separators |

### 1.2 Semantic Status Colors

| Status | Background | Text | Border | Usage |
|--------|-----------|------|--------|-------|
| `safe` / `active` | `bg-green-100` | `text-green-700` | — | Worker OK, low heat index |
| `caution` / `on_break` | `bg-yellow-100` | `text-yellow-700` | — | Worker on break, medium heat |
| `alert` / `high` | `bg-orange-100` | `text-orange-700` | — | High heat, worker flagged |
| `critical` / `sos` | `bg-red-100` | `text-red-700` | — | SOS, extreme heat, medical |
| `offline` | `bg-gray-100` | `text-gray-500` | — | Worker disconnected |

### 1.3 Heat Index Severity Colors

| Severity | Heat Index | Color | Tailwind |
|----------|-----------|-------|----------|
| Low (Caution) | < 32°C | `#00D15A` | `text-[#00D15A]` |
| Medium (Warning) | 32–41°C | `#FFCC00` | `text-[#FFCC00]` |
| High (Danger) | 41–54°C | `#FF6B00` | `text-orange-500` |
| Critical (Extreme) | ≥ 54°C | `#FF3B30` | `text-[#FF3B30]` |

---

## 2. Typography

### 2.1 Font Stack

```css
font-family: 'Inter', 'SF Pro Text', system-ui, -apple-system, sans-serif;
```

Configure in `tailwind.config.ts`:
```ts
fontFamily: { sans: ['var(--font-inter)', 'system-ui', 'sans-serif'] }
```

### 2.2 Type Scale

| Role | Size | Weight | Class | Usage |
|------|------|--------|-------|-------|
| Page title | 24px | 700 | `text-2xl font-bold tracking-tight` | Dashboard section headers |
| Section header | 18px | 600 | `text-lg font-semibold` | Card titles |
| Body | 14px | 400 | `text-sm` | Standard content |
| Body large | 16px | 400 | `text-base` | Description text |
| Label | 12px | 500 | `text-xs font-medium` | Form labels, badges |
| Metric large | 32px | 700 | `text-4xl font-bold tabular-nums` | Live worker count, big stats |
| Metric medium | 24px | 700 | `text-2xl font-bold tabular-nums` | Heat index display |
| Metric small | 18px | 600 | `text-lg font-semibold tabular-nums` | Card stats |
| Sidebar nav | 13px | 500 | `text-[13px] font-medium` | Sidebar navigation items |
| Timestamp | 11px | 400 | `text-[11px] text-gray-400` | Last seen, recorded at |

---

## 3. Spacing & Layout

### 3.1 Layout Grid (Dashboard)

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar (240px fixed)  │  Main Content (flex-1)            │
│  bg-[#0B281F]           │  bg-[#F7F9F8]                     │
│                         │  ┌──────────────────────────────┐ │
│  Logo (h-16)            │  │ Header (h-16, bg-white)      │ │
│  ─────────────          │  └──────────────────────────────┘ │
│  Nav Items              │  ┌──────────────────────────────┐ │
│                         │  │ Page Content (p-6, overflow) │ │
│  ─────────────          │  └──────────────────────────────┘ │
│  User Profile (bottom)  │                                   │
└─────────────────────────────────────────────────────────────┘
```

**Sidebar:** `w-60 min-h-screen flex-shrink-0 flex flex-col bg-[#0B281F]`
**Main wrapper:** `flex-1 flex flex-col min-h-screen overflow-hidden`
**Header:** `h-16 bg-white border-b border-gray-100 flex items-center px-6 flex-shrink-0`
**Content area:** `flex-1 overflow-y-auto p-6 bg-[#F7F9F8]`

### 3.2 Content Grid

```
12-column grid with gap-6:
  - Stats row:        4× col-span-3  (1/4 width each)
  - Worker grid:      col-span-8 + col-span-4
  - Analytics row:    col-span-7 + col-span-5
  - Full width:       col-span-12
```

Tailwind: `grid grid-cols-12 gap-6`

### 3.3 Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| Page padding | `p-6` (24px) | Content area padding |
| Card padding | `p-5` (20px) | Standard card inner padding |
| Card padding lg | `p-6` (24px) | Large cards / analytics |
| Section gap | `gap-6` (24px) | Between grid cards |
| Item gap | `gap-3` (12px) | Between list items |
| Icon gap | `gap-2` (8px) | Icon + text pairs |

---

## 4. Border Radius

| Component | Class | Value |
|-----------|-------|-------|
| Primary button (pill) | `rounded-full` | 9999px |
| Cards | `rounded-3xl` | 24px |
| Modals / panels | `rounded-2xl` | 16px |
| Input fields | `rounded-xl` | 12px |
| Badges | `rounded-full` | 9999px |
| Alert banners | `rounded-2xl` | 16px |
| Avatar | `rounded-full` | circle |
| Table rows | `rounded-xl` | 12px (use on container) |
| Sidebar nav item | `rounded-xl` | 12px |

---

## 5. Shadows & Elevation

| Level | Class | Usage |
|-------|-------|-------|
| Card default | `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` | Standard data cards |
| Card hover | `shadow-[0_12px_40px_rgb(0,0,0,0.08)]` | Interactive card hover |
| Primary button | `shadow-lg shadow-[#00D15A]/30` | CTA buttons |
| Danger button | `shadow-lg shadow-red-500/40` | SOS / alert buttons |
| Modal | `shadow-2xl` | Modals, popovers |
| Header | `shadow-[0_1px_0_0_#E5E7EB]` | Top navigation bar |
| Dropdown | `shadow-[0_8px_24px_rgb(0,0,0,0.12)]` | Dropdowns, tooltips |

---

## 6. Component Specifications

### 6.1 Sidebar Navigation

```tsx
// Sidebar wrapper
<aside className="w-60 min-h-screen flex flex-col bg-[#0B281F] flex-shrink-0">

  {/* Logo area */}
  <div className="h-16 flex items-center px-5 border-b border-[#1a4a36]">
    <span className="text-white font-bold text-lg tracking-tight">HeatGuard</span>
  </div>

  {/* Nav items */}
  <nav className="flex-1 px-3 py-4 space-y-1">
    {/* Active state */}
    <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#00D15A]/20 text-white text-[13px] font-medium cursor-pointer transition-colors">
      <Icon className="w-4 h-4 text-[#00D15A]" />
      Overview
      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D15A]" />
    </a>
    {/* Inactive state */}
    <a className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[#A3B8AF] text-[13px] font-medium hover:bg-[#0f3728] hover:text-white cursor-pointer transition-colors">
      <Icon className="w-4 h-4" />
      Workers
    </a>
  </nav>

  {/* Bottom user section */}
  <div className="p-3 border-t border-[#1a4a36]">
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#0f3728] cursor-pointer transition-colors">
      <Avatar className="w-7 h-7 rounded-full bg-[#00D15A]/20" />
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">Manager Name</p>
        <p className="text-[#A3B8AF] text-[11px] truncate">Site Name</p>
      </div>
    </div>
  </div>
</aside>
```

### 6.2 Header Bar

```tsx
<header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
  {/* Left: Page title + site breadcrumb */}
  <div>
    <h1 className="text-gray-900 font-semibold text-base leading-none">Overview</h1>
    <p className="text-gray-500 text-xs mt-0.5">Palm Jebel Ali — Site A</p>
  </div>

  {/* Right: stats + actions */}
  <div className="flex items-center gap-4">
    {/* Live worker count */}
    <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
      <span className="w-2 h-2 rounded-full bg-[#00D15A] animate-pulse" />
      <span className="text-green-700 text-xs font-semibold">24 Online</span>
    </div>
    {/* Notification bell */}
    <button className="relative p-2 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors" aria-label="Notifications">
      <BellIcon className="w-5 h-5 text-gray-500" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF3B30] rounded-full" />
    </button>
    {/* Avatar */}
    <div className="w-8 h-8 rounded-full bg-[#00D15A]/20 flex items-center justify-center cursor-pointer">
      <span className="text-[#00D15A] text-xs font-bold">MG</span>
    </div>
  </div>
</header>
```

### 6.3 Stat Summary Cards (KPI Row)

```tsx
<div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
  <div className="flex items-center justify-between mb-3">
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Active Workers</p>
    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
      <UsersIcon className="w-4 h-4 text-[#00D15A]" />
    </div>
  </div>
  <p className="text-3xl font-bold text-gray-900 tabular-nums">24</p>
  <p className="text-xs text-gray-400 mt-1">of 30 total on shift</p>
</div>
```

### 6.4 Worker Status Card

```tsx
<div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-shadow cursor-pointer">
  {/* Header row */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-sm text-gray-600">
        GK
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-none">George Kim</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Badge #0042</p>
      </div>
    </div>
    {/* Status badge */}
    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
      Active
    </span>
  </div>
  {/* Metrics row */}
  <div className="grid grid-cols-3 gap-2 mt-3">
    <div className="bg-[#F7F9F8] rounded-xl p-2.5 text-center">
      <p className="text-[11px] text-gray-400 mb-0.5">Heat Idx</p>
      <p className="text-sm font-bold text-[#FF6B00] tabular-nums">38.2°</p>
    </div>
    <div className="bg-[#F7F9F8] rounded-xl p-2.5 text-center">
      <p className="text-[11px] text-gray-400 mb-0.5">Last Break</p>
      <p className="text-sm font-bold text-gray-900 tabular-nums">42m</p>
    </div>
    <div className="bg-[#F7F9F8] rounded-xl p-2.5 text-center">
      <p className="text-[11px] text-gray-400 mb-0.5">GPS</p>
      <p className="text-sm font-bold text-[#00D15A]">Live</p>
    </div>
  </div>
  {/* Footer: last seen */}
  <p className="text-[11px] text-gray-400 mt-3">Last update: 12 seconds ago</p>
</div>
```

### 6.5 Alert Card

```tsx
{/* Critical */}
<div className="bg-[#FFF1F0] border border-[#FFCDD0] rounded-2xl p-4 flex items-start gap-3">
  <div className="w-8 h-8 rounded-full bg-[#FF3B30]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
    <AlertTriangleIcon className="w-4 h-4 text-[#FF3B30]" />
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[#FF3B30] text-[11px] font-bold uppercase tracking-wider">Critical</span>
      <span className="text-[11px] text-gray-400">2m ago</span>
    </div>
    <p className="text-sm font-semibold text-gray-900 mt-0.5">Heat index 55°C — George Kim</p>
    <p className="text-xs text-gray-500 mt-0.5 truncate">Zone B · Palm Jebel Ali</p>
  </div>
  <button className="flex-shrink-0 text-xs text-[#FF3B30] font-semibold hover:underline cursor-pointer">Resolve</button>
</div>

{/* Warning */}
<div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 ...">
  ...
</div>
```

### 6.6 Primary Button

```tsx
<button className="w-full bg-[#00D15A] text-white font-semibold py-4 px-6 rounded-full hover:bg-green-600 transition-colors shadow-lg shadow-[#00D15A]/30 flex items-center justify-center gap-2 cursor-pointer">
  <PlusIcon className="w-4 h-4" />
  Send Broadcast
</button>
```

### 6.7 Secondary/Ghost Button

```tsx
<button className="text-[#00D15A] font-medium py-3 px-6 rounded-full hover:bg-green-50 transition-colors cursor-pointer">
  View All
</button>
```

### 6.8 Danger Button (SOS / Emergency Action)

```tsx
<button className="bg-[#FF3B30] text-white font-bold rounded-full py-3 px-6 shadow-lg shadow-red-500/40 animate-pulse cursor-pointer">
  SOS Alert
</button>
```

### 6.9 Input Field

```tsx
<div className="relative w-full">
  <label className="block text-xs font-medium text-gray-700 mb-1.5">Message</label>
  <input
    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00D15A] focus:border-transparent transition-all"
    placeholder="Type a message..."
  />
</div>
```

### 6.10 Status Badge

```tsx
{/* Safe */}
<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Safe</span>
{/* Warning */}
<span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Caution</span>
{/* Danger */}
<span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Danger</span>
{/* Offline */}
<span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Offline</span>
{/* On Break */}
<span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">On Break</span>
```

### 6.11 Section Panel Container

```tsx
<section className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
  {/* Panel header */}
  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
    <h2 className="text-base font-semibold text-gray-900">Live Alerts</h2>
    <button className="text-[#00D15A] text-xs font-semibold hover:underline cursor-pointer">View All</button>
  </div>
  {/* Panel body */}
  <div className="p-5 space-y-3">
    {/* content */}
  </div>
</section>
```

### 6.12 Data Table Row

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-gray-100">
      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 px-4">Worker</th>
      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 px-4">Status</th>
      <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider pb-3 px-4">Heat Index</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer rounded-xl">
      <td className="py-3 px-4 text-sm text-gray-900 font-medium">George Kim</td>
      <td className="py-3 px-4">
        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
      </td>
      <td className="py-3 px-4 text-sm font-semibold text-orange-500 tabular-nums">38.2°C</td>
    </tr>
  </tbody>
</table>
```

### 6.13 Notification / Toast

```tsx
{/* Realtime alert toast — appears top-right */}
<div className="fixed top-4 right-4 z-50 bg-white rounded-2xl p-4 shadow-[0_8px_24px_rgb(0,0,0,0.12)] border border-red-100 flex items-start gap-3 max-w-sm animate-in slide-in-from-right">
  <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
    <AlertTriangleIcon className="w-4 h-4 text-[#FF3B30]" />
  </div>
  <div>
    <p className="text-sm font-semibold text-gray-900">New Critical Alert</p>
    <p className="text-xs text-gray-500 mt-0.5">George Kim — Heat index 55°C</p>
  </div>
</div>
```

---

## 7. Dashboard Sections — Layout Specs

### 7.1 Navigation Structure (Sidebar)

```
HeatGuard (logo)
─────────────────
Overview          [home icon]
Workers           [users icon]
Alerts            [bell icon]  ← badge with unread count
Analytics         [bar-chart icon]
Map               [map-pin icon]
Messages          [message-circle icon]
─────────────────
Settings          [settings icon]
─────────────────
[User Avatar + Name + Site]
```

### 7.2 Overview Page — Grid Layout

```
Row 1: KPI Stats (4 cards, col-span-3 each)
  [Active Workers] [Alerts Today] [Avg Heat Index] [Break Compliance]

Row 2: Main content
  [Worker Status Grid   col-span-8] [Live Alerts Panel col-span-4]

Row 3: Analytics
  [Heat Index Chart  col-span-7] [Break Compliance col-span-5]
```

### 7.3 Workers Page

```
Header: [Search input] [Filter by status dropdown] [Export button]
Body: Grid 3 columns of Worker Status Cards (6.4)
      OR toggle to Table view (6.12)
```

### 7.4 Alerts Page

```
Header: Filter tabs [All | Critical | High | Medium | Resolved]
Body: Scrollable list of Alert Cards (6.5) with pagination
      Each card: Acknowledge + Resolve actions inline
```

### 7.5 Analytics Page

```
Row 1: Date range picker + site filter
Row 2: [Heat Index over Time — Area Chart  col-span-8] [Heat Distribution — Donut col-span-4]
Row 3: [Symptom Frequency — Horizontal Bar col-span-6] [Break Compliance — Gauge col-span-6]
Row 4: [Worker Activity Table — full width]
```

### 7.6 Map Page

```
Full screen map with floating overlays:
- Sidebar stays visible (left)
- Map fills remainder
- Floating panel (top-right): worker list with GPS coordinates
- Map pins: color-coded by worker status (green/yellow/orange/red)
- Click pin: Worker detail card popup (glassmorphic bg-white/80 backdrop-blur)
```

### 7.7 Messages Page

```
Split panel layout (col-span-4 | col-span-8):
Left:  Conversation list (direct threads + site broadcast)
Right: Message thread + compose area

Compose area:
  - Textarea (rounded-xl)
  - Recipient: [All Workers] [Select Worker ▼] [Select Nurse ▼]
  - [Send Broadcast button — primary pill]
```

---

## 8. Chart Specifications

### 8.1 Heat Index Over Time (Area Chart)

- **Library:** Recharts `AreaChart`
- **Colors:** Gradient fill from `#00D15A20` → `#FF3B3020` based on heat level
- **Line:** `#00D15A` for safe range, transitions to `#FF3B30` at 41°C threshold
- **Threshold line:** Dashed horizontal line at 41°C labeled "Danger Zone"
- **X-axis:** Time (last 8 hours by default)
- **Y-axis:** Temperature °C
- **Interactive:** Hover tooltip with exact reading + timestamp

```tsx
// Recharts AreaChart config
<AreaChart data={readings}>
  <defs>
    <linearGradient id="heatGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#00D15A" stopOpacity={0.15} />
      <stop offset="95%" stopColor="#00D15A" stopOpacity={0} />
    </linearGradient>
  </defs>
  <Area type="monotone" dataKey="heat_index" stroke="#00D15A" fill="url(#heatGradient)" strokeWidth={2} />
  <ReferenceLine y={41} stroke="#FF3B30" strokeDasharray="4 4" label="Danger" />
</AreaChart>
```

### 8.2 Break Compliance (Gauge Chart)

- **Library:** Custom SVG half-circle gauge OR Recharts `RadialBarChart`
- **Colors:** Red → Yellow → Green arc
- **Center text:** Compliance % in `text-4xl font-bold`
- **Below gauge:** "X of Y workers took required breaks"

### 8.3 Symptom Frequency (Horizontal Bar)

- **Library:** Recharts `BarChart` horizontal
- **Colors:** Bars use severity gradient — most reported = `#FF3B30`, least = `#00D15A`
- **Y-axis:** Symptom names
- **X-axis:** Count
- **Max bars:** 8 symptoms

### 8.4 Worker Status Distribution (Donut)

- **Library:** Recharts `PieChart` with `innerRadius`
- **Segments:** Active (#00D15A), On Break (#FFCC00), Alert (#FF6B00), Offline (#9CA3AF)
- **Center:** Total worker count
- **Legend:** Right-aligned pill badges

---

## 9. Realtime Data Patterns

### 9.1 Supabase Realtime Subscription Pattern

```tsx
useEffect(() => {
  const channel = supabase
    .channel('dashboard-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'worker_status' },
      (payload) => dispatch({ type: 'UPDATE_WORKER', payload: payload.new }))
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' },
      (payload) => dispatch({ type: 'NEW_ALERT', payload: payload.new }))
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}, [])
```

### 9.2 Live Indicator Components

```tsx
{/* Pulsing dot — use for "live" data */}
<span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D15A] opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00D15A]" />
  </span>
  Live
</span>
```

### 9.3 Skeleton Loading State

```tsx
{/* Card skeleton while data loads */}
<div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 animate-pulse">
  <div className="h-4 bg-gray-100 rounded-full w-2/3 mb-3" />
  <div className="h-8 bg-gray-100 rounded-full w-1/3 mb-2" />
  <div className="h-3 bg-gray-100 rounded-full w-1/2" />
</div>
```

### 9.4 Optimistic UI Update Rule

When a manager sends a message or acknowledges an alert:
1. Update local state immediately (optimistic)
2. Fire API call in background
3. On error: revert state + show toast error

---

## 10. Responsive Breakpoints

This is a **desktop-first** dashboard. Mobile is for managers checking in urgently only.

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| `xl` | ≥ 1280px | Full 12-col grid, 240px sidebar — primary target |
| `lg` | ≥ 1024px | 12-col grid, 200px collapsed sidebar (icons only) |
| `md` | ≥ 768px | Sidebar hidden, hamburger menu, single-column content |
| `sm` | ≥ 640px | Single column, compact cards |

**Sidebar collapse at `lg`:**
- Hide text labels, show only icons
- Width shrinks from `w-60` to `w-16`
- Tooltip on hover for nav labels

**Grid collapse at `md`:**
- `grid-cols-12` → `grid-cols-1`
- Stats row: 2×2 grid
- Worker cards: single column
- Alerts panel: moves below worker grid

---

## 11. Accessibility Rules

- All icon-only buttons must have `aria-label`
- Use `role="alert"` on critical notification toasts
- Color is never the ONLY status indicator — always pair with text/icon
- Focus rings: `focus:ring-2 focus:ring-[#00D15A] focus:ring-offset-2`
- Skip-to-main link at top of sidebar: `<a href="#main-content" className="sr-only focus:not-sr-only">`
- Heading hierarchy: h1 (page title) → h2 (section) → h3 (card title)
- All data tables need `scope="col"` on headers
- `prefers-reduced-motion`: wrap `animate-pulse` and chart animations with `motion-safe:`
- Minimum touch target on action buttons: 44×44px (even on desktop for accessibility)
- WCAG AA minimum contrast 4.5:1 for all text — verified for brand palette above

---

## 12. Icon System

Use **Lucide React** exclusively. Do not use emojis as icons.

```tsx
import {
  LayoutDashboard, Users, Bell, BarChart3, MapPin,
  MessageCircle, Settings, AlertTriangle, ThermometerSun,
  Coffee, Wifi, WifiOff, CheckCircle2, XCircle, Clock,
  Send, Phone, Video, LogOut, ChevronRight, Plus, Filter
} from 'lucide-react'
```

Standard icon sizes:
- Sidebar nav: `w-4 h-4`
- Header actions: `w-5 h-5`
- Card icons (in colored bg circle): `w-4 h-4`
- Inline with text: `w-3.5 h-3.5`

---

## 13. Animation & Transition Guidelines

| Scenario | Duration | Easing | Class |
|----------|----------|--------|-------|
| Color/bg hover | 150ms | ease | `transition-colors duration-150` |
| Shadow hover | 200ms | ease | `transition-shadow duration-200` |
| Card hover lift | 200ms | ease-out | `transition-all duration-200` |
| Toast slide in | 300ms | ease-out | `animate-in slide-in-from-right duration-300` |
| Sidebar expand | 200ms | ease-in-out | `transition-all duration-200` |
| Alert pulse | infinite | — | `motion-safe:animate-pulse` |
| Live dot ping | infinite | — | `motion-safe:animate-ping` |

**Rule:** Always wrap infinite animations with `motion-safe:` to respect `prefers-reduced-motion`.

---

## 14. shadcn/ui Integration Notes

Install base components:
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge input table dialog sheet tooltip
```

**Override shadcn defaults** — set these in `components.json` and CSS variables:
```css
:root {
  --primary: 145 83% 41%;        /* #00D15A */
  --primary-foreground: 0 0% 100%;
  --background: 150 11% 97%;     /* #F7F9F8 */
  --card: 0 0% 100%;
  --border: 220 9% 91%;          /* gray-200 */
  --radius: 1rem;                 /* 16px base — cards use rounded-3xl override */
}
```

**Rule:** shadcn Button's `variant="default"` maps to brand primary. Never use raw shadcn card radius — always override to `rounded-3xl`.

---

## 15. Pre-Delivery Checklist

Before delivering any UI component:

- [ ] No emojis used as icons (Lucide only)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states smooth at 150–200ms
- [ ] Focus rings use `focus:ring-[#00D15A]`
- [ ] `motion-safe:` wraps all infinite animations
- [ ] Card shadows use `shadow-[0_8px_30px_rgb(0,0,0,0.04)]`
- [ ] Primary buttons are pill (`rounded-full`) with green shadow
- [ ] Stat numbers use `tabular-nums` for no layout shift
- [ ] Live data indicators use pulsing dot pattern (section 9.2)
- [ ] Skeleton loaders present for async data (section 9.3)
- [ ] Responsive at 768px (sidebar collapses) and 1280px (full grid)
- [ ] WCAG AA contrast verified (text on brand green: white ✓)
