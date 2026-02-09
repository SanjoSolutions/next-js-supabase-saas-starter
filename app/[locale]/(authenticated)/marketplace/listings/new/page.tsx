import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { MarketplaceNav } from "@/components/marketplace/marketplace-nav"
import { ListingForm } from "@/components/marketplace/listing-form"

export default async function NewListingPage() {
  const t = await getTranslations("marketplace.listings")
  await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  if (!activeOrgId) redirect("/organizations/new")

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("marketplace_role")
    .eq("organization_id", activeOrgId)
    .single()

  if (!profile) redirect("/marketplace/profile/setup")

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <h1 className="text-3xl font-bold">{t("form.createTitle")}</h1>
      <MarketplaceNav />
      <ListingForm
        organizationId={activeOrgId}
        marketplaceRole={profile.marketplace_role}
      />
    </div>
  )
}
