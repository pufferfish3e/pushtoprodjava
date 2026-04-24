"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Mic, Square, Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react"
import type { ProcessResponse } from "@/lib/types"

interface LiveRecorderProps {
  eventId: string
  onResult: (result: ProcessResponse) => void
}

type RecordState = "idle" | "requesting" | "recording" | "stopped" | "processing" | "done" | "error"

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}

export function LiveRecorder({ eventId, onResult }: LiveRecorderProps) {
  const [state, setState] = useState<RecordState>("idle")
  const [elapsed, setElapsed] = useState(0)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [liveTranscript, setLiveTranscript] = useState("")
  const [spsuMinutes, setSpsuMinutes] = useState<string | null>(null)
  const [formattingMinutes, setFormattingMinutes] = useState(false)
  const [showMinutes, setShowMinutes] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const transcriptRef = useRef("")

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  async function transcribeChunk(chunk: Blob) {
    try {
      const file = new File([chunk], "chunk.webm", { type: chunk.type || "audio/webm" })
      const fd = new FormData()
      fd.append("audio", file)
      const res = await fetch("/api/transcribe", { method: "POST", body: fd })
      if (res.ok) {
        const { transcript } = await res.json()
        if (transcript) {
          transcriptRef.current = transcriptRef.current
            ? transcriptRef.current + " " + transcript
            : transcript
          setLiveTranscript(transcriptRef.current)
        }
      }
    } catch {
      // non-fatal — transcript may have gaps
    }
  }

  async function startRecording() {
    setError(null)
    setLiveTranscript("")
    setSpsuMinutes(null)
    setShowMinutes(false)
    transcriptRef.current = ""
    setState("requesting")

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : ""

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
          transcribeChunk(e.data)
        }
      }

      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        if (timerRef.current) clearInterval(timerRef.current)
        setState("stopped")
      }

      recorder.start(5000)
      setState("recording")
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } catch (err) {
      setState("error")
      setError(err instanceof Error ? err.message : "Microphone access denied")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
  }

  async function submitRecording() {
    setState("processing")
    setProgress(20)
    try {
      const blob = new Blob(chunksRef.current, {
        type: chunksRef.current[0]?.type || "audio/webm",
      })
      const file = new File([blob], "recording.webm", { type: blob.type })
      const formData = new FormData()
      formData.append("audio", file)
      formData.append("event_id", eventId)
      setProgress(40)

      const res = await fetch("/api/process", { method: "POST", body: formData })
      setProgress(80)

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Processing failed")
      }

      const data: ProcessResponse = await res.json()
      setProgress(100)
      setState("done")
      onResult(data)
    } catch (err) {
      setState("error")
      setError(err instanceof Error ? err.message : "Processing failed")
    }
  }

  async function handleFormatMinutes() {
    if (!transcriptRef.current) return
    setFormattingMinutes(true)
    try {
      const res = await fetch("/api/minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptRef.current, eventId }),
      })
      if (res.ok) {
        const { minutes } = await res.json()
        setSpsuMinutes(minutes)
        setShowMinutes(true)
      }
    } catch {
      // non-fatal
    } finally {
      setFormattingMinutes(false)
    }
  }

  function reset() {
    setState("idle")
    setElapsed(0)
    setProgress(0)
    setError(null)
    setLiveTranscript("")
    setSpsuMinutes(null)
    setShowMinutes(false)
    transcriptRef.current = ""
    chunksRef.current = []
  }

  const isProcessing = state === "processing"
  const showTranscript = state === "recording" || state === "stopped" || state === "done"

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border p-8">
        {state === "recording" ? (
          <>
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex size-16 animate-ping rounded-full bg-destructive/30" />
              <button
                onClick={stopRecording}
                className="relative flex size-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-transform hover:scale-105"
              >
                <Square className="size-6 fill-current" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground tabular-nums">{formatTime(elapsed)}</p>
              <p className="text-xs text-muted-foreground">Recording — click to stop</p>
            </div>
          </>
        ) : isProcessing ? (
          <>
            <Loader2 className="size-10 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Extracting tasks with AI…</p>
          </>
        ) : state === "done" ? (
          <>
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-foreground/20">
              <Mic className="size-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-foreground">Done. Tasks extracted.</p>
            <button onClick={reset} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
              Record again
            </button>
          </>
        ) : (
          <>
            <div className="flex size-16 items-center justify-center rounded-full border-2 border-border">
              <Mic className="size-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Live recording</p>
              <p className="text-xs text-muted-foreground">
                Tap start — transcript updates every 5 seconds
              </p>
            </div>
          </>
        )}
      </div>

      {showTranscript && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Live Transcript
            {state === "recording" && (
              <span className="inline-block size-1.5 rounded-full bg-destructive animate-pulse" />
            )}
          </p>
          <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
            {liveTranscript ? (
              <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                {liveTranscript}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Waiting for speech…</p>
            )}
          </div>
        </div>
      )}

      {isProcessing && (
        <div className="flex flex-col gap-2">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground">Processing…</p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {state === "stopped" && (
        <div className="flex flex-col gap-2">
          <Button onClick={submitRecording} className="w-full">
            Process Meeting — Extract Tasks &amp; Briefings
          </Button>
          <Button
            variant="outline"
            onClick={handleFormatMinutes}
            disabled={formattingMinutes || !liveTranscript}
            className="w-full gap-2"
          >
            {formattingMinutes ? (
              <><Loader2 className="size-4 animate-spin" /> Formatting minutes…</>
            ) : (
              <><FileText className="size-4" /> View as SPSU Meeting Minutes</>
            )}
          </Button>
        </div>
      )}

      {(state === "idle" || state === "requesting") && (
        <Button onClick={startRecording} disabled={state === "requesting"} className="w-full">
          {state === "requesting" && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {state === "requesting" ? "Requesting mic…" : "Start Recording"}
        </Button>
      )}

      {spsuMinutes && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowMinutes(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            SPSU Meeting Minutes Draft
            {showMinutes ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
          {showMinutes && (
            <div className="rounded-md border border-border bg-muted/20 p-4">
              <pre className="text-xs leading-relaxed text-foreground whitespace-pre-wrap font-mono overflow-x-auto">
                {spsuMinutes}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(spsuMinutes)}
                className="mt-3 text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Copy to clipboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
