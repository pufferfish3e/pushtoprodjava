# Orin

> **One meeting. Five AI agents. Four role-specific briefings. Zero manual sorting.**

AI-powered attention routing and documentation support for student-run organizations — built for SPSU (Singapore Polytechnic Students' Union) at the [Push to Prod Hackathon](https://push-to-prod.devfolio.co/overview).

[![Live Demo](https://img.shields.io/badge/Live%20Demo-%F0%9F%9A%80%20pushtoprodjava.vercel.app-000000?style=for-the-badge&logo=vercel)](https://pushtoprodjava.vercel.app)
[![View Slide Deck](https://img.shields.io/badge/View%20Slide%20Deck-%F0%9F%93%BD%20Canva-6C63FF?style=for-the-badge)](https://canva.link/kjmck7pmxtncip5)
[![GitHub Repo](https://img.shields.io/badge/GitHub%20Repo-%F0%9F%90%99%20pufferfish3e-181717?style=for-the-badge&logo=github)](https://github.com/pufferfish3e/pushtoprodjava)

---

## The Problem

SPSU runs many overlapping events with volunteer committees. Every meeting produces one shared stream of notes — but different roles need different information:

| Role | What they actually need |
|---|---|
| **Secretary** | Documentation gaps, ambiguous owners, minutes |
| **OC (Organising Committee)** | Tasks and deadlines, what's blocked |
| **CC / VCC** | Blockers, urgency-5 items, where to intervene |
| **EXCO** | Cross-event risk, overloaded people, escalation points |

Right now, everyone reads the same document. This means:

- Wasted time filtering irrelevant information
- Important signals missed between meetings
- Delayed decisions and escalation
- Secretaries spending hours manually reformatting notes into minutes

**The core problem: organizations create too much shared information, but not enough role-relevant information.**

---

## What Orin Does

Upload a meeting recording or paste notes. Five specialized AI agents process it simultaneously:

```
audio  ──► [Transcription Agent]   Groq Whisper → raw transcript
           [Meeting Agent]         Claude → tasks, owners, deadlines, blockers
           [Routing Agent]         Claude → 4 role-specific briefings  ← the differentiator
           [Document Agent]        Claude → ready-to-finalize minutes draft
           [Risk Agent]            Claude → overloaded people, unowned blockers, deadline risks
question ► [Query Agent]           Claude → plain-English answer over live task data
```

Each role gets a completely different output from the same meeting — not a different slice of the same summary, but a structurally different briefing built from what each role actually needs to act on.

---

## Agent Overview

Orin is a six-agent pipeline. Five run in parallel on every meeting upload.

### 1. Transcription Agent
**Technology:** Groq Whisper `large-v3-turbo`
**Input:** Raw audio file (`.mp3`, `.wav`, `.m4a`)
**Output:** Plain-text transcript

Converts spoken meeting audio to text. Groq's Whisper implementation is used for speed — transcription of a typical 30-minute meeting completes in under 10 seconds.

---

### 2. Meeting Agent
**Technology:** Claude Sonnet 4.6
**Input:** Transcript
**Output:** Structured JSON — `tasks[]`, `decisions[]`

The extraction backbone. Reads raw, unstructured meeting text and produces a typed task list with assignees, deadlines, urgency scores (1–5), blocker flags, and status. This is the data layer that all downstream agents use.

Key extraction logic:
- Urgency 5 = critical blocker, 4 = must do this week, 3 = normal, 2 = low, 1 = someday
- `is_blocker = true` if the task blocks another task or the event itself from proceeding
- All output is Zod-validated before being used downstream

---

### 3. Routing Agent
**Technology:** Claude Sonnet 4.6
**Input:** Structured meeting state + transcript + event name
**Output:** Four role-specific briefings (Secretary / OC / CC-VCC / EXCO)

This is the core differentiator. Rather than filtering a single summary, the Routing Agent produces four structurally distinct outputs — each built around what that role needs to act on:

- **Secretary briefing:** documentation gaps, ambiguous owners, decisions that must appear in formal records
- **OC briefing:** what changed, next actions this week, what is blocked or waiting
- **CC / VCC briefing:** blockers, highest-urgency tasks, slipping items, where direct intervention is needed
- **EXCO briefing:** cross-event risk, overloaded people, major unresolved blockers, escalation signals

---

### 4. Document Agent
**Technology:** Claude Sonnet 4.6 (co-located with Routing Agent for latency efficiency)
**Input:** Structured meeting state + transcript
**Output:** Formal minutes draft in paragraph form

Generates a ready-to-review minutes document that the Secretary can finalize rather than write from scratch. Dramatically reduces documentation overhead for volunteer-run committees.

---

### 5. Risk Agent
**Technology:** Claude Sonnet 4.6 (co-located with Routing Agent) + client-side derivation
**Input:** Structured task data
**Output:** `RiskSignal[]` with type, description, and severity (`high` / `medium`)

Detects four categories of risk automatically:

| Risk Type | What it flags |
|---|---|
| `overloaded_person` | Same assignee on too many high-urgency tasks |
| `unowned_blocker` | A blocker with no clear owner |
| `deadline_risk` | Tasks with deadlines approaching but not started |
| `unresolved_task` | High-urgency tasks still pending with no update |

---

### 6. Query Agent
**Technology:** Claude Sonnet 4.6
**Input:** Natural-language question + live task data from Supabase
**Output:** Plain-English answer grounded in stored task data

Lets any team member ask questions like "Who is most overloaded right now?" or "What is blocking the Freshmen Social?" and get a direct, data-grounded answer — no filtering, no query syntax.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                   │
│  Next.js App Router · React 19 · Tailwind v4         │
│  Clerk Auth · shadcn/ui components                   │
└────────────┬────────────────────────────┬────────────┘
             │ POST /api/process           │ POST /api/query
             ▼                             ▼
┌────────────────────────┐   ┌────────────────────────┐
│    /api/process         │   │    /api/query           │
│  (Next.js Route Handler)│   │  (Next.js Route Handler)│
└──────────┬─────────────┘   └──────────┬─────────────┘
           │                             │
           ▼                             ▼
┌──────────────────────────────────────────────────────┐
│              Server-Side Agent Layer (lib/)           │
│                                                       │
│  groq.ts          → Transcription Agent (Groq)       │
│  claude.ts        → Meeting Agent (Claude)            │
│  claude.ts        → Routing Agent (Claude)            │
│  claude.ts        → Document Agent (Claude)           │
│  derive-risks.ts  → Risk Agent (derived + Claude)     │
│  claude.ts        → Query Agent (Claude)              │
│                                                       │
│  Promise.all() for agents 2–5 (parallel execution)   │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                  Supabase Postgres                    │
│  events · meetings · tasks  (RLS enabled)            │
│  Clerk JWT → Supabase tenant boundary                │
└──────────────────────────────────────────────────────┘
```

**Key architectural decisions:**
- All Claude calls are server-side only — API keys never reach the client
- Agents 2–5 run in `Promise.all()` to keep total processing time under 30 seconds
- Zod validates every Claude response before it touches the database
- RLS enforces per-org data isolation at the database level

---

## User Workflow

```
1. Sign in (Clerk auth)
          │
          ▼
2. Dashboard — cross-event overview
   Active events · risk signals · who is overloaded
          │
          ▼
3. Open an event
   Task table (sorted by urgency + blocker status)
   Briefing tabs (Secretary / OC / CC-VCC / EXCO)
   Risk banner (high/medium severity alerts)
          │
          ▼
4. Upload a meeting recording (or paste notes)
   → Transcription Agent runs (Groq)
   → Meeting + Routing + Document + Risk Agents run in parallel (Claude)
          │
          ▼
5. Review extracted tasks before publishing
   Inline edit: assignee, urgency, deadline
   "Publish all" → saved to Supabase
          │
          ▼
6. Read your role-specific briefing
   Each role sees a structurally different output
          │
          ▼
7. Ask a natural-language question
   "What is blocking the Leadership Summit?"
   → Query Agent answers from live task data
```

---

## Supabase Setup

### Schema

Three tables, created via `supabase/migrations/initialsetup.sql`:

```sql
events  (id, name, event_date, org_id, status)
meetings (id, event_id, transcript, created_at)
tasks   (id, event_id, meeting_id, assignee, task, deadline,
         urgency, status, is_blocker, notes)
```

RLS is enabled on all tables. Policies scope reads and writes to the authenticated user's `org_id` via the Clerk JWT.

### Clerk → Supabase Connection

Clerk Dashboard → Integrations → Supabase → activate → copy domain → Supabase → Authentication → Add provider → Clerk → paste domain.

### Strengths

- **Instant setup** — no migration tooling overhead, schema is in one SQL file pasted into the dashboard
- **RLS out of the box** — role-level data isolation without building a middleware auth layer
- **Realtime-ready** — task status updates propagate without polling
- **Generous free tier** — no billing friction during a hackathon build
- **Clerk native integration** — JWT-based tenant boundary means no custom auth logic

### Weaknesses

- **Cold start on queries** — free-tier Supabase instances pause after inactivity; first query after pause has noticeable latency
- **No schema migrations in dev** — we paste SQL manually; in production this would need a proper migration tool
- **RLS complexity at scale** — policies are simple today (org_id match), but multi-role permission hierarchies would require significant policy work

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui |
| Auth | Clerk |
| Database | Supabase Postgres + Row Level Security |
| Transcription | Groq Whisper `large-v3-turbo` |
| AI Agents | Claude Sonnet 4.6 (Anthropic) |
| Hosting | Vercel |

---

## Local Setup

### 1. Install dependencies

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

Paste `supabase/migrations/initialsetup.sql` into the Supabase SQL editor. Creates `events`, `meetings`, and `tasks` tables with RLS enabled, and seeds 3 demo SPSU events.

Connect Clerk → Supabase: Clerk Dashboard → Integrations → Supabase → activate → copy domain → Supabase → Authentication → Add provider → Clerk → paste domain.

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000` → sign in → dashboard.

---

## Demo Data

Three seeded SPSU events in `data/demo/`:

| File | What it demonstrates |
|---|---|
| `notes-orientation-camp.txt` | Campsite booking blocker, transport dependency chain |
| `notes-freshmen-social.txt` | Venue not confirmed blocker, cross-event personnel overload |
| `notes-leadership-summit.txt` | External facilitator at-risk, EXCO oversight angle |

Sample natural-language queries in `data/demo/queries.txt`.

---

## Judging Criteria

### Technicality
Orin is a fully functional end-to-end application. The complete workflow — audio upload → transcription → parallel AI extraction → structured database storage → role-specific briefings → natural-language query — works in production. The codebase is built on a production stack (Next.js 16, Supabase, Clerk, Vercel) with Zod validation, RLS, and TypeScript throughout. This is not a prototype behind a static mock — every agent actually runs and every output is grounded in live data.

Built in 5 hours with a parallel-lane team structure that kept individual developers unblocked throughout the sprint.

### Originality
Most AI meeting tools produce one summary for everyone. Orin's differentiator is **attention routing**: the same meeting produces structurally different outputs for each role, determined not just by prompt variation but by controlling *what each agent is allowed to see and act on*. The concept of role-scoped information routing applied to volunteer-run student organizations is a fresh framing on a solved-feeling problem.

### Practicality
Orin is a web application accessible from any device with a browser. The target users — student committee members at Singapore Polytechnic — have no special hardware or software requirements. The workflow mirrors how these organizations already run: meetings happen, notes need processing, people need to know what to do next. Orin integrates into that workflow rather than replacing it.

### Aesthetics
Pure dark theme, high information density, zero clutter. Built with shadcn/ui `base-nova` on Tailwind v4 with a consistent semantic token system. The interface is task-focused: urgency and blocker status are always visible, briefings are one click away, risk signals surface automatically. No decoration that doesn't carry information.

### Wow Factor
Five agents, parallel execution, one meeting input, four completely different structured outputs, a live query interface, an auto-generated minutes draft, and a real-time risk surface — all built in a single hackathon session and deployed to production. The combination of Groq's transcription speed with Claude's extraction quality means a recorded meeting becomes actionable role-specific intelligence in under 30 seconds.

---

## Project Structure

```
app/
  dashboard/              Cross-event overview (server, live Supabase reads)
  dashboard/events/[id]/  Event detail (task table, briefings, upload, query)
  api/process/            Full pipeline: audio → Groq → Claude → Supabase
  api/query/              NL query over live task data
  test/                   Dev endpoint tester

components/
  EventDetailClient.tsx   Upload, live state, inline status updates
  AudioUpload.tsx         Drag-drop audio input
  TaskTable.tsx           Urgency+blocker sorted, inline status change
  BriefingTabs.tsx        4 role tabs (Secretary / OC / CC-VCC / EXCO)
  RiskBanner.tsx          High/medium risk signal alerts
  MinutesPreview.tsx      Secretary doc draft + copy
  QueryPanel.tsx          NL query input + response

lib/
  claude.ts               All Claude agents (Zod-validated output)
  groq.ts                 Whisper transcription
  types.ts                Shared TypeScript interfaces
  derive-risks.ts         Risk signal derivation from task data
  mock-data.ts            Demo fixtures (aligned with seeded UUIDs)

supabase/migrations/      Schema + seed SQL
data/demo/                Sample meeting notes + queries
```

---

> Most AI meeting tools create one summary for everyone. Orin turns one meeting into role-specific operational briefings and a usable minutes draft — so each person sees only what they need to act on.