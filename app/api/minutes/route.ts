import { NextRequest, NextResponse } from 'next/server'
import { formatAsSPSUMinutes } from '@/lib/claude'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
  }
  try {
    const { transcript, eventId } = await req.json()
    if (!transcript) return NextResponse.json({ error: 'transcript required' }, { status: 400 })

    let eventName = 'Event'
    if (eventId) {
      try {
        const supabase = createAdminSupabaseClient()
        const { data } = await supabase.from('events').select('name').eq('id', eventId).single()
        if (data) eventName = data.name
      } catch {
        // non-fatal
      }
    }

    const minutes = await formatAsSPSUMinutes(transcript, eventName)
    return NextResponse.json({ minutes })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
