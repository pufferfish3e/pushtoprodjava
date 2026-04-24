# Frontend Roadmap — MVP to Demo Ready

## Phase 1: Core Flow (must ship by demo)

### 1.1 Task Review & Publish
**Goal:** Secretary can paste notes, review extracted tasks, and save them.

- [ ] Add modal/drawer for task review before publish
  - [ ] Show extracted tasks from `/api/process` response
  - [ ] Allow inline edit of task fields (assignee, urgency, deadline)
  - [ ] Confirm/reject individual tasks or bulk publish
  - [ ] Save to Supabase `tasks` table on publish
- [ ] Success toast when tasks saved
- [ ] Redirect to event detail after publish

**Owner:** Dev 2 | **Blocking:** `/api/process` + Supabase schema

### 1.2 Live Data Binding
**Goal:** Dashboard reads real events and tasks from Supabase, not mock data.

- [ ] Add server-side Supabase client in dashboard page
- [ ] Replace `MOCK_EVENTS` with `supabase.from('events').select()`
- [ ] Replace `MOCK_TASKS` with `supabase.from('tasks').select()`
- [ ] Replace `MOCK_RISKS` with derived risk calculation (overloaded person, unowned blocker)
- [ ] Add error boundary + "no data" empty state

**Owner:** Dev 2 | **Blocking:** Supabase schema finalized

### 1.3 Task Inline Actions
**Goal:** Users can quickly update task status without leaving the page.

- [ ] Add status dropdown on TaskTable rows (Pending → In Progress → Done / Blocked)
- [ ] Trigger Supabase update on status change
- [ ] Optimistic UI update + refetch on save
- [ ] Toast confirmation

**Owner:** Dev 2 | **Blocks:** None (can use mock until DB ready)

---

## Phase 2: Cross-Event Visibility (strongly preferred if time)

### 2.1 Conflict Detection & Warnings
**Goal:** Highlight people overloaded across events.

- [ ] Add "People View" card on dashboard showing person → event/task assignments
- [ ] Highlight if same person assigned > 1 urgent task with overlapping deadlines
- [ ] Link each person card to their tasks across all events
- [ ] Integrate into risk signal banner (already has `overloaded_person` type)

**Owner:** Dev 2 | **Blocks:** None

### 2.2 Search & Filter
**Goal:** Find tasks quickly on event detail page.

- [ ] Add search input (filters task name, assignee, notes)
- [ ] Add urgency filter (5-only, 4+, 3+, all)
- [ ] Add status filter (pending, in_progress, blocked, completed)
- [ ] Persist filter state in URL params for shareable links

**Owner:** Dev 2 | **Blocks:** None

### 2.3 Minutes Export
**Goal:** Secretary can export minutes as markdown or copy formatted text.

- [ ] Add "Export" button on MinutesPreview
- [ ] Options: Copy to clipboard (done), Download as .md, Download as .txt
- [ ] Pre-populate with meeting metadata (event, date, attendees)

**Owner:** Dev 2 | **Blocks:** None

---

## Phase 3: Query Interface (Dev 3 primary, Dev 2 UI support)

### 3.1 Natural-Language Task Query
**Goal:** Users can ask "what's blocking the orientation camp" and get instant answer.

- [ ] Add query input panel (sidebar or modal on dashboard)
- [ ] Query format: "What tasks are assigned to Wei Ling?"
- [ ] Call `/api/query` → Genspark → plain-English response
- [ ] Show response below query input with source tasks highlighted
- [ ] Save recent queries for quick replay

**Owner:** Dev 3 (Genspark integration) + Dev 2 (UI) | **Blocks:** `/api/query` endpoint

---

## Phase 4: Polish & Edge Cases (if time allows)

### 4.1 Loading & Empty States
- [ ] Skeleton loaders for event list, task list, briefings
- [ ] Empty state illustrations + copy for:
  - No events yet
  - No tasks for this event
  - No briefing available (AI extraction pending)
  - No risks (happy path)

### 4.2 Error Handling
- [ ] Toast on failed Supabase reads
- [ ] Fallback UI if Clerk auth fails
- [ ] Retry logic for failed API calls

### 4.3 Mobile Responsiveness
- [ ] Test on iPhone 12 / iPad
- [ ] Adjust TaskTable to scroll/stack on small screens
- [ ] Touch-friendly button sizing (min 44px)
- [ ] Collapsible briefing tabs on mobile

### 4.4 Accessibility
- [ ] Keyboard navigation for tabs, modals, filters
- [ ] ARIA labels on dynamic regions
- [ ] Focus management in modals (FocusScope)
- [ ] Color contrast check (all text meets WCAG AA)

---

## Phase 5: Stretch (demo-day bonus, not critical)

### 5.1 Real-Time Collaboration
- [ ] Supabase Realtime subscriptions on task updates
- [ ] "Wei Ling just marked task X as done" live notification
- [ ] Collaborative live edit of minutes

### 5.2 Task Templates
- [ ] Pre-save common task templates (e.g., "Confirm venue", "Send invites")
- [ ] Secretary can apply template to speed up data entry

### 5.3 Calendar View
- [ ] Display events + task deadlines on calendar
- [ ] Drag tasks to reschedule deadline

### 5.4 Telegram Alerts (if time + infra ready)
- [ ] Notify assignees of newly created tasks
- [ ] Alert on deadline day / overdue

---

## Success Criteria (MVP Demo)

By demo day, audience should see:

1. ✅ Secretary uploads meeting audio → extracted tasks appear in review modal
2. ✅ Tasks saved → appear on event detail page, sorted by urgency
3. ✅ Dashboard shows 3 active events + cross-event risk warnings (overloaded person, blocker)
4. ✅ Each role (Secretary, OC, CC, EXCO) sees tailored briefing for the event
5. ✅ Genspark query works: "What's blocking orientation camp?" → instant answer

---

## Handoff Notes

**To Dev 1 (Extraction):**
- `/api/process` must return `ProcessResponse` shape exactly
- Test extraction on 3 sample SPSU meeting transcripts
- Validate task urgency inference (1-5 scale)

**To Dev 3 (Query):**
- `/api/query` should accept natural-language question + stored task context
- Return plain-English answer grounded in actual task IDs
- Keep response <500 chars for UI legibility

**To all:**
- Avoid wide refactors mid-sprint — small adapters over rewrites
- Log all API calls (endpoint, event_id, rows affected, latency)
- Test the core flow end-to-end daily (upload → extract → save → display)
