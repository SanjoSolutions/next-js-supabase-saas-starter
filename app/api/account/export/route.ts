import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Memberships and organizations
  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, created_at, organizations(*)")
    .eq("user_id", user.id)

  const orgIds = (memberships ?? [])
    .map((m) => (m.organizations as unknown as { id: string } | null)?.id)
    .filter(Boolean) as string[]

  // Notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Activity logs
  const { data: activityLogs } = await supabase
    .from("activity_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Credit transactions for all orgs the user belongs to
  let creditTransactions: unknown[] = []
  if (orgIds.length > 0) {
    try {
      const { data } = await supabase
        .from("credit_transactions")
        .select("*")
        .in("organization_id", orgIds)
        .order("created_at", { ascending: false })
      creditTransactions = data ?? []
    } catch {
      // Table may not exist — silently skip
    }
  }

  // Marketplace profiles for user's orgs
  let marketplaceProfiles: unknown[] = []
  if (orgIds.length > 0) {
    const { data } = await supabase
      .from("marketplace_profiles")
      .select("*")
      .in("organization_id", orgIds)
    marketplaceProfiles = data ?? []
  }

  const exportData = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_sign_in_at: user.last_sign_in_at,
      user_metadata: user.user_metadata,
      app_metadata: user.app_metadata,
    },
    memberships: memberships ?? [],
    notifications: notifications ?? [],
    activity_logs: activityLogs ?? [],
    credit_transactions: creditTransactions,
    marketplace_profiles: marketplaceProfiles,
  }

  const filename = `data-export-${new Date().toISOString().split("T")[0]}.json`

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
