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
import { formatDistanceToNow } from "date-fns"

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user, membership, organization } = await requireOrgMember(id)
  const supabase = await createClient()

  // Get all members of the organization with emails
  const { data: members, error } = await supabase.rpc(
    "get_organization_members",
    {
      org_id: id,
    },
  )

  if (error) {
    console.error("Error fetching members:", error)
  }

  let membersWithEmails = members || []

  // Ensure the current user appears in the members list.
  if (user && membership) {
    const hasSelf = (membersWithEmails as any[]).some(
      (m) => m.user_id === user.id,
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
          <CardTitle>Organization Members</CardTitle>
          <CardDescription>
            {organization?.name} • {membersWithEmails.length} member
            {membersWithEmails.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membersWithEmails.map((member: any) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(member.role)}>
                      {member.role.charAt(0).toUpperCase() +
                        member.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDistanceToNow(new Date(member.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Active
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
