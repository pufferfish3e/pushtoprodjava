# Orin

> **One meeting → four role-specific briefings + a ready-to-edit minutes draft.**

AI-powered attention routing and documentation support for student-run organizations. Built for SPSU (Singapore Polytechnic Students' Union).

---

## The Problem

SPSU runs many overlapping events with volunteer committees. Every meeting produces one shared stream of notes — but a CC/VCC needs blockers, the OC needs next actions, the Secretary needs documentation gaps, and EXCO needs cross-event risk. Nobody needs the same slice.

Right now that all gets flattened into one document nobody reads between meetings.

**Result:** CCs only notice issues after it's already late. Secretaries spend hours reconstructing meetings into formal minutes by hand.

---

## What This Does

Upload a meeting recording. Six specialized agents process it:

```
audio  ──► [Transcription]   Groq Whisper → transcript
           [Meeting Agent]   Claude → tasks, owners, deadlines, blockers
           [Routing Agent]   Claude → 4 role-specific briefings    ← the differentiator
           [Document Agent]  Claude → minutes draft ready to finalize
           [Risk Agent]      Claude → overloaded people, unowned blockers, deadline risks
question ► [Query Agent]     Claude → plain-English answer over live task data
```

**Each role gets a different output from the same meeting:**

| Role | Gets |
|---|---|
| Secretary | Documentation gaps, ambiguous owners, generated minutes draft |
| OC | What changed, next actions this week, what is blocked |
| CC / VCC | Blockers, highest-urgency tasks, where intervention is needed |
| EXCO | Cross-event risk, overloaded people, escalation signals |

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui |
| Auth | Clerk |
| Database | Supabase Postgres + RLS |
| Transcription | Groq Whisper large-v3-turbo |
| AI agents | Claude Sonnet 4.6 (Anthropic) |
| Hosting | Vercel |

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` → `.env.local` and fill in:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
```

Keys from:
- [Clerk Dashboard](https://dashboard.clerk.com) → API Keys
- [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → Data API
- [Anthropic Console](https://console.anthropic.com)
- [Groq Console](https://console.groq.com)

### 3. Database

Paste `supabase/migrations/initialsetup.sql` into Supabase SQL editor. Creates `events`, `meetings`, `tasks` tables with RLS and seeds 3 demo events.

Connect Clerk → Supabase: Clerk Dashboard → Integrations → Supabase → activate → copy domain → Supabase → Authentication → Add provider → Clerk → paste domain.

### 4. Run

```bash
npm run dev
```

`http://localhost:3000` → sign in → dashboard.

---

## Routes

| Route | What |
|---|---|
| `/dashboard` | Cross-event overview — active events, risk signals |
| `/dashboard/events/[id]` | Event detail — tasks, upload, briefings, minutes, query |
| `/test` | Dev tool — test all API endpoints |
| `/api/process` | `POST` audio + event_id → full `ProcessResponse` |
| `/api/query` | `POST` question + event_id? → plain-English answer |

---

## Demo Data

Three seeded SPSU events in `data/demo/`:

| File | Signals |
|---|---|
| `notes-orientation-camp.txt` | Campsite blocker, transport dependency chain |
| `notes-freshmen-social.txt` | Venue blocker, cross-event overload |
| `notes-leadership-summit.txt` | Facilitator at-risk, EXCO oversight angle |

Sample NL queries in `data/demo/queries.txt`.

---

## Project Structure

```
app/
  dashboard/              Cross-event overview (server, live Supabase reads)
  dashboard/events/[id]/  Event detail (server fetch → client wrapper)
  api/process/            Full pipeline: audio → Groq → Claude → Supabase
  api/query/              NL query over task data
  test/                   Dev endpoint tester

components/
  EventDetailClient.tsx   Upload wire-up, live state, inline status updates
  AudioUpload.tsx         Drag-drop audio input
  TaskTable.tsx           Urgency+blocker sorted, inline status change
  BriefingTabs.tsx        4 role tabs (Secretary / OC / CC-VCC / EXCO)
  RiskBanner.tsx          High/medium risk signal alerts
  MinutesPreview.tsx      Secretary doc draft + copy
  QueryPanel.tsx          NL query input + response

lib/
  claude.ts               All 5 Claude agents (Zod-validated output)
  groq.ts                 Whisper transcription
  types.ts                Shared TypeScript interfaces
  derive-risks.ts         Risk signal derivation from task data
  mock-data.ts            Demo fixtures (aligned with seeded UUIDs)

supabase/migrations/      Schema + seed SQL
data/demo/                Sample meeting notes + queries
```

---

## The One Line

> Most AI meeting tools create one summary for everyone. We turn one meeting into role-specific operational briefings and a usable minutes draft — so each person sees only what they need to act on.
