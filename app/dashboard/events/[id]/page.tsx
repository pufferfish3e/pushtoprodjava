import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { EventDetailClient } from "@/components/EventDetailClient"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { deriveRisks } from "@/lib/derive-risks"
import { MOCK_EVENTS, MOCK_TASKS, MOCK_BRIEFINGS, MOCK_RISKS } from "@/lib/mock-data"
import type { Event, Task, Briefings, RiskSignal } from "@/lib/types"
import { CalendarDays, ChevronLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_VARIANT: Record<Event["status"], "default" | "secondary" | "outline"> = {
  planning: "outline",
  active: "default",
  completed: "secondary",
}

const MINUTES_MOCK = `MINUTES OF MEETING
Orientation Camp 2026 — Planning Meeting
Date: 24 April 2026 | 14:00 | SR 3-01

ATTENDEES
Wei Ling (CC), Ravi (OC), Sarah (Logistics), Hafiz (Programme)

1. Venue Booking
   Hall A unconfirmed. Wei Ling to follow up SP management by 28 Apr. BLOCKER.

2. Budget Proposal
   Blocked pending venue cost. Submit to EXCO upon confirmation.

3. Registration Form
   Ravi ~60% done. Target: 30 Apr.

4. Transport
   Sarah collecting quotes. Confirm by 3 May.

5. Programme
   Hafiz drafting schedule. Full rundown to Wei Ling by 5 May.

NEXT MEETING: 1 May 2026, 14:00
`

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params

  let event: Event | null = null
  let tasks: Task[] = []
  let briefings: Briefings | null = null
  let risks: RiskSignal[] = []
  let minutes: string | null = null
  let fromDB = false

  try {
    const supabase = createServerSupabaseClient()
    const [{ data: evtData }, { data: taskData }, { data: meetingData }] = await Promise.all([
      supabase.from("events").select("*").eq("id", id).single(),
      supabase.from("tasks").select("*").eq("event_id", id).order("urgency", { ascending: false }),
      supabase
        .from("meetings")
        .select("briefings, risks, minutes_draft")
        .eq("event_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ])

    if (evtData) {
      event = evtData as Event
      tasks = (taskData ?? []) as Task[]
      fromDB = true

      if (meetingData) {
        briefings = meetingData.briefings as Briefings ?? null
        risks = (meetingData.risks as RiskSignal[]) ?? deriveRisks(tasks)
        minutes = meetingData.minutes_draft ?? null
      } else {
        risks = deriveRisks(tasks)
      }
    }
  } catch {
    // fall through to mock
  }

  if (!fromDB) {
    const mockEvent = MOCK_EVENTS.find(e => e.id === id)
    if (!mockEvent) notFound()
    event = mockEvent
    tasks = MOCK_TASKS.filter(t => t.event_id === id)
    briefings = MOCK_BRIEFINGS
    risks = MOCK_RISKS
    minutes = MINUTES_MOCK
  }

  if (!event) notFound()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="size-3.5" />
          All Events
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {event.name}
          </h1>
          <Badge variant={STATUS_VARIANT[event.status]}>{event.status}</Badge>
          {!fromDB && (
            <span className="text-xs text-muted-foreground border border-border rounded px-2 py-1">
              mock data
            </span>
          )}
        </div>
        {event.event_date && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            <span>{event.event_date}</span>
          </div>
        )}
      </div>

      <EventDetailClient
        eventId={id}
        eventName={event.name}
        initialTasks={tasks}
        initialBriefings={briefings}
        initialRisks={risks}
        initialMinutes={minutes}
      />
    </div>
  )
}
