import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/groq'
import { extractMeetingState, generateOutputs } from '@/lib/claude'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import type { ProcessResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  const start = Date.now()

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set in environment' }, { status: 500 })
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in environment' }, { status: 500 })
  }

  const form = await req.formData()
  const audio = form.get('audio')
  const eventId = form.get('event_id')

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: 'audio file required' }, { status: 400 })
  }
  if (typeof eventId !== 'string' || !eventId) {
    return NextResponse.json({ error: 'event_id required' }, { status: 400 })
  }

  try {
    const supabase = createAdminSupabaseClient()

    const { data: event } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .single()

    const eventName = event?.name ?? 'Unknown Event'

    // 1. Transcribe
    const transcript = await transcribeAudio(audio)
    console.log(`[process] event=${eventId} name="${eventName}" transcript_chars=${transcript.length}`)

    // 2. Extract structured state
    const state = await extractMeetingState(transcript)
    console.log(`[process] event=${eventId} tasks_extracted=${state.tasks.length} decisions=${state.decisions.length}`)

    // 3. Generate briefings + risks + minutes draft
    const { briefings, risks, minutes_draft } = await generateOutputs(transcript, state, eventName)

    // 4. Save meeting record
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .insert({ event_id: eventId, transcript, briefings, risks, minutes_draft })
      .select('id')
      .single()

    if (meetingError) {
      console.error(`[process] meeting insert failed event=${eventId}`, meetingError.message)
      return NextResponse.json({ error: 'failed to save meeting', detail: meetingError.message }, { status: 500 })
    }

    // 5. Save tasks
    const taskRows = state.tasks.map(t => ({ ...t, event_id: eventId }))
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(taskRows)
      .select()

    if (tasksError) {
      console.error(`[process] tasks insert failed event=${eventId}`, tasksError.message)
      return NextResponse.json({ error: 'failed to save tasks', detail: tasksError.message }, { status: 500 })
    }

    console.log(`[process] done event=${eventId} meeting=${meeting.id} tasks=${tasks.length} latency=${Date.now() - start}ms`)

    const response: ProcessResponse = {
      meeting_id: meeting.id,
      transcript,
      tasks: tasks as ProcessResponse['tasks'],
      briefings,
      risks,
      minutes_draft,
    }

    return NextResponse.json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[process] unhandled error event=${eventId}`, msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
