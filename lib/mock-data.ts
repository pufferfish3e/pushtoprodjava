import type { Event, Task, Briefings, RiskSignal } from "./types"

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-001",
    name: "Orientation Camp 2026",
    event_date: "2026-05-10",
    org_id: "demo-org",
    status: "active",
    created_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "evt-002",
    name: "Freshmen Social Night",
    event_date: "2026-05-17",
    org_id: "demo-org",
    status: "active",
    created_at: "2026-04-01T00:00:00Z",
  },
  {
    id: "evt-003",
    name: "Leadership Summit",
    event_date: "2026-06-01",
    org_id: "demo-org",
    status: "active",
    created_at: "2026-04-01T00:00:00Z",
  },
]

export const MOCK_TASKS: Task[] = [
  {
    id: "t-001",
    event_id: "evt-001",
    assignee: "Wei Ling",
    task: "Confirm venue booking with SP management",
    deadline: "2026-04-28",
    urgency: 5,
    status: "pending",
    is_blocker: true,
    notes: "Hall A still unconfirmed — blocks logistics planning",
  },
  {
    id: "t-002",
    event_id: "evt-001",
    assignee: "Ravi Kumar",
    task: "Finalise participant registration form",
    deadline: "2026-04-30",
    urgency: 4,
    status: "in_progress",
    is_blocker: false,
    notes: "",
  },
  {
    id: "t-003",
    event_id: "evt-001",
    assignee: "Sarah Tan",
    task: "Arrange transport for day-trip segment",
    deadline: "2026-05-03",
    urgency: 3,
    status: "pending",
    is_blocker: false,
    notes: "",
  },
  {
    id: "t-004",
    event_id: "evt-001",
    assignee: "Wei Ling",
    task: "Submit budget proposal to EXCO",
    deadline: "2026-04-27",
    urgency: 5,
    status: "blocked",
    is_blocker: true,
    notes: "Waiting on venue cost confirmation",
  },
  {
    id: "t-005",
    event_id: "evt-001",
    assignee: "Hafiz Abdullah",
    task: "Design camp schedule and ice-breaker rundown",
    deadline: "2026-05-05",
    urgency: 2,
    status: "in_progress",
    is_blocker: false,
    notes: "",
  },
  {
    id: "t-006",
    event_id: "evt-002",
    assignee: "Priya Nair",
    task: "Secure DJ / live band booking",
    deadline: "2026-05-01",
    urgency: 4,
    status: "pending",
    is_blocker: false,
    notes: "",
  },
  {
    id: "t-007",
    event_id: "evt-002",
    assignee: "Wei Ling",
    task: "Set up ticketing on Eventbrite",
    deadline: "2026-04-29",
    urgency: 4,
    status: "pending",
    is_blocker: false,
    notes: "Wei Ling also handling Orientation Camp venue — possible overload",
  },
  {
    id: "t-008",
    event_id: "evt-003",
    assignee: "Ravi Kumar",
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
    "Meeting held 24 Apr 2026. Key outcomes: venue booking for Orientation Camp unconfirmed (blocker). Budget proposal blocked pending venue cost. Action: Wei Ling to chase SP management by 28 Apr. Ravi Kumar completing registration form by 30 Apr.",
  oc:
    "Two critical blockers for Orientation Camp: venue and budget both unresolved. Transport and schedule tasks on track. Social Night ticketing assigned to Wei Ling — watch for overload risk across events.",
  cc_vcc:
    "Cross-event risk: Wei Ling assigned to both Orientation Camp venue (urgent) and Social Night ticketing. Deadline conflict possible around 28–29 Apr. Recommend CC review workload and reassign if needed.",
  exco:
    "Budget proposal for Orientation Camp blocked pending venue confirmation. Cannot approve spend until Hall A booking is resolved. Escalation may be needed with SP management before 28 Apr deadline.",
}

export const MOCK_RISKS: RiskSignal[] = [
  {
    type: "unowned_blocker",
    description: "Venue booking for Orientation Camp has no confirmed owner at SP management level.",
    severity: "high",
  },
  {
    type: "overloaded_person",
    description: "Wei Ling is assigned 3 urgent tasks across 2 events with overlapping deadlines (28–29 Apr).",
    severity: "high",
  },
  {
    type: "deadline_risk",
    description: "Budget proposal due 27 Apr is blocked — cannot proceed until venue cost is known.",
    severity: "medium",
  },
]
