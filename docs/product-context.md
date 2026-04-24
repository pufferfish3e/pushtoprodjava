# Product Context — Current State
Last updated: 2026-04-24

This document reflects what has actually been built and decided.
It supersedes the original `revised-hackathon-brief.md` for accuracy on implementation details.
Read this first when picking up the project mid-session.

---

## 1. What This Product Is

**Working name:** Orin (internal; not branded in UI yet)

**One sentence:**
Most AI meeting tools create one summary for everyone. Orin turns one meeting into role-specific operational briefings and editable formal documentation, so each person sees only what they need to act on.

**What makes it different:**
The Attention Routing Agent — five parallel Claude calls that each receive a different slice of the same meeting, producing briefings tailored to Secretary, OC, CC/VCC, and EXCO roles. This is not one generic summary passed to four people. It is four genuinely different briefings generated simultaneously.

**Target user:**
SPSU (Singapore Polytechnic Students' Union) secretaries, committee chairs, and EXCO members coordinating student events.

---

## 2. The Problem It Solves

SPSU runs many concurrent student events. Each meeting produces:
- operational tasks and blockers for the committee (OC)
- intervention points for the event lead (CC/VCC)
- documentation obligations for the secretary
- escalation signals for executive oversight (EXCO)

Currently all of this gets flattened into one recording or one shared notes doc. The secretary manually rewrites it into formal minutes. Everyone else reads what they don't need and misses what they do.

Orin turns one recording into four focused briefings and a ready-to-edit SPSU-formatted minutes draft — in one pipeline run.

---

## 3. The Actual Agent Pipeline

All agents run server-side via the Anthropic Messages API (`claude-sonnet-4-6`). No client-side Claude calls.

```
Browser mic / audio file
        │
        ▼
[Transcription Agent]  ←  Groq Whisper large-v3-turbo
        │  transcript: string
        ▼
[Meeting Agent]        ←  Claude: transcript → structured state
        │  { tasks[], decisions[] }
        ▼
[5 parallel Claude calls — Promise.all]
   ├─ [Secretary Agent]   full transcript + all tasks + all decisions
   ├─ [OC Agent]          full transcript + all tasks + decisions
   ├─ [CC/VCC Agent]      full transcript + high-urgency/blocker tasks only
   ├─ [EXCO Agent]        structured state ONLY (no raw transcript)
   └─ [Risk + Minutes Agent]  full transcript + full state
        │
        ▼
  Supabase: meetings + tasks rows saved via admin client
        │
        ▼
  Dashboard: briefings, tasks, risks, minutes_draft updated live
```

**Key design decisions:**
- Secretary and OC see the full transcript because they need all operational detail
- CC/VCC see only high-urgency and blocker tasks — they need to intervene, not read everything
- EXCO receive structured state only, no raw transcript — executive oversight is data-driven, not narrative
- Risk signals and minutes draft are generated in the same 5th parallel call to save a round trip
- All DB writes use `createAdminSupabaseClient` (service role key, bypasses RLS) — Clerk JWTs are not configured as a trusted issuer in Supabase, so the server-client approach fails on inserts

---

## 4. Key Features Built

### Recording
- **Live recording** via Web Speech API for real-time transcript display (no API cost during recording)
- MediaRecorder collects the audio blob in parallel for the final `/api/process` submit
- Speech recognition auto-restarts on silence so it runs continuously
- **File upload** via `AudioUpload.tsx` as an alternative

### SPSU Minutes Flow
After stopping a recording:
1. `/api/minutes` is called automatically — formats transcript into SPSU official minutes template (2nd meeting format: 6 agenda items, IN ATTENDANCE table, task delegation table, signature lines)
2. Minutes appear as an **editable textarea** — user corrects names, times, agenda items
3. "Extract Tasks & Briefings from These Minutes" sends edited text to `/api/process-text` which runs the full agent pipeline on the edited content (skips transcription)
4. OR "Process Meeting" sends the original audio blob through `/api/process` for Groq transcription + full pipeline

### Minutes Draft (event page)
- `MinutesPreview.tsx` — editable, with Save/Cancel
- Export as `.txt` (file download)
- Export as PDF (opens print dialog in new window with Times New Roman, print margins)
- Copy to clipboard

### Role Briefings (event page)
- `BriefingTabs.tsx` — 4 tabs: Secretary / OC / CC VCC / EXCO
- Each tab has its own Copy button

### Dashboard
- Event cards with task count, blocker count, urgency indicator
- "High Priority" risk banner across events
- "New Event" dialog — creates event in Supabase, redirects to event page

### Event Detail Page (section order, top to bottom)
1. New Meeting Recording (Live Record tab / Upload File tab)
2. Role Briefings (4 tabs)
3. Meeting Record (minutes draft — editable, exportable)
4. High Priority (risk signals)
5. Tasks table (status editable inline)
6. Ask About [Event] (query panel)

---

## 5. API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/process` | POST | Audio file → Groq transcription → full agent pipeline → save to DB |
| `/api/process-text` | POST | Text transcript → full agent pipeline (skip transcription) → save to DB |
| `/api/transcribe` | POST | Audio chunk → Groq → transcript string (used by older chunk flow, mostly unused now) |
| `/api/minutes` | POST | Transcript text → SPSU-formatted minutes draft via Claude |
| `/api/events` | POST | Create new event in Supabase |
| `/api/query` | POST | Natural language question → task-grounded answer via Claude |

---

## 6. Data Model

```sql
events       id, name, event_date, org_id, status, created_at
tasks        id, event_id, assignee, task, deadline, urgency, status, is_blocker, notes
meetings     id, event_id, transcript, briefings (jsonb), risks (jsonb), minutes_draft, created_at
```

`org_id` defaults to `'demo-org'` for all hackathon inserts.

Briefings are stored as JSONB: `{ secretary, oc, cc_vcc, exco }`.

---

## 7. Auth and DB Client Rules

- **`createServerSupabaseClient`** — uses Clerk JWT. Use for reads in server components (dashboard page, event page). Does NOT work for inserts without Supabase configured to trust Clerk JWTs.
- **`createAdminSupabaseClient`** — uses `SUPABASE_SERVICE_ROLE_KEY`. Use in all API route handlers. Bypasses RLS. Never expose to client.
- **`createBrowserSupabaseClient`** — client-side, used in `EventDetailClient` for task status updates via Clerk token.

---

## 8. Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          ← required for all API route DB writes
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
GROQ_API_KEY                       ← required for audio transcription
ANTHROPIC_API_KEY                  ← required for all Claude agents
```

---

## 9. What Is Still To Do / Known Gaps

| Item | Status |
|---|---|
| End-to-end test with real audio | Not confirmed — needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` |
| Speaker diarization | Not built — Groq returns flat transcript |
| Task review/edit modal before saving | Not built — tasks save automatically |
| Supabase migration for `events` UPDATE policy | File written (`003_events_update_policy.sql`), must be run in SQL editor |
| Persistent minutes edits (saved to DB) | Minutes edited in UI but not persisted back to `meetings` row |
| Cross-event person overload detection | Risk signals exist but don't join across events |
| Demo data for presentation | `lib/mock-data.ts` has 3 events, 8 tasks, 3 risks — used when DB is empty |

---

## 10. Demo Script

**Best flow for judges:**

1. Open dashboard — show 3 active events with risk banner
2. Open an event → point to "High Priority" and "Tasks" populated from a previous run
3. Go to "New Meeting Recording" → start live recording, speak for 30 seconds → show live transcript appearing in real time
4. Stop recording → show SPSU minutes auto-formatting
5. Edit a name in the minutes textarea → click "Extract Tasks & Briefings from These Minutes"
6. Watch briefing tabs populate — click through Secretary / OC / CC VCC / EXCO to show different content
7. Show "Meeting Record" — click Edit → make a change → Export PDF
8. Point to task table updating live

**Best "aha" moment:**
Switch between Secretary and EXCO tabs and explain why they are different: the Secretary sees documentation gaps and ambiguous owners; EXCO sees only structured risk signals with no raw transcript, because executives need to escalate, not read.

---

## 11. The Core Sentence

**Most AI meeting tools create one summary for everyone. Orin turns one meeting into role-specific operational briefings and ready-to-edit formal documentation, so each person sees only what they need to act on.**

Do not let the pitch become "AI meeting notes." The differentiator is attention routing by role.
