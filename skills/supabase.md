# Supabase Skill

## Use this when

- creating tables or migrations
- wiring dashboard reads or task writes
- enabling realtime
- deciding how much schema is enough for the MVP

## Goal

Use Supabase as the real persistence layer from the start without overdesigning the database.

## Must ship

- real Postgres persistence
- RLS enabled on app tables
- minimum schema for events and tasks
- task reads that support both event view and cross-event overview

## Minimum schema direction

Start small:
- `events`
- `tasks`

Keep columns close to the product and prompt:
- `event_date`
- `org_id`
- `deadline`
- `urgency`
- `status`
- `is_blocker`

Optional:
- add one light ingestion/review table only if the review step clearly needs persisted drafts

## Realtime guidance

Realtime is valuable for the demo if it is easy to wire.
Use it on `tasks` only.
Do not spend hours on a complex event-bus story.

## RLS guidance

- assume Clerk-backed auth
- prefer `org_id` as the tenant boundary
- if Clerk organizations are not ready, a fixed demo `org_id` is acceptable for the hackathon

## Recommended file targets

- `supabase/migrations/*`
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/types.ts`

## Do not do

- introduce an ORM
- build a production-grade data warehouse
- use service-role keys in client code
- store demo data only in memory if Supabase is available

## Acceptance checklist

- data survives refresh
- signed-in users can read the needed rows
- writes are scoped correctly
- the dashboard can query active events and event tasks with simple calls
