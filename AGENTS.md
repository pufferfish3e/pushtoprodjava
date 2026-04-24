# [PROJECT_NAME] - Hackathon Workspace Contract

Status at the time of writing:
- Project name: `[PROJECT_NAME]`
- Permanent visual identity: `[DESIGN_SYSTEM_TBD]`
- Primary domain: SPSU-inspired student-union event coordination
- Build target: a credible 5-hour hackathon MVP

This file is the canonical instruction set for AI agents and teammates working in this repo.

If another workspace file disagrees with this one, `AGENTS.md` wins.

## Quick Navigation

Important companion files:
- `CLAUDE.md` - Claude-specific guidance layered on top of this file
- `skills/README.md` - index of repo-local tool and workflow skills
- `docs/revised-hackathon-brief.md` - teammate-facing product and execution brief
- `docs/judge-cheat-sheet.md` - pitch and Q&A support
- `docs/external-skill-shortlist.md` - optional dev-support skills to find later

## 1. What This Repo Is Optimizing For

This repo is not optimizing for a polished brand launch.
It is optimizing for fast, parallel, low-friction product development during a short hackathon.

The success bar is:
- the team can build in parallel without stepping on each other
- an agent can read this file and immediately understand the product, architecture, and scope boundaries
- the demo tells one tight story instead of three half-built stories
- the app feels real enough to judge, even if branding and edge-case coverage are unfinished

## 2. Product Context

The real-world source problem comes from SPSU, the Singapore Polytechnic Students' Union.
SPSU runs many student events with volunteer committees, and event coordination is currently buried inside recordings, notes, minutes, and chat threads.

The important business problem is not "secretaries hate formatting."
The important business problems are:

1. "CCs, VCCs, advisors, and EXCO leaders do not have real-time visibility into what is happening across active events."
2. "Organizations create too much shared information, but not enough role-relevant information — the wrong people are forced to read the wrong level of detail."
3. "Secretaries still have to turn meetings into formal documentation by hand after every session."

This repo should preserve that framing.

The core differentiator is:

**Most AI meeting tools generate one summary for everyone. This product turns one meeting into role-specific operational briefings and usable formal documentation, so each person sees only what they need to act on.**

### SPSU roles that matter to the product

- President / Vice President: organization-wide oversight
- EXCO: portfolio leads and event-level CC / VCC / advisors
- SC members: the operational committee members doing the work
- Secretary: the person who captures notes, minutes, and task assignments
- CC / VCC: the main dashboard users who need visibility

### What agents should understand about the domain

- There are many events in one academic year
- Multiple events can run at the same time
- One person can be assigned across multiple events
- The real source material is meeting audio or recordings, not clean task data — transcription is step one
- Task urgency matters because deadlines and event dates are near
- A believable demo needs realistic event names, people, blockers, and deadlines

## 3. Canonical MVP

The MVP is exactly this:

`meeting audio -> Transcription Agent -> Meeting Agent (structured state) -> Attention Routing Agent (role briefings) -> Document Agent (minutes draft) + Risk Agent (risk signals) -> live dashboard -> Genspark natural-language query`

### Agent system (in pipeline order)

1. **Transcription Agent** — converts uploaded meeting audio into transcript text
2. **Meeting Agent** — converts transcript into structured operational state (tasks, owners, deadlines, blockers, decisions, urgency)
3. **Attention Routing Agent** — generates 4 role-specific briefings from the same state (Secretary / OC / CC VCC / EXCO) — **this is the core differentiator**
4. **Document Agent** — generates secretary-usable minutes draft from transcript + structured state
5. **Risk Agent** — derives risk signals (overloaded person, unowned blocker, critical-path slip)
6. **Query Agent** — natural-language question over live operational state (Genspark)

### Must ship

- Secretary can upload or capture meeting audio
- Transcription Agent produces transcript text
- Meeting Agent produces structured operational state saved to Supabase
- Attention Routing Agent produces 4 role-based briefings (Secretary / OC / CC VCC / EXCO)
- Document Agent produces at least one secretary-usable minutes draft
- Tasks can be reviewed and edited before publishing
- Home view shows active events with cross-event risk signals
- Event detail view shows task table + role briefing tabs + minutes preview
- One or two believable risk signals visible in the UI
- Seeded demo data makes the system feel real

### Strongly preferred if time allows

- conflict banner or cross-event warning for people double-booked across events
- "what changed since last meeting?" delta summary
- editable minutes preview before finalizing
- one narrow Query Agent (Genspark) flow

### Stretch only

- Telegram alerts
- scheduled background agents
- full live in-meeting streaming transcription
- polished docx export
- rich calendar views
- full document lifecycle automation

If time gets tight, cut stretch items first.
Do not protect a roadmap feature at the expense of the core demo loop.

