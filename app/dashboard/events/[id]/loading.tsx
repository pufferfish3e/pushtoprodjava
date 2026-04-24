import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function EventDetailLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="size-3.5" />
          All Events
        </Link>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      {/* Recording section */}
      <section>
        <Skeleton className="mb-3 h-3 w-36" />
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-24 w-full rounded-md" />
      </section>

      <Separator />

      {/* Briefings */}
      <section>
        <Skeleton className="mb-3 h-3 w-28" />
        <Skeleton className="h-9 w-full mb-4 rounded-md" />
        <div className="rounded-lg border border-border p-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </section>

      {/* Minutes */}
      <section>
        <div className="rounded-lg border border-border p-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </section>

      <Separator />

      {/* Tasks */}
      <section>
        <Skeleton className="mb-3 h-3 w-20" />
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-md" />
          ))}
        </div>
      </section>

      <Separator />

      {/* Query */}
      <section>
        <Skeleton className="mb-3 h-3 w-40" />
        <Skeleton className="h-9 w-full rounded-md" />
      </section>
    </div>
  )
}
