import { NextRequest, NextResponse } from 'next/server'
import { answerQuery } from '@/lib/claude'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { QueryResponse } from '@/lib/types'

const BodySchema = z.object({
  question: z.string().min(1),
  event_id: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = BodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'question required' }, { status: 400 })
  }

  const { question, event_id } = parsed.data
  const supabase = createServerSupabaseClient()

  let query = supabase.from('tasks').select('*')
  if (event_id) query = query.eq('event_id', event_id)

  const { data: tasks, error } = await query

  if (error) {
    console.error('[query] tasks fetch failed', error.message)
    return NextResponse.json({ error: 'failed to fetch tasks' }, { status: 500 })
  }

  console.log(`[query] question="${question}" event_id=${event_id ?? 'all'} tasks_loaded=${tasks?.length ?? 0}`)

  const answer = await answerQuery(question, tasks ?? [])
  const response: QueryResponse = { answer }
  return NextResponse.json(response)
}
