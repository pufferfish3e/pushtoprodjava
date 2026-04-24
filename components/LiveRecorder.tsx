"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Mic, Square, Loader2 } from "lucide-react"
import type { ProcessResponse } from "@/lib/types"

interface LiveRecorderProps {
  eventId: string
  onResult: (result: ProcessResponse) => void
}

type RecordState = "idle" | "requesting" | "recording" | "transcribing" | "formatting" | "editing" | "processing" | "done" | "error"

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
  const [minutes, setMinutes] = useState("")
  const [speechSupported, setSpeechSupported] = useState(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const whisperPollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Web Speech API transcript — fallback only, Whisper polling is source of truth
  const speechTranscriptRef = useRef("")
  const finalTranscriptRef = useRef("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  // Stable ref so recorder.onstop closure always has current eventId
  const eventIdRef = useRef(eventId)
  useEffect(() => { eventIdRef.current = eventId }, [eventId])

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSpeechSupported(!!SR)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (whisperPollRef.current) clearInterval(whisperPollRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
      try { recognitionRef.current?.stop() } catch {}
    }
  }, [])

  function startSpeechRecognition() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: {
      resultIndex: number
      results: { isFinal: boolean; [i: number]: { transcript: string } }[]
    }) => {
      let interim = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscriptRef.current += result[0].transcript + " "
        } else {
          interim += result[0].transcript
        }
      }
      const full = (finalTranscriptRef.current + interim).trim()
      speechTranscriptRef.current = full
      setLiveTranscript(full)
    }

    recognition.onerror = (event: { error: string }) => {
      if (event.error === "no-speech") {
        try { recognition.start() } catch {}
      }
    }

    recognition.onend = () => {
      if (mediaRecorderRef.current?.state === "recording") {
        try { recognition.start() } catch {}
      }
    }

    recognitionRef.current = recognition
    try { recognition.start() } catch {}
  }

  async function startRecording() {
    setError(null)
    setLiveTranscript("")
    setMinutes("")
    speechTranscriptRef.current = ""
    finalTranscriptRef.current = ""
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
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      // onstop: uses refs only — no stale closure risk
      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        try { recognitionRef.current?.stop() } catch {}
        if (timerRef.current) clearInterval(timerRef.current)
        transcribeAndFormat()
      }

      recorder.start(1000)
      setState("recording")
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)

      startSpeechRecognition()

      // Poll Groq Whisper every 3s for reliable live captions
      whisperPollRef.current = setInterval(async () => {
        if (chunksRef.current.length === 0) return
        try {
          const blob = new Blob(chunksRef.current, {
            type: chunksRef.current[0]?.type || "audio/webm",
          })
          const file = new File([blob], "recording.webm", { type: blob.type })
          const formData = new FormData()
          formData.append("audio", file)
          const res = await fetch("/api/transcribe", { method: "POST", body: formData })
          if (res.ok) {
            const data = await res.json()
            if (data.transcript) {
              speechTranscriptRef.current = data.transcript
              setLiveTranscript(data.transcript)
            }
          }
        } catch {
          // non-fatal — captions just don't update this tick
        }
      }, 3000)
    } catch (err) {
      setState("error")
      setError(err instanceof Error ? err.message : "Microphone access denied")
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    try { recognitionRef.current?.stop() } catch {}
    if (timerRef.current) clearInterval(timerRef.current)
    if (whisperPollRef.current) clearInterval(whisperPollRef.current)
  }

  // Primary path: Groq Whisper → /api/minutes → editor
  // Falls back to Web Speech API transcript if Whisper fails
  async function transcribeAndFormat() {
    setState("transcribing")
    setProgress(20)
    setError(null)

    let transcript = ""

    if (chunksRef.current.length > 0) {
      try {
        const blob = new Blob(chunksRef.current, {
          type: chunksRef.current[0]?.type || "audio/webm",
        })
        const file = new File([blob], "recording.webm", { type: blob.type })
        const formData = new FormData()
        formData.append("audio", file)

        const res = await fetch("/api/transcribe", { method: "POST", body: formData })
        if (res.ok) {
          const data = await res.json()
          transcript = data.transcript ?? ""
        }
      } catch {
        // fall through
      }
    }

    // Fallback to live captions
    if (!transcript.trim()) {
      transcript = speechTranscriptRef.current
    }

    if (!transcript.trim()) {
      setState("editing")
      setProgress(0)
      setMinutes("")
      setError("Could not transcribe audio. Type or paste meeting content below.")
      return
    }

    // Show raw transcript immediately so secretary can start reviewing
    setMinutes(transcript)
    setState("formatting")
    setProgress(60)

    // Format into SPSU minutes structure
    try {
      const res = await fetch("/api/minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, eventId: eventIdRef.current }),
      })
      if (res.ok) {
        const { minutes: formatted } = await res.json()
        if (formatted) setMinutes(formatted)
      }
      // if /api/minutes fails, raw transcript stays — still usable
    } catch {
      // raw transcript already set above
    }

    setProgress(100)
    setState("editing")
  }

  async function handleSubmitMinutes() {
    if (!minutes.trim()) {
      setError("Minutes cannot be empty.")
      return
    }
    setState("processing")
    setProgress(0)
    setError(null)
    try {
      setProgress(30)
      const res = await fetch("/api/process-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: minutes, event_id: eventId }),
      })
      setProgress(80)
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Processing failed")
      }
      const data: ProcessResponse = await res.json()
      setProgress(100)
      setState("done")
      onResult(data)
    } catch (err) {
      setState("editing")
      setError(err instanceof Error ? err.message : "Processing failed")
    }
  }

  function reset() {
    if (whisperPollRef.current) clearInterval(whisperPollRef.current)
    setState("idle")
    setElapsed(0)
    setProgress(0)
    setError(null)
    setLiveTranscript("")
    setMinutes("")
    speechTranscriptRef.current = ""
    finalTranscriptRef.current = ""
    chunksRef.current = []
  }

  const isProcessing = state === "processing"
  const showEditor = state === "editing" || state === "processing" || state === "done"

  const statusLabel =
    state === "transcribing" ? "Transcribing audio with Whisper…" :
    state === "formatting" ? "Formatting meeting minutes…" :
    state === "processing" ? "Extracting tasks and generating briefings…" :
    ""

  return (
    <div className="flex flex-col gap-4">
      {/* Recording control */}
      {(state === "idle" || state === "requesting" || state === "recording") && (
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
          ) : (
            <>
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-border">
                <Mic className="size-7 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Live recording</p>
                <p className="text-xs text-muted-foreground">
                  {speechSupported
                    ? "Live captions preview — Whisper transcribes on stop"
                    : "Audio captured — Whisper transcribes on stop"}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Live captions while recording (preview only) */}
      {state === "recording" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Live Captions
            <span className="inline-block size-1.5 rounded-full bg-destructive animate-pulse" />
          </p>
          <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
            {liveTranscript ? (
              <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{liveTranscript}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Waiting for speech…</p>
            )}
          </div>
        </div>
      )}

      {/* Progress during transcription / formatting / processing */}
      {(state === "transcribing" || state === "formatting" || isProcessing) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
            <Loader2 className="size-5 animate-spin text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">{statusLabel}</p>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Minutes editor — open by default, populated from Whisper + /api/minutes */}
      {showEditor && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Meeting Minutes
            </p>
            {state !== "done" && (
              <button
                onClick={reset}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Record again
              </button>
            )}
          </div>
          <textarea
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            disabled={isProcessing || state === "done"}
            className="w-full min-h-72 resize-y rounded border border-border bg-background p-3 text-xs leading-relaxed text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
            spellCheck={false}
          />
        </div>
      )}

      {state === "editing" && (
        <Button onClick={handleSubmitMinutes} className="w-full">
          Submit Minutes — Extract Tasks &amp; Briefings
        </Button>
      )}

      {state === "done" && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground">Done. Tasks and briefings generated.</p>
          <button onClick={reset} className="text-xs text-muted-foreground underline-offset-2 hover:underline">
            Record again
          </button>
        </div>
      )}

      {(state === "idle" || state === "requesting") && (
        <Button onClick={startRecording} disabled={state === "requesting"} className="w-full">
          {state === "requesting" && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {state === "requesting" ? "Requesting mic…" : "Start Recording"}
        </Button>
      )}
    </div>
  )
}
