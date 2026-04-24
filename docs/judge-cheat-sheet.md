# Judge Cheat Sheet

## One-line framing

"This comes from a real SPSU workflow problem: task ownership and event risk are buried inside meeting documents, so CCs and VCCs only notice issues after it is already late."

## Why this is a real internal workflow problem

- SPSU runs many student events with volunteer committees
- multiple events can be active at the same time
- the source of truth is usually notes, minutes, PDFs, chats, and trackers
- the people leading events do not get a live view of blockers and urgency
- secretaries do high-effort documentation work, but the useful task data stays trapped in documents

## Why Claude + Genspark is the right pairing

- Claude is strong at turning messy, unstructured meeting notes into structured tasks, blockers, and urgency
- Genspark is strong as a natural-language layer over existing task data
- together they do two different jobs:
  - Claude extracts and structures the operational truth
  - Genspark makes that truth easy to ask about in plain English

## What we intentionally cut for the hackathon

- Telegram alerts
- scheduled background agents
- audio transcription
- polished document export
- secondary calendar-heavy views

We cut those on purpose so the demo stays reliable:

`notes -> extraction -> dashboard -> query`

## Why this stack makes sense right now

As of April 24, 2026:

- Next.js 16 officially leans into clearer request boundaries with `proxy.ts` and AI-assisted debugging workflows, which is useful for a fast agent-friendly app
- Clerk's current Supabase guidance recommends native integration plus RLS, which keeps auth simple and secure for a hackathon app
- Supabase's current docs emphasize Realtime plus AI workflows, which fits a live ops dashboard
- Anthropic's current model lineup includes stronger Sonnet-tier models for coding and structured extraction, which fits our meeting-notes use case

## Clean judge answers

### Why not just use Notion, Asana, or a spreadsheet?

Those tools still expect someone to manually convert meeting discussion into tasks. Our value is that the task list is extracted automatically from notes the team already takes.

### What if the AI gets a task wrong?

The app is designed around human review before publish. Claude handles the heavy lift, and the secretary or organizer sanity-checks the output before it becomes the dashboard truth.

### Why is this better than just reading minutes?

Minutes are passive documents. This turns them into active coordination data. Instead of opening a PDF and digging, a lead can see blockers and ask a direct question immediately.

### Why use Genspark at all?

Because leaders often do not want raw rows first. They want a plain-English answer like "what is still unresolved for Appreciation Dinner?" Genspark is the query layer, not a gimmick.

### Why is this credible in a short hackathon?

Because the scope is narrow. We are not trying to automate the whole organization. We are solving one specific gap: turning meeting notes into live event visibility.

## Trend notes with sources

- Next.js 16 was released on October 21, 2025: https://nextjs.org/blog/next-16
- Next.js Proxy docs were updated on March 31, 2026: https://nextjs.org/docs/app/getting-started/proxy
- Clerk's Supabase integration guide was updated on April 17, 2026: https://clerk.com/docs/guides/development/integrations/databases/supabase
- Clerk's Next.js reference was updated on April 17, 2026: https://clerk.com/docs/reference/nextjs/overview
- Anthropic announced Claude Sonnet 4.6 on February 17, 2026: https://www.anthropic.com/research/claude-sonnet-4-6
- Anthropic models overview: https://platform.claude.com/docs/en/about-claude/models/overview
- Supabase docs: https://supabase.com/docs
- Supabase AI docs: https://supabase.com/docs/guides/ai
