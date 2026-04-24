"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@clerk/nextjs"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
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
}

export function EventDetailClient({
  eventId,
  eventName,
  initialTasks,
  initialBriefings,
  initialRisks,
  initialMinutes,
}: Props) {
  const { getToken } = useAuth()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [briefings, setBriefings] = useState<Briefings | null>(initialBriefings)
  const [risks, setRisks] = useState<RiskSignal[]>(initialRisks)
  const [minutes, setMinutes] = useState<string | null>(initialMinutes)
  const [justProcessed, setJustProcessed] = useState(false)

  function handleResult(result: ProcessResponse) {
    setTasks(result.tasks)
    setBriefings(result.briefings)
    setRisks(result.risks)
    setMinutes(result.minutes_draft)
    setJustProcessed(true)
  }

  const handleStatusChange = useCallback(async (taskId: string, status: TaskStatus) => {
    // optimistic
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t))
    try {
      const token = await getToken()
      const supabase = createBrowserSupabaseClient(async () => token)
      const { error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId)
      if (error) {
        console.error("[tasks] status update failed", error.message)
        // revert on error
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: t.status } : t))
      }
    } catch (e) {
      console.error("[tasks] status update error", e)
    }
  }, [getToken])

  return (
    <div className="flex flex-col gap-8">
      {risks.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Risk Signals
          </p>
          <RiskBanner risks={risks} />
        </section>
      )}

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

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Role Briefings
        </p>
        <BriefingTabs briefings={briefings} />
      </section>

      <section>
        <MinutesPreview minutes={minutes} />
      </section>

      <Separator />

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Ask About {eventName}
        </p>
        <QueryPanel eventId={eventId} />
      </section>
    </div>
  )
}
