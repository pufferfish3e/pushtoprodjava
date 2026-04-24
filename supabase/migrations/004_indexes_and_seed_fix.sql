-- 004 — indexes + stable seed task IDs (safe to re-run)

-- Indexes for foreign key lookups (missing from initial setup)
create index if not exists idx_tasks_event_id    on tasks(event_id);
create index if not exists idx_meetings_event_id on meetings(event_id);
create index if not exists idx_meetings_created  on meetings(created_at desc);

-- Delete unstable seed tasks (no fixed IDs in initial setup, so they duplicate on re-run)
-- Replace with stable UUIDs so re-runs are idempotent
delete from tasks where event_id in (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'a1b2c3d4-0003-0003-0003-000000000003'
) and id not in (
  'b0000001-0001-0001-0001-000000000001',
  'b0000001-0001-0001-0001-000000000002',
  'b0000001-0001-0001-0001-000000000003',
  'b0000001-0001-0001-0001-000000000004',
  'b0000001-0002-0002-0002-000000000005',
  'b0000001-0002-0002-0002-000000000006',
  'b0000001-0002-0002-0002-000000000007',
  'b0000001-0003-0003-0003-000000000008'
);

insert into tasks (id, event_id, assignee, task, deadline, urgency, status, is_blocker, notes) values
  -- Orientation Camp
  ('b0000001-0001-0001-0001-000000000001', 'a1b2c3d4-0001-0001-0001-000000000001', 'Marcus Tan',   'Confirm campsite booking with Ulu Pandan CC',         '2026-04-28', 5, 'pending',     true,  'Site still not confirmed. Blocks transport and logistics planning.'),
  ('b0000001-0001-0001-0001-000000000002', 'a1b2c3d4-0001-0001-0001-000000000001', 'Sarah Lim',    'Finalise camp programme booklet and print 120 copies', '2026-05-03', 4, 'in_progress', false, 'Content drafted, pending CC sign-off before print.'),
  ('b0000001-0001-0001-0001-000000000003', 'a1b2c3d4-0001-0001-0001-000000000001', 'Reza Halim',   'Arrange transport — 3 buses from school to campsite',  '2026-05-01', 4, 'pending',     false, 'Blocked on campsite confirmation from Marcus.'),
  ('b0000001-0001-0001-0001-000000000004', 'a1b2c3d4-0001-0001-0001-000000000001', 'Priya Nair',   'Submit medical form collection to school clinic',      '2026-04-30', 3, 'pending',     false, 'Forms sent out, chasing 22 outstanding submissions.'),
  -- Freshmen Social Night
  ('b0000001-0002-0002-0002-000000000005', 'a1b2c3d4-0002-0002-0002-000000000002', 'Marcus Tan',   'Book MPSH 2 for Freshmen Social Night',               '2026-04-27', 5, 'pending',     true,  'No venue = no event. Marcus also owns campsite — risk of overload.'),
  ('b0000001-0002-0002-0002-000000000006', 'a1b2c3d4-0002-0002-0002-000000000002', 'Aileen Chua',  'Source emcee and confirm with external vendor',        '2026-05-05', 3, 'pending',     false, 'Two vendors shortlisted, awaiting quote.'),
  ('b0000001-0002-0002-0002-000000000007', 'a1b2c3d4-0002-0002-0002-000000000002', 'Wei Jie Tan',  'Prepare slide deck for icebreaker segment',            '2026-05-12', 2, 'pending',     false, ''),
  -- Leadership Summit
  ('b0000001-0003-0003-0003-000000000008', 'a1b2c3d4-0003-0003-0003-000000000003', 'Divya Menon',  'Confirm keynote speaker availability and send brief',  '2026-05-10', 4, 'pending',     false, 'Speaker tentatively agreed, formal confirmation pending.')
on conflict (id) do nothing;

-- RLS policy: allow admin (service role) full access to meetings for API routes
-- Service role bypasses RLS by default, but explicit policy avoids surprises
drop policy if exists "admin all meetings" on meetings;
drop policy if exists "admin all tasks"    on tasks;
