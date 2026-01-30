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

  // 2. Use secure RPC function to accept invite (bypasses RLS)
  const { data, error } = await supabase
    .rpc("accept_invite", { invite_token: token })
    .single()

  if (error) throw new Error(error.message || "Failed to accept invite")
  if (!data) throw new Error("Invite not found or expired")

  const result = data as { org_id: string; org_role: string }

  // 3. Set as active org
  cookieStore.set("active_org_id", result.org_id, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })

  return { organizationId: result.org_id }
}
