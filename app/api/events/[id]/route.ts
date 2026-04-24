import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const supabase = createAdminSupabaseClient()

  await supabase.from('tasks').delete().eq('event_id', id)
  await supabase.from('meetings').delete().eq('event_id', id)

  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) {
    console.error('[events] delete failed', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
