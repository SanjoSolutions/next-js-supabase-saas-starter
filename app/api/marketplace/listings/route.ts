import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"

const VALID_LISTING_TYPES = ["request", "offer"] as const
const VALID_PACKAGE_SIZES = ["small", "medium", "large", "pallet"] as const

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 })
  }

  const token = authHeader.slice(7)

  // Create a Supabase client with the user's access token
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  )

  // Verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Validate required fields
  const {
    organizationId,
    listingType,
    title,
    description,
    priceMinCents,
    priceMaxCents,
    pickupStreet,
    pickupPostalCode,
    pickupCity,
    deliveryStreet,
    deliveryPostalCode,
    deliveryCity,
    packageSize,
    deliveryDate,
    expiresAt,
    packageWeightKg,
    packageDescription,
    deliveryTimeStart,
    deliveryTimeEnd,
  } = body as {
    organizationId?: string
    listingType?: string
    title?: string
    description?: string
    priceMinCents?: number
    priceMaxCents?: number
    pickupStreet?: string
    pickupPostalCode?: string
    pickupCity?: string
    deliveryStreet?: string
    deliveryPostalCode?: string
    deliveryCity?: string
    packageSize?: string
    deliveryDate?: string
    expiresAt?: string
    packageWeightKg?: number
    packageDescription?: string
    deliveryTimeStart?: string
    deliveryTimeEnd?: string
  }

  const missing: string[] = []
  if (!organizationId) missing.push("organizationId")
  if (!listingType) missing.push("listingType")
  if (!title) missing.push("title")
  if (!priceMinCents) missing.push("priceMinCents")
  if (!priceMaxCents) missing.push("priceMaxCents")
  if (!pickupStreet) missing.push("pickupStreet")
  if (!pickupPostalCode) missing.push("pickupPostalCode")
  if (!pickupCity) missing.push("pickupCity")
  if (!deliveryStreet) missing.push("deliveryStreet")
  if (!deliveryPostalCode) missing.push("deliveryPostalCode")
  if (!deliveryCity) missing.push("deliveryCity")
  if (!packageSize) missing.push("packageSize")
  if (!deliveryDate) missing.push("deliveryDate")
  if (!expiresAt) missing.push("expiresAt")

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 },
    )
  }

  if (!VALID_LISTING_TYPES.includes(listingType as (typeof VALID_LISTING_TYPES)[number])) {
    return NextResponse.json({ error: "listingType must be 'request' or 'offer'" }, { status: 400 })
  }
  if (!VALID_PACKAGE_SIZES.includes(packageSize as (typeof VALID_PACKAGE_SIZES)[number])) {
    return NextResponse.json({ error: "packageSize must be 'small', 'medium', 'large', or 'pallet'" }, { status: 400 })
  }
  if (priceMinCents! > priceMaxCents!) {
    return NextResponse.json({ error: "priceMinCents must not exceed priceMaxCents" }, { status: 400 })
  }

  // Verify membership
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", organizationId!)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 })
  }

  // Verify marketplace profile
  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("marketplace_role, stripe_connect_onboarded")
    .eq("organization_id", organizationId!)
    .single()

  if (!profile) {
    return NextResponse.json({ error: "Marketplace profile not found" }, { status: 403 })
  }

  if (listingType === "request" && profile.marketplace_role === "seller") {
    return NextResponse.json({ error: "Sellers cannot create delivery requests" }, { status: 403 })
  }
  if (listingType === "offer" && profile.marketplace_role === "buyer") {
    return NextResponse.json({ error: "Buyers cannot create delivery offers" }, { status: 403 })
  }
  if (listingType === "offer" && !profile.stripe_connect_onboarded) {
    return NextResponse.json({ error: "Stripe Connect onboarding required to post offers" }, { status: 403 })
  }

  const priceCents = Math.round((priceMinCents! + priceMaxCents!) / 2)

  const { data, error } = await supabase
    .from("service_listings")
    .insert({
      organization_id: organizationId,
      listing_type: listingType,
      title,
      description: description || null,
      pickup_street: pickupStreet,
      pickup_postal_code: pickupPostalCode,
      pickup_city: pickupCity,
      pickup_country: "DE",
      delivery_street: deliveryStreet,
      delivery_postal_code: deliveryPostalCode,
      delivery_city: deliveryCity,
      delivery_country: "DE",
      package_size: packageSize,
      package_weight_kg: packageWeightKg || null,
      package_description: packageDescription || null,
      price_cents: priceCents,
      price_min_cents: priceMinCents,
      price_max_cents: priceMaxCents,
      delivery_date: deliveryDate,
      delivery_time_start: deliveryTimeStart || null,
      delivery_time_end: deliveryTimeEnd || null,
      expires_at: expiresAt,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data, { status: 201 })
}
