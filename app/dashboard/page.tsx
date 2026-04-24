import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskBanner } from "@/components/RiskBanner"
import { MOCK_EVENTS, MOCK_TASKS, MOCK_RISKS } from "@/lib/mock-data"
import type { Event } from "@/lib/types"
import { CalendarDays, Users, AlertTriangle } from "lucide-react"

function taskCountFor(eventId: string) {
  return MOCK_TASKS.filter((t) => t.event_id === eventId).length
}

function blockerCountFor(eventId: string) {
  return MOCK_TASKS.filter((t) => t.event_id === eventId && t.is_blocker).length
}

function maxUrgencyFor(eventId: string) {
  const tasks = MOCK_TASKS.filter((t) => t.event_id === eventId)
  return tasks.length ? Math.max(...tasks.map((t) => t.urgency)) : 0
}

const STATUS_VARIANT: Record<Event["status"], "default" | "secondary" | "outline"> = {
  active: "default",
  completed: "secondary",
  cancelled: "outline",
}

export default function DashboardPage() {
  const events = MOCK_EVENTS
  const risks = MOCK_RISKS

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cross-event overview — active coordination across {events.filter((e) => e.status === "active").length} events
        </p>
      </div>

      {risks.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Risk Signals
          </h2>
          <RiskBanner risks={risks} />
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Active Events
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const taskCount = taskCountFor(event.id)
            const blockerCount = blockerCountFor(event.id)
            const maxUrgency = maxUrgencyFor(event.id)

            return (
              <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                <Card className="group transition-colors hover:bg-accent/50 cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-snug group-hover:text-foreground">
                        {event.name}
                      </CardTitle>
                      <Badge variant={STATUS_VARIANT[event.status]} className="shrink-0 text-xs">
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        <span>{event.event_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        <span>{taskCount} task{taskCount !== 1 ? "s" : ""}</span>
                      </div>
                      {blockerCount > 0 && (
                        <div className="flex items-center gap-1.5 text-destructive">
                          <AlertTriangle className="size-3.5" />
                          <span>{blockerCount} blocker{blockerCount !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                      {maxUrgency === 5 && (
                        <div className="flex items-center gap-1.5 text-destructive font-medium">
                          <span className="size-1.5 rounded-full bg-destructive inline-block" />
                          Critical task present
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
