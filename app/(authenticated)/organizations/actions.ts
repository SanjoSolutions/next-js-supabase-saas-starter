"use server"

import { cookies } from "next/headers"

export async function setActiveOrganizationAction(orgId: string) {
  const cookieStore = await cookies()
  cookieStore.set("active_org_id", orgId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}

export async function acceptInviteAction(token: string) {
  const cookieStore = await cookies()
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  // 1. Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Authentication required")

  // 2. Fetch invite
  const { data: invite, error: fetchError } = await supabase
    .from("invites")
    .select("*")
    .eq("token", token)
    .single()

  if (fetchError || !invite) throw new Error("Invite not found or expired")
  if (invite.status !== "pending") throw new Error("Invite already processed")

  // 3. Create membership
  const { error: memberError } = await supabase.from("memberships").insert([
    {
      user_id: user.id,
      organization_id: invite.organization_id,
      role: invite.role,
    },
  ])

  if (memberError) {
    if (memberError.code === "23505") {
      // Already a member, that's fine, just process the invite
    } else {
      throw memberError
    }
  }

  // 4. Update invite status
  await supabase.from("invites").update({ status: "accepted" }).eq("id", invite.id)

  // 5. Set as active org
  cookieStore.set("active_org_id", invite.organization_id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  return { organizationId: invite.organization_id }
}
