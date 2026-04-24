-- 24 Apr 2026 10:41am

-- 1. events (must exist before meetings + tasks reference it)
create table events (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  event_date date,
  org_id text not null,
  status text default 'planning'
    check (status in ('planning', 'active', 'completed')),
  created_at timestamptz default now()
);

-- 2. meetings (stores Groq transcript)
create table meetings (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  transcript text not null,
  created_at timestamptz default now()
);

-- 3. tasks (for later, when Claude extraction lands)
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

-- 4. RLS on all three
alter table events enable row level security;
alter table meetings enable row level security;
alter table tasks enable row level security;

-- 5. Policies (authenticated users read/write — tighten per org later)
create policy "auth read events"  on events  for select using (auth.role() = 'authenticated');
create policy "auth write events" on events  for insert with check (auth.role() = 'authenticated');
create policy "auth read meetings"  on meetings  for select using (auth.role() = 'authenticated');
create policy "auth write meetings" on meetings  for insert with check (auth.role() = 'authenticated');
create policy "auth read tasks"  on tasks  for select using (auth.role() = 'authenticated');
create policy "auth write tasks" on tasks  for insert with check (auth.role() = 'authenticated');
