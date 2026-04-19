-- HeatGuard Initial Schema
-- Enable extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('manager', 'worker', 'nurse');
create type alert_severity as enum ('low', 'medium', 'high', 'critical');
create type alert_type as enum ('heat_stress', 'no_break', 'symptom_report', 'sos', 'custom');
create type worker_status_type as enum ('active', 'on_break', 'alert', 'offline');
create type break_type as enum ('water', 'shade', 'rest', 'medical');
create type call_status as enum ('pending', 'ringing', 'active', 'ended', 'missed', 'declined');
create type message_type as enum ('text', 'alert', 'system', 'broadcast');

-- ============================================================
-- SITES
-- ============================================================
create table sites (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  address     text,
  lat         double precision,
  lng         double precision,
  timezone    text default 'UTC',
  created_at  timestamptz default now()
);

-- ============================================================
-- PROFILES  (extends auth.users)
-- ============================================================
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  role              user_role not null default 'worker',
  full_name         text,
  avatar_url        text,
  site_id           uuid references sites(id) on delete set null,
  phone             text,
  emergency_contact text,
  emergency_phone   text,
  badge_id          text unique,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- WORKER LIVE STATUS  (one row per worker, upserted in realtime)
-- ============================================================
create table worker_status (
  id                  uuid primary key default uuid_generate_v4(),
  worker_id           uuid unique not null references profiles(id) on delete cascade,
  status              worker_status_type not null default 'offline',
  lat                 double precision,
  lng                 double precision,
  accuracy            double precision,
  current_heat_index  double precision,
  shift_start         timestamptz,
  last_seen           timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ============================================================
-- HEAT READINGS
-- ============================================================
create table heat_readings (
  id           uuid primary key default uuid_generate_v4(),
  worker_id    uuid not null references profiles(id) on delete cascade,
  temperature  double precision not null,   -- °C
  humidity     double precision,            -- %
  heat_index   double precision,            -- calculated °C
  lat          double precision,
  lng          double precision,
  recorded_at  timestamptz default now()
);

-- ============================================================
-- SYMPTOMS
-- ============================================================
create table symptoms (
  id          uuid primary key default uuid_generate_v4(),
  worker_id   uuid not null references profiles(id) on delete cascade,
  symptoms    text[] not null,  -- e.g. ['dizziness','nausea','headache']
  severity    int not null check (severity between 1 and 5),
  notes       text,
  recorded_at timestamptz default now()
);

-- ============================================================
-- BREAKS
-- ============================================================
create table breaks (
  id               uuid primary key default uuid_generate_v4(),
  worker_id        uuid not null references profiles(id) on delete cascade,
  break_type       break_type not null default 'rest',
  started_at       timestamptz default now(),
  ended_at         timestamptz,
  duration_minutes int  -- populated on end
);

-- ============================================================
-- ALERTS
-- ============================================================
create table alerts (
  id               uuid primary key default uuid_generate_v4(),
  site_id          uuid references sites(id) on delete cascade,
  worker_id        uuid references profiles(id) on delete set null,
  created_by       uuid references profiles(id) on delete set null,  -- null = auto-generated
  type             alert_type not null,
  severity         alert_severity not null default 'medium',
  message          text not null,
  metadata         jsonb default '{}',
  acknowledged_at  timestamptz,
  acknowledged_by  uuid references profiles(id) on delete set null,
  resolved_at      timestamptz,
  resolved_by      uuid references profiles(id) on delete set null,
  created_at       timestamptz default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================
create table messages (
  id           uuid primary key default uuid_generate_v4(),
  sender_id    uuid not null references profiles(id) on delete cascade,
  recipient_id uuid references profiles(id) on delete cascade,  -- null = broadcast
  site_id      uuid references sites(id) on delete cascade,      -- for broadcast scope
  content      text not null,
  type         message_type not null default 'text',
  metadata     jsonb default '{}',
  read_at      timestamptz,
  created_at   timestamptz default now()
);

-- ============================================================
-- VIDEO CALLS
-- ============================================================
create table video_calls (
  id          uuid primary key default uuid_generate_v4(),
  caller_id   uuid not null references profiles(id) on delete cascade,
  callee_id   uuid not null references profiles(id) on delete cascade,
  status      call_status not null default 'pending',
  room_id     text unique,  -- WebRTC / Daily.co / Livekit room identifier
  started_at  timestamptz,
  ended_at    timestamptz,
  created_at  timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on heat_readings (worker_id, recorded_at desc);
create index on symptoms (worker_id, recorded_at desc);
create index on breaks (worker_id, started_at desc);
create index on alerts (site_id, created_at desc);
create index on alerts (worker_id, created_at desc);
create index on alerts (resolved_at) where resolved_at is null;
create index on messages (recipient_id, created_at desc);
create index on messages (sender_id, created_at desc);
create index on messages (site_id, created_at desc);
create index on video_calls (caller_id, created_at desc);
create index on video_calls (callee_id, created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table profiles      enable row level security;
alter table sites         enable row level security;
alter table worker_status enable row level security;
alter table heat_readings enable row level security;
alter table symptoms      enable row level security;
alter table breaks        enable row level security;
alter table alerts        enable row level security;
alter table messages      enable row level security;
alter table video_calls   enable row level security;

-- Helper: get current user role
create or replace function current_user_role()
returns user_role language sql security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- Helper: get current user site
create or replace function current_user_site()
returns uuid language sql security definer as $$
  select site_id from profiles where id = auth.uid()
$$;

-- PROFILES policies
create policy "Users can view profiles on same site"
  on profiles for select
  using (site_id = current_user_site() or id = auth.uid());

create policy "Users can update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "Managers can update any profile on their site"
  on profiles for update
  using (current_user_role() in ('manager') and site_id = current_user_site());

-- SITES policies
create policy "Users can view their site"
  on sites for select
  using (id = current_user_site());

create policy "Managers can update their site"
  on sites for update
  using (current_user_role() = 'manager' and id = current_user_site());

-- WORKER STATUS policies
create policy "Site members can view worker status"
  on worker_status for select
  using (
    worker_id = auth.uid() or
    exists (
      select 1 from profiles p where p.id = worker_status.worker_id
        and p.site_id = current_user_site()
    )
  );

create policy "Workers can upsert own status"
  on worker_status for all
  using (worker_id = auth.uid());

-- HEAT READINGS policies
create policy "Workers can insert own readings"
  on heat_readings for insert
  with check (worker_id = auth.uid());

create policy "Site members can view heat readings"
  on heat_readings for select
  using (
    worker_id = auth.uid() or
    current_user_role() in ('manager', 'nurse')
  );

-- SYMPTOMS policies
create policy "Workers can insert own symptoms"
  on symptoms for insert
  with check (worker_id = auth.uid());

create policy "Site members can view symptoms"
  on symptoms for select
  using (
    worker_id = auth.uid() or
    current_user_role() in ('manager', 'nurse')
  );

-- BREAKS policies
create policy "Workers can manage own breaks"
  on breaks for all
  using (worker_id = auth.uid());

create policy "Managers and nurses can view breaks"
  on breaks for select
  using (current_user_role() in ('manager', 'nurse'));

-- ALERTS policies
create policy "All site members can view alerts"
  on alerts for select
  using (site_id = current_user_site() or worker_id = auth.uid());

create policy "Managers and system can create alerts"
  on alerts for insert
  with check (
    created_by = auth.uid() or
    current_user_role() = 'manager'
  );

create policy "Managers and nurses can acknowledge/resolve alerts"
  on alerts for update
  using (current_user_role() in ('manager', 'nurse'));

-- MESSAGES policies
create policy "Users can view messages sent to them or broadcast to their site"
  on messages for select
  using (
    sender_id = auth.uid() or
    recipient_id = auth.uid() or
    (recipient_id is null and site_id = current_user_site())
  );

create policy "Users can send messages"
  on messages for insert
  with check (sender_id = auth.uid());

-- VIDEO CALLS policies
create policy "Participants can view their calls"
  on video_calls for select
  using (caller_id = auth.uid() or callee_id = auth.uid());

create policy "Users can create calls"
  on video_calls for insert
  with check (caller_id = auth.uid());

create policy "Participants can update call status"
  on video_calls for update
  using (caller_id = auth.uid() or callee_id = auth.uid());

-- ============================================================
-- REALTIME  (enable publication for live dashboard updates)
-- ============================================================
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table
    worker_status,
    heat_readings,
    symptoms,
    breaks,
    alerts,
    messages,
    video_calls;
commit;
