"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle, XCircle, ChevronDown, ChevronRight } from "lucide-react"

// ── types ──────────────────────────────────────────────────────────────────

type Status = "idle" | "loading" | "ok" | "error"

interface Result {
  status: Status
  latency?: number
  data?: unknown
  error?: string
}

// ── helpers ────────────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: Status }) {
  if (status === "loading") return <Loader2 className="size-4 animate-spin text-muted-foreground" />
  if (status === "ok") return <CheckCircle className="size-4 text-green-500" />
  if (status === "error") return <XCircle className="size-4 text-destructive" />
  return <span className="size-4 rounded-full border border-border inline-block" />
}

function JsonBlock({ data }: { data: unknown }) {
  const [open, setOpen] = useState(false)
  const str = JSON.stringify(data, null, 2)
  const lines = str.split("\n").length
  const preview = str.split("\n").slice(0, 6).join("\n")

  return (
    <div className="rounded-md border border-border bg-muted/30 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        {open ? "Collapse" : `Expand (${lines} lines)`}
      </button>
      <pre className="overflow-x-auto px-3 pb-3 text-xs text-foreground font-mono leading-relaxed">
        {open ? str : preview + (lines > 6 ? "\n  ..." : "")}
      </pre>
    </div>
  )
}

function Section({
  title,
  badge,
  children,
}: {
  title: string
  badge: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-5">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <Badge variant="outline" className="text-xs font-mono">
          {badge}
        </Badge>
      </div>
      {children}
    </div>
  )
}

function ResultRow({ label, result }: { label: string; result: Result }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <StatusIcon status={result.status} />
        <span className="text-xs text-muted-foreground">{label}</span>
        {result.latency !== undefined && (
          <span className="ml-auto text-xs text-muted-foreground">{result.latency}ms</span>
        )}
      </div>
      {result.error && (
        <p className="text-xs text-destructive pl-6">{result.error}</p>
      )}
      {result.data !== undefined && <JsonBlock data={result.data} />}
    </div>
  )
}

// ── main page ──────────────────────────────────────────────────────────────

export default function TestPage() {
  // /api/process
  const fileRef = useRef<HTMLInputElement>(null)
  const [eventId, setEventId] = useState("evt-001")
  const [processResult, setProcessResult] = useState<Result>({ status: "idle" })

  // /api/query
  const [question, setQuestion] = useState("What is blocking the orientation camp?")
  const [queryEventId, setQueryEventId] = useState("")
  const [queryResult, setQueryResult] = useState<Result>({ status: "idle" })

  // env check
  const [envResult, setEnvResult] = useState<Result>({ status: "idle" })

  async function runEnvCheck() {
    setEnvResult({ status: "loading" })
    const t = Date.now()
    try {
      const res = await fetch("/api/test/env")
      const data = await res.json()
      setEnvResult({ status: res.ok ? "ok" : "error", latency: Date.now() - t, data })
    } catch (e) {
      setEnvResult({ status: "error", error: String(e) })
    }
  }

  async function runProcess() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setProcessResult({ status: "loading" })
    const t = Date.now()
    try {
      const form = new FormData()
      form.append("audio", file)
      form.append("event_id", eventId)
      const res = await fetch("/api/process", { method: "POST", body: form })
      const data = await res.json()
      setProcessResult({
        status: res.ok ? "ok" : "error",
        latency: Date.now() - t,
        data,
        error: res.ok ? undefined : data?.error,
      })
    } catch (e) {
      setProcessResult({ status: "error", error: String(e) })
    }
  }

  async function runQuery() {
    if (!question.trim()) return
    setQueryResult({ status: "loading" })
    const t = Date.now()
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          ...(queryEventId.trim() ? { event_id: queryEventId.trim() } : {}),
        }),
      })
      const data = await res.json()
      setQueryResult({
        status: res.ok ? "ok" : "error",
        latency: Date.now() - t,
        data,
        error: res.ok ? undefined : data?.error,
      })
    } catch (e) {
      setQueryResult({ status: "error", error: String(e) })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10 flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">Backend Test</h1>
            <Badge variant="secondary" className="text-xs">dev only</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Test all API endpoints. No auth required on this page.
          </p>
        </div>

        <Separator />

        {/* Env check */}
        <Section title="Environment" badge="GET /api/test/env">
          <p className="text-xs text-muted-foreground">
            Check which API keys are present without exposing values.
          </p>
          <Button size="sm" variant="outline" onClick={runEnvCheck} disabled={envResult.status === "loading"}>
            {envResult.status === "loading" && <Loader2 data-icon="inline-start" className="animate-spin" />}
            Check Keys
          </Button>
          {envResult.status !== "idle" && <ResultRow label="env check" result={envResult} />}
        </Section>

        {/* /api/process */}
        <Section title="Full Pipeline" badge="POST /api/process">
          <p className="text-xs text-muted-foreground">
            Upload audio → Groq transcription → Claude extraction → saves to Supabase → returns{" "}
            <code className="text-foreground">ProcessResponse</code>.
          </p>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="event_id"
                className="h-8 text-xs w-36 font-mono"
              />
              <span className="text-xs text-muted-foreground self-center">event_id</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                className="text-xs text-muted-foreground file:mr-2 file:rounded file:border file:border-border file:bg-muted file:px-2 file:py-1 file:text-xs file:text-foreground file:cursor-pointer"
              />
            </div>
            <Button
              size="sm"
              onClick={runProcess}
              disabled={processResult.status === "loading"}
              className="w-fit"
            >
              {processResult.status === "loading" && <Loader2 data-icon="inline-start" className="animate-spin" />}
              Run Pipeline
            </Button>
          </div>
          {processResult.status !== "idle" && (
            <ResultRow label="process response" result={processResult} />
          )}
        </Section>

        {/* /api/query */}
        <Section title="NL Query" badge="POST /api/query">
          <p className="text-xs text-muted-foreground">
            Ask a natural-language question over stored tasks. Leave event_id blank to query all events.
          </p>
          <div className="flex flex-col gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What is blocking the orientation camp?"
              className="h-8 text-xs"
            />
            <div className="flex gap-2">
              <Input
                value={queryEventId}
                onChange={(e) => setQueryEventId(e.target.value)}
                placeholder="event_id (optional)"
                className="h-8 text-xs w-48 font-mono"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                "What is blocking the orientation camp?",
                "Who has the most urgent tasks?",
                "What tasks are overdue?",
                "List all blockers across all events",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className={cn(
                    "rounded border border-border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
                    question === q && "border-foreground/40 text-foreground"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              onClick={runQuery}
              disabled={queryResult.status === "loading" || !question.trim()}
              className="w-fit"
            >
              {queryResult.status === "loading" && <Loader2 data-icon="inline-start" className="animate-spin" />}
              Ask
            </Button>
          </div>
          {queryResult.status !== "idle" && (
            <ResultRow label="query response" result={queryResult} />
          )}
        </Section>

        <Separator />

        <p className="text-xs text-muted-foreground">
          Supabase URL: <code className="text-foreground">{process.env.NEXT_PUBLIC_SUPABASE_URL ?? "not set"}</code>
        </p>
      </div>
    </div>
  )
}
