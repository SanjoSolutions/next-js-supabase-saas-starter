import { isFeatureModuleEnabledInCode } from "@/features/config"
import { POST as matchingEnginePost } from "@/features/marketplace/api/matching-engine/route"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  if (!isFeatureModuleEnabledInCode("marketplace")) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return matchingEnginePost(req)
}
