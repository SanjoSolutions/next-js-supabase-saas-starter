import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { MarketplaceNav } from "@/features/marketplace/components/marketplace-nav"
import { MatchCard } from "@/features/marketplace/components/match-card"
import { getMatchesForOrg } from "@/features/marketplace/actions/matches"

export default async function MatchesPage() {
  const t = await getTranslations("marketplace.matches")
  await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = await requireMarketplaceAccess(
    cookieStore.get("active_org_id")?.value
  )

  const matches = await getMatchesForOrg(activeOrgId)

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <MarketplaceNav />

      {matches && matches.length > 0 ? (
        <div className="grid gap-4">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} activeOrgId={activeOrgId} />
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
