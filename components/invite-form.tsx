"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface InviteFormProps {
  activeOrgId: string
  className?: string
}

export function InviteForm({ activeOrgId, className }: InviteFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setInviteLink(null)

    const supabase = createClient()

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      const { data, error: inviteError } = await supabase
        .from("invites")
        .insert([
          {
            email,
            organization_id: activeOrgId,
            inviter_id: userData.user.id,
          },
        ])
        .select()
        .single()

      if (inviteError) throw inviteError

      setSuccess(true)
      const origin = typeof window !== "undefined" ? window.location.origin : ""
      setInviteLink(`${origin}/invites/accept?token=${data.token}`)
      setEmail("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create invite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Invite Member</CardTitle>
          <CardDescription>
            Send an invitation to join your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && (
                <div className="bg-green-500/10 p-3 rounded text-green-600 text-sm">
                  <p className="font-medium">Invite created successfully!</p>
                  <p className="mt-1 break-all">
                    Link: <span className="font-mono">{inviteLink}</span>
                  </p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Create Invite"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
