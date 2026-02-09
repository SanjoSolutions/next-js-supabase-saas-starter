import { requireUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { MatchCard } from "@/components/marketplace/match-card"
import { getMatchesForOrg } from "@/actions/marketplace/matches"

export default async function MatchesPage() {
  const t = await getTranslations("marketplace.matches")
  await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  if (!activeOrgId) redirect("/organizations/new")

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
