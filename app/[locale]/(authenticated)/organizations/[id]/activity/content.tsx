import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { requireOrgMember } from "@/lib/auth"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { formatDistanceToNow } from "@/lib/date"
import { Link } from "@/i18n/navigation"
import { getActivityLogs } from "./actions"
import { ActivityPagination } from "./pagination"
import { getTranslations, getLocale } from "next-intl/server"
import { type Locale } from "@/i18n/config"

interface ActivityDashboardContentProps {
  orgId: string
  page: number
}

export async function ActivityDashboardContent({
  orgId,
  page,
}: ActivityDashboardContentProps) {
  const t = await getTranslations("organizations.activity")
  const locale = (await getLocale()) as Locale
  const { organization } = await requireOrgMember(orgId)

  // Check feature flag
  const hasAnalytics = await isFeatureEnabled("advanced_analytics", orgId)

  if (!hasAnalytics) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
            <CardDescription>{t("upgradeDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t("upgradeMessage")}
            </p>
            <Link
              href={`/organizations/${orgId}/billing`}
              className="text-primary hover:underline"
            >
              {t("upgradeToPro")}
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const {
    data: activities,
    total,
    hasMore,
    error,
  } = await getActivityLogs(orgId, page)

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case "member_joined":
        return "default"
      case "member_invited":
        return "secondary"
      case "role_changed":
        return "outline"
      case "subscription_created":
        return "default"
      case "subscription_canceled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getActivityBadgeClass = (type: string) => {
    if (type === "subscription_created") {
      return "bg-green-50 text-green-700 border-green-200"
    }
    return ""
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {organization?.name} - {t("events", { count: total })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {t("noActivity")}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("event")}</TableHead>
                    <TableHead>{t("actor")}</TableHead>
                    <TableHead>{t("details")}</TableHead>
                    <TableHead>{t("time")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge
                          variant={getActivityBadgeVariant(
                            activity.activity_type
                          )}
                          className={getActivityBadgeClass(
                            activity.activity_type
                          )}
                        >
                          {t(`types.${activity.activity_type}` as any) ||
                            activity.title}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {activity.actor_email || t("system")}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {activity.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(activity.created_at, locale, {
                          addSuffix: true,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <ActivityPagination
                currentPage={page}
                hasMore={hasMore}
                total={total}
                orgId={orgId}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
