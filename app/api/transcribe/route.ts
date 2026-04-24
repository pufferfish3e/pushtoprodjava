import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/groq'

export async function POST(req: NextRequest) {
  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: 'GROQ_API_KEY not set' }, { status: 500 })
  }
  try {
    const form = await req.formData()
    const audio = form.get('audio')
    if (!(audio instanceof File)) {
      return NextResponse.json({ error: 'audio file required' }, { status: 400 })
    }
    const transcript = await transcribeAudio(audio)
    return NextResponse.json({ transcript })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
