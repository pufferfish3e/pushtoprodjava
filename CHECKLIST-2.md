# Dev 2 Checklist — Frontend / UI

## ✅ Done
- [x] shadcn/ui — dark premium black/white theme, base-nova, Tailwind v4
- [x] `lib/types.ts` — all 8 interfaces, EventStatus = planning|active|completed
- [x] `lib/mock-data.ts` — 3 events, 8 tasks, 2 blockers, 3 risk signals
- [x] `components/AudioUpload.tsx` — drag-drop, sends `"audio"` field + `event_id`
- [x] `components/TaskTable.tsx` — urgency-sorted, blocker badge, status badge
- [x] `components/BriefingTabs.tsx` — 4 role tabs, skeleton states
- [x] `components/RiskBanner.tsx` — high/medium severity
- [x] `components/MinutesPreview.tsx` — monospace + copy button
- [x] `app/dashboard/layout.tsx` — sticky header, Clerk UserButton
- [x] `app/dashboard/page.tsx` — event cards, risk signals (mock data)
- [x] `app/dashboard/events/[id]/page.tsx` — task table + tabs + minutes (mock data)
- [x] `app/test/page.tsx` — dev test page for all API endpoints
- [x] Build ✓ | TypeScript ✓

## 🔥 Critical — these break the demo if not done

### 1. Wire AudioUpload into event detail page
This is the core demo flow. Without it judges see no live pipeline.
- [ ] Add `"use client"` wrapper or new client component on event detail page
- [ ] Place `<AudioUpload eventId={id} onResult={handleResult} />` on the page
- [ ] On `onResult`: update local state to show returned tasks + briefings + risks + minutes
- [ ] Components already accept these shapes — just pass the data through

### 2. Replace mock data IDs with real Supabase UUIDs
Wait for Dev 1 to seed events, then update `lib/mock-data.ts`:
```ts
id: "a1b2c3d4-0001-0001-0001-000000000001",  // Orientation Camp
id: "a1b2c3d4-0002-0002-0002-000000000002",  // Social Night
id: "a1b2c3d4-0003-0003-0003-000000000003",  // Leadership Summit
```
(Dev 1 will share exact UUIDs after seeding)

### 3. Replace app/page.tsx
Still shows starter boilerplate. For demo: either redirect `/` → `/dashboard` or replace with a clean product landing page.

Simple redirect option (server component):
```tsx
import { redirect } from 'next/navigation'
export default function HomePage() { redirect('/dashboard') }
```

## 🔄 Next — wire real Supabase reads (unblocked once Dev 1 seeds schema)
- [ ] `app/dashboard/page.tsx` — fetch events from `supabase.from('events').select('*')`
- [ ] `app/dashboard/events/[id]/page.tsx` — fetch tasks + latest meeting from Supabase
- [ ] Show skeleton while loading, empty state if no tasks yet
- [ ] Keep mock data as fallback if Supabase returns empty

## 🔄 Next — task status update
- [ ] Click/dropdown on `TaskTable` row to change status
- [ ] `supabase.from('tasks').update({ status }).eq('id', id)`
- [ ] Optimistic update — don't wait for full reload

## ⏳ After core is wired
- [ ] Add `<QueryPanel />` component — text input, POST to `/api/query`, show answer
- [ ] Place query panel on event detail page or dashboard
- [ ] Task search/filter on event detail page (urgency, status, assignee)
- [ ] Cross-event workload view — who is assigned where
- [ ] Loading skeletons for real data fetches

## 🚀 Stretch
- [ ] Export minutes as `.md` download
- [ ] Supabase Realtime on `tasks` table
- [ ] Mobile responsive pass

## 🔗 Blockers
| Blocker | Owner | Status |
|---|---|---|
| `meetings` columns fix | Dev 1 | 🔥 Needed now |
| Seed events with UUIDs | Dev 1 | 🔥 Needed now |
| Seed tasks rows | Dev 1 | 🔄 Soon |
| `GROQ_API_KEY` + `ANTHROPIC_API_KEY` | Both | 🔥 Add to `.env.local` |

## Demo flow to protect
Brief §12 says the "aha moment" is:
> one meeting → 4 role-specific briefings + usable minutes draft

UI must show this visibly. BriefingTabs + MinutesPreview are built.
They just need real data from `/api/process` flowing through `AudioUpload.onResult`.
That one wire-up is the highest priority task.

## Notes
- `EventStatus` = `'planning' | 'active' | 'completed'` only
- `Event` requires `created_at`
- `AudioUpload` needs `eventId: string` prop
- Server components → `lib/supabase/server.ts`, client components → `lib/supabase/client.ts`
- Semantic tokens only, no raw colors
