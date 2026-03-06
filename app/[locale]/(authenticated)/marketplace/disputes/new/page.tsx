import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { getContractsForOrg } from "@/actions/marketplace/contracts"
import { DisputeForm } from "@/components/marketplace/dispute-form"

export default async function NewDisputePage() {
  const t = await getTranslations("marketplace.disputes")
  await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = await requireMarketplaceAccess(
    cookieStore.get("active_org_id")?.value
  )

  const contracts = await getContractsForOrg(activeOrgId)
  const disputableContracts = (contracts || []).filter(
    (c: { status: string }) => ["paid", "in_progress", "pickup_confirmed", "delivered"].includes(c.status)
  )

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <MarketplaceNav />
      <p className="text-sm text-muted-foreground">
        {t("odrNotice")}{" "}
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          ec.europa.eu/consumers/odr
        </a>
      </p>
      <DisputeForm
        organizationId={activeOrgId}
        contracts={disputableContracts}
      />
    </div>
  )
}
