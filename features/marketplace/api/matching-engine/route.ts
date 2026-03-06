import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // Verify authorization (cron secret or admin key)
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const supabase = createAdminClient()

  // Step 1: Expire old listings
  const { data: expiredCount } = await supabase.rpc("expire_old_listings")

  // Step 2: Get all open listings
  const { data: openListings, error: listingsError } = await supabase
    .from("service_listings")
    .select("id, listing_type, organization_id")
    .eq("status", "open")
    .order("created_at", { ascending: true })

  if (listingsError) {
    return NextResponse.json(
      { error: listingsError.message },
      { status: 500 }
    )
  }

  let matchesCreated = 0

  // Step 3: For each listing, find matches
  for (const listing of openListings || []) {
    const { data: matches, error: matchError } = await supabase.rpc(
      "find_matching_listings",
      { p_listing_id: listing.id }
    )

    if (matchError || !matches || matches.length === 0) continue

    // Take the best match (smallest price gap)
    const bestMatch = matches[0]

    // Determine request and offer
    const requestListingId =
      listing.listing_type === "request" ? listing.id : bestMatch.match_listing_id
    const offerListingId =
      listing.listing_type === "offer" ? listing.id : bestMatch.match_listing_id

    // Insert match (ignore conflicts for already-matched pairs)
    const { error: insertError } = await supabase
      .from("order_matches")
      .insert({
        request_listing_id: requestListingId,
        offer_listing_id: offerListingId,
        agreed_price_cents: bestMatch.agreed_price,
      })

    if (!insertError) {
      matchesCreated++
    }
  }

  return NextResponse.json({
    expiredListings: expiredCount ?? 0,
    matchesCreated,
    listingsProcessed: openListings?.length ?? 0,
  })
}
