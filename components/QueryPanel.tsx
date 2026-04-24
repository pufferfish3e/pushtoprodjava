"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"

const PRESETS = [
  "What is still blocked?",
  "Who has the most urgent tasks?",
  "What needs to happen before the event date?",
  "What changed since the last meeting?",
]

interface QueryPanelProps {
  eventId?: string
}

export function QueryPanel({ eventId }: QueryPanelProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAsk(q?: string) {
    const text = q ?? question
    if (!text.trim()) return
    setLoading(true)
    setAnswer(null)
    setError(null)
    if (q) setQuestion(q)

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, ...(eventId ? { event_id: eventId } : {}) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Query failed")
      setAnswer(data.answer)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAsk()}
          placeholder="Ask about this event…"
          className="h-9 text-sm"
        />
        <Button
          size="sm"
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="shrink-0"
        >
          {loading
            ? <Loader2 data-icon="inline-start" className="animate-spin" />
            : <Search data-icon="inline-start" />}
          Ask
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p}
            onClick={() => handleAsk(p)}
            disabled={loading}
            className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors disabled:opacity-40"
          >
            {p}
          </button>
        ))}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {answer && (
        <div className="rounded-md border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}
