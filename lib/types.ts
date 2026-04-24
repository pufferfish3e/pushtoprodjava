export type TaskUrgency = 1 | 2 | 3 | 4 | 5
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
export type EventStatus = 'planning' | 'active' | 'completed'
export type RiskType = 'overloaded_person' | 'unowned_blocker' | 'deadline_risk' | 'unresolved_task'
export type RiskSeverity = 'high' | 'medium'

export interface Event {
  id: string
  name: string
  event_date: string | null
  org_id: string
  status: EventStatus
  created_at: string
}

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

export interface Meeting {
  id: string
  event_id: string
  transcript: string
  briefings: Briefings | null
  risks: RiskSignal[] | null
  minutes_draft: string | null
  created_at: string
}

export interface Briefings {
  secretary: string
  oc: string
  cc_vcc: string
  exco: string
}

export interface RiskSignal {
  type: RiskType
  description: string
  severity: RiskSeverity
}

export interface ExtractionResult {
  tasks: Omit<Task, 'id' | 'event_id'>[]
  decisions: string[]
}

export interface ProcessResponse {
  meeting_id: string
  transcript: string
  tasks: Task[]
  briefings: Briefings
  risks: RiskSignal[]
  minutes_draft: string
}

export interface QueryResponse {
  answer: string
}
