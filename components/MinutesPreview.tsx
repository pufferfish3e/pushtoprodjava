"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Check } from "lucide-react"

interface MinutesPreviewProps {
  minutes: string | null
  loading?: boolean
}

export function MinutesPreview({ minutes, loading }: MinutesPreviewProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!minutes) return
    await navigator.clipboard.writeText(minutes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">Minutes Draft</CardTitle>
        {minutes && (
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
            {copied ? (
              <Check data-icon="inline-start" className="size-3" />
            ) : (
              <Copy data-icon="inline-start" className="size-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-3/4" : "w-full"}`} />
            ))}
          </div>
        ) : minutes ? (
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-mono max-h-96 overflow-y-auto">
            {minutes}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">No minutes draft available.</p>
        )}
      </CardContent>
    </Card>
  )
}
