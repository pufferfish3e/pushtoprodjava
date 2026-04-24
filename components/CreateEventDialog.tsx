"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CreateEventDialog() {
  return (
    <Button size="sm" variant="outline" disabled>
      <Plus className="size-4 mr-1" />
      New Event
    </Button>
  )
}
