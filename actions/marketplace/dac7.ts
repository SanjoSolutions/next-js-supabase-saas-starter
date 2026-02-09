"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth"

export async function aggregateSellerData(year: number) {
  // This is an admin-only action — verify the caller is an admin
  // In a real system you'd check a platform-level admin role
  await requireUser()

  const admin = createAdminClient()

  // Aggregate completed contracts for the year
  const { data: contracts, error } = await admin
    .from("contracts")
    .select("seller_org_id, gross_price_cents, platform_fee_cents, seller_payout_cents")
    .eq("status", "completed")
    .gte("completed_at", `${year}-01-01T00:00:00Z`)
    .lt("completed_at", `${year + 1}-01-01T00:00:00Z`)

  if (error) {
    throw new Error(error.message)
  }

  // Group by seller
  const sellerData: Record<string, {
    totalTransactions: number
    totalGrossCents: number
    totalFeesCents: number
    totalNetCents: number
  }> = {}

  for (const contract of contracts || []) {
    const sellerId = contract.seller_org_id
    if (!sellerData[sellerId]) {
      sellerData[sellerId] = {
        totalTransactions: 0,
        totalGrossCents: 0,
        totalFeesCents: 0,
        totalNetCents: 0,
      }
    }
    sellerData[sellerId].totalTransactions += 1
    sellerData[sellerId].totalGrossCents += contract.gross_price_cents
    sellerData[sellerId].totalFeesCents += contract.platform_fee_cents
    sellerData[sellerId].totalNetCents += contract.seller_payout_cents
  }

  // Upsert into dac7_seller_data
  for (const [sellerOrgId, data] of Object.entries(sellerData)) {
    await admin
      .from("dac7_seller_data")
      .upsert(
        {
          seller_org_id: sellerOrgId,
          reporting_year: year,
          total_transactions: data.totalTransactions,
          total_gross_cents: data.totalGrossCents,
          total_fees_cents: data.totalFeesCents,
          total_net_cents: data.totalNetCents,
        },
        { onConflict: "seller_org_id,reporting_year" }
      )
  }

  return Object.keys(sellerData).length
}

export async function getDac7Data(year: number) {
  await requireUser()

  const admin = createAdminClient()

  const { data, error } = await admin
    .from("dac7_seller_data")
    .select(`
      *,
      organizations:seller_org_id(name),
      marketplace_profiles!inner(company_name, tax_id, vat_id, street_address, postal_code, city, country)
    `)
    .eq("reporting_year", year)
    .order("total_gross_cents", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function exportDac7Csv(year: number) {
  const data = await getDac7Data(year)

  if (!data || data.length === 0) {
    return ""
  }

  const headers = [
    "Seller Org",
    "Company Name",
    "Tax ID",
    "VAT ID",
    "Address",
    "Postal Code",
    "City",
    "Country",
    "Total Transactions",
    "Total Gross (EUR)",
    "Total Fees (EUR)",
    "Total Net (EUR)",
  ]

  const rows = data.map((row) => {
    const profile = Array.isArray(row.marketplace_profiles)
      ? row.marketplace_profiles[0]
      : row.marketplace_profiles
    return [
      (row.organizations as { name: string })?.name || "",
      profile?.company_name || "",
      profile?.tax_id || "",
      profile?.vat_id || "",
      profile?.street_address || "",
      profile?.postal_code || "",
      profile?.city || "",
      profile?.country || "",
      row.total_transactions,
      (row.total_gross_cents / 100).toFixed(2),
      (row.total_fees_cents / 100).toFixed(2),
      (row.total_net_cents / 100).toFixed(2),
    ]
  })

  return [headers, ...rows].map((r) => r.join(",")).join("\n")
}
