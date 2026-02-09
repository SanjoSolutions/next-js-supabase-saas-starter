"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

interface CreateListingInput {
  organizationId: string
  listingType: "request" | "offer"
  title: string
  description?: string
  pickupStreet: string
  pickupPostalCode: string
  pickupCity: string
  pickupCountry?: string
  deliveryStreet: string
  deliveryPostalCode: string
  deliveryCity: string
  deliveryCountry?: string
  packageSize: "small" | "medium" | "large" | "pallet"
  packageWeightKg?: number
  packageDescription?: string
  priceMinCents: number
  priceMaxCents: number
  deliveryDate: string
  deliveryTimeStart?: string
  deliveryTimeEnd?: string
  expiresAt: string
}

export async function createListing(input: CreateListingInput) {
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

  // Verify marketplace profile exists and role matches
  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("marketplace_role, stripe_connect_onboarded")
    .eq("organization_id", input.organizationId)
    .single()

  if (!profile) {
    throw new Error("Marketplace profile not found")
  }

  // Validate role matches listing type
  if (input.listingType === "request" && profile.marketplace_role === "seller") {
    throw new Error("Sellers cannot create delivery requests")
  }
  if (input.listingType === "offer" && profile.marketplace_role === "buyer") {
    throw new Error("Buyers cannot create delivery offers")
  }

  // Sellers must have active Stripe Connect to post offers
  if (input.listingType === "offer" && !profile.stripe_connect_onboarded) {
    throw new Error("Stripe Connect onboarding required to post offers")
  }

  if (input.priceMinCents > input.priceMaxCents) {
    throw new Error("Minimum price must not exceed maximum price")
  }

  const priceCents = Math.round((input.priceMinCents + input.priceMaxCents) / 2)

  const { data, error } = await supabase
    .from("service_listings")
    .insert({
      organization_id: input.organizationId,
      listing_type: input.listingType,
      title: input.title,
      description: input.description || null,
      pickup_street: input.pickupStreet,
      pickup_postal_code: input.pickupPostalCode,
      pickup_city: input.pickupCity,
      pickup_country: input.pickupCountry || "DE",
      delivery_street: input.deliveryStreet,
      delivery_postal_code: input.deliveryPostalCode,
      delivery_city: input.deliveryCity,
      delivery_country: input.deliveryCountry || "DE",
      package_size: input.packageSize,
      package_weight_kg: input.packageWeightKg || null,
      package_description: input.packageDescription || null,
      price_cents: priceCents,
      price_min_cents: input.priceMinCents,
      price_max_cents: input.priceMaxCents,
      delivery_date: input.deliveryDate,
      delivery_time_start: input.deliveryTimeStart || null,
      delivery_time_end: input.deliveryTimeEnd || null,
      expires_at: input.expiresAt,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateListing(
  listingId: string,
  organizationId: string,
  updates: Partial<Omit<CreateListingInput, "organizationId" | "listingType">>
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

  const updateData: Record<string, unknown> = {}
  if (updates.title) updateData.title = updates.title
  if (updates.description !== undefined) updateData.description = updates.description || null
  if (updates.priceMinCents && updates.priceMaxCents) {
    if (updates.priceMinCents > updates.priceMaxCents) {
      throw new Error("Minimum price must not exceed maximum price")
    }
    updateData.price_min_cents = updates.priceMinCents
    updateData.price_max_cents = updates.priceMaxCents
    updateData.price_cents = Math.round((updates.priceMinCents + updates.priceMaxCents) / 2)
  }
  if (updates.deliveryDate) updateData.delivery_date = updates.deliveryDate
  if (updates.expiresAt) updateData.expires_at = updates.expiresAt

  const { data, error } = await supabase
    .from("service_listings")
    .update(updateData)
    .eq("id", listingId)
    .eq("organization_id", organizationId)
    .eq("status", "open")
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function cancelListing(listingId: string, organizationId: string) {
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

  const { error } = await supabase
    .from("service_listings")
    .update({ status: "cancelled" })
    .eq("id", listingId)
    .eq("organization_id", organizationId)
    .eq("status", "open")

  if (error) {
    throw new Error(error.message)
  }
}

interface GetListingsOptions {
  type?: "request" | "offer"
  status?: string
  organizationId?: string
  limit?: number
  offset?: number
}

export async function getListings(options: GetListingsOptions = {}) {
  const supabase = await createClient()

  let query = supabase
    .from("service_listings")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false })

  if (options.type) {
    query = query.eq("listing_type", options.type)
  }
  if (options.status) {
    query = query.eq("status", options.status)
  } else {
    query = query.eq("status", "open")
  }
  if (options.organizationId) {
    query = query.eq("organization_id", options.organizationId)
  }
  if (options.limit) {
    query = query.limit(options.limit)
  }
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getListingById(listingId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("service_listings")
    .select("*, organizations(name)")
    .eq("id", listingId)
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getMyListings(organizationId: string) {
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
    .from("service_listings")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
