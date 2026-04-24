"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Upload, FileAudio, FileText, X, Loader2 } from "lucide-react"
import type { ProcessResponse } from "@/lib/types"

interface AudioUploadProps {
  eventId: string
  onResult: (result: ProcessResponse) => void
}

type UploadState = "idle" | "uploading" | "extracting" | "formatting" | "editing" | "processing" | "done" | "error"

const AUDIO_TYPES = /\.(mp3|wav|m4a|ogg|webm|flac|aac|opus)$/i
const DOC_TYPES = /\.(pdf|txt|md)$/i

function getFileKind(file: File): "audio" | "document" | "unsupported" {
  if (AUDIO_TYPES.test(file.name) || file.type.startsWith("audio/")) return "audio"
  if (DOC_TYPES.test(file.name) || file.type === "application/pdf" || file.type.startsWith("text/")) return "document"
  return "unsupported"
}

export function AudioUpload({ eventId, onResult }: AudioUploadProps) {
  const [state, setState] = useState<UploadState>("idle")
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [minutes, setMinutes] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const fileKind = file ? getFileKind(file) : null

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError(null)
    setState("idle")
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f)
    setError(null)
    setState("idle")
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function clearFile() {
    setFile(null)
    setState("idle")
    setError(null)
    setMinutes("")
    if (inputRef.current) inputRef.current.value = ""
  }

  async function extractText(): Promise<string> {
    if (!file) throw new Error("No file selected")
    const kind = getFileKind(file)

    if (kind === "audio") {
      setState("extracting")
      setProgress(30)
      const formData = new FormData()
      formData.append("audio", file)
      const res = await fetch("/api/transcribe", { method: "POST", body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Transcription failed")
      }
      const { transcript } = await res.json()
      return transcript
    }

    if (kind === "document") {
      setState("extracting")
      setProgress(30)
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/extract-text", { method: "POST", body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error || "Extraction failed")
      }
      const { text } = await res.json()
      return text
    }

    throw new Error("Unsupported file type. Use audio (MP3, WAV, M4A) or documents (PDF, TXT).")
  }

  async function handleProcess() {
    if (!file) return
    if (fileKind === "unsupported") {
      setError("Unsupported file type. Use audio (MP3, WAV, M4A) or documents (PDF, TXT).")
      return
    }

    setState("uploading")
    setProgress(15)
    setError(null)

    try {
      const text = await extractText()
      setProgress(60)
      setState("formatting")

      const minutesRes = await fetch("/api/minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text, eventId }),
      })

      if (minutesRes.ok) {
        const { minutes: formatted } = await minutesRes.json()
        setMinutes(formatted ?? text)
      } else {
        setMinutes(text)
      }

      setProgress(100)
      setState("editing")
    } catch (err) {
      setState("error")
      setError(err instanceof Error ? err.message : "Unknown error")
    }
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

  const isLoading = state === "uploading" || state === "extracting" || state === "formatting" || state === "processing"
  const showEditor = state === "editing" || state === "processing" || state === "done"

  const progressLabel =
    state === "uploading" ? "Uploading your file…" :
    state === "extracting" ? (fileKind === "audio" ? "Reading your recording…" : "Reading your document…") :
    state === "formatting" ? "Preparing meeting notes…" :
    state === "processing" ? "Generating briefings and tasks…" :
    ""

  const FileIcon = fileKind === "document" ? FileText : FileAudio
  const buttonLabel = fileKind === "document" ? "Process Document" : "Process Recording"

  return (
    <div className="flex flex-col gap-4">
      {!showEditor && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !file && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors",
            file
              ? "cursor-default border-border bg-muted/30"
              : "cursor-pointer border-border hover:border-foreground/30 hover:bg-muted/20"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac,.pdf,.txt,.md"
            className="hidden"
            onChange={handleFileChange}
          />

          {file ? (
            <>
              <FileIcon className="size-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                  {fileKind === "unsupported" && (
                    <span className="ml-2 text-destructive">— unsupported type</span>
                  )}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); clearFile() }}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <>
              <Upload className="size-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drop file or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports meeting recordings (MP3, WAV, M4A) and written minutes (PDF, TXT)</p>
              </div>
            </>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground">{progressLabel}</p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {showEditor && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">
              Your Meeting Notes
            </p>
            {state !== "done" && (
              <button
                onClick={clearFile}
                className="text-xs text-muted-foreground underline-offset-2 hover:underline"
              >
                Start over
              </button>
            )}
          </div>
          <textarea
            value={minutes}
            onChange={e => setMinutes(e.target.value)}
            disabled={state === "processing" || state === "done"}
            className="w-full min-h-72 resize-y rounded border border-border bg-background p-3 text-xs leading-relaxed text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-60"
            spellCheck={false}
            autoFocus={state === "editing"}
          />
        </div>
      )}

      {state === "done" && (
        <p className="text-sm text-foreground">Done — your briefings and tasks are ready above.</p>
      )}

      {state === "editing" && (
        <Button onClick={handleSubmitMinutes} disabled={!minutes.trim()} className="w-full">
          Generate Briefings &amp; Tasks
        </Button>
      )}

      {!showEditor && (
        <Button
          onClick={handleProcess}
          disabled={!file || isLoading || fileKind === "unsupported"}
          className="w-full"
        >
          {isLoading && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {isLoading ? progressLabel : buttonLabel}
        </Button>
      )}
    </div>
  )
}
