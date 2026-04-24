# Dev 2 Checklist — Frontend / UI

## ✅ Done
- [x] shadcn/ui — dark premium black/white theme, base-nova, Tailwind v4
- [x] `lib/types.ts` — all 8 interfaces
- [x] `lib/mock-data.ts` — 3 events (correct UUIDs), 8 tasks, 2 blockers, 3 risk signals
- [x] `lib/derive-risks.ts` — derives RiskSignal[] from tasks (overload, blocker, deadline)
- [x] `components/AudioUpload.tsx` — drag-drop, sends `"audio"` + `event_id`
- [x] `components/TaskTable.tsx` — urgency+blocker sorted, status dropdown (onStatusChange prop)
- [x] `components/BriefingTabs.tsx` — 4 role tabs, skeleton states
- [x] `components/RiskBanner.tsx` — high/medium severity
- [x] `components/MinutesPreview.tsx` — monospace + copy button
- [x] `components/QueryPanel.tsx` — text input + presets, POST /api/query, renders answer
- [x] `components/EventDetailClient.tsx` — client wrapper: upload → live state update, inline status changes, briefings, minutes, query panel
- [x] `app/page.tsx` — redirects signed-in → /dashboard, signed-out → /sign-in
- [x] `app/dashboard/layout.tsx` — sticky header, Clerk UserButton
- [x] `app/dashboard/page.tsx` — real Supabase reads, falls back to mock, derives risks live
- [x] `app/dashboard/events/[id]/page.tsx` — server fetch event+tasks+meeting, passes to EventDetailClient
- [x] `app/test/page.tsx` — dev test page
- [x] Build ✓ | TypeScript ✓ | Lint ✓

## 🔄 Next (nice to have before demo)
- [ ] Empty state on dashboard when no events in DB yet (currently shows mock)
- [ ] Loading skeleton on dashboard while Supabase fetches
- [ ] Task search/filter on event detail (urgency, status, assignee)
- [ ] Cross-event workload view on dashboard (who owns what across all events)

## 🚀 Stretch
- [ ] Export minutes as .md download
- [ ] Supabase Realtime on tasks — live updates across sessions
- [ ] Mobile responsive pass

## 🔗 Current blockers
| Blocker | Status |
|---|---|
| Supabase migration run in dashboard | Must be done before real reads work |
| GROQ_API_KEY + ANTHROPIC_API_KEY in .env.local | Must be set before upload works |

## Demo flow (what judges will see)
1. `/dashboard` — 3 event cards, risk banners, cross-event overload signal
2. Click event → urgency-sorted task table with blocker highlighted
3. Upload audio → pipeline runs 6-12s → tasks + briefings + risks + minutes update live
4. Open briefing tabs — Secretary vs OC vs CC/VCC vs EXCO each different
5. Minutes draft visible + copyable
6. Ask "What is still blocking this event?" → plain-English answer
7. Change a task status inline → updates Supabase immediately
