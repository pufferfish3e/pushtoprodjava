import type { Task, RiskSignal } from "./types"

export function deriveRisks(tasks: Task[]): RiskSignal[] {
  const risks: RiskSignal[] = []
  const today = new Date().toISOString().slice(0, 10)

  // overloaded person: assigned urgency>=4 tasks across 2+ different events
  const personEvents: Record<string, Set<string>> = {}
  for (const t of tasks) {
    if (t.urgency >= 4 && t.assignee) {
      if (!personEvents[t.assignee]) personEvents[t.assignee] = new Set()
      personEvents[t.assignee].add(t.event_id)
    }
  }
  for (const [person, events] of Object.entries(personEvents)) {
    if (events.size >= 2) {
      risks.push({
        type: "overloaded_person",
        description: `${person} has urgent tasks across ${events.size} active events.`,
        severity: "high",
      })
    }
  }

  // unowned blocker
  const unowned = tasks.filter(t => t.is_blocker && !t.assignee?.trim())
  if (unowned.length) {
    risks.push({
      type: "unowned_blocker",
      description: `${unowned.length} blocker task${unowned.length > 1 ? "s" : ""} have no assignee.`,
      severity: "high",
    })
  }

  // deadline risk: blocked or pending urgency>=4 with deadline <= 3 days away
  const soon = tasks.filter(t => {
    if (!t.deadline) return false
    if (t.status === "completed") return false
    if (t.urgency < 4) return false
    return t.deadline <= today
  })
  if (soon.length) {
    risks.push({
      type: "deadline_risk",
      description: `${soon.length} high-urgency task${soon.length > 1 ? "s are" : " is"} past or at deadline.`,
      severity: "high",
    })
  }

  // unresolved blockers
  const blockers = tasks.filter(t => t.is_blocker && t.status !== "completed")
  if (blockers.length) {
    risks.push({
      type: "unresolved_task",
      description: `${blockers.length} unresolved blocker${blockers.length > 1 ? "s" : ""} across active events.`,
      severity: "medium",
    })
  }

  return risks
}
