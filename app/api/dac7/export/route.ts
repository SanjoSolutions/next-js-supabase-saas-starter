import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import { exportDac7Csv, getDac7Data } from "@/actions/marketplace/dac7"

export async function GET(req: NextRequest) {
  // Verify authentication
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString(), 10)
  const format = searchParams.get("format") || "json"

  try {
    if (format === "csv") {
      const csv = await exportDac7Csv(year)
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="dac7-report-${year}.csv"`,
        },
      })
    }

    const data = await getDac7Data(year)
    return NextResponse.json({ year, sellers: data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    )
  }
}
