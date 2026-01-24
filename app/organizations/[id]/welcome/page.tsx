import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function WelcomePage({
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

  // Get organization details
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", id)
    .single()

  if (orgError || !organization) {
    redirect("/protected")
  }

  // Get user's membership details
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", id)
    .eq("user_id", user.id)
    .single()

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Welcome to {organization.name}! 🎉</CardTitle>
              <CardDescription>
                You've successfully joined the organization
                {membership && ` as a ${membership.role}`}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                You now have access to all the features and resources available to your organization.
              </p>
              <Button asChild className="w-full">
                <Link href="/protected">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
