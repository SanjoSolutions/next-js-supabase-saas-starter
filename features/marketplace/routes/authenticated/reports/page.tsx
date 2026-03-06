import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketplaceNav } from "@/features/marketplace/components/marketplace-nav"
import { ReportForm } from "@/features/marketplace/components/report-form"
import { getMyReports } from "@/features/marketplace/actions/reports"

export default async function ReportsPage() {
  const t = await getTranslations("marketplace.reports")
  await requireUser()
  const cookieStore = await cookies()

  await requireMarketplaceAccess(cookieStore.get("active_org_id")?.value)

  const reports = await getMyReports()

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <MarketplaceNav />

      <ReportForm />

      {reports && reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t("myReports")}</h2>
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {t(`types.${report.report_type}`)}
                  </CardTitle>
                  <Badge variant="outline">{t(`status.${report.status}`)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{report.description}</p>
                {report.service_listings && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("relatedListing")}: {report.service_listings.title}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
