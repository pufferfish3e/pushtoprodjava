import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TaskTable } from "@/components/TaskTable"
import { BriefingTabs } from "@/components/BriefingTabs"
import { RiskBanner } from "@/components/RiskBanner"
import { MinutesPreview } from "@/components/MinutesPreview"
import { MOCK_EVENTS, MOCK_TASKS, MOCK_BRIEFINGS, MOCK_RISKS } from "@/lib/mock-data"
import { CalendarDays, ChevronLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

const MINUTES_MOCK = `MINUTES OF MEETING
Orientation Camp 2026 — Planning Meeting
Date: 24 April 2026 | Time: 14:00 | Venue: SR 3-01

ATTENDEES
- Wei Ling (CC)
- Ravi Kumar (OC)
- Sarah Tan (Logistics)
- Hafiz Abdullah (Programme)

AGENDA ITEMS

1. Venue Booking
   - Hall A booking not yet confirmed by SP management
   - ACTION: Wei Ling to follow up by 28 Apr (BLOCKER)

2. Budget Proposal
   - Cannot submit until venue cost is known
   - ACTION: Wei Ling to submit to EXCO upon venue confirmation (Due: 27 Apr)

3. Registration Form
   - Ravi Kumar completing Google Form setup
   - ACTION: Finalise by 30 Apr

4. Transport
   - Day-trip bus quotes being collected
   - ACTION: Sarah Tan to confirm by 3 May

5. Programme Rundown
   - Ice-breaker activities drafted
   - ACTION: Hafiz Abdullah to send full schedule by 5 May

NEXT MEETING: 1 May 2026, 14:00
`

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  const event = MOCK_EVENTS.find((e) => e.id === id)
  if (!event) notFound()

  const tasks = MOCK_TASKS.filter((t) => t.event_id === id)
  const risks = MOCK_RISKS

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
          <Badge variant={event.status === "active" ? "default" : "secondary"}>
            {event.status}
          </Badge>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" />
          <span>{event.event_date}</span>
        </div>
      </div>

      {risks.length > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Risk Signals
          </h2>
          <RiskBanner risks={risks} />
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Tasks ({tasks.length})
        </h2>
        <TaskTable tasks={tasks} />
      </section>

      <Separator />

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Briefings by Role
        </h2>
        <BriefingTabs briefings={MOCK_BRIEFINGS} />
      </section>

      <section>
        <MinutesPreview minutes={MINUTES_MOCK} />
      </section>
    </div>
  )
}
