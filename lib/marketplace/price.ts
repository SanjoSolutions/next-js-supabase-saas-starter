const DEFAULT_VAT_RATE = 19 // Germany standard VAT rate
const DEFAULT_PLATFORM_FEE_PERCENT = parseInt(
  process.env.MARKETPLACE_PLATFORM_FEE_PERCENT || "10",
  10
)

export function calculateVat(
  netCents: number,
  vatRate: number = DEFAULT_VAT_RATE
): number {
  return Math.round(netCents * (vatRate / 100))
}

export function calculateGross(
  netCents: number,
  vatRate: number = DEFAULT_VAT_RATE
): number {
  return netCents + calculateVat(netCents, vatRate)
}

export function calculatePlatformFee(
  netCents: number,
  feePercent: number = DEFAULT_PLATFORM_FEE_PERCENT
): number {
  return Math.round(netCents * (feePercent / 100))
}

export function calculateSellerPayout(
  netCents: number,
  feePercent: number = DEFAULT_PLATFORM_FEE_PERCENT
): number {
  return netCents - calculatePlatformFee(netCents, feePercent)
}

export function calculatePriceBreakdown(
  netCents: number,
  vatRate: number = DEFAULT_VAT_RATE,
  feePercent: number = DEFAULT_PLATFORM_FEE_PERCENT
) {
  const vatCents = calculateVat(netCents, vatRate)
  const grossCents = netCents + vatCents
  const platformFeeCents = calculatePlatformFee(netCents, feePercent)
  const sellerPayoutCents = netCents - platformFeeCents

  return {
    netCents,
    vatRate,
    vatCents,
    grossCents,
    platformFeeCents,
    sellerPayoutCents,
  }
}

export function formatEurCents(cents: number): string {
  const euros = cents / 100
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(euros)
}
