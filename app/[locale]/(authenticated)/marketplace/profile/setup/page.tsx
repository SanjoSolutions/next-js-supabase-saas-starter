import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ProfileSetupForm } from "@/components/marketplace/profile-setup-form"

export default async function ProfileSetupPage() {
  const t = await getTranslations("marketplace.profile")
  const user = await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  if (!activeOrgId) {
    redirect("/organizations/new")
  }

  // Check membership
  const supabase = await createClient()
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", activeOrgId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    redirect("/protected")
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("marketplace_profiles")
    .select("id")
    .eq("organization_id", activeOrgId)
    .single()

  if (existing) {
    redirect("/marketplace")
  }

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t("setup.title")}</h1>
        <p className="text-muted-foreground mt-2">{t("setup.description")}</p>
      </div>
      <ProfileSetupForm organizationId={activeOrgId} />
    </div>
  )
}
