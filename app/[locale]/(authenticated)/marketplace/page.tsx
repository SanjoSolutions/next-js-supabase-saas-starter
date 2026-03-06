import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { ListOrdered, GitCompareArrows, FileText, ArrowRight } from "lucide-react"

export default async function MarketplaceDashboard() {
  const t = await getTranslations("marketplace")
  await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = await requireMarketplaceAccess(
    cookieStore.get("active_org_id")?.value
  )

  const supabase = await createClient()

  // Check if org has marketplace profile
  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("*")
    .eq("organization_id", activeOrgId)
    .single()

  if (!profile) {
    redirect("/marketplace/profile/setup")
  }

  // Get counts for dashboard
  const { count: listingsCount } = await supabase
    .from("service_listings")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", activeOrgId)
    .eq("status", "open")

  const { count: matchesCount } = await supabase
    .from("order_matches")
    .select("*", { count: "exact", head: true })
    .or(
      `request_listing_id.in.(select id from service_listings where organization_id='${activeOrgId}'),offer_listing_id.in.(select id from service_listings where organization_id='${activeOrgId}')`
    )
    .in("status", ["proposed", "buyer_confirmed", "seller_confirmed"])

  const { count: contractsCount } = await supabase
    .from("contracts")
    .select("*", { count: "exact", head: true })
    .or(`buyer_org_id.eq.${activeOrgId},seller_org_id.eq.${activeOrgId}`)
    .not("status", "in", "(completed,cancelled)")

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {profile.company_name}
            <Badge variant="outline" className="ml-2">
              {t(`roles.${profile.marketplace_role}`)}
            </Badge>
          </p>
        </div>
        <Button asChild>
          <Link href="/marketplace/listings/new">
            {t("dashboard.newListing")}
          </Link>
        </Button>
      </div>

      <MarketplaceNav />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.activeListings")}
            </CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listingsCount ?? 0}</div>
            <Link
              href="/marketplace/listings"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
            >
              {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.pendingMatches")}
            </CardTitle>
            <GitCompareArrows className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchesCount ?? 0}</div>
            <Link
              href="/marketplace/matches"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
            >
              {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.activeContracts")}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contractsCount ?? 0}</div>
            <Link
              href="/marketplace/contracts"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
            >
              {t("dashboard.viewAll")} <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
