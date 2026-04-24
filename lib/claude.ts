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

const RiskSchema = z.array(z.object({
  type: z.enum(['overloaded_person', 'unowned_blocker', 'deadline_risk', 'unresolved_task']),
  description: z.string(),
  severity: z.enum(['high', 'medium']),
}))

// --- Meeting Agent ---
// transcript → structured tasks + decisions
export async function extractMeetingState(transcript: string): Promise<ExtractionResult> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 10000,
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

// --- 5 parallel role briefing agents + risk + minutes ---

async function runSecretaryAgent(transcript: string, state: ExtractionResult, eventName: string): Promise<string> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are the Secretary briefing agent for SPSU (Singapore Polytechnic Students' Union).
You have access to the full meeting transcript, all tasks, and all decisions.
Your job: produce a clear briefing for the Secretary covering —
- Documentation gaps: anything mentioned verbally but not formally recorded
- Ambiguous or missing task owners
- Items that must appear in formal minutes
- Decisions that need written confirmation
- Attendance and quorum notes if mentioned
- Any action items assigned to the Secretary specifically
Write in clear bullet points grouped by topic. Be thorough — the Secretary needs everything.`,
    messages: [{
      role: 'user',
      content: `Event: ${eventName}\n\nFull transcript:\n${transcript}\n\nExtracted tasks:\n${JSON.stringify(state.tasks, null, 2)}\n\nDecisions:\n${state.decisions.join('\n')}\n\nProduce the Secretary briefing.`,
    }],
  })
  return getText(msg)
}

async function runOCAgent(transcript: string, state: ExtractionResult): Promise<string> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are the OC (Organising Committee) briefing agent for SPSU events.
Focus on operational execution. The OC needs to know what to do next, what is blocked, and what changed.
Cover:
- Clear next actions this week, owner + deadline
- Tasks that are blocked or waiting on someone else
- Updates from the meeting that affect current plans
- Dependencies the OC must be aware of
Keep it concise and action-oriented. Use bullet points.`,
    messages: [{
      role: 'user',
      content: `Transcript:\n${transcript}\n\nAll tasks:\n${JSON.stringify(state.tasks, null, 2)}\n\nDecisions:\n${state.decisions.join('\n')}\n\nProduce the OC briefing.`,
    }],
  })
  return getText(msg)
}

async function runCCVCCAgent(transcript: string, state: ExtractionResult): Promise<string> {
  // CC/VCC get high-urgency and blocker tasks + strategic transcript context
  const criticalTasks = state.tasks.filter(t => t.is_blocker || t.urgency >= 4)
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `You are the CC/VCC (Committee Chair / Vice-Chairperson) briefing agent for SPSU events.
The CC/VCC is responsible for strategic oversight and direct intervention where needed.
Focus on:
- Blockers requiring CC/VCC attention or escalation
- Highest-urgency tasks (urgency 4-5) and their owners
- Items slipping or at risk of missing deadlines
- Dependencies not moving that could derail the event
- Decisions made in the meeting the CC/VCC should be aware of
Be direct. Flag what needs the CC/VCC's personal action. Use bullet points.`,
    messages: [{
      role: 'user',
      content: `Relevant transcript excerpts:\n${transcript}\n\nHigh-urgency and blocker tasks:\n${JSON.stringify(criticalTasks, null, 2)}\n\nDecisions:\n${state.decisions.join('\n')}\n\nProduce the CC/VCC briefing.`,
    }],
  })
  return getText(msg)
}

async function runEXCOAgent(state: ExtractionResult, eventName: string): Promise<string> {
  // EXCO gets structured data only — no raw transcript, executive-level view
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 768,
    system: `You are the EXCO (Executive Committee) briefing agent for SPSU.
EXCO has oversight across multiple events and does not need operational detail.
Focus on:
- Cross-event or organisation-level risks from this meeting
- People who appear overloaded across tasks
- Major unresolved blockers requiring executive awareness
- Escalation signals: anything that cannot be resolved at committee level
- Summary of decisions with strategic implications
Be concise and high-level. Flag only what EXCO needs to act on or be aware of. Use bullet points.`,
    messages: [{
      role: 'user',
      content: `Event: ${eventName}\n\nAll tasks (structured):\n${JSON.stringify(state.tasks, null, 2)}\n\nDecisions:\n${state.decisions.join('\n')}\n\nProduce the EXCO briefing.`,
    }],
  })
  return getText(msg)
}

async function runRiskAndMinutesAgent(
  transcript: string,
  state: ExtractionResult,
  eventName: string,
): Promise<{ risks: RiskSignal[]; minutes_draft: string }> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You are a risk and documentation agent for SPSU events.
Produce two outputs from the meeting:

