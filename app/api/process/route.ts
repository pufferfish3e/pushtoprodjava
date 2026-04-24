import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/groq'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { ProcessResponse } from '@/lib/types'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const audio = form.get('audio')
  const eventId = form.get('event_id')

  if (!(audio instanceof File)) {
    return NextResponse.json({ error: 'audio file required' }, { status: 400 })
  }

  if (typeof eventId !== 'string' || !eventId) {
    return NextResponse.json({ error: 'event_id required' }, { status: 400 })
  }

  const transcript = await transcribeAudio(audio)

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('meetings')
    .insert({ event_id: eventId, transcript })
    .select('id')
    .single()

  if (error) {
    console.error('[process] supabase insert failed', error.message)
    return NextResponse.json({ error: 'failed to save meeting' }, { status: 500 })
  }

  console.log(`[process] event=${eventId} meeting=${data.id} transcript_chars=${transcript.length}`)

  const response: ProcessResponse = {
    transcript,
    meeting_id: data.id,
  }

  return NextResponse.json(response)
}
