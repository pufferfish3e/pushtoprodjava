import { NextRequest, NextResponse } from 'next/server'
import { answerQuery } from '@/lib/claude'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { QueryResponse } from '@/lib/types'

const BodySchema = z.object({
  question: z.string().min(1),
  event_id: z.string().optional(),
})

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set in environment' }, { status: 500 })
  }

  const body = await req.json()
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'question required' }, { status: 400 })
  }

  const { question, event_id } = parsed.data
  const supabase = createAdminSupabaseClient()

  // Fetch tasks + meeting docs in parallel
  const [tasksResult, meetingsResult] = await Promise.all([
    (() => {
      let q = supabase.from('tasks').select('*')
      if (event_id) q = q.eq('event_id', event_id)
      return q
    })(),
    (() => {
      let q = supabase
        .from('meetings')
        .select('minutes_draft, transcript, created_at')
        .order('created_at', { ascending: false })
        .limit(3)
      if (event_id) q = q.eq('event_id', event_id)
      return q
    })(),
  ])

  if (tasksResult.error) {
    console.error('[query] tasks fetch failed', tasksResult.error.message)
    return NextResponse.json({ error: 'failed to fetch tasks' }, { status: 500 })
  }

  if (meetingsResult.error) {
    // Non-fatal — proceed without meeting docs
    console.warn('[query] meetings fetch failed', meetingsResult.error.message)
  }

  const tasks = tasksResult.data ?? []
  const meetings = meetingsResult.data ?? []

  console.log(
    `[query] question="${question}" event_id=${event_id ?? 'all'} tasks=${tasks.length} meetings=${meetings.length}`,
  )

  try {
    const answer = await answerQuery(question, tasks, meetings)
    const response: QueryResponse = { answer }
    return NextResponse.json(response)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[query] unhandled error', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
