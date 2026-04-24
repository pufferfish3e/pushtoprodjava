import type { Event, Task, Briefings, RiskSignal } from "./types"

// IDs match supabase/migrations/initialsetup.sql seed
export const EVT = {
  orientation: "a1b2c3d4-0001-0001-0001-000000000001",
  socialnight:  "a1b2c3d4-0002-0002-0002-000000000002",
  summit:       "a1b2c3d4-0003-0003-0003-000000000003",
} as const

export const MOCK_EVENTS: Event[] = [
  {
    id: EVT.orientation,
    name: "Orientation Camp 2026",
    event_date: "2026-05-10",
    org_id: "demo-org",
    status: "active",
    created_at: "2026-04-01T00:00:00Z",
  },
  {
    id: EVT.socialnight,
    name: "Freshmen Social Night",
    event_date: "2026-05-17",
    org_id: "demo-org",
    status: "active",
    created_at: "2026-04-01T00:00:00Z",
  },
  {
    id: EVT.summit,
    name: "Leadership Summit 2026",
    event_date: "2026-06-01",
    org_id: "demo-org",
    status: "active",
    created_at: "2026-04-01T00:00:00Z",
  },
]

export const MOCK_TASKS: Task[] = [
  {
    id: "00000000-0000-0000-0001-000000000001",
    event_id: EVT.orientation,
    assignee: "Wei Ling",
    task: "Confirm venue booking with SP management",
    deadline: "2026-04-28",
    urgency: 5,
    status: "pending",
    is_blocker: true,
    notes: "Hall A unconfirmed — blocks all logistics planning",
  },
  {
    id: "00000000-0000-0000-0001-000000000002",
    event_id: EVT.orientation,
    assignee: "Wei Ling",
    task: "Submit budget proposal to EXCO",
    deadline: "2026-04-27",
    urgency: 5,
    status: "blocked",
    is_blocker: true,
    notes: "Blocked on venue cost confirmation",
  },
  {
    id: "00000000-0000-0000-0001-000000000003",
    event_id: EVT.orientation,
    assignee: "Ravi",
    task: "Finalise participant registration form",
    deadline: "2026-04-30",
    urgency: 4,
    status: "in_progress",
    is_blocker: false,
    notes: "",
  },
  {
    id: "00000000-0000-0000-0001-000000000004",
    event_id: EVT.orientation,
    assignee: "Sarah",
    task: "Arrange transport for day-trip segment",
    deadline: "2026-05-03",
    urgency: 3,
    status: "pending",
    is_blocker: false,
    notes: "",
  },
  {
    id: "00000000-0000-0000-0001-000000000005",
    event_id: EVT.orientation,
    assignee: "Hafiz",
    task: "Design camp schedule and ice-breaker rundown",
    deadline: "2026-05-05",
    urgency: 2,
    status: "in_progress",
    is_blocker: false,
    notes: "",
  },
  {
    id: "00000000-0000-0000-0002-000000000001",
    event_id: EVT.socialnight,
    assignee: "Priya",
    task: "Secure DJ or live band booking",
    deadline: "2026-05-01",
    urgency: 4,
    status: "pending",
    is_blocker: false,
    notes: "",
  },
  {
    id: "00000000-0000-0000-0002-000000000002",
    event_id: EVT.socialnight,
    assignee: "Wei Ling",
    task: "Set up ticketing on Eventbrite",
    deadline: "2026-04-29",
    urgency: 4,
    status: "pending",
    is_blocker: false,
    notes: "Wei Ling also on Orientation Camp — possible overload",
  },
  {
    id: "00000000-0000-0000-0003-000000000001",
    event_id: EVT.summit,
    assignee: "Ravi",
    task: "Send speaker invitations",
    deadline: "2026-04-30",
    urgency: 3,
    status: "in_progress",
    is_blocker: false,
    notes: "",
  },
]

export const MOCK_BRIEFINGS: Briefings = {
  secretary:
    "Meeting held 24 Apr 2026. Key outcomes: venue booking for Orientation Camp unconfirmed (blocker). Budget proposal blocked pending venue cost. Action: Wei Ling to chase SP management by 28 Apr. Ravi completing registration form by 30 Apr.",
  oc:
    "Two critical blockers for Orientation Camp: venue and budget both unresolved. Transport and schedule on track. Social Night ticketing assigned to Wei Ling — watch for overload risk across events.",
  cc_vcc:
    "Cross-event risk: Wei Ling assigned to Orientation Camp venue (urgency 5) and Social Night ticketing (urgency 4) with overlapping deadlines 28–29 Apr. Recommend CC review workload and reassign if needed.",
  exco:
    "Budget proposal for Orientation Camp blocked pending venue confirmation. Cannot approve spend until Hall A booking resolved. Escalation may be needed with SP management before 28 Apr deadline.",
}

export const MOCK_RISKS: RiskSignal[] = [
  {
    type: "unowned_blocker",
    description: "Venue booking for Orientation Camp has no confirmed owner at SP management level.",
    severity: "high",
  },
  {
    type: "overloaded_person",
    description: "Wei Ling has 3 urgent tasks across 2 events with overlapping deadlines (28–29 Apr).",
    severity: "high",
  },
  {
    type: "deadline_risk",
    description: "Budget proposal due 27 Apr is blocked — cannot proceed until venue cost is known.",
    severity: "medium",
  },
]
