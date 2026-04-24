import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

const BodySchema = z.object({
  name: z.string().min(1).max(200),
  event_date: z.string().nullable().optional(),
  status: z.enum(['planning', 'active', 'completed']).default('planning'),
})

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  try {
    const supabase = createAdminSupabaseClient()
    const { data, error } = await supabase
      .from('events')
      .insert({
        name: body.name,
        event_date: body.event_date ?? null,
        status: body.status,
        org_id: 'demo-org',
      })
      .select()
      .single()

    if (error) {
      console.error('[events] insert failed', error.message)
      return NextResponse.json({ error: 'failed to create event', detail: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[events] unhandled error', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
