"use server"

import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"

export async function createPaymentForContract(contractId: string) {
  const user = await requireUser()
  const supabase = await createClient()

  // Get contract
  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("*")
    .eq("id", contractId)
    .eq("status", "pending_payment")
    .single()

  if (contractError || !contract) {
    throw new Error("Contract not found or not pending payment")
  }

  // Verify caller is buyer
  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("organization_id", contract.buyer_org_id)
    .eq("user_id", user.id)
    .single()

  if (!membership) {
    throw new Error("Only the buyer can initiate payment")
  }

  // Get seller's Stripe Connect account
  const { data: sellerProfile } = await supabase
    .from("marketplace_profiles")
    .select("stripe_connect_account_id")
    .eq("organization_id", contract.seller_org_id)
    .single()

  if (!sellerProfile?.stripe_connect_account_id) {
    throw new Error("Seller has no Stripe Connect account")
  }

  // Create PaymentIntent with destination charge
  const paymentIntent = await stripe.paymentIntents.create({
    amount: contract.gross_price_cents,
    currency: "eur",
    application_fee_amount: contract.platform_fee_cents,
    transfer_data: {
      destination: sellerProfile.stripe_connect_account_id,
    },
    metadata: {
      contract_id: contractId,
      buyer_org_id: contract.buyer_org_id,
      seller_org_id: contract.seller_org_id,
      invoice_number: contract.invoice_number,
    },
  })

  // Store payment intent ID on contract
  await supabase
    .from("contracts")
    .update({ stripe_payment_intent_id: paymentIntent.id })
    .eq("id", contractId)

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  }
}
