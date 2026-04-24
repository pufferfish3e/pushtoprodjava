import { NextRequest, NextResponse } from 'next/server'
import { extractTextFromPDF } from '@/lib/claude'

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })
  }
  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file required' }, { status: 400 })
    }

    const mimeType = file.type.toLowerCase()

    // Plain text — just read it
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || file.name.match(/\.(txt|md)$/i)) {
      const text = await file.text()
      return NextResponse.json({ text })
    }

    // PDF — Claude document extraction
    if (mimeType === 'application/pdf' || file.name.match(/\.pdf$/i)) {
      const buffer = await file.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      const text = await extractTextFromPDF(base64)
      return NextResponse.json({ text })
    }

    return NextResponse.json({ error: 'unsupported file type' }, { status: 400 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[extract-text] error', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
