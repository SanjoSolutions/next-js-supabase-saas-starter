"use client"

import { useTranslations } from "next-intl"
import { formatEurCents, calculateVat, calculateGross } from "@/lib/marketplace/price"

interface PriceDisplayProps {
  netCents: number
  vatRate?: number
  showBreakdown?: boolean
}

export function PriceDisplay({
  netCents,
  vatRate = 19,
  showBreakdown = true,
}: PriceDisplayProps) {
  const t = useTranslations("marketplace.price")

  const vatCents = calculateVat(netCents, vatRate)
  const grossCents = calculateGross(netCents, vatRate)

  if (!showBreakdown) {
    return (
      <span className="font-bold" role="status" aria-label={t("grossPrice")}>
        {formatEurCents(grossCents)}
      </span>
    )
  }

  return (
    <div className="space-y-1" role="status" aria-label={t("priceBreakdown")}>
      <div className="text-sm text-muted-foreground">
        {t("net")}: {formatEurCents(netCents)}
      </div>
      <div className="text-sm text-muted-foreground">
        {t("vat", { rate: vatRate })}: {formatEurCents(vatCents)}
      </div>
      <div className="text-lg font-bold">
        {t("gross")}: {formatEurCents(grossCents)}
      </div>
    </div>
  )
}
