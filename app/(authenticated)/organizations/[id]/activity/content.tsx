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
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { getActivityLogs } from "./actions"
import { ActivityPagination } from "./pagination"

interface ActivityDashboardContentProps {
  orgId: string
  page: number
}

export async function ActivityDashboardContent({
  orgId,
  page,
}: ActivityDashboardContentProps) {
  const { organization } = await requireOrgMember(orgId)

  // Check feature flag
  const hasAnalytics = await isFeatureEnabled("advanced_analytics", orgId)

  if (!hasAnalytics) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>Activity Dashboard</CardTitle>
            <CardDescription>
              Upgrade to Pro to access the activity dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The activity dashboard provides a complete audit log of all
              organization events including member joins, invites, role changes,
              and billing events.
            </p>
            <Link
              href={`/organizations/${orgId}/billing`}
              className="text-primary hover:underline"
            >
              Upgrade to Pro
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: activities, total, hasMore, error } = await getActivityLogs(orgId, page)

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
          <CardTitle>Activity Dashboard</CardTitle>
          <CardDescription>
            {organization?.name} - {total} event{total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-destructive">{error}</p>
          ) : activities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No activity recorded yet
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge
                          variant={getActivityBadgeVariant(activity.activity_type)}
                          className={getActivityBadgeClass(activity.activity_type)}
                        >
                          {activity.title}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {activity.actor_email || "System"}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {activity.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), {
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
