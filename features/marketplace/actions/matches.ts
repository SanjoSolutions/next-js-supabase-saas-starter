"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

export async function getMatchesForOrg(organizationId: string) {
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

  // Get all listings for this org to find their matches
  const { data: listings } = await supabase
    .from("service_listings")
    .select("id")
    .eq("organization_id", organizationId)

  if (!listings || listings.length === 0) {
    return []
  }

  const listingIds = listings.map((l) => l.id)

  const { data, error } = await supabase
    .from("order_matches")
    .select(`
      *,
      request_listing:service_listings!order_matches_request_listing_id_fkey(
        id, title, listing_type, price_cents, pickup_city, delivery_city,
        package_size, delivery_date, organization_id,
        organizations(name)
      ),
      offer_listing:service_listings!order_matches_offer_listing_id_fkey(
        id, title, listing_type, price_cents, pickup_city, delivery_city,
        package_size, delivery_date, organization_id,
        organizations(name)
      )
    `)
    .or(
      `request_listing_id.in.(${listingIds.join(",")}),offer_listing_id.in.(${listingIds.join(",")})`
    )
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getMatchById(matchId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("order_matches")
    .select(`
      *,
      request_listing:service_listings!order_matches_request_listing_id_fkey(
        *, organizations(name)
      ),
      offer_listing:service_listings!order_matches_offer_listing_id_fkey(
        *, organizations(name)
      )
    `)
    .eq("id", matchId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function confirmMatch(matchId: string, organizationId: string) {
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

  const { data, error } = await supabase.rpc("confirm_match", {
    p_match_id: matchId,
    p_confirming_org_id: organizationId,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function rejectMatch(matchId: string, organizationId: string) {
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
    .from("order_matches")
    .update({
      status: "rejected",
      rejected_at: new Date().toISOString(),
      rejected_by_org_id: organizationId,
    })
    .eq("id", matchId)
    .not("status", "in", "(confirmed,rejected)")
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
