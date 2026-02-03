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
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "@/lib/date"
import { getTranslations, getLocale } from "next-intl/server"
import { type Locale } from "@/i18n/config"

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = await getTranslations("organizations")
  const locale = (await getLocale()) as Locale
  const { id } = await params
  const { user, membership, organization } = await requireOrgMember(id)
  const supabase = await createClient()

  // Get all members of the organization with emails
  const { data: members, error } = await supabase.rpc(
    "get_organization_members",
    {
      org_id: id,
    }
  )

  if (error) {
    console.error("Error fetching members:", error)
  }

  let membersWithEmails = members || []

  // Ensure the current user appears in the members list.
  if (user && membership) {
    const hasSelf = (membersWithEmails as any[]).some(
      (m) => m.user_id === user.id
    )
    if (!hasSelf) {
      membersWithEmails = [
        ...membersWithEmails,
        {
          id: `me-${user.id}`,
          user_id: user.id,
          email: user.email,
          role: membership.role,
          created_at: new Date().toISOString(),
        },
      ]
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"
      case "admin":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>{t("members.title")}</CardTitle>
          <CardDescription>
            {organization?.name} •{" "}
            {t("members.description", { count: membersWithEmails.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("members.email")}</TableHead>
                <TableHead>{t("members.role")}</TableHead>
                <TableHead>{t("members.joined")}</TableHead>
                <TableHead>{t("members.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersWithEmails.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {t(`roles.${member.role}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(member.created_at, locale, {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {t("members.active")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
