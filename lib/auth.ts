import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Checks if a user is authenticated. Redirects to login if not.
 * Returns the user object.
 */
export async function requireUser() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) {
    redirect("/auth/login")
  }

  return user
}

/**
 * Checks if the current user is a member of the specified organization.
 * Redirects to /protected if not a member.
 * Returns user, membership, and organization details.
 */
export async function requireOrgMember(orgId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  // Verify membership
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    redirect("/protected")
  }

  // Get organization details
  const { data: organization } = await supabase
    .from("organizations")
    .select("name, plan, subscription_status")
    .eq("id", orgId)
    .single()

  if (!organization) {
    redirect("/protected")
  }

  return { user, membership, organization }
}

/**
 * Checks if the org has a marketplace profile. Redirects to profile setup if not.
 * Returns user, membership, organization, and marketplace profile.
 */
export async function requireMarketplaceProfile(orgId: string) {
  const { user, membership, organization } = await requireOrgMember(orgId)
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("*")
    .eq("organization_id", orgId)
    .single()

  if (!profile) {
    redirect("/marketplace/profile/setup")
  }

  return { user, membership, organization, profile }
}

/**
 * Checks if the org has an active seller marketplace profile with Stripe Connect.
 * Redirects to seller onboarding if not ready.
 */
export async function requireSellerProfile(orgId: string) {
  const result = await requireMarketplaceProfile(orgId)

  if (
    result.profile.marketplace_role === "buyer" ||
    !result.profile.stripe_connect_onboarded
  ) {
    redirect("/marketplace/seller/onboarding")
  }

  return result
}
