"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Check } from "lucide-react"
import type { Briefings } from "@/lib/types"
import { MarkdownContent } from "@/components/MarkdownContent"

interface BriefingTabsProps {
  briefings: Briefings | null
  loading?: boolean
}

const TABS = [
  { key: "secretary" as const, label: "Secretary" },
  { key: "oc" as const, label: "OC" },
  { key: "cc_vcc" as const, label: "CC / VCC" },
  { key: "exco" as const, label: "EXCO" },
]

function BriefingCard({
  label,
  content,
  loading,
}: {
  label: string
  content: string | undefined
  loading?: boolean
}) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!content) return
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold">{label} Briefing</CardTitle>
        {content && !loading && (
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs">
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : content ? (
          <MarkdownContent text={content} />
        ) : (
          <p className="text-sm text-muted-foreground">No briefing available.</p>
        )}
      </CardContent>
    </Card>
  )
}

export function BriefingTabs({ briefings, loading }: BriefingTabsProps) {
  return (
    <Tabs defaultValue="secretary">
      <TabsList className="w-full grid grid-cols-4">
        {TABS.map((t) => (
          <TabsTrigger key={t.key} value={t.key}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((t) => (
        <TabsContent key={t.key} value={t.key}>
          <BriefingCard
            label={t.label}
            content={briefings?.[t.key]}
            loading={loading}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
