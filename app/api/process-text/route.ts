import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { extractMeetingState, generateOutputs } from '@/lib/claude'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import type { ProcessResponse } from '@/lib/types'

const BodySchema = z.object({
  transcript: z.string().min(1),
  event_id: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const start = Date.now()

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in environment' }, { status: 500 })
  }

  let body: z.infer<typeof BodySchema>
  try {
    const raw = await req.json()
    body = BodySchema.parse(raw)
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: 'transcript and event_id required', detail }, { status: 400 })
  }

  const { transcript, event_id: eventId } = body

  try {
    const supabase = createAdminSupabaseClient()

    const { data: event } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .single()

    const eventName = event?.name ?? 'Unknown Event'

    const state = await extractMeetingState(transcript)
    console.log(`[process-text] event=${eventId} tasks=${state.tasks.length} decisions=${state.decisions.length}`)

    const { briefings, risks, minutes_draft } = await generateOutputs(transcript, state, eventName)

    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({ event_id: eventId, transcript, briefings, risks, minutes_draft })
      .select('id')
      .single()

    if (meetingError) {
      console.error(`[process-text] meeting insert failed event=${eventId}`, meetingError.message)
      return NextResponse.json({ error: 'failed to save meeting', detail: meetingError.message }, { status: 500 })
    }

    const taskRows = state.tasks.map(t => ({ ...t, event_id: eventId }))
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(taskRows)
      .select()

    if (tasksError) {
      console.error(`[process-text] tasks insert failed event=${eventId}`, tasksError.message)
      return NextResponse.json({ error: 'failed to save tasks', detail: tasksError.message }, { status: 500 })
    }

    console.log(`[process-text] done event=${eventId} meeting=${meeting.id} tasks=${tasks?.length} latency=${Date.now() - start}ms`)

    const response: ProcessResponse = {
      meeting_id: meeting.id,
      transcript,
      tasks: (tasks ?? []) as ProcessResponse['tasks'],
      briefings,
      risks,
      minutes_draft,
    }

    return NextResponse.json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[process-text] unhandled error event=${eventId}`, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
