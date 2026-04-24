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
  {
    key: "secretary" as const,
    label: "Secretary",
    description: "Full record of decisions, actions, and who is responsible for what.",
  },
  {
    key: "oc" as const,
    label: "OC",
    description: "What the Organising Committee needs to act on — blockers, next steps, open tasks.",
  },
  {
    key: "cc_vcc" as const,
    label: "CC / VCC",
    description: "Cross-event risks, workload conflicts, and items requiring the Camp Coordinator's attention.",
  },
  {
    key: "exco" as const,
    label: "EXCO",
    description: "Summary for the Executive Committee — budget matters, escalations, and approvals needed.",
  },
]

function BriefingCard({
  label,
  description,
  content,
  loading,
}: {
  label: string
  description: string
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
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-sm font-semibold">{label} Briefing</CardTitle>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {content && !loading && (
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs shrink-0">
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
          <p className="text-sm text-muted-foreground">No briefing yet. Add a meeting recording below to generate one.</p>
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
            description={t.description}
            content={briefings?.[t.key]}
            loading={loading}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
