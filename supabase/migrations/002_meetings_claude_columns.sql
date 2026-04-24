-- 24 Apr 2026 — add Claude output columns to meetings + update RLS

-- Claude agents write briefings, risks, minutes_draft to this table
alter table meetings
  add column if not exists briefings    jsonb,
  add column if not exists risks        jsonb,
  add column if not exists minutes_draft text;

-- tasks also needs update + delete policies for status changes from UI
create policy "auth update tasks" on tasks
  for update using (auth.role() = 'authenticated');

create policy "auth update events" on events
  for update using (auth.role() = 'authenticated');
