export type TaskUrgency = 1 | 2 | 3 | 4 | 5
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'

export interface Task {
  id: string
  event_id: string
  assignee: string
  task: string
  deadline: string | null
  urgency: TaskUrgency
  status: TaskStatus
  is_blocker: boolean
  notes: string
}

export interface Briefings {
  secretary: string
  oc: string
  cc_vcc: string
  exco: string
}

export interface RiskSignal {
  type: 'overloaded_person' | 'unowned_blocker' | 'deadline_risk' | 'unresolved_task'
  description: string
  severity: 'high' | 'medium'
}

export interface ProcessResponse {
  meeting_id: string
  transcript: string
  tasks: Task[]
  briefings: Briefings
  risks: RiskSignal[]
  minutes_draft: string
}

export interface Event {
  id: string
  name: string
  event_date: string
  org_id: string
  status: 'active' | 'completed' | 'cancelled'
}
