import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { MatchConfirmation } from "@/components/marketplace/match-confirmation"
import { getMatchById } from "@/actions/marketplace/matches"
import { formatEurCents, calculateGross } from "@/lib/marketplace/price"
import { notFound } from "next/navigation"

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = await getTranslations("marketplace.matches")
  await requireUser()
  const { id } = await params
  const cookieStore = await cookies()
  const activeOrgId = await requireMarketplaceAccess(
    cookieStore.get("active_org_id")?.value
  )

  let match
  try {
    match = await getMatchById(id)
  } catch {
    notFound()
  }

  const requestListing = match.request_listing
  const offerListing = match.offer_listing

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <MarketplaceNav />

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{t("detail.title")}</h1>
        <Badge variant="outline">{t(`status.${match.status}`)}</Badge>
      </div>

      <p className="text-muted-foreground">
        {t("detail.agreedPrice")}: <strong>{formatEurCents(calculateGross(match.agreed_price_cents))}</strong>
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.request")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{requestListing.title}</p>
            <p className="text-sm text-muted-foreground">
              {requestListing.organizations?.name}
            </p>
            <p className="text-sm">
              {requestListing.pickup_city} → {requestListing.delivery_city}
            </p>
            <p className="text-sm font-medium">
              {formatEurCents(calculateGross(requestListing.price_cents))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.offer")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium">{offerListing.title}</p>
            <p className="text-sm text-muted-foreground">
              {offerListing.organizations?.name}
            </p>
            <p className="text-sm">
              {offerListing.pickup_city} → {offerListing.delivery_city}
            </p>
            <p className="text-sm font-medium">
              {formatEurCents(calculateGross(offerListing.price_cents))}
            </p>
          </CardContent>
        </Card>
      </div>

      {match.status !== "confirmed" && match.status !== "rejected" && (
        <MatchConfirmation
          matchId={match.id}
          organizationId={activeOrgId}
          matchStatus={match.status}
        />
      )}
    </div>
  )
}
