import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

const BodySchema = z.object({
  name: z.string().min(1).max(200),
  event_date: z.string().nullable().optional(),
  status: z.enum(['planning', 'active', 'completed']).default('planning'),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = BodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { name, event_date, status } = parsed.data
    const supabase = createAdminSupabaseClient()

    const { data, error } = await supabase
      .from('events')
      .insert({ name, event_date: event_date ?? null, status, org_id: 'demo-org' })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
