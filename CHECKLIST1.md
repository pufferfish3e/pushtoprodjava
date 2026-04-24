# Build Checklist

---

## Dev 1 — Backend / AI Pipeline

### ✅ Done
- [x] `groq-sdk` + `zod` installed
- [x] `lib/types.ts` — base contract (`Event`, `Task`, `Meeting`, `ProcessResponse`)
- [x] `lib/groq.ts` — `transcribeAudio(file)` → transcript string
- [x] `app/api/process/route.ts` — POST audio + event_id → Groq transcript → saved to `meetings` table

### ✅ Done — Claude pipeline
- [x] `npm install @anthropic-ai/sdk`
- [x] `lib/claude.ts` — Meeting Agent: transcript → tasks + decisions (Zod-validated JSON)
- [x] `lib/claude.ts` — Attention Routing Agent: state → 4 role briefings (secretary / oc / cc_vcc / exco)
- [x] `lib/claude.ts` — Document Agent: transcript + state → minutes draft
- [x] `lib/claude.ts` — Risk Agent: state → risk signals array
- [x] `lib/claude.ts` — Query Agent: NL question + tasks → plain-English answer
- [x] `app/api/process/route.ts` — full chain: Groq → extract → route → save tasks + meeting to Supabase
- [x] `app/api/query/route.ts` — POST question + optional event_id → Claude answer over task rows
- [x] `lib/types.ts` — unified: `Event`, `Task`, `Meeting`, `Briefings`, `RiskSignal`, `ExtractionResult`, `ProcessResponse`, `QueryResponse`

### 🔄 Next — Supabase
- [ ] Run migration SQL in Supabase dashboard (events + meetings + tasks + RLS policies)
- [ ] Add `briefings jsonb`, `risks jsonb`, `minutes_draft text` columns to `meetings` table
- [ ] Seed demo data: 3 SPSU events, believable tasks, 1 blocker, 1 urgency-5 task, 1 cross-event conflict

### ⏳ Query lane
- [ ] `app/api/query/route.ts` — POST `{ question, event_id? }` → NL answer (Genspark adapter or Claude fallback)

### 🚀 Stretch
- [ ] Validate Claude JSON output with Zod schema before saving
- [ ] Retry logic if Claude returns malformed JSON
- [ ] `/api/process` streaming response for long transcripts
- [ ] Cross-event conflict detection in Risk Agent

### 🔗 What Dev 2 is waiting on
- `app/api/process/route.ts` full response shape (transcript + tasks + briefings + risks + minutes_draft) — **unblock first**
- Supabase schema live — needed for real data reads on dashboard
- Demo seed data — needed for a believable rehearsal

### Notes
- All Claude calls server-side only, never client
- Log: endpoint, event_id, tasks extracted, latency — per AGENTS.md §7.6
- No `any` — strict TypeScript throughout
- Validate Claude JSON before touching Supabase

---

# Frontend Build Checklist

## ✅ Completed (Dev 2)
- [x] shadcn/ui init with dark premium black/white theme
- [x] lib/types.ts — canonical handoff contract
- [x] AudioUpload.tsx — drag-drop file picker + POST to `/api/process`
- [x] TaskTable.tsx — urgency-sorted, blocker badges, status colors
- [x] BriefingTabs.tsx — 4 role briefings with loading states
- [x] RiskBanner.tsx — high/medium severity signals
- [x] MinutesPreview.tsx — secretary doc draft + copy button
- [x] Dashboard home page — event cards grid, cross-event risk overview
- [x] Event detail page — task table + briefings + minutes preview
- [x] Dashboard layout — sticky header with Clerk UserButton
- [x] Mock data — 3 realistic SPSU events, 2 blockers, 3 risk signals

## 🔄 In Progress (Dev 2)
- [ ] Wire AudioUpload to `/api/process` real response (pending Dev 1 endpoint)
- [ ] Add task review modal before publish (edit, confirm, save)
- [ ] Connect dashboard to Supabase real event/task reads
- [ ] Implement task edit/status update UI (mark done, blocked, etc.)

## ⏳ Next (Dev 2)
- [ ] Add task search/filter on event detail page
- [ ] Add query input panel (Genspark integration or adapter)
- [ ] Cross-event person workload view (summary of who's overloaded)
- [ ] Mobile responsive refinement
- [ ] Empty states for no events / no tasks / no briefings
- [ ] Loading skeleton states for real data fetch

## 🚀 Stretch (if time)
- [ ] Task deadline inline edit
- [ ] Drag-drop task status workflow
- [ ] Export minutes to markdown/docx
- [ ] Real-time Supabase realtime updates
- [ ] Dark mode toggle (currently dark-only)

## 🔗 Blockers / Dependencies
- `/api/process` endpoint (Dev 1) — needed for AudioUpload to work end-to-end
- Supabase schema (Dev 1) — needed to wire real reads
- Genspark integration (Dev 3) — needed for query lane

## Notes
- All components accept mock data and Supabase-ready interfaces
- No `any` types; all TypeScript strict
- shadcn/ui base-nova, no custom colors (semantic tokens only)
- Caveman code style: terse, direct, no overbuilt abstractions
