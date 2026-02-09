import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { ListingCard } from "@/components/marketplace/listing-card"
import { Plus } from "lucide-react"

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const t = await getTranslations("marketplace.listings")
  await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value
  const { tab } = await searchParams

  if (!activeOrgId) redirect("/organizations/new")

  const supabase = await createClient()

  let query = supabase
    .from("service_listings")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false })

  if (tab === "requests") {
    query = query.eq("listing_type", "request").eq("status", "open")
  } else if (tab === "offers") {
    query = query.eq("listing_type", "offer").eq("status", "open")
  } else if (tab === "mine") {
    query = query.eq("organization_id", activeOrgId)
  } else {
    query = query.eq("status", "open")
  }

  const { data: listings } = await query.limit(50)

  const tabs = [
    { key: "all", label: t("tabs.all") },
    { key: "requests", label: t("tabs.requests") },
    { key: "offers", label: t("tabs.offers") },
    { key: "mine", label: t("tabs.mine") },
  ]

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/marketplace/listings/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("newListing")}
          </Link>
        </Button>
      </div>
      <MarketplaceNav />

      <div className="flex gap-2 mb-4">
        {tabs.map((tabItem) => (
          <Button
            key={tabItem.key}
            variant={(tab || "all") === tabItem.key ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={tabItem.key === "all" ? "/marketplace/listings" : `/marketplace/listings?tab=${tabItem.key}`}>
              {tabItem.label}
            </Link>
          </Button>
        ))}
      </div>

      {listings && listings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          {t("empty")}
        </div>
      )}
    </div>
  )
}
