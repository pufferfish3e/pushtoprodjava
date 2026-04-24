export type TaskUrgency = 1 | 2 | 3 | 4 | 5
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
export type EventStatus = 'planning' | 'active' | 'completed'

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
  created_at: string
}

export interface ProcessResponse {
  transcript: string
  meeting_id: string
}
