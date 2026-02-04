import { EnvVarWarning } from "@/components/env-var-warning"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { createClient } from "@/lib/supabase/server"
import { hasEnvVars } from "@/lib/utils"
import { cookies } from "next/headers"
import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { NotificationCenter } from "./notification-center"
import { OrgSwitcher } from "./org-switcher"
import { UserMenu } from "./user-menu"
import { Button } from "./ui/button"

export async function Header() {
  const t = await getTranslations()
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  // Get organizations where the user is a member
  const { data: memberships } = user
    ? await supabase
        .from("memberships")
        .select("organizations(id, name)")
        .eq("user_id", user.id)
    : { data: null }

  interface Organization {
    id: string
    name: string
  }

  const organizations: Organization[] =
    memberships
      ?.map((m) => (m as unknown as { organizations: Organization | null }).organizations)
      .filter((org): org is Organization => org !== null) || []

  // Check if activity dashboard is enabled for the active organization
  const hasActivityDashboard = activeOrgId
    ? await isFeatureEnabled("advanced_analytics", activeOrgId)
    : false

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-14">
      <div className="w-full max-w-5xl flex justify-between items-center px-4 text-sm">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link href="/" className="font-semibold text-base">
            {t("common.appName")}
          </Link>
        </div>

        {/* Right: Org Switcher, Notifications, User Menu */}
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : user ? (
          <div className="flex items-center gap-2">
            {organizations.length > 0 && (
              <Suspense
                fallback={
                  <div className="h-8 w-32 bg-accent animate-pulse rounded" />
                }
              >
                <OrgSwitcher
                  organizations={organizations}
                  activeOrgId={activeOrgId}
                />
              </Suspense>
            )}
            <NotificationCenter />
            <Suspense
              fallback={
                <div className="h-8 w-8 bg-accent animate-pulse rounded-full" />
              }
            >
              <UserMenu
                user={{
                  email: user.email,
                  user_metadata: user.user_metadata,
                }}
                activeOrgId={activeOrgId}
                hasActivityDashboard={hasActivityDashboard}
              />
            </Suspense>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/auth/login">{t("auth.button.signIn")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/auth/sign-up">{t("auth.button.signUp")}</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
