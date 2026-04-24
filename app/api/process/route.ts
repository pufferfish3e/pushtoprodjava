import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/groq'
import { extractMeetingState, generateOutputs } from '@/lib/claude'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ProcessResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  const start = Date.now()
  const form = await req.formData()
  const audio = form.get('audio')
  const eventId = form.get('event_id')

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: 'audio file required' }, { status: 400 })
  }
  if (typeof eventId !== 'string' || !eventId) {
    return NextResponse.json({ error: 'event_id required' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

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
    return NextResponse.json({ error: 'failed to save meeting' }, { status: 500 })
  }

  // 5. Save tasks
  const taskRows = state.tasks.map(t => ({ ...t, event_id: eventId }))
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .insert(taskRows)
    .select()

  if (tasksError) {
    console.error(`[process] tasks insert failed event=${eventId}`, tasksError.message)
    return NextResponse.json({ error: 'failed to save tasks' }, { status: 500 })
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
}
