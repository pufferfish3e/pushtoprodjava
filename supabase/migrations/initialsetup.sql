-- 24 Apr 2026 — full schema, run once on a fresh project

-- 1. events
create table events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  event_date date,
  org_id text not null,
  status text default 'planning'
    check (status in ('planning', 'active', 'completed')),
  created_at timestamptz default now()
);

-- 2. meetings — includes Claude output columns
create table meetings (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  transcript text not null,
  briefings jsonb,
  risks jsonb,
  minutes_draft text,
  created_at timestamptz default now()
);

-- 3. tasks
create table tasks (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  assignee text,
  task text not null,
  deadline date,
  urgency int check (urgency between 1 and 5),
  status text default 'pending'
    check (status in ('pending', 'in_progress', 'completed', 'blocked')),
  is_blocker boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- 4. RLS
alter table events  enable row level security;
alter table meetings enable row level security;
alter table tasks   enable row level security;

-- 5. Policies
create policy "auth read events"    on events   for select using (auth.role() = 'authenticated');
create policy "auth write events"   on events   for insert with check (auth.role() = 'authenticated');

create policy "auth read meetings"  on meetings for select using (auth.role() = 'authenticated');
create policy "auth write meetings" on meetings for insert with check (auth.role() = 'authenticated');

create policy "auth read tasks"     on tasks    for select using (auth.role() = 'authenticated');
create policy "auth write tasks"    on tasks    for insert with check (auth.role() = 'authenticated');
create policy "auth update tasks"   on tasks    for update using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- SEED — demo events with fixed UUIDs
-- ─────────────────────────────────────────────
insert into events (id, name, event_date, org_id, status) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Orientation Camp 2026',  '2026-05-10', 'demo-org', 'active'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Freshmen Social Night',  '2026-05-17', 'demo-org', 'active'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Leadership Summit',      '2026-06-01', 'demo-org', 'active');

-- ─────────────────────────────────────────────
-- SEED — demo tasks (8 rows across 3 events)
-- Covers: 1 blocker, 1 urgency-5, 1 cross-event person (Marcus Tan)
-- ─────────────────────────────────────────────
insert into tasks (event_id, assignee, task, deadline, urgency, status, is_blocker, notes) values
  -- Orientation Camp
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Marcus Tan',   'Confirm campsite booking with Ulu Pandan CC',         '2026-04-28', 5, 'pending',     true,  'Site still not confirmed. Blocks transport and logistics planning.'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Sarah Lim',    'Finalise camp programme booklet and print 120 copies', '2026-05-03', 4, 'in_progress', false, 'Content drafted, pending CC sign-off before print.'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Reza Halim',   'Arrange transport — 3 buses from school to campsite',  '2026-05-01', 4, 'pending',     false, 'Blocked on campsite confirmation from Marcus.'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Priya Nair',   'Submit medical form collection to school clinic',      '2026-04-30', 3, 'pending',     false, 'Forms sent out, chasing 22 outstanding submissions.'),

  -- Freshmen Social Night
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Marcus Tan',   'Book MPSH 2 for Freshmen Social Night',               '2026-04-27', 5, 'pending',     true,  'No venue = no event. Marcus also owns campsite — risk of overload.'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Aileen Chua',  'Source emcee and confirm with external vendor',        '2026-05-05', 3, 'pending',     false, 'Two vendors shortlisted, awaiting quote.'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Wei Jie Tan',  'Prepare slide deck for icebreaker segment',            '2026-05-12', 2, 'pending',     false, ''),

  -- Leadership Summit
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Divya Menon',  'Confirm keynote speaker availability and send brief',  '2026-05-10', 4, 'pending',     false, 'Speaker tentatively agreed, formal confirmation pending.');
