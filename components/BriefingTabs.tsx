"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Briefings } from "@/lib/types"

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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">{t.label} Briefing</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </div>
              ) : briefings ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {briefings[t.key]}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">No briefing available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