1. risks: identify operational risk signals.
   Types: overloaded_person, unowned_blocker, deadline_risk, unresolved_task.
   Severity: high=needs immediate action, medium=monitor closely.

2. minutes_draft: formal meeting minutes as a single string with clear section headers. Use this exact structure:

MEETING MINUTES — [Event Name]
Date: [date if mentioned, else leave blank]
Attendees: [names and roles if mentioned]

CONTENT DISCUSSED
[Detailed summary of what was discussed, grouped by topic. Include the substance of discussions, not just outcomes. Each topic as its own short paragraph.]

DECISIONS MADE
[Bulleted list of decisions, one per line starting with •]

TASKS ASSIGNED
[Bulleted list: • [Assignee] — [task] (deadline: [date]). Mark blockers with [BLOCKER].]

NEXT MEETING
[Date/time/venue if mentioned, else "To be confirmed."]

Use plain text only — no markdown. Leave sections blank if information not available.

Respond with valid JSON only. No markdown outside the JSON.`,
    messages: [{
      role: 'user',
      content: `Event: ${eventName}\n\nTranscript:\n${transcript}\n\nExtracted state:\n${JSON.stringify(state)}\n\nReturn JSON:\n{"risks":[{"type":"unowned_blocker","description":"","severity":"high"}],"minutes_draft":""}`,
    }],
  })

  const raw = getText(msg)
  const parsed = parseJSON(raw) as { risks: unknown; minutes_draft: unknown }
  return {
    risks: RiskSchema.parse(parsed.risks),
    minutes_draft: typeof parsed.minutes_draft === 'string' ? parsed.minutes_draft : '',
  }
}

// --- generateOutputs: runs all 5 agents in parallel ---
export async function generateOutputs(
  transcript: string,
  state: ExtractionResult,
  eventName: string,
): Promise<{ briefings: Briefings; risks: RiskSignal[]; minutes_draft: string }> {
  const [secretary, oc, cc_vcc, exco, riskAndMinutes] = await Promise.all([
    runSecretaryAgent(transcript, state, eventName),
    runOCAgent(transcript, state),
    runCCVCCAgent(transcript, state),
    runEXCOAgent(state, eventName),
    runRiskAndMinutesAgent(transcript, state, eventName),
  ])

  return {
    briefings: { secretary, oc, cc_vcc, exco },
    risks: riskAndMinutes.risks,
    minutes_draft: riskAndMinutes.minutes_draft,
  }
}

// --- SPSU Minutes Agent ---
// transcript → SPSU-formatted official meeting minutes (2nd meeting template)
export async function formatAsSPSUMinutes(transcript: string, eventName: string): Promise<string> {
  const today = new Date().toLocaleDateString('en-SG', { day: '2-digit', month: 'long', year: 'numeric' })

  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 20000,
    system: `You are a secretary for SPSU (Singapore Polytechnic Students' Union).
Format the meeting transcript into SPSU official meeting minutes using this exact structure:

SPSU 67th COUNCIL [EVENT NAME] 26/27
MEETING DISCUSSION MEETING
[Date] | [Location] | [Time] HOURS

IN ATTENDANCE
Name | Designation | Present / Absent with Apologies
[list attendees from transcript]

[CC/VCC name], Chairperson of [Event], called the meeting to order at [time].

AGENDA 1: APOLOGIES
[Any apologies mentioned, or "No apologies received."]

AGENDA 2: UPDATES BY COMMITTEE
[Key updates each member gave, bullet points per person]

AGENDA 3: DISCUSSION ON EVENT
[Main discussion points, decisions made]

AGENDA 4: TASK DELEGATION
Committee Member | Task | Deadline
[rows from transcript]

AGENDA 5: A.O.B.
[Any other business, or "No other business raised."]

AGENDA 6: FIXTURE OF NEXT MEETING
[Next meeting date/time/venue if mentioned, otherwise "To be confirmed."]

The discussion was proposed to be closed by [name] and seconded by [name].

[CC/VCC name], Chairperson, officially closed the discussion at [time].

Recorded by: ________________________________
[Secretary name]
Secretary, SPSU 67th Council

Chaired by: ________________________________
[CC/VCC name]
Chairperson/Vice-Chairperson, [Event name]

Use formal English. Infer values from transcript context. Mark unclear items with [TBC].
Respond with the formatted minutes only — no explanation, no preamble.`,
    messages: [{
      role: 'user',
      content: `Event: ${eventName}\nDate: ${today}\n\nTranscript:\n${transcript}\n\nFormat as SPSU meeting minutes.`,
    }],
  })

  const block = msg.content[0]
  return block.type === 'text' ? block.text : ''
}

// --- PDF Text Extraction ---
// Sends base64-encoded PDF to Claude and returns extracted plain text
export async function extractTextFromPDF(base64Data: string): Promise<string> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'document' as const,
          source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: base64Data },
        },
        {
          type: 'text',
          text: 'Extract all text from this document. Return the raw text content only, preserving structure. No commentary, no preamble.',
        },
      ],
    }],
  })
  return getText(msg)
}

// --- Placeholder Generator ---
// Generates realistic AI-preview data for an event with no processed meetings

const PlaceholderTaskSchema = z.object({
  assignee: z.string(),
  task: z.string(),
  deadline: z.string().nullable(),
  urgency: z.number().int().min(1).max(5).transform(n => n as 1 | 2 | 3 | 4 | 5),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']).default('pending'),
  is_blocker: z.boolean(),
  notes: z.string(),
})

const PlaceholdersSchema = z.object({
  tasks: z.array(PlaceholderTaskSchema),
  briefings: z.object({
    secretary: z.string(),
    oc: z.string(),
    cc_vcc: z.string(),
    exco: z.string(),
  }),
  risks: RiskSchema,
  minutes_draft: z.string(),
})

export async function generatePlaceholders(
  eventName: string,
  eventDate: string | null,
): Promise<{
  tasks: Omit<Task, 'id' | 'event_id'>[]
  briefings: Briefings
  risks: RiskSignal[]
  minutes_draft: string
}> {
  const dateStr = eventDate ?? 'date TBC'
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You are generating AI-preview placeholder data for an SPSU (Singapore Polytechnic Students' Union) event coordination dashboard.
No meetings have been processed yet. Generate realistic, plausible pre-event planning data typical for an SPSU event of this name and type.
Use realistic SPSU role names: OC Chair, Secretary, Logistics Lead, Programme Lead, CC (Committee Chair), VCC.
Generate 5-7 tasks covering typical pre-event planning (venue, budget, logistics, programme, registration, communications).
Each briefing should be practical and specific to the event name. Be concise — 3-5 bullet points per briefing.
Begin the minutes_draft with "[ AI PREVIEW — no meetings processed yet ]" on the first line.
Respond with valid JSON only. No markdown, no explanation outside the JSON.`,
    messages: [{
      role: 'user',
      content: `Event: ${eventName}\nDate: ${dateStr}\n\nGenerate placeholder preview data. Return JSON:\n{"tasks":[{"assignee":"","task":"","deadline":"YYYY-MM-DD or null","urgency":3,"status":"pending","is_blocker":false,"notes":""}],"briefings":{"secretary":"","oc":"","cc_vcc":"","exco":""},"risks":[{"type":"unowned_blocker","description":"","severity":"high"}],"minutes_draft":""}`,
    }],
  })

  const raw = getText(msg)
  const parsed = PlaceholdersSchema.parse(parseJSON(raw))
  return parsed
}

