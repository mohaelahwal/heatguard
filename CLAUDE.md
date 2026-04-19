# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on http://localhost:3000
npm run build     # Production build
npm run lint      # ESLint
```

Before running, copy `.env.local.example` → `.env.local` and fill in Supabase credentials.

## Architecture

**HeatGuard** is a real-time heat-safety SaaS. Three user roles drive two separate UIs:

| Role | Interface | Path |
|------|-----------|------|
| `manager` | Web dashboard (desktop-first) | `/dashboard` |
| `worker` | Mobile PWA (iPhone-style) | `/app` |
| `nurse` | Mobile PWA (same shell as worker) | `/app` |

Middleware at [middleware.ts](middleware.ts) handles auth gating and role-based redirects. Unauthenticated users go to `/login`. After OAuth callback (`/auth/callback`) users are redirected to their role's area.

## Key Directories

```
app/
  (app)/          # Route group: worker + nurse PWA (mobile-first)
  dashboard/      # Manager dashboard (desktop-first)
  api/            # All backend API routes
  auth/callback/  # Supabase auth redirect handler
lib/
  supabase/
    client.ts     # Browser client (Client Components)
    server.ts     # Server client + service-role client (Server Components / Route Handlers)
  types/
    database.ts   # All DB row types, enums, and enriched join types
  utils.ts        # cn(), calculateHeatIndex(), heatIndexSeverity(), apiSuccess(), apiError()
supabase/
  migrations/
    001_initial_schema.sql  # Complete schema: tables, enums, RLS, triggers, realtime
```

## Supabase Setup

1. Create a project at supabase.com
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor
3. Copy your project URL + anon key + service role key into `.env.local`

**Tables:** `sites`, `profiles`, `worker_status`, `heat_readings`, `symptoms`, `breaks`, `alerts`, `messages`, `video_calls`

**Realtime** is enabled on all operational tables. The dashboard subscribes to `worker_status`, `alerts`, and `heat_readings` channels.

**RLS** is enabled on all tables. Key rules:
- Workers can only read/write their own rows
- Managers and nurses can read all rows on their site
- Only managers can create custom alerts and broadcast messages
- Service-role client (in `createServiceClient()`) bypasses RLS — use only in trusted server contexts

## API Routes

All routes under `app/api/` follow the same pattern:
1. Authenticate with `createClient()` from `lib/supabase/server.ts`
2. Get `user` via `supabase.auth.getUser()`
3. Return `apiSuccess(data)` or `apiError(message, status)` from `lib/utils.ts`

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/heat-readings` | GET, POST | Log readings; auto-creates alert if heat index is high/critical |
| `/api/symptoms` | GET, POST | Log symptoms; auto-creates alert + sets status to `alert` for severity ≥ 4 |
| `/api/breaks` | GET, POST, PATCH | Start break (POST), end current break (PATCH) — also updates `worker_status` |
| `/api/alerts` | GET, POST | List alerts (filtered); manager creates custom alerts |
| `/api/alerts/[id]/acknowledge` | PATCH, POST | PATCH = acknowledge; POST = acknowledge + resolve (manager only) |
| `/api/messages` | GET, POST | Direct messages or site broadcasts (broadcast = manager only) |
| `/api/worker-status` | GET, PUT | GET site-wide statuses (manager view); PUT = worker heartbeat + GPS update |
| `/api/video-calls` | GET, POST | Initiate call, list calls |
| `/api/video-calls/[id]` | PATCH | Update call status (`ringing` → `active` → `ended`/`missed`/`declined`) |

## Heat Index Logic

`calculateHeatIndex(tempC, humidity)` in `lib/utils.ts` uses the Rothfusz equation and returns `°C`.

`heatIndexSeverity(heatIndex)` thresholds:
- `< 32°C` → `low`
- `32–41°C` → `medium`
- `41–54°C` → `high`
- `≥ 54°C` → `critical`

POST to `/api/heat-readings` automatically creates an alert and updates `worker_status.current_heat_index` when severity is `high` or `critical`.

## Styling Conventions

- `cn()` from `lib/utils.ts` for conditional Tailwind classes (clsx + tailwind-merge)
- Brand color: `brand` / `heat` scales defined in `tailwind.config.ts`
- PWA safe-area spacing: `pt-safe-top`, `pb-safe-bottom` (iPhone notch/home indicator)
- Dashboard: standard desktop breakpoints (`lg:`, `xl:`)
- App (worker/nurse): max-w-md container, no horizontal breakpoints

## Realtime Subscriptions (pattern)

```ts
const channel = supabase
  .channel('worker-status')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'worker_status',
    filter: `worker.site_id=eq.${siteId}`,
  }, (payload) => handleChange(payload))
  .subscribe()

return () => supabase.removeChannel(channel)
```
