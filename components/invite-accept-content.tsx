"use client"

import { acceptInviteAction } from "@/app/organizations/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function InviteAcceptContent({ token }: { token: string }) {
  const [invite, setInvite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchInvite() {
      const { data: inviteData, error: fetchError } = await supabase
        .from("invites")
        .select(`id, email, role, organization_id`)
        .eq("token", token)
        .single()

      if (fetchError || !inviteData) {
        console.error('Fetch invite error:', fetchError)
        setError("Invite not found or expired")
      } else {
        console.log('DEBUG: invite_token=' + token)
        console.log('DEBUG: org_id=' + inviteData?.organization_id)
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("name")
          .eq("id", inviteData.organization_id)
          .single()
        
        if (orgError) {
          console.error('Fetch org error:', orgError)
          setError("Failed to load organization details")
        } else {
          console.log('Org found:', orgData)
          setInvite({ ...inviteData, organizations: orgData })
        }
      }
      setLoading(false)
    }

    fetchInvite()
  }, [token, supabase])

  const handleAccept = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setIsProcessing(false)
        router.push(`/auth/sign-up?return_url=${encodeURIComponent(window.location.href)}`)
        return
      }

      const result = await acceptInviteAction(token)
      router.push(`/organizations/${result.organizationId}/welcome`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to accept invite")
      setIsProcessing(false)
    }
  }

  if (loading) {
    console.log('InviteAcceptContent: Still loading...');
    return <div>Loading invitation...</div>
  }

  console.log('InviteAcceptContent: Rendering with state:', { invite, error, loading, isProcessing });

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle>Organization Invitation</CardTitle>
        {invite && (
          <CardDescription>
            You have been invited to join <strong>{invite.organizations.name}</strong> as a {invite.role}.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!invite && !error && <p>No invite found.</p>}
        {invite && (
          <Button onClick={handleAccept} className="w-full" disabled={isProcessing}>
            {isProcessing ? "Accepting..." : "Accept Invitation"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
