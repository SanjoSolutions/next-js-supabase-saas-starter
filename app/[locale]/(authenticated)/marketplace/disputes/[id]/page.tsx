import { requireUser } from "@/lib/auth"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { getDisputeById } from "@/actions/marketplace/disputes"
import { notFound } from "next/navigation"

export default async function DisputeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = await getTranslations("marketplace.disputes")
  await requireUser()
  const { id } = await params

  let dispute
  try {
    dispute = await getDisputeById(id)
  } catch {
    notFound()
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <MarketplaceNav />

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{t("detail.title")}</h1>
        <Badge variant="secondary">{t(`status.${dispute.status}`)}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{dispute.reason}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">{dispute.description}</p>
          <p className="text-sm text-muted-foreground">
            {t("detail.contract")}: {dispute.contracts?.tracking_code}
          </p>
          {dispute.resolution_notes && (
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-medium">{t("detail.resolution")}</p>
              <p className="text-sm">{dispute.resolution_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
