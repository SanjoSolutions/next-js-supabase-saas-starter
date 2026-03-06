import { isFeatureModuleEnabledInCode } from "@/features/config"
import { GET as dac7ExportGet } from "@/features/marketplace/api/dac7/export/route"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  if (!isFeatureModuleEnabledInCode("marketplace")) {
    return new NextResponse("Not Found", { status: 404 })
  }

  return dac7ExportGet(req)
}
