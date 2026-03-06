import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { ContractStatusTimeline } from "@/components/marketplace/contract-status-timeline"
import { ContractActions } from "@/components/marketplace/contract-actions"
import { PriceDisplay } from "@/components/marketplace/price-display"
import { getContractById } from "@/actions/marketplace/contracts"
import { formatEurCents } from "@/lib/marketplace/price"
import { notFound } from "next/navigation"

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = await getTranslations("marketplace.contracts")
  await requireUser()
  const { id } = await params
  const cookieStore = await cookies()
  const activeOrgId = await requireMarketplaceAccess(
    cookieStore.get("active_org_id")?.value
  )

  let contract
  try {
    contract = await getContractById(id)
  } catch {
    notFound()
  }

  const isBuyer = contract.buyer_org_id === activeOrgId
  const isSeller = contract.seller_org_id === activeOrgId

  if (!isBuyer && !isSeller) notFound()

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <MarketplaceNav />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{contract.tracking_code}</h1>
          <p className="text-muted-foreground">
            {t("invoice")}: {contract.invoice_number}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {t(`status.${contract.status}`)}
        </Badge>
      </div>

      <ContractStatusTimeline status={contract.status} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("parties")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm font-medium">{t("buyer")}</p>
              <p className="text-sm text-muted-foreground">{contract.buyer_org?.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("seller")}</p>
              <p className="text-sm text-muted-foreground">{contract.seller_org?.name}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("priceBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <PriceDisplay netCents={contract.net_price_cents} vatRate={Number(contract.vat_rate)} />
            <div className="text-sm text-muted-foreground pt-2 border-t">
              <p>{t("platformFee")}: {formatEurCents(contract.platform_fee_cents)}</p>
              <p>{t("sellerPayout")}: {formatEurCents(contract.seller_payout_cents)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ContractActions
        contractId={contract.id}
        organizationId={activeOrgId}
        status={contract.status}
        isBuyer={isBuyer}
        isSeller={isSeller}
      />
    </div>
  )
}
