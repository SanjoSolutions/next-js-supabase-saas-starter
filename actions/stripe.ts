"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createCheckoutSession(orgId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  // Verify membership
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", user.id)
    .single()

  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    throw new Error("Only owners or admins can manage billing")
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", orgId)
    .single()

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
          {
              price: priceId,
              quantity: 1
          }
      ],
      customer: org?.stripe_customer_id || undefined,
      customer_email: org?.stripe_customer_id ? undefined : user.email,
      success_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(":54321", ":3000")}/organizations/${orgId}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(":54321", ":3000")}/organizations/${orgId}/billing?canceled=true`,
      metadata: {
          orgId,
      }
    })

    if (session.url) {
        redirect(session.url)
    }
  } catch (error) {
    console.error("Stripe Checkout Error:", error)
    throw error // Re-throw to show 500, but now it's logged
  }
}

export async function createCustomerPortalSession(orgId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error("Unauthorized")
    }

      // Verify membership
  const { data: membership } = await supabase
  .from("memberships")
  .select("role")
  .eq("organization_id", orgId)
  .eq("user_id", user.id)
  .single()

    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
        throw new Error("Only owners or admins can manage billing")
    }

    const { data: org } = await supabase
        .from("organizations")
        .select("stripe_customer_id")
        .eq("id", orgId)
        .single()

    if (!org?.stripe_customer_id) {
        throw new Error("No billing account found")
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: org.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(":54321", ":3000")}/organizations/${orgId}/billing`,
    })

    if (session.url) {
        redirect(session.url)
    }
}
