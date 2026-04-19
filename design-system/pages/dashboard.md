# Dashboard Page — Design System
> Extracted from `manager dashboard.png` mockup (2026-03-30)
> This file overrides MASTER.md for the `/dashboard` page family.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│  HEADER  (full width, h-14, bg #0C2A1F)             │
│  [logo]   [search ── ── ── ── ──]  [bell][☰][user] │
├──────┬──────────────────────────────────────────────┤
│ SIDE │  PAGE CONTENT  (bg #FFFFFF)                  │
│ BAR  │                                              │
│ 72px │  ┌──────────────────────────────────────┐   │
│      │  │  widgets …                           │   │
│ bg   │  └──────────────────────────────────────┘   │
│ #0C  │                                              │
│ 2A1F │                                              │
└──────┴──────────────────────────────────────────────┘
```

The header and sidebar share the same background; they visually form an "L" of forest green framing the white content area.

---

## Color Tokens

| Token              | Hex       | Usage                                       |
|--------------------|-----------|---------------------------------------------|
| `forest`           | `#0C2A1F` | Header + sidebar background                 |
| `forest-hover`     | `#0f3728` | Hover on forest surfaces                    |
| `forest-border`    | `#1a4a36` | Dividers inside forest surfaces             |
| `brand-green`      | `#00D15A` | Active nav icon box, CTAs, live indicator   |
| `brand-green-dim`  | `#00D15A1A` (≈10%) | Active item background glow             |
| `page-bg`          | `#FFFFFF` | Main content area background                |
| `surface`          | `#F7F9F8` | Card inner sections, input fills            |
| `text-primary`     | `#0E1B18` | Body text on white                          |
| `text-secondary`   | `#6B7280` | Muted labels                                |
| `safe`             | `#00D15A` | Status: on-shift, recovered                 |
| `caution`          | `#FFCC00` | Status: caution, pending                    |
| `warning`          | `#FF6B00` | Status: heat warning                        |
| `danger`           | `#FF3B30` | Status: heat danger, critical incidents     |
| `critical-dark`    | `#9B1C1C` | Status: extreme / highest severity          |
| `aqi-orange`       | `#F97316` | AQI moderate display                        |

---

## Typography

| Context            | Size   | Weight | Color        |
|--------------------|--------|--------|--------------|
| Welcome heading    | 28px   | 700    | `#0E1B18`    |
| Sub heading        | 14px   | 700    | `#0E1B18`    |
| Stat number large  | 36px   | 700    | `#0E1B18`    |
| Stat number medium | 22px   | 700    | `#0E1B18`    |
| Card label         | 11px   | 600    | `#6B7280`    |
| Nav label          | 9px    | 600    | white/55%    |
| Nav label active   | 9px    | 700    | `#ffffff`    |
| Header user name   | 13px   | 600    | `#ffffff`    |
| Header user role   | 11px   | 400    | `#00D15A`    |

---

## Sidebar

- **Width:** 72px (always fixed — no expand/collapse)
- **Background:** `#0C2A1F`
- **Item layout:** flex-col, icon centered on top, 9px label below
- **Icon size:** 20×20
- **Item height:** ~56px
- **Active state:** icon wrapped in `#00D15A` rounded-xl box (36×36), icon white, label white
- **Inactive state:** icon white/55%, label white/45%
- **Hover state:** icon box bg `white/10`, icon white/80%
- **Nav items (top):** Dashboard, Roster, Map, Incidents, Compliance, Claims, Messages, Tele Triage
- **Nav items (bottom):** Settings
- **No logo in sidebar** — logo is in the header

---

## Header

- **Height:** 56px (h-14)
- **Background:** `#0C2A1F`
- **Left:** snowflake/asterisk icon (white) + "heatguard" text (white, 16px, 700)
- **Center:** search input `bg-white/10 border-white/15`, placeholder white/45%, green circular search button `#00D15A`
- **Right:** bell icon (white/70%), menu icon (white/70%), vertical divider, avatar 32px, user name (white 13px 600), role in `#00D15A` (11px)

---

## Cards

- **Border radius:** `rounded-2xl` (16px) for inner metric blocks, `rounded-3xl` (24px) for primary cards
- **Background:** `#FFFFFF`
- **Shadow:** `shadow-sm` + `border border-gray-100`
- **Padding:** 24px (p-6)

---

## Heat Stress Gauge

- Semi-circle Recharts PieChart (`startAngle=180`, `endAngle=0`)
- Track: `#F3F4F6`
- Fill: maps to heat color scale (caution → warning → danger → critical)
- Center label: WBGT value large + "°C WBGT" below
- Below gauge: `WBGT | HUMIDITY | AQI` three blocks
- Alert band text (e.g. "HIGH HEAT ALERT"): the matching heat color, 11px, uppercase, bold

---

## Status Pills

| State     | Background   | Text         | Dot        |
|-----------|--------------|--------------|------------|
| safe      | `#00D15A1A`  | `#00D15A`    | `#00D15A`  |
| caution   | `#FFF7ED`    | `#B45309`    | `#FFCC00`  |
| warning   | `#FFF7ED`    | `#C2410C`    | `#FF6B00`  |
| danger    | `#FEF2F2`    | `#DC2626`    | `#FF3B30`  |
| critical  | `#FEF2F2`    | `#991B1B`    | `#9B1C1C`  |
| pending   | `#FFFBEB`    | `#92400E`    | `#FFCC00`  |
| reviewing | `#FFF7ED`    | `#C2410C`    | `#FF6B00`  |
| join/waiting | `#E0F2FE` | `#0369A1`    | —          |

---

## Incident Badges (Open Incidents list)

- Location tag: `#EFF6FF bg` + `#2563EB text`, rounded-full, 10px
- SOS badge: `#FEF2F2 bg` + `#DC2626 text`
- WAITING badge: `#FFF7ED bg` + `#C2410C text`
- JOIN badge: `#E0F2FE bg` + `#0369A1 text`
- "View Timeline >" link: `#6B7280`, 11px
