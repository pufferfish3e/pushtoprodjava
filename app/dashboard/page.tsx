import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RiskBanner } from "@/components/RiskBanner"
import { CreateEventDialog } from "@/components/CreateEventDialog"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { deriveRisks } from "@/lib/derive-risks"
import { MOCK_EVENTS, MOCK_TASKS, MOCK_RISKS } from "@/lib/mock-data"
import type { Event, Task } from "@/lib/types"
import { CalendarDays, Users, AlertTriangle } from "lucide-react"

const STATUS_VARIANT: Record<Event["status"], "default" | "secondary" | "outline"> = {
  planning: "outline",
  active: "default",
  completed: "secondary",
}

function buildStats(tasks: Task[], eventId: string) {
  const evtTasks = tasks.filter(t => t.event_id === eventId)
  return {
    count: evtTasks.length,
    blockers: evtTasks.filter(t => t.is_blocker && t.status !== "completed").length,
    maxUrgency: evtTasks.length ? Math.max(...evtTasks.map(t => t.urgency)) : 0,
  }
}

export default async function DashboardPage() {
  let events: Event[] = []
  let tasks: Task[] = []
  let fromDB = false

  try {
    const supabase = createServerSupabaseClient()
    const [{ data: evts }, { data: tks }] = await Promise.all([
      supabase.from("events").select("*").order("event_date", { ascending: true }),
      supabase.from("tasks").select("*"),
    ])
    if (evts?.length) {
      events = evts as Event[]
      tasks = (tks ?? []) as Task[]
      fromDB = true
    }
  } catch {
    // fall through to mock
  }

  if (!fromDB) {
    events = MOCK_EVENTS
    tasks = MOCK_TASKS
  }

  const risks = fromDB ? deriveRisks(tasks) : MOCK_RISKS
  const active = events.filter(e => e.status !== "completed")

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {active.length} active · cross-event coordination overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!fromDB && (
            <span className="text-xs text-muted-foreground border border-border rounded px-2 py-1">
              mock data
            </span>
          )}
          <CreateEventDialog />
        </div>
      </div>

      {risks.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Risk Signals
          </p>
          <RiskBanner risks={risks} />
        </section>
      )}

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Active Events
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(event => {
            const { count, blockers, maxUrgency } = buildStats(tasks, event.id)
            return (
              <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                <Card className="group h-full cursor-pointer transition-colors hover:bg-accent/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold leading-snug">
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
                        <span>{event.event_date ?? "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        <span>{count} task{count !== 1 ? "s" : ""}</span>
                      </div>
                      {blockers > 0 && (
                        <div className="flex items-center gap-1.5 text-destructive">
                          <AlertTriangle className="size-3.5" />
                          <span>{blockers} blocker{blockers !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                      {maxUrgency === 5 && (
                        <div className="flex items-center gap-1.5 text-destructive font-medium">
                          <span className="inline-block size-1.5 rounded-full bg-destructive" />
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
      </section>
    </div>
  )
}
