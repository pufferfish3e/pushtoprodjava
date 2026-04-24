import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { RiskSignal } from "@/lib/types"

interface RiskBannerProps {
  risks: RiskSignal[]
}

const RISK_LABEL: Record<RiskSignal["type"], string> = {
  overloaded_person: "Overloaded",
  unowned_blocker: "Unowned Blocker",
  deadline_risk: "Deadline Risk",
  unresolved_task: "Unresolved Task",
}

export function RiskBanner({ risks }: RiskBannerProps) {
  if (!risks.length) return null

  const high = risks.filter((r) => r.severity === "high")
  const medium = risks.filter((r) => r.severity === "medium")

  return (
    <div className="flex flex-col gap-2">
      {high.map((risk, i) => (
        <Alert key={i} variant="destructive" className="border-destructive/50">
          <AlertTriangle className="size-4" />
          <AlertTitle className="text-xs font-semibold uppercase tracking-wide">
            {RISK_LABEL[risk.type]}
          </AlertTitle>
          <AlertDescription className="text-sm">{risk.description}</AlertDescription>
        </Alert>
      ))}
      {medium.map((risk, i) => (
        <Alert key={i} className={cn("border-foreground/20 bg-muted/40")}>
          <AlertCircle className="size-4 text-muted-foreground" />
          <AlertTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {RISK_LABEL[risk.type]}
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">{risk.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
