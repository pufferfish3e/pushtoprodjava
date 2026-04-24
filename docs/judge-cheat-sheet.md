# Judge Cheat Sheet

## One-line framing

"Most AI meeting tools give everyone the same summary. We turn one meeting into four role-specific operational briefings plus a ready-to-edit minutes draft — so each person sees only what they need to act on."

## What is actually built and working

- Secretary uploads or records meeting audio
- Transcription Agent (Groq Whisper) converts audio to text
- Meeting Agent (Claude) extracts structured tasks, owners, deadlines, urgency, blockers
- Attention Routing Agent (Claude) generates 4 distinct briefings: Secretary / OC / CC-VCC / EXCO
- Document Agent (Claude) produces a formal minutes draft the secretary can review immediately
- Risk Agent (Claude) surfaces overloaded people, unowned blockers, deadline risks
- Dashboard shows all active events with live blockers and cross-event risk signals
- Event detail page shows urgency-sorted task table, 4 role briefing tabs, minutes preview
- Task status can be updated inline (Pending → In Progress → Done / Blocked)
- Query Agent answers plain-English questions over live task data
- All data persisted in Supabase with RLS

## The demo flow (practice this sequence)

1. Open dashboard — show 3 active SPSU events, risk banners, cross-event overload signal
2. Click an event — show urgency-sorted tasks with blocker highlighted
3. Upload a meeting audio clip (use `data/demo/notes-orientation-camp.txt` converted, or a real recording)
4. Pipeline runs: transcription → extraction → briefings → risks → minutes (6-12 seconds)
5. Tasks update live on the page
6. Open Briefing Tabs — show Secretary vs OC vs CC/VCC vs EXCO tabs, each with different focus
7. Show minutes draft — point out secretary can copy and finalize this immediately
8. Ask a question: "What is still blocking the orientation camp?" — plain-English answer appears

## The "aha" moment to land

> "One meeting. Four different briefings. One formal draft. Each person sees what matters to their role — not the same cluttered transcript."

## Why this is different from Notion AI / Zoom AI / generic summarizers

Those tools create one summary for everyone. Ours classifies and routes information by role:
- Secretary gets documentation gaps and ambiguity flags
- OC gets next actions this week and what is blocked
- CC/VCC gets blockers and intervention points
- EXCO gets cross-event risk and overloaded people

That is a fundamentally different output — not a better summary, a role-aware routing layer.

## Agent architecture (show this if asked about the AI system)

```
audio  ──► [Transcription Agent — Groq Whisper]  ──► transcript
           [Meeting Agent — Claude]              ──► tasks + decisions
           [Attention Routing Agent — Claude]    ──► 4 role briefings  ← main differentiator
           [Document Agent — Claude]             ──► minutes draft
           [Risk Agent — Claude]                 ──► risk signals
question ► [Query Agent — Claude]               ──► plain-English answer
```

## Clean judge answers

### Why not just use Notion, Asana, or a spreadsheet?

Those tools still require someone to manually convert meeting discussion into tasks. Our value is that the extraction happens automatically from audio the team already records.

### What if the AI gets a task wrong?

Every task is visible in the review UI before and after saving. The secretary sanity-checks the output. Claude handles the heavy lift; humans stay in control.

### Why is this better than just reading minutes?

Minutes are passive documents. This turns them into live coordination data. Instead of opening a PDF, a CC can see blockers and ask a direct question immediately.

### Why four briefings instead of one?

Because a committee member doing logistics does not need the EXCO risk escalation signals, and the EXCO does not need the secretary's documentation ambiguity checklist. Showing everyone everything is the problem we are solving.

### Why Groq for transcription?

Groq runs Whisper at very low latency. The transcription step completes in 2-4 seconds for a short clip, which keeps the demo tight.

### Is this credible in a hackathon?

The scope is narrow by design. One upload flow, one event page, four briefings, one minutes draft, one query. Everything else was intentionally cut to make this part reliable.

## What was intentionally cut

- Telegram / push alerts
- Scheduled background agents
- Full document export (PDF/DOCX)
- Calendar views
- Real-time collaborative editing
- Live in-meeting transcription streaming

## Stack summary (if asked)

- Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui
- Clerk for auth, Supabase Postgres with RLS for data
- Groq (Whisper) for transcription, Claude Sonnet 4.6 for all AI agents
- Deployed on Vercel

## Trend notes with sources

- Next.js 16: https://nextjs.org/blog/next-16
- Clerk + Supabase guide (updated Apr 17 2026): https://clerk.com/docs/guides/development/integrations/databases/supabase
- Claude Sonnet 4.6 (announced Feb 17 2026): https://www.anthropic.com/research/claude-sonnet-4-6
- Supabase AI docs: https://supabase.com/docs/guides/ai
