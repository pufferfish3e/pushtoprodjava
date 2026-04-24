# Dev 1 Checklist — Backend / AI Pipeline

## ✅ Done
- [x] `lib/groq.ts` — Transcription Agent: audio → transcript (lazy-init, build-safe)
- [x] `lib/claude.ts` — Meeting Agent: transcript → tasks + decisions (Zod-validated)
- [x] `lib/claude.ts` — Attention Routing Agent: state → 4 role briefings
- [x] `lib/claude.ts` — Document Agent: state + transcript → minutes draft
- [x] `lib/claude.ts` — Risk Agent: state → risk signals array
- [x] `lib/claude.ts` — Query Agent: NL question + tasks → plain-English answer
- [x] `app/api/process/route.ts` — full chain: audio → Groq → Claude → Supabase → `ProcessResponse`
- [x] `app/api/query/route.ts` — POST question + optional event_id → answer
- [x] `lib/types.ts` — all 8 interfaces unified, build-clean
- [x] `supabase/migrations/initialsetup.sql` — events + meetings + tasks + RLS
- [x] Build passes ✓ | TypeScript clean ✓

## 🔥 Critical — fix before anything else works

### Migration is incomplete
`meetings` table is missing 3 columns that `route.ts` already writes to.
Run this in Supabase SQL editor now:
```sql
alter table meetings
  add column briefings   jsonb,
  add column risks       jsonb,
  add column minutes_draft text;
```
Without this: every `/api/process` call 500s on the insert.

### Seed demo events with known IDs
`mock-data.ts` uses text IDs (`evt-001` etc). Real Supabase uses UUIDs.
Either:
- **Option A (easier):** seed events with fixed UUIDs and update mock-data.ts to match
- **Option B:** seed events, then Dev 2 reads real IDs from Supabase instead of hardcoding

Recommended Option A. Run:
```sql
insert into events (id, name, event_date, org_id, status) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Orientation Camp 2026', '2026-05-10', 'demo-org', 'active'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Freshmen Social Night', '2026-05-17', 'demo-org', 'active'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Leadership Summit',     '2026-06-01', 'demo-org', 'active');
```
Then update `lib/mock-data.ts` ids to match (tell Dev 2).

### Add missing env key
`GROQ_API_KEY` not in `.env.example`. Add it so teammates know it's required.

## 🔄 Next — end-to-end test
- [ ] Add both API keys to `.env.local`
- [ ] Upload a real audio file via `/test` page → verify full `ProcessResponse` JSON
- [ ] Confirm tasks + briefings + risks + minutes appear in response
- [ ] Check Supabase dashboard: rows in `meetings` and `tasks` after upload

## 🔄 Next — demo data
- [ ] Write 3 sample SPSU meeting note fixtures as text files: `data/demo/notes-*.txt`
- [ ] Test extraction on all 3 — verify urgency inference, blocker detection
- [ ] Seed ~8 tasks into `tasks` table matching seeded event IDs (for Dev 2 to test dashboard reads without needing an actual audio upload)

## ⏳ Later
- [ ] Add update RLS policy on `tasks` (currently only insert — needed for status changes)
- [ ] Handle Claude JSON parse failures gracefully (retry once, then 422)
- [ ] Test `/api/query` with seeded tasks via `/test` page

## 🚀 Stretch
- [ ] Retry logic on Zod parse failure
- [ ] Streaming `/api/process` for long recordings
- [ ] Cross-event conflict detection in Risk Agent

## 🔗 What unblocks Dev 2
| Dev 1 action | Dev 2 unlocked |
|---|---|
| Fix `meetings` columns | `/api/process` stops 500ing |
| Seed events with fixed UUIDs | Dev 2 wires real reads |
| Seed tasks rows | Dev 2 replaces mock data |
| Share event UUIDs | Dev 2 updates `mock-data.ts` |

## Agent map (all 6 implemented)
```
audio → [Transcription] → transcript
transcript → [Meeting] → tasks + decisions
tasks → [Attention Routing] → 4 briefings
transcript + tasks → [Document] → minutes draft
tasks → [Risk] → risk signals
question + tasks → [Query] → plain-English answer
```
