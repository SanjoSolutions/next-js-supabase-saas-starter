import { isFeatureModuleEnabledInCode } from "@/features/config"
import { POST as marketplaceListingsPost } from "@/features/marketplace/api/listings/route"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  if (!isFeatureModuleEnabledInCode("marketplace")) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  return marketplaceListingsPost(req)
}
