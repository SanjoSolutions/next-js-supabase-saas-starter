"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

interface CreateDisputeInput {
  contractId: string
  organizationId: string
  reason: string
  description: string
}

export async function createDispute(input: CreateDisputeInput) {
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

  // Verify org is party to the contract
  const { data: contract } = await supabase
    .from("contracts")
    .select("buyer_org_id, seller_org_id, status")
    .eq("id", input.contractId)
    .single()

  if (!contract) {
    throw new Error("Contract not found")
  }

  if (
    contract.buyer_org_id !== input.organizationId &&
    contract.seller_org_id !== input.organizationId
  ) {
    throw new Error("Organization is not a party to this contract")
  }

  // Can only dispute contracts in certain statuses
  const disputableStatuses = ["paid", "in_progress", "pickup_confirmed", "delivered"]
  if (!disputableStatuses.includes(contract.status)) {
    throw new Error("Contract cannot be disputed in its current status")
  }

  const { data, error } = await supabase
    .from("disputes")
    .insert({
      contract_id: input.contractId,
      initiator_org_id: input.organizationId,
      reason: input.reason,
      description: input.description,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  // Update contract status to disputed
  await supabase
    .from("contracts")
    .update({ status: "disputed" })
    .eq("id", input.contractId)

  return data
}

export async function getDisputesForOrg(organizationId: string) {
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

  // Get contracts where org is a party
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id")
    .or(`buyer_org_id.eq.${organizationId},seller_org_id.eq.${organizationId}`)

  if (!contracts || contracts.length === 0) {
    return []
  }

  const contractIds = contracts.map((c) => c.id)

  const { data, error } = await supabase
    .from("disputes")
    .select(`
      *,
      contracts(id, tracking_code, buyer_org_id, seller_org_id)
    `)
    .in("contract_id", contractIds)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getDisputeById(disputeId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("disputes")
    .select(`
      *,
      contracts(
        *,
        buyer_org:organizations!contracts_buyer_org_id_fkey(id, name),
        seller_org:organizations!contracts_seller_org_id_fkey(id, name)
      )
    `)
    .eq("id", disputeId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
