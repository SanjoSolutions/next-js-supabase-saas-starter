import { requireAdmin } from "@/features/admin/access"
import { isFeatureModuleEnabledInCode } from "@/features/config"
import { createAdminClient } from "@/lib/supabase/admin"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function AdminDashboardPage() {
  if (!isFeatureModuleEnabledInCode("admin")) {
    notFound()
  }

  await requireAdmin()
  const t = await getTranslations("admin")
  const supabase = createAdminClient()

  // Fetch total users count via admin auth API
  const { data: usersData } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  })
  const userCount =
    usersData && "total" in usersData ? (usersData.total as number) : 0

  // Fetch total organizations count
  const { count: totalOrganizations } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true })

  // Fetch active subscriptions (orgs with pro plan and active subscription)
  const { count: activeSubscriptions } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true })
    .eq("plan", "pro")
    .eq("subscription_status", "active")

  // Estimate revenue: count of pro orgs * $20/mo (placeholder)
  const estimatedRevenue = (activeSubscriptions ?? 0) * 20

  // Fetch recent signups (last 10 users)
  const { data: recentUsersData } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 10,
  })
  const recentUsers = (recentUsersData?.users ?? [])
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 10)

  // Fetch recent organizations (last 10)
  const { data: recentOrganizations } = await supabase
    .from("organizations")
    .select("id, name, plan, created_at")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div>
        <h1 className="font-bold text-3xl mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("stats.totalUsers")}</CardDescription>
            <CardTitle className="text-3xl">{userCount}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("stats.totalOrganizations")}</CardDescription>
            <CardTitle className="text-3xl">
              {totalOrganizations ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("stats.totalRevenue")}</CardDescription>
            <CardTitle className="text-3xl">
              ${estimatedRevenue}
              <span className="text-sm font-normal text-muted-foreground">
                {t("stats.perMonth")}
              </span>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              {t("stats.activeSubscriptions")}
            </CardDescription>
            <CardTitle className="text-3xl">
              {activeSubscriptions ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Data */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Signups */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentSignups.title")}</CardTitle>
            <CardDescription>
              {t("recentSignups.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("recentSignups.empty")}
              </p>
            ) : (
              <div className="space-y-3">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate max-w-[200px]">
                      {user.email}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Organizations */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentOrganizations.title")}</CardTitle>
            <CardDescription>
              {t("recentOrganizations.description")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!recentOrganizations || recentOrganizations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("recentOrganizations.empty")}
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[160px]">
                        {org.name}
                      </span>
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
                        {org.plan}
                      </span>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {new Date(org.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