## 4. Non-Goals

Do not spend hackathon hours on:
- inventing brand colors, mascots, logos, taglines, or typography systems
- migrating the starter to Vite or Express
- building a generic internal platform
- creating a full permissions matrix
- building a perfect minutes generator
- adding background automation just because it sounds impressive
- adding a package or service that requires long setup without materially improving the demo

## 5. Current Technical Baseline

This repo already starts with:
- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- Clerk auth
- Supabase helpers
- `proxy.ts` already in place

Build on this starter.
Do not restart the stack unless the team explicitly decides the starter is unusable.

### Canonical stack

- Frontend: Next.js App Router, React, Tailwind
- Auth: Clerk
- Data: Supabase Postgres with RLS
- AI extraction: Claude via server-side API route or server-only module
- NL query: Genspark
- Hosting target: Vercel

### Canonical route direction

These routes are expected unless the team agrees on an alternative:

- `/` or `/dashboard`: cross-event overview
- `/dashboard/events/[id]`: single event detail
- `/api/process`: note ingestion and Claude extraction
- `/api/query`: Genspark-backed natural-language query

## 6. Parallel Build Lanes

This repo is intended for parallel teammate and agent work.
Pick a lane and avoid touching other lanes unless required.

### Lane A - Extraction and data flow

Own:
- `app/api/process/*`
- `lib/claude.*`
- extraction-related types and validation

Responsibilities:
- notes in
- JSON out
- review-safe output shape
- save to Supabase

### Lane B - Dashboard UI (Dev 2)

**Read this first before touching any file.**

#### What is already built (do not rebuild)

All of the following files exist and are wired up. Pull the branch and verify before writing anything new.

```
lib/types.ts                              ← canonical types — read-only for Dev 2
lib/utils.ts                              ← shadcn cn() utility
lib/mock-data.ts                          ← 3 SPSU events, 8 tasks, 2 blockers, 3 risks
components/ui/*                           ← shadcn/ui components (button, badge, card, table, tabs, skeleton, alert, separator, input, progress)
components/AudioUpload.tsx                ← drag-drop file picker, POSTs to /api/process, loading state
components/BriefingTabs.tsx               ← 4 role tabs (Secretary / OC / CC VCC / EXCO)
components/TaskTable.tsx                  ← urgency-sorted, blocker badge, status colors
components/RiskBanner.tsx                 ← high/medium severity alert banners
components/MinutesPreview.tsx             ← monospace draft + copy button
app/dashboard/layout.tsx                  ← sticky header with Clerk UserButton, auth guard
app/dashboard/page.tsx                    ← event cards grid, cross-event risk signals (mock data)
app/dashboard/events/[id]/page.tsx        ← task table + briefings + minutes preview (mock data)
```

#### Design system

- shadcn/ui `base-nova` style, Tailwind v4
- Pure dark theme (black background, white text, no color accents)
- CSS variables in `app/globals.css` — do not add raw color values anywhere
- Use semantic tokens only: `bg-background`, `text-muted-foreground`, `text-destructive`, etc.
- Icons: `lucide-react` only

#### What Dev 2 needs to build next (priority order)

**1. Task review modal (must ship)**
- After `AudioUpload` receives the `ProcessResponse` from `/api/process`, open a review step
- Show extracted tasks in an editable list before saving
- Allow inline edit: assignee, urgency, deadline
- "Publish all" button saves to Supabase `tasks` table
- File: `components/TaskReviewModal.tsx` (new)
- Wire into: `app/dashboard/events/[id]/page.tsx` or a new `/dashboard/review` page

**2. Live Supabase data binding (must ship)**
- Replace `MOCK_EVENTS` / `MOCK_TASKS` / `MOCK_RISKS` imports with real Supabase reads
- Use `lib/supabase/server.ts` in server components (already configured)
- Query: `supabase.from('events').select('*')` and `supabase.from('tasks').select('*')`
- Keep mock data as fallback only if DB is not yet ready
- Risk signals (`MOCK_RISKS`) can be derived client-side from task data until Dev 1 ships them from the API

**3. Task status update (must ship)**
- Add a status dropdown or click-to-cycle on `TaskTable` rows
- Call `supabase.from('tasks').update({ status }).eq('id', id)` on change
- Optimistic UI update — do not wait for full page reload
- File: extend `components/TaskTable.tsx`

**4. Query input panel (after Dev 3 ships `/api/query`)**
- Simple textarea + submit button on the dashboard or event detail page
- POST to `/api/query`, render plain-English response below
- File: `components/QueryPanel.tsx` (new)

#### Handoff contract from Dev 1

Dev 1 owns `app/api/process/route.ts`. It returns exactly this shape:

