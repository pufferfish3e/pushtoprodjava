-- Demo seed data — run after both migrations
-- Fixed UUIDs so mock-data.ts can hardcode them

-- Events
insert into events (id, name, event_date, org_id, status) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Orientation Camp 2026',  '2026-05-10', 'demo-org', 'active'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Freshmen Social Night',  '2026-05-17', 'demo-org', 'active'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Leadership Summit 2026', '2026-06-01', 'demo-org', 'active')
on conflict (id) do nothing;

-- Tasks for Orientation Camp (evt 1)
insert into tasks (event_id, assignee, task, deadline, urgency, status, is_blocker, notes) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Wei Ling',  'Confirm venue booking with SP management',     '2026-04-28', 5, 'pending',     true,  'Hall A unconfirmed — blocks all logistics planning'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Wei Ling',  'Submit budget proposal to EXCO',               '2026-04-27', 5, 'blocked',     true,  'Blocked on venue cost confirmation'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Ravi',      'Finalise participant registration form',        '2026-04-30', 4, 'in_progress', false, ''),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Sarah',     'Arrange transport for day-trip segment',        '2026-05-03', 3, 'pending',     false, ''),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Hafiz',     'Design camp schedule and ice-breaker rundown', '2026-05-05', 2, 'in_progress', false, '');

-- Tasks for Freshmen Social Night (evt 2)
insert into tasks (event_id, assignee, task, deadline, urgency, status, is_blocker, notes) values
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Priya',     'Secure DJ or live band booking',  '2026-05-01', 4, 'pending',     false, ''),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Wei Ling',  'Set up ticketing on Eventbrite',  '2026-04-29', 4, 'pending',     false, 'Wei Ling also on Orientation Camp — possible overload');

-- Tasks for Leadership Summit (evt 3)
insert into tasks (event_id, assignee, task, deadline, urgency, status, is_blocker, notes) values
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Ravi',      'Send speaker invitations',        '2026-04-30', 3, 'in_progress', false, '');