// --- Query Agent ---
// NL question + task rows + meeting docs → plain-English answer
export interface MeetingDoc {
  minutes_draft: string | null
  transcript: string | null
  created_at: string
}

export async function answerQuery(
  question: string,
  tasks: Task[],
  meetings: MeetingDoc[] = [],
): Promise<string> {
  const docSections: string[] = []

  meetings.forEach((m, i) => {
    const label = `Meeting ${i + 1} (${m.created_at.slice(0, 10)})`
    if (m.minutes_draft?.trim()) {
      docSections.push(`--- ${label}: Minutes ---\n${m.minutes_draft}`)
    }
    if (m.transcript?.trim()) {
      docSections.push(`--- ${label}: Transcript ---\n${m.transcript}`)
    }
  })

  const meetingContext = docSections.length > 0
    ? `\n\nMEETING DOCUMENTS:\n${docSections.join('\n\n')}`
    : ''

  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: `You are a query agent for an SPSU event coordination tool.
You have access to structured task data and the full text of meeting minutes and transcripts.
Answer questions using all available sources. Prefer minutes/transcript for questions about what was discussed, decided, or said. Use task data for status, assignments, urgency, and blockers.
Be concise and specific. Quote from the documents when helpful. If the answer is genuinely not in any source, say so plainly.`,
    messages: [{
      role: 'user',
      content: `TASKS:\n${JSON.stringify(tasks, null, 2)}${meetingContext}\n\nQuestion: ${question}`,
    }],
  })

  return getText(msg)
}
