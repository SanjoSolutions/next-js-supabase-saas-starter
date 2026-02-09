"use client"

import { useTranslations } from "next-intl"
import { formatEurCents, calculateVat, calculateGross } from "@/lib/marketplace/price"

interface PriceDisplayProps {
  netCents: number
  priceMaxCents?: number
  vatRate?: number
  showBreakdown?: boolean
}

export function PriceDisplay({
  netCents,
  priceMaxCents,
  vatRate = 19,
  showBreakdown = true,
}: PriceDisplayProps) {
  const t = useTranslations("marketplace.price")

  const grossCents = calculateGross(netCents, vatRate)
  const isRange = priceMaxCents != null && priceMaxCents !== netCents
  const grossMaxCents = isRange ? calculateGross(priceMaxCents, vatRate) : grossCents

  if (!showBreakdown) {
    return (
      <span className="font-bold" role="status" aria-label={t("grossPrice")}>
        {isRange
          ? `${formatEurCents(grossCents)} - ${formatEurCents(grossMaxCents)}`
          : formatEurCents(grossCents)}
      </span>
    )
  }

  const vatCents = calculateVat(netCents, vatRate)

  return (
    <div className="space-y-1" role="status" aria-label={t("priceBreakdown")}>
      <div className="text-sm text-muted-foreground">
        {t("net")}: {isRange
          ? `${formatEurCents(netCents)} - ${formatEurCents(priceMaxCents!)}`
          : formatEurCents(netCents)}
      </div>
      <div className="text-sm text-muted-foreground">
        {t("vat", { rate: vatRate })}: {isRange
          ? `${formatEurCents(vatCents)} - ${formatEurCents(calculateVat(priceMaxCents!, vatRate))}`
          : formatEurCents(vatCents)}
      </div>
      <div className="text-lg font-bold">
        {t("gross")}: {isRange
          ? `${formatEurCents(grossCents)} - ${formatEurCents(grossMaxCents)}`
          : formatEurCents(grossCents)}
      </div>
    </div>
  )
}
