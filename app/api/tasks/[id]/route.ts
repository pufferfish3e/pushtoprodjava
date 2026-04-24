import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import { z } from 'zod'

const BodySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const body = await req.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid status' }, { status: 400 })
  }
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase
    .from('tasks')
    .update({ status: parsed.data.status })
    .eq('id', id)
  if (error) {
    console.error(`[tasks] status update failed id=${id}`, error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  console.log(`[tasks] status updated id=${id} status=${parsed.data.status}`)
  return NextResponse.json({ ok: true })
}
