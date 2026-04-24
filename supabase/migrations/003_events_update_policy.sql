-- Allow authenticated users to update events (status changes, etc.)
drop policy if exists "auth update events" on events;
create policy "auth update events" on events
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Note: INSERT for events goes through /api/events which uses the service role
-- client (createAdminSupabaseClient), so it bypasses RLS. The policy below
-- covers direct client-side inserts if ever needed.
drop policy if exists "auth insert events" on events;
create policy "auth insert events" on events
  for insert with check (auth.role() = 'authenticated');
