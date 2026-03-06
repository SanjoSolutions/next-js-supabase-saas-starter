"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

interface CreateP2bComplaintInput {
  organizationId: string
  complaintType: "listing_removed" | "account_restricted" | "ranking" | "other"
  subject: string
  description: string
}

export async function createP2bComplaint(input: CreateP2bComplaintInput) {
  const user = await requireUser()
  const supabase = await createClient()

  // Verify membership
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", input.organizationId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    throw new Error("Not a member of this organization")
  }

  const { data, error } = await supabase
    .from("p2b_complaints")
    .insert({
      organization_id: input.organizationId,
      complainant_user_id: user.id,
      complaint_type: input.complaintType,
      subject: input.subject,
      description: input.description,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getP2bComplaints(organizationId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    throw new Error("Not a member of this organization")
  }

  const { data, error } = await supabase
    .from("p2b_complaints")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
