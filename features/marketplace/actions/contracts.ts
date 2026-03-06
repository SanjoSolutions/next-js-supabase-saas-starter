"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"
import { calculatePriceBreakdown } from "@/features/marketplace/lib/price"

export async function createContractFromMatch(matchId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  // Get the match with listings
  const { data: match, error: matchError } = await supabase
    .from("order_matches")
    .select(`
      *,
      request_listing:service_listings!order_matches_request_listing_id_fkey(organization_id),
      offer_listing:service_listings!order_matches_offer_listing_id_fkey(organization_id)
    `)
    .eq("id", matchId)
    .eq("status", "confirmed")
    .single()

  if (matchError || !match) {
    throw new Error("Confirmed match not found")
  }

  const buyerOrgId = match.request_listing.organization_id
  const sellerOrgId = match.offer_listing.organization_id

  // Verify caller is a party
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .in("organization_id", [buyerOrgId, sellerOrgId])
    .limit(1)
    .single()

  if (!membership) {
    throw new Error("Not authorized")
  }

  // Check if contract already exists for this match
  const { data: existing } = await supabase
    .from("contracts")
    .select("id")
    .eq("match_id", matchId)
    .single()

  if (existing) {
    return existing
  }

  const breakdown = calculatePriceBreakdown(match.agreed_price_cents)

  const { data, error } = await supabase
    .from("contracts")
    .insert({
      match_id: matchId,
      buyer_org_id: buyerOrgId,
      seller_org_id: sellerOrgId,
      net_price_cents: breakdown.netCents,
      vat_rate: breakdown.vatRate,
      vat_cents: breakdown.vatCents,
      gross_price_cents: breakdown.grossCents,
      platform_fee_cents: breakdown.platformFeeCents,
      seller_payout_cents: breakdown.sellerPayoutCents,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getContractById(contractId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("contracts")
    .select(`
      *,
      buyer_org:organizations!contracts_buyer_org_id_fkey(id, name),
      seller_org:organizations!contracts_seller_org_id_fkey(id, name),
      order_matches(
        request_listing:service_listings!order_matches_request_listing_id_fkey(*),
        offer_listing:service_listings!order_matches_offer_listing_id_fkey(*)
      )
    `)
    .eq("id", contractId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getContractsForOrg(organizationId: string) {
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

  const { data, error } = await supabase.rpc("get_org_contracts", {
    p_org_id: organizationId,
    p_page_size: 50,
    p_page_offset: 0,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

const VALID_TRANSITIONS: Record<string, { nextStatuses: string[]; allowedRole: "buyer" | "seller" | "both" }> = {
  paid: { nextStatuses: ["in_progress", "cancelled"], allowedRole: "seller" },
  in_progress: { nextStatuses: ["pickup_confirmed"], allowedRole: "seller" },
  pickup_confirmed: { nextStatuses: ["delivered"], allowedRole: "seller" },
  delivered: { nextStatuses: ["completed"], allowedRole: "buyer" },
}

export async function updateContractStatus(
  contractId: string,
  organizationId: string,
  newStatus: string
) {
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

  // Get contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .single()

  if (contractError || !contract) {
    throw new Error("Contract not found")
  }

  // Verify org is a party
  const isBuyer = contract.buyer_org_id === organizationId
  const isSeller = contract.seller_org_id === organizationId
  if (!isBuyer && !isSeller) {
    throw new Error("Not authorized")
  }

  // Validate transition
  const transition = VALID_TRANSITIONS[contract.status]
  if (!transition || !transition.nextStatuses.includes(newStatus)) {
    throw new Error(`Invalid status transition: ${contract.status} -> ${newStatus}`)
  }

  if (transition.allowedRole === "buyer" && !isBuyer) {
    throw new Error("Only the buyer can perform this action")
  }
  if (transition.allowedRole === "seller" && !isSeller) {
    throw new Error("Only the seller can perform this action")
  }

  const timestampField: Record<string, string> = {
    in_progress: "started_at",
    pickup_confirmed: "pickup_at",
    delivered: "delivered_at",
    completed: "completed_at",
    cancelled: "cancelled_at",
  }

  const updateData: Record<string, unknown> = {
    status: newStatus,
  }
  if (timestampField[newStatus]) {
    updateData[timestampField[newStatus]] = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from("contracts")
    .update(updateData)
    .eq("id", contractId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