```typescript
// Already in lib/types.ts
interface ProcessResponse {
  meeting_id: string
  transcript: string
  tasks: Task[]
  briefings: Briefings
  risks: RiskSignal[]
  minutes_draft: string
}
```

`AudioUpload.tsx` already calls `POST /api/process` and passes the result to `onResult(data: ProcessResponse)`. Wire that callback into the review modal.

#### Merge notes

When you pull this branch you will need to merge `lib/types.ts`. Dev 1 may have a `Meeting` interface — add it to the file without removing anything. All other files are non-conflicting new files.

#### What Dev 2 must not touch

- `app/api/process/*` — Dev 1 owns this
- `app/api/query/*` — Dev 3 owns this
- `lib/groq.ts` — Dev 1 owns this
- `lib/supabase/*` — shared, read-only for Dev 2

### Lane C - Query interface

Own:
- `app/api/query/*`
- query input and response panel
- Genspark integration or adapter layer

Responsibilities:
- take a natural-language question
- run the Genspark query flow
- return a plain-English answer grounded in stored task data

### Lane D - Demo data and pitch support

Own:
- seeded demo fixtures
- sample meeting notes
- sample queries
- pitch support docs

Responsibilities:
- make the demo believable
- keep the data consistent across extraction, dashboard, and query flows

### Ownership rules

- One component per file
- Avoid multi-person edits to the same file when possible
- If a shared type changes, update the downstream lanes immediately
- Prefer small adapters over wide refactors during the sprint
- Leave concise comments only where the code would otherwise be hard to parse

## 7. Architecture Rules

### 7.1 Supabase from day one

Use Supabase from the start.
Do not rely on an in-memory store unless the database setup is completely blocked and the team explicitly chooses a temporary fallback.

### 7.2 RLS-first

All real data access should assume Row Level Security.
Do not put service-role keys in the client.
Do not write client-side code that assumes unrestricted table access.

### 7.3 Clerk is the auth system

Use Clerk for authentication.
Use Supabase as the database and realtime layer.

Preferred tenant boundary:
- Clerk organization ID when available

Hackathon fallback:
- If Clerk Organizations are not configured in time, use a single fixed demo `org_id` for the hackathon rather than blocking MVP progress

### 7.4 Keep the schema small

The starting schema should stay MVP-sized.
Prefer the smallest set of tables that supports the demo.

Reasonable first tables:
- `events`
- `tasks`

Optional only if clearly needed:
- lightweight ingestion / review table for raw note submissions

Do not design a production-grade document lifecycle schema on day one.

### 7.5 Prefer end-to-end simple shapes

Prefer DB-friendly snake_case end-to-end during the hackathon.
Do not add DTO mapper layers just to convert naming styles.

### 7.6 Agent-readable logs

Server logs should be easy for humans and agents to parse.
Log:
- which endpoint ran
- which event was processed
- how many tasks were extracted
- whether parse / validation failed
- response latency if useful

Do not dump secrets or full private note bodies into logs.

## 8. AI System Rules

### Claude usage

Claude is for:
- Meeting Agent: transcript → structured operational state (tasks, owners, deadlines, blockers, decisions, urgency)
- Attention Routing Agent: structured state → 4 role-specific briefings (Secretary / OC / CC VCC / EXCO)
- Document Agent: transcript + structured state → secretary-usable minutes draft
- Risk Agent: structured state → risk signals
- urgency inference and cross-event conflict detection

Claude is not for:
- client-side calls
- ornamental copy generation during the sprint
- replacing the dashboard or query system itself
- transcription (use Groq Whisper or equivalent for the Transcription Agent)

Claude guidance:
- use the Anthropic Messages API from server code only
- prefer the latest stable Sonnet-tier model available to the team
- if the team has already validated a prompt on a pinned model, do not swap models close to demo time without retesting
- parse structured JSON, then validate it
- test extraction and briefing prompts on at least 3 sample transcripts before trusting them
- the Attention Routing Agent prompt is the most important — protect it from last-minute changes

### Genspark usage

Genspark has one core job in this repo:

`natural-language question -> structured task lookup -> plain-English answer`

Keep it narrow and reliable.

Do not turn Genspark into:
- a cron system
- a background notification engine
- a second extraction layer
- a vague "AI assistant" with no clear task boundary

If the real Genspark integration is slow to wire up, create a clean adapter boundary so the UI and response format can be finished in parallel.

## 9. Temporary UI Rules While Design Is Unset

The permanent design system is intentionally blank.
Do not invent one inside the codebase without team agreement.

Current status:
- Project name: `[PROJECT_NAME]`
- Brand palette: `[DESIGN_SYSTEM_TBD]`
- Font system: `[DESIGN_SYSTEM_TBD]`

