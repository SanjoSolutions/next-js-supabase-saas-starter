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
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
      console.error("Webhook signature verification failed.", error)
    return new NextResponse("Webhook error", { status: 400 })
  }

  const supabase = createAdminClient()

  const session = event.data.object as Stripe.Checkout.Session | Stripe.Subscription

  if (event.type === "checkout.session.completed") {
      const checkoutSession = session as Stripe.Checkout.Session
      const orgId = checkoutSession.metadata?.orgId

      if (orgId) {
          await supabase.from("organizations").update({
              stripe_customer_id: checkoutSession.customer as string,
              stripe_subscription_id: checkoutSession.subscription as string,
              plan: "pro",
              subscription_status: "active"
          }).eq("id", orgId)
      }
  } else if (event.type === "customer.subscription.updated") {
       const subscription = session as Stripe.Subscription
       // Find org by customer id
       const { data: org } = await supabase.from("organizations").select("id").eq("stripe_customer_id", subscription.customer as string).single()
       
       if (org) {
           await supabase.from("organizations").update({
               plan: subscription.status === "active" ? "pro" : "free",
               subscription_status: subscription.status
           }).eq("id", org.id)
       }

  } else if (event.type === "customer.subscription.deleted") {
      const subscription = session as Stripe.Subscription
      const { data: org } = await supabase.from("organizations").select("id").eq("stripe_customer_id", subscription.customer as string).single()

      if (org) {
        await supabase.from("organizations").update({
            plan: "free",
            subscription_status: "canceled"
        }).eq("id", org.id)
    }
  }

  return new NextResponse(null, { status: 200 })
}
