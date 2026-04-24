"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Check, Pencil, X, Download, FileText } from "lucide-react"

interface MinutesPreviewProps {
  minutes: string | null
  loading?: boolean
  onSave?: (value: string) => void
}

export function MinutesPreview({ minutes, loading, onSave }: MinutesPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(minutes ?? "")

  // Keep draft in sync if minutes change externally (e.g. new processing run)
  useEffect(() => {
    if (!editing) setDraft(minutes ?? "")
  }, [minutes, editing])

  async function handleCopy() {
    const text = editing ? draft : (minutes ?? "")
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSave() {
    onSave?.(draft)
    setEditing(false)
  }

  function handleCancel() {
    setDraft(minutes ?? "")
    setEditing(false)
  }

  function exportTxt() {
    const text = editing ? draft : (minutes ?? "")
    if (!text) return
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "meeting-record.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  function exportPdf() {
    const text = editing ? draft : (minutes ?? "")
    if (!text) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Meeting Minutes</title>
  <style>
    body { font-family: "Times New Roman", serif; font-size: 12pt; margin: 2.5cm; line-height: 1.6; color: #000; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: inherit; }
    @media print { body { margin: 2cm; } }
  </style>
</head>
<body><pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
<script>window.onload = () => { window.print(); }<\/script>
</body></html>`)
    win.document.close()
  }

  const hasContent = editing ? !!draft : !!minutes

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2 flex-wrap">
        <CardTitle className="text-sm font-semibold">Meeting Record</CardTitle>
        {hasContent && !loading && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {editing ? (
              <>
                <Button variant="default" size="sm" onClick={handleSave} className="h-7 px-2 text-xs">
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCancel} className="h-7 px-2 text-xs">
                  <X className="size-3" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="h-7 px-2 text-xs">
                <Pencil className="size-3" />
                Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="sm" onClick={exportTxt} className="h-7 px-2 text-xs">
              <Download className="size-3" />
              .txt
            </Button>
            <Button variant="ghost" size="sm" onClick={exportPdf} className="h-7 px-2 text-xs">
              <FileText className="size-3" />
              PDF
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
            ))}
          </div>
        ) : editing ? (
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            className="w-full min-h-96 resize-y rounded border border-border bg-background p-2 text-xs leading-relaxed text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            spellCheck={false}
            autoFocus
          />
        ) : minutes ? (
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-mono max-h-96 overflow-y-auto">
            {minutes}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">No meeting record yet. Process a recording above to generate one.</p>
        )}
      </CardContent>
    </Card>
  )
}
