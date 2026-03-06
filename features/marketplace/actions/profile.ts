"use server"

import { assertMarketplaceAccess } from "@/features/marketplace/access"
import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

interface CreateProfileInput {
  organizationId: string
  marketplaceRole: "buyer" | "seller" | "both"
  businessType: "company" | "sole_proprietor"
  companyName: string
  taxId?: string
  vatId?: string
  streetAddress: string
  postalCode: string
  city: string
  country?: string
  contactEmail: string
  contactPhone?: string
}

interface UpdateProfileInput extends Partial<Omit<CreateProfileInput, "organizationId">> {
  organizationId: string
}

export async function createMarketplaceProfile(input: CreateProfileInput) {
  const user = await requireUser()
  await assertMarketplaceAccess(input.organizationId)
  const supabase = await createClient()

  // Verify user is owner/admin
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", input.organizationId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("Only owners or admins can create a marketplace profile")
  }

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("marketplace_profiles")
    .select("id")
    .eq("organization_id", input.organizationId)
    .single()

  if (existing) {
    throw new Error("Marketplace profile already exists for this organization")
  }

  const { data, error } = await supabase
    .from("marketplace_profiles")
    .insert({
      organization_id: input.organizationId,
      marketplace_role: input.marketplaceRole,
      business_type: input.businessType,
      company_name: input.companyName,
      tax_id: input.taxId || null,
      vat_id: input.vatId || null,
      street_address: input.streetAddress,
      postal_code: input.postalCode,
      city: input.city,
      country: input.country || "DE",
      contact_email: input.contactEmail,
      contact_phone: input.contactPhone || null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateMarketplaceProfile(input: UpdateProfileInput) {
  const user = await requireUser()
  await assertMarketplaceAccess(input.organizationId)
  const supabase = await createClient()

  // Verify user is owner/admin
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", input.organizationId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("Only owners or admins can update the marketplace profile")
  }

  const updateData: Record<string, unknown> = {}
  if (input.marketplaceRole) updateData.marketplace_role = input.marketplaceRole
  if (input.businessType) updateData.business_type = input.businessType
  if (input.companyName) updateData.company_name = input.companyName
  if (input.taxId !== undefined) updateData.tax_id = input.taxId || null
  if (input.vatId !== undefined) updateData.vat_id = input.vatId || null
  if (input.streetAddress) updateData.street_address = input.streetAddress
  if (input.postalCode) updateData.postal_code = input.postalCode
  if (input.city) updateData.city = input.city
  if (input.country) updateData.country = input.country
  if (input.contactEmail) updateData.contact_email = input.contactEmail
  if (input.contactPhone !== undefined) updateData.contact_phone = input.contactPhone || null

  const { data, error } = await supabase
    .from("marketplace_profiles")
    .update(updateData)
    .eq("organization_id", input.organizationId)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getMarketplaceProfile(organizationId: string) {
  await assertMarketplaceAccess(organizationId)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("marketplace_profiles")
    .select("*")
    .eq("organization_id", organizationId)
    .single()

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message)
  }

  return data
}
