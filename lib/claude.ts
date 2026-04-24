import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { ExtractionResult, Briefings, RiskSignal, Task } from '@/lib/types'

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}
const MODEL = 'claude-sonnet-4-6'

// Strip markdown fences Claude sometimes wraps around JSON
function parseJSON(raw: string): unknown {
  const stripped = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim()
  return JSON.parse(stripped)
}

function getText(msg: Anthropic.Message): string {
  const block = msg.content[0]
  return block.type === 'text' ? block.text : ''
}

// --- Zod schemas ---

const TaskSchema = z.object({
  assignee: z.string(),
  task: z.string(),
  deadline: z.string().nullable(),
  urgency: z.number().int().min(1).max(5).transform(n => n as 1 | 2 | 3 | 4 | 5),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).default('pending'),
  is_blocker: z.boolean(),
  notes: z.string(),
})

const DecisionSchema = z.preprocess(
  d => typeof d === 'string' ? d : JSON.stringify(d),
  z.string()
)

const ExtractionSchema = z.object({
  tasks: z.array(TaskSchema),
  decisions: z.array(DecisionSchema),
})

const RoutingSchema = z.object({
  briefings: z.object({
    secretary: z.string(),
    oc: z.string(),
    cc_vcc: z.string(),
    exco: z.string(),
  }),
  risks: z.array(z.object({
    type: z.enum(['overloaded_person', 'unowned_blocker', 'deadline_risk', 'unresolved_task']),
    description: z.string(),
    severity: z.enum(['high', 'medium']),
  })),
  minutes_draft: z.string(),
})

// --- Meeting Agent ---
// transcript → structured tasks + decisions
export async function extractMeetingState(transcript: string): Promise<ExtractionResult> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are a meeting extraction agent for SPSU (Singapore Polytechnic Students' Union).
Extract all tasks, owners, deadlines, and decisions from the transcript.
Urgency 1-5: 5=critical blocker, 4=must do this week, 3=normal, 2=low, 1=someday.
Set is_blocker=true if the task blocks the event or another task from proceeding.
Respond with valid JSON only. No markdown, no explanation outside the JSON.`,
    messages: [{
      role: 'user',
      content: `Transcript:\n\n${transcript}\n\nReturn JSON:\n{"tasks":[{"assignee":"","task":"","deadline":"YYYY-MM-DD or null","urgency":3,"status":"pending","is_blocker":false,"notes":""}],"decisions":["plain string sentence per decision"]}`,
    }],
  })

  const raw = getText(msg)
  return ExtractionSchema.parse(parseJSON(raw))
}

// --- Routing Agent + Document Agent + Risk Agent (one call for hackathon speed) ---
// state → briefings per role + risk signals + minutes draft
export async function generateOutputs(
  transcript: string,
  state: ExtractionResult,
  eventName: string,
): Promise<{ briefings: Briefings; risks: RiskSignal[]; minutes_draft: string }> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You are an AI coordination layer for SPSU student union events.
Given a structured meeting state, produce three outputs:

secretary briefing: documentation gaps, ambiguous task owners, items needing clarification for formal records, decisions that must appear in minutes.
oc briefing: what changed, clear next actions this week, what is blocked or waiting.
cc_vcc briefing: blockers, highest-urgency tasks, slipping items, dependencies not moving, where direct intervention is needed.
exco briefing: cross-event risk, overloaded people, major unresolved blockers, escalation signals.

Risk types: overloaded_person, unowned_blocker, deadline_risk, unresolved_task.
Severity: high=needs immediate action, medium=monitor closely.

minutes_draft: formal meeting minutes in paragraph form suitable for the secretary to review and finalize.

Respond with valid JSON only. No markdown, no explanation.`,
    messages: [{
      role: 'user',
      content: `Event: ${eventName}\n\nStructured state:\n${JSON.stringify(state)}\n\nTranscript:\n${transcript}\n\nReturn JSON:\n{"briefings":{"secretary":"","oc":"","cc_vcc":"","exco":""},"risks":[{"type":"unowned_blocker","description":"","severity":"high"}],"minutes_draft":""}`,
    }],
  })

  const raw = getText(msg)
  return RoutingSchema.parse(parseJSON(raw))
}

// --- Query Agent ---
// NL question + task rows → plain-English answer
export async function answerQuery(question: string, tasks: Task[]): Promise<string> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 512,
    system: `You are a query agent for an SPSU event coordination tool.
Answer questions clearly and concisely based only on the task data provided.
If the answer is not in the data, say so plainly.`,
    messages: [{
      role: 'user',
      content: `Task data:\n${JSON.stringify(tasks)}\n\nQuestion: ${question}`,
    }],
  })

  return getText(msg)
}
