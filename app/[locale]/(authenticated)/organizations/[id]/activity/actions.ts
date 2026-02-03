"use server"

import { requireOrgMember } from "@/lib/auth"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { createClient } from "@/lib/supabase/server"

export interface ActivityLog {
  id: string
  created_at: string
  actor_email: string | null
  activity_type: string
  title: string
  description: string | null
  metadata: Record<string, unknown>
}

export interface GetActivityLogsResult {
  data: ActivityLog[]
  total: number
  hasMore: boolean
  error?: string
}

export async function getActivityLogs(
  orgId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<GetActivityLogsResult> {
  // Verify membership
  await requireOrgMember(orgId)

  // Check feature flag
  const hasFeature = await isFeatureEnabled("advanced_analytics", orgId)
  if (!hasFeature) {
    return { data: [], total: 0, hasMore: false, error: "Feature not enabled" }
  }

  const supabase = await createClient()
  const offset = (page - 1) * pageSize

  // Get paginated logs
  const { data, error } = await supabase.rpc("get_activity_logs", {
    org_id: orgId,
    page_size: pageSize,
    page_offset: offset,
  })

  if (error) {
    console.error("Error fetching activity logs:", error)
    return { data: [], total: 0, hasMore: false, error: error.message }
  }

  // Get total count
  const { data: countData, error: countError } = await supabase.rpc(
    "get_activity_logs_count",
    { org_id: orgId }
  )

  const total = countError ? 0 : (countData as number)
  const hasMore = offset + pageSize < total

  return { data: data || [], total, hasMore }
}
