"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Task, TaskUrgency, TaskStatus } from "@/lib/types"

interface TaskTableProps {
  tasks: Task[]
  loading?: boolean
}

function urgencyLabel(u: TaskUrgency) {
  return ["", "Low", "Low-Med", "Medium", "High", "Critical"][u]
}

function urgencyClass(u: TaskUrgency) {
  if (u === 5) return "text-destructive font-semibold"
  if (u === 4) return "text-foreground font-medium"
  return "text-muted-foreground"
}

const STATUS_VARIANT: Record<TaskStatus, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  in_progress: "secondary",
  completed: "default",
  blocked: "destructive",
}

function statusLabel(s: TaskStatus) {
  return { pending: "Pending", in_progress: "In Progress", completed: "Done", blocked: "Blocked" }[s]
}

const URGENCY_DOTS: Record<TaskUrgency, string> = {
  1: "bg-muted-foreground/40",
  2: "bg-muted-foreground/60",
  3: "bg-foreground/50",
  4: "bg-foreground/80",
  5: "bg-destructive",
}

export function TaskTable({ tasks, loading }: TaskTableProps) {
  const sorted = [...tasks].sort((a, b) => b.urgency - a.urgency)

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (!sorted.length) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">No tasks found.</p>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-8"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deadline</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((task) => (
            <TableRow
              key={task.id}
              className={cn(
                "border-border",
                task.is_blocker && "bg-destructive/5"
              )}
            >
              <TableCell>
                <span
                  className={cn("block size-2 rounded-full", URGENCY_DOTS[task.urgency])}
                  title={`Urgency ${task.urgency}`}
                />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-foreground">{task.task}</span>
                  {task.is_blocker && (
                    <Badge variant="destructive" className="w-fit text-xs px-1.5 py-0">
                      Blocker
                    </Badge>
                  )}
                  {task.notes && (
                    <span className="text-xs text-muted-foreground">{task.notes}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{task.assignee}</TableCell>
              <TableCell>
                <span className={cn("text-xs", urgencyClass(task.urgency))}>
                  {urgencyLabel(task.urgency)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[task.status]}>
                  {statusLabel(task.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {task.deadline ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
