"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

interface CreateReportInput {
  listingId?: string
  reportType: "illegal_content" | "fraud" | "misleading" | "other"
  description: string
}

export async function createContentReport(input: CreateReportInput) {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("content_reports")
    .insert({
      reporter_user_id: user.id,
      listing_id: input.listingId || null,
      report_type: input.reportType,
      description: input.description,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getMyReports() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("content_reports")
    .select(`
      *,
      service_listings(id, title)
    `)
    .eq("reporter_user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
