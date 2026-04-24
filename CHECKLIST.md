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
