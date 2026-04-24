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

### ✅ Migration fixed
`meetings` columns added (`briefings jsonb`, `risks jsonb`, `minutes_draft text`).
`auth update tasks` policy added.
All in `supabase/migrations/initialsetup.sql` — **run this fresh** (drop existing tables first if already run).

### ✅ Demo events + tasks seeded (in migration file)
Fixed UUIDs in `initialsetup.sql`. Tell Dev 2 the IDs:
- Orientation Camp: `a1b2c3d4-0001-0001-0001-000000000001`
- Freshmen Social Night: `a1b2c3d4-0002-0002-0002-000000000002`
- Leadership Summit: `a1b2c3d4-0003-0003-0003-000000000003`

### ✅ Env keys
Both `GROQ_API_KEY` and `ANTHROPIC_API_KEY` present in `.env.example`.

## 🔄 Next — end-to-end test
- [ ] Add both API keys to `.env.local`
- [ ] Upload a real audio file via `/test` page → verify full `ProcessResponse` JSON
- [ ] Confirm tasks + briefings + risks + minutes appear in response
- [ ] Check Supabase dashboard: rows in `meetings` and `tasks` after upload

## 🔄 Next — demo data
- [x] Write 3 sample SPSU meeting note fixtures: `data/demo/notes-orientation-camp.txt`, `notes-freshmen-social.txt`, `notes-leadership-summit.txt`
- [x] Seed 8 tasks into `tasks` table in migration (Marcus Tan overloaded across 2 events, 2 blockers, 1 urgency-5)
- [ ] Test extraction on all 3 notes — verify urgency inference, blocker detection, cross-event conflict surfaces

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
