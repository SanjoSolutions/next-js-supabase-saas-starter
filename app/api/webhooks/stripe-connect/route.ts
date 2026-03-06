import { isFeatureModuleEnabledInCode } from "@/features/config"
import { POST as stripeConnectWebhookPost } from "@/features/marketplace/api/webhooks/stripe-connect/route"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  if (!isFeatureModuleEnabledInCode("marketplace")) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return stripeConnectWebhookPost(req)
}
