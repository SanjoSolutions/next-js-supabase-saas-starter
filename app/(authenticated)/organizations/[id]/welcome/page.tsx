import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requireOrgMember } from "@/lib/auth"
import Link from "next/link"

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { membership, organization } = await requireOrgMember(id)

  return (
    <div className="flex-1 flex items-center justify-center">
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
  )
}
