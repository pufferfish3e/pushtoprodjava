import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
  })
}
