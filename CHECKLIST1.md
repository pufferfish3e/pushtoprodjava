# Dev 1 Checklist — Backend / AI Pipeline

## ✅ Done
- [x] `lib/groq.ts` — Transcription Agent: audio → transcript (lazy-init, build-safe)
- [x] `lib/claude.ts` — Meeting Agent: transcript → tasks + decisions (Zod-validated)
- [x] `lib/claude.ts` — Attention Routing Agent: state → 4 role briefings
- [x] `lib/claude.ts` — Document Agent: state + transcript → minutes draft
- [x] `lib/claude.ts` — Risk Agent: state → risk signals array
- [x] `lib/claude.ts` — Query Agent: NL question + tasks → plain-English answer
- [x] `app/api/process/route.ts` — full chain: audio → Groq → Claude → Supabase → ProcessResponse
- [x] `app/api/query/route.ts` — POST question + optional event_id → answer
- [x] `lib/types.ts` — all 8 interfaces unified
- [x] `supabase/migrations/initialsetup.sql` — full schema + Claude columns + RLS + update policies + seeded events + tasks
- [x] `supabase/migrations/002_meetings_claude_columns.sql` — alter script if schema already applied without Claude columns
- [x] `data/demo/seed.sql` — standalone seed matching initialsetup.sql UUIDs
- [x] `data/demo/notes-orientation-camp.txt` — campsite blocker, transport dependency chain
- [x] `data/demo/notes-freshmen-social.txt` — venue blocker, Marcus Tan cross-event overload
- [x] `data/demo/notes-leadership-summit.txt` — facilitator at-risk, EXCO oversight angle
- [x] `data/demo/notes-orientation.txt` — Wei Ling overload angle
- [x] `data/demo/notes-socialnight.txt` — chain dependency, ticketing blocker
- [x] `data/demo/notes-summit.txt` — speaker chicken-and-egg blocker
- [x] `data/demo/queries.txt` — 9 sample NL queries covering all 4 roles
- [x] `lib/mock-data.ts` — IDs match seeded UUIDs, EVT constants exported
- [x] Build ✓ | TypeScript ✓

## 🔥 Run in Supabase (if not done yet)
Single file does everything:
`supabase/migrations/initialsetup.sql`

If schema already exists without Claude columns, also run:
`supabase/migrations/002_meetings_claude_columns.sql`

**Seeded event UUIDs (share with Dev 2):**
- Orientation Camp:    a1b2c3d4-0001-0001-0001-000000000001
- Freshmen Social Night: a1b2c3d4-0002-0002-0002-000000000002
- Leadership Summit:   a1b2c3d4-0003-0003-0003-000000000003

## 🔄 Next — end-to-end test
- [ ] Add ANTHROPIC_API_KEY + GROQ_API_KEY to .env.local
- [ ] Go to /test → Check Keys → all 5 show true
- [ ] Upload a real audio file via /test page
- [ ] Verify ProcessResponse has tasks[], briefings, risks[], minutes_draft
- [ ] Check Supabase: rows in meetings + tasks after upload

## 🔄 Next — test extraction quality
- [ ] Test each data/demo/notes-*.txt through the pipeline
- [ ] Confirm urgency-5 + blocker tasks extracted
- [ ] Confirm overload person risk surfaces in risks[]
- [ ] Confirm minutes_draft reads like formal meeting minutes

## ⏳ Later
- [ ] Test /api/query using queries from data/demo/queries.txt
- [ ] Handle Claude JSON parse failure gracefully (retry once then 422)

## 🚀 Stretch
- [ ] Streaming /api/process for long recordings
- [ ] Cross-event conflict detection in Risk Agent

## 🔗 What Dev 2 can do now
| Available | Dev 2 action |
|---|---|
| UUIDs in mock-data.ts | Already aligned — no change needed |
| Migration + seed run | Replace mock reads with real Supabase reads |
| /api/process full response | Wire AudioUpload.onResult into event page |
| /api/query live | Build QueryPanel component |

## Agent map
audio  → [Transcription]     → transcript
         [Meeting]           → tasks + decisions
         [Attention Routing] → 4 role briefings
         [Document]          → minutes draft
         [Risk]              → risk signals
question → [Query]           → plain-English answer
