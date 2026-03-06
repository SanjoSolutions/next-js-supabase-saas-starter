"use client"

import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { Check, CreditCard, Truck, Package, CheckCircle } from "lucide-react"

interface ContractStatusTimelineProps {
  status: string
}

const STEPS = [
  { key: "pending_payment", icon: CreditCard },
  { key: "paid", icon: Check },
  { key: "in_progress", icon: Truck },
  { key: "pickup_confirmed", icon: Package },
  { key: "delivered", icon: Truck },
  { key: "completed", icon: CheckCircle },
]

const STATUS_ORDER = [
  "pending_payment",
  "paid",
  "in_progress",
  "pickup_confirmed",
  "delivered",
  "completed",
]

export function ContractStatusTimeline({ status }: ContractStatusTimelineProps) {
  const t = useTranslations("marketplace.contracts")

  const currentIndex = STATUS_ORDER.indexOf(status)
  const isTerminal = ["disputed", "resolved", "refunded", "cancelled"].includes(status)

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2" role="status" aria-label={t("statusTimeline")}>
      {STEPS.map((step, index) => {
        const Icon = step.icon
        const isPast = !isTerminal && currentIndex >= index
        const isCurrent = status === step.key

        return (
          <div key={step.key} className="flex items-center gap-2">
            {index > 0 && (
              <div
                className={cn(
                  "h-0.5 w-8",
                  isPast ? "bg-primary" : "bg-muted"
                )}
              />
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs whitespace-nowrap",
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : isPast
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(`status.${step.key}`)}</span>
            </div>
          </div>
        )
      })}
      {isTerminal && (
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-destructive" />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-destructive text-destructive-foreground whitespace-nowrap">
            {t(`status.${status}`)}
          </div>
        </div>
      )}
    </div>
  )
}
