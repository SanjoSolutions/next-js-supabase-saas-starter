"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

export async function createConnectOnboardingLink(organizationId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("Only owners or admins can manage Stripe Connect")
  }

  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("*")
    .eq("organization_id", organizationId)
    .single()

  if (!profile) {
    throw new Error("Marketplace profile not found")
  }

  let accountId = profile.stripe_connect_account_id

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "standard",
      country: profile.country || "DE",
      email: profile.contact_email,
      business_type: profile.business_type === "company" ? "company" : "individual",
      metadata: {
        organization_id: organizationId,
      },
    })

    accountId = account.id

    await supabase
      .from("marketplace_profiles")
      .update({ stripe_connect_account_id: accountId })
      .eq("organization_id", organizationId)
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(":54321", ":3000")

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${baseUrl}/marketplace/seller/onboarding`,
    return_url: `${baseUrl}/marketplace/seller/onboarding?success=true`,
    type: "account_onboarding",
  })

  return accountLink.url
}

export async function getConnectAccountStatus(organizationId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("stripe_connect_account_id, stripe_connect_onboarded")
    .eq("organization_id", organizationId)
    .single()

  if (!profile?.stripe_connect_account_id) {
    return { hasAccount: false, isOnboarded: false, details: null }
  }

  try {
    const account = await stripe.accounts.retrieve(profile.stripe_connect_account_id)
    const isOnboarded = account.charges_enabled && account.payouts_enabled

    if (isOnboarded && !profile.stripe_connect_onboarded) {
      await supabase
        .from("marketplace_profiles")
        .update({ stripe_connect_onboarded: true })
        .eq("organization_id", organizationId)
    }

    return {
      hasAccount: true,
      isOnboarded,
      details: {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
    }
  } catch {
    return { hasAccount: true, isOnboarded: false, details: null }
  }
}

export async function createConnectLoginLink(organizationId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", organizationId)
    .eq("user_id", user.id)
    .single()

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    throw new Error("Only owners or admins can access Stripe dashboard")
  }

  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("stripe_connect_account_id")
    .eq("organization_id", organizationId)
    .single()

  if (!profile?.stripe_connect_account_id) {
    throw new Error("No Stripe Connect account found")
  }

  const loginLink = await stripe.accounts.createLoginLink(
    profile.stripe_connect_account_id
  )

  return loginLink.url
}