Until the team decides branding, use temporary MVP UI rules:
- use neutral Tailwind colors such as zinc, slate, stone, or gray
- keep screens clean, high-contrast, and readable
- optimize for information density over ornament
- use consistent spacing and card/table patterns
- keep styling easy to replace later
- prefer system or existing default fonts over introducing a font decision
- avoid fancy animation unless it materially improves comprehension

Preferred UI library path:
- `shadcn/ui` plus Tailwind if installed quickly
- if the package setup slows the sprint, ship with lightweight local Tailwind components first

The UI should look intentional, but branding is not the problem to solve today.

## 10. Package Policy

Fast iteration matters more than dependency purity, but package churn can still kill a hackathon hour.

### Preapproved package shortlist

These are reasonable adds if they directly unblock the MVP:
- `@anthropic-ai/sdk`
- `zod`
- `lucide-react`
- `date-fns`
- `@radix-ui/*`
- `class-variance-authority`
- `clsx`
- `tailwind-merge`

### Add with caution

Only add a new package if it saves more time than it costs:
- shadcn/ui related packages
- CSV / export utilities
- lightweight markdown or syntax helpers

### Avoid unless absolutely necessary

- ORMs
- global state libraries
- charting suites
- workflow engines
- background job infrastructure
- calendar libraries
- PDF / docx generation libraries before the core loop is stable

## 11. Coding Rules

- No `any`
- No giant files
- No speculative abstraction
- No premature generic frameworks
- No server secrets in client code
- No route rewrites that fight the starter unless necessary
- No roadmap-only code hidden behind TODO comments

Prefer:
- small shared types
- route handlers and server helpers that are easy to test
- explicit empty/loading/error states
- deterministic demo fixtures
- direct code over indirect architecture

## 12. Suggested Shared Types

Keep shared types small and obvious.
Put them in one place early.

Reasonable MVP types:
- `event`
- `task`
- `extraction_result`
- `query_answer`
- `task_status`
- `task_urgency`

Reasonable event fields:
- `id`
- `name`
- `event_date`
- `org_id`
- `status`

Reasonable task fields:
- `id`
- `event_id`
- `assignee`
- `task`
- `deadline`
- `urgency`
- `status`
- `is_blocker`
- `notes`

## 13. Demo Data Is a First-Class Asset

Demo data is not an afterthought.
It is part of the product.

Agents should help create:
- 3 realistic concurrent events
- believable committee members and secretaries
- raw meeting notes that actually exercise extraction
- 3 to 5 good Genspark queries
- one obvious blocker
- one obvious urgency-5 task
- one cross-event staffing or deadline conflict

Preferred approach:
- keep fixtures in versioned repo files
- make the same fixtures usable for manual testing, prompt testing, and live demo rehearsal

## 14. Handoff Rules

When finishing a task, report:
- files changed
- what now works
- what is still blocked
- what the next lane should do next

If a change affects another lane:
- mention the new type or contract explicitly
- do not make teammates reverse-engineer your output

## 15. Current Trend Notes

These notes are here to keep the repo aligned with current tooling, not to trigger unnecessary refactors.

- Next.js 16 was released on October 21, 2025 and formalized `proxy.ts`, better request logging, and DevTools MCP for AI-assisted debugging.
- Next.js Proxy docs were updated on March 31, 2026 and explicitly position `proxy.ts` as a request boundary, not a place for slow data fetching.
- Clerk's Supabase integration guide was updated on April 17, 2026 and recommends the native Supabase integration plus RLS rather than the old JWT template flow.
- Anthropic announced Claude Sonnet 4.6 on February 17, 2026 as the most capable Sonnet model yet, which is relevant for extraction quality and coding support.
- Supabase's current docs emphasize AI workflows, Realtime, and "Start with Supabase AI prompts," which matches a fast AI-product build path.

Use these trends to justify the stack.
Do not use them as an excuse to broaden scope.

## 16. Sources

- Next.js 16: https://nextjs.org/blog/next-16
- Next.js Proxy docs: https://nextjs.org/docs/app/getting-started/proxy
- Clerk + Supabase integration: https://clerk.com/docs/guides/development/integrations/databases/supabase
- Clerk Next.js reference: https://clerk.com/docs/reference/nextjs/overview
- Anthropic models overview: https://platform.claude.com/docs/en/about-claude/models/overview
- Anthropic Sonnet 4.6: https://www.anthropic.com/research/claude-sonnet-4-6
- Supabase docs: https://supabase.com/docs
- Supabase AI docs: https://supabase.com/docs/guides/ai

## 17. Final Sanity Check

If you are unsure what to build next, choose the option that most directly improves one of these:
- better extraction reliability
- faster task visibility
- clearer cross-event awareness
- stronger demo flow
- lower teammate coordination overhead

If it does not help one of those five things, it is probably not the next priority.
