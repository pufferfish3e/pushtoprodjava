"use client"

import { useState, useCallback } from "react"
import { AudioUpload } from "@/components/AudioUpload"
import { LiveRecorder } from "@/components/LiveRecorder"
import { TaskTable } from "@/components/TaskTable"
import { BriefingTabs } from "@/components/BriefingTabs"
import { RiskBanner } from "@/components/RiskBanner"
import { MinutesPreview } from "@/components/MinutesPreview"
import { QueryPanel } from "@/components/QueryPanel"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Task, Briefings, RiskSignal, ProcessResponse, TaskStatus } from "@/lib/types"

interface Props {
  eventId: string
  eventName: string
  initialTasks: Task[]
  initialBriefings: Briefings | null
  initialRisks: RiskSignal[]
  initialMinutes: string | null
  isPlaceholder?: boolean
}

export function EventDetailClient({
  eventId,
  eventName,
  initialTasks,
  initialBriefings,
  initialRisks,
  initialMinutes,
  isPlaceholder = false,
}: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [briefings, setBriefings] = useState<Briefings | null>(initialBriefings)
  const [risks, setRisks] = useState<RiskSignal[]>(initialRisks)
  const [minutes, setMinutes] = useState<string | null>(initialMinutes)
  const [justProcessed, setJustProcessed] = useState(false)
  const [showPlaceholderBanner, setShowPlaceholderBanner] = useState(isPlaceholder)

  function handleResult(result: ProcessResponse) {
    setTasks(result.tasks)
    setBriefings(result.briefings)
    setRisks(result.risks)
    setMinutes(result.minutes_draft)
    setJustProcessed(true)
    setShowPlaceholderBanner(false)
  }

  const handleStatusChange = useCallback(async (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        console.error("[tasks] status update failed", body?.error)
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status } : t))
      }
    } catch (e) {
      console.error("[tasks] status update error", e)
    }
  }, [])

  return (
    <div className="flex flex-col gap-8">

      {/* AI preview banner */}
      {showPlaceholderBanner && (
        <div className="flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            AI-generated preview — process a recording or upload a file to replace with real data.
          </p>
          <button
            onClick={() => setShowPlaceholderBanner(false)}
            className="ml-4 text-xs text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200 transition-colors shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Recording — top */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          New Meeting Recording
        </p>
        <Tabs defaultValue="record">
          <TabsList className="mb-4">
            <TabsTrigger value="record">Live Record</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>
          <TabsContent value="record">
            <LiveRecorder eventId={eventId} onResult={handleResult} />
          </TabsContent>
          <TabsContent value="upload">
            <AudioUpload eventId={eventId} onResult={handleResult} />
          </TabsContent>
        </Tabs>
      </section>

      <Separator />

      {/* 2. Role Briefings */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Role Briefings
        </p>
        <BriefingTabs briefings={briefings} />
      </section>

      {/* 3. Minutes Preview */}
      <section>
        <MinutesPreview minutes={minutes} onSave={setMinutes} />
      </section>

      <Separator />

      {/* 4. High Priority */}
      {risks.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            High Priority
          </p>
          <RiskBanner risks={risks} />
        </section>
      )}

      {/* 5. Tasks */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Tasks ({tasks.length})
          </p>
          {justProcessed && (
            <Badge variant="secondary" className="text-xs">live — just processed</Badge>
          )}
        </div>
        <TaskTable tasks={tasks} onStatusChange={handleStatusChange} />
      </section>

      <Separator />

      {/* 6. Query */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Ask About {eventName}
        </p>
        <QueryPanel eventId={eventId} />
      </section>
    </div>
  )
}
