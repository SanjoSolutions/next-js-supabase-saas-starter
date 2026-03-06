import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketplaceNav } from "@/features/marketplace/components/marketplace-nav"
import { PriceDisplay } from "@/features/marketplace/components/price-display"
import { MapPin, Package, Calendar, ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = await getTranslations("marketplace.listings")
  await requireUser()
  const { id } = await params
  const cookieStore = await cookies()

  await requireMarketplaceAccess(cookieStore.get("active_org_id")?.value)

  const supabase = await createClient()
  const { data: listing, error } = await supabase
    .from("service_listings")
    .select("*, organizations(name)")
    .eq("id", id)
    .single()

  if (error || !listing) notFound()

  const orgName = listing.organizations && "name" in listing.organizations
    ? listing.organizations.name
    : null

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <MarketplaceNav />

      <div className="flex items-center gap-3">
        <Badge variant={listing.listing_type === "request" ? "default" : "secondary"}>
          {t(`types.${listing.listing_type}`)}
        </Badge>
        <Badge variant="outline">{t(`status.${listing.status}`)}</Badge>
      </div>

      <h1 className="text-3xl font-bold">{listing.title}</h1>
      {orgName && <p className="text-muted-foreground">{orgName}</p>}

      {listing.description && (
        <p className="text-sm">{listing.description}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.route")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium">{t("form.pickup")}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {listing.pickup_street}, {listing.pickup_postal_code} {listing.pickup_city}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{t("form.delivery")}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {listing.delivery_street}, {listing.delivery_postal_code} {listing.delivery_city}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("detail.details")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {t(`packageSizes.${listing.package_size}`)}
                {listing.package_weight_kg && ` - ${listing.package_weight_kg} kg`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {listing.delivery_date}
                {listing.delivery_time_start && listing.delivery_time_end &&
                  ` (${listing.delivery_time_start} - ${listing.delivery_time_end})`}
              </span>
            </div>
            <PriceDisplay
              netCents={listing.price_min_cents ?? listing.price_cents}
              priceMaxCents={listing.price_max_cents ?? undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
