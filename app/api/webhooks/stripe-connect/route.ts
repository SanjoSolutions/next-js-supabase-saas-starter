import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    console.error("Connect webhook signature verification failed.", error)
    return new NextResponse("Webhook error", { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account
      const isOnboarded = account.charges_enabled && account.payouts_enabled

      if (account.metadata?.organization_id) {
        await supabase
          .from("marketplace_profiles")
          .update({ stripe_connect_onboarded: isOnboarded })
          .eq("organization_id", account.metadata.organization_id)
      } else {
        await supabase
          .from("marketplace_profiles")
          .update({ stripe_connect_onboarded: isOnboarded })
          .eq("stripe_connect_account_id", account.id)
      }
      break
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const contractId = paymentIntent.metadata?.contract_id

      if (contractId) {
        await supabase
          .from("contracts")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
          })
          .eq("id", contractId)
          .eq("status", "pending_payment")
      }
      break
    }

    case "transfer.created": {
      const transfer = event.data.object as Stripe.Transfer
      const contractId = transfer.metadata?.contract_id

      if (contractId) {
        await supabase
          .from("contracts")
          .update({ stripe_transfer_id: transfer.id })
          .eq("id", contractId)
      }
      break
    }

    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute
      const paymentIntentId = typeof dispute.payment_intent === "string"
        ? dispute.payment_intent
        : dispute.payment_intent?.id

      if (paymentIntentId) {
        await supabase
          .from("contracts")
          .update({ status: "disputed" })
          .eq("stripe_payment_intent_id", paymentIntentId)
      }
      break
    }
  }

  return new NextResponse(null, { status: 200 })
}
