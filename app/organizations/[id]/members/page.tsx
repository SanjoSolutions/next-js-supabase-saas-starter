import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { formatDistanceToNow } from "date-fns"
import { redirect } from "next/navigation"

export default async function MembersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verify user is a member of this organization
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    redirect("/protected")
  }

  // Get organization details
  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", id)
    .single()

  // Get all members of the organization with emails
  const { data: members } = await supabase
    .from("organization_members")
    .select(`
      id,
      role,
      created_at,
      user_id,
      email
    `)
    .eq("organization_id", id)
    .order("created_at", { ascending: true })

  const membersWithEmails = members || []

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
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Header />
        <div className="flex-1 w-full max-w-5xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>
                {organization?.name} • {membersWithEmails.length} member{membersWithEmails.length !== 1 ? 's' : ''}
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
                  {membersWithEmails.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(member.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
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
      </div>
    </main>
  )
}
