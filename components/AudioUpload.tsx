"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Upload, FileAudio, X, Loader2 } from "lucide-react"
import type { ProcessResponse } from "@/lib/types"

interface AudioUploadProps {
  onResult: (result: ProcessResponse) => void
}

type UploadState = "idle" | "uploading" | "processing" | "done" | "error"

export function AudioUpload({ onResult }: AudioUploadProps) {
  const [state, setState] = useState<UploadState>("idle")
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f) return
    setFile(f)
    setError(null)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function clearFile() {
    setFile(null)
    setState("idle")
    setError(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  async function handleSubmit() {
    if (!file) return
    setState("uploading")
    setProgress(20)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      setProgress(40)
      setState("processing")

      const res = await fetch("/api/process", {
        method: "POST",
        body: formData,
      })

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
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  const isLoading = state === "uploading" || state === "processing"

  return (
    <div className="flex flex-col gap-4">
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
          accept="audio/*,.mp3,.wav,.m4a,.ogg"
          className="hidden"
          onChange={handleFileChange}
        />

        {file ? (
          <>
            <FileAudio className="size-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
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
              <p className="text-sm font-medium text-foreground">Drop audio file or click to browse</p>
              <p className="text-xs text-muted-foreground">MP3, WAV, M4A, OGG supported</p>
            </div>
          </>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Progress value={progress} className="h-1" />
          <p className="text-xs text-muted-foreground">
            {state === "uploading" ? "Uploading…" : "Extracting tasks with AI…"}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {state === "done" && (
        <p className="text-sm text-foreground">Done. Tasks extracted.</p>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!file || isLoading}
        className="w-full"
      >
        {isLoading && <Loader2 data-icon="inline-start" className="animate-spin" />}
        {isLoading ? (state === "uploading" ? "Uploading…" : "Processing…") : "Process Meeting"}
      </Button>
    </div>
  )
}
