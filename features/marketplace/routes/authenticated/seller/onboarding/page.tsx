import { requireUser } from "@/lib/auth"
import { requireMarketplaceAccess } from "@/features/marketplace/access"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MarketplaceNav } from "@/features/marketplace/components/marketplace-nav"
import { StripeConnectButton } from "@/features/marketplace/components/stripe-connect-button"
import { getConnectAccountStatus } from "@/features/marketplace/actions/stripe-connect"
import { Check, Clock, AlertCircle } from "lucide-react"

export default async function SellerOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>
}) {
  const t = await getTranslations("marketplace.seller")
  await requireUser()
  const cookieStore = await cookies()
  const activeOrgId = await requireMarketplaceAccess(
    cookieStore.get("active_org_id")?.value
  )
  const { success } = await searchParams

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("marketplace_profiles")
    .select("*")
    .eq("organization_id", activeOrgId)
    .single()

  if (!profile) {
    redirect("/marketplace/profile/setup")
  }

  if (profile.marketplace_role === "buyer") {
    redirect("/marketplace")
  }

  const status = await getConnectAccountStatus(activeOrgId)

  return (
    <div className="flex-1 flex flex-col gap-6 w-full">
      <h1 className="text-3xl font-bold">{t("onboarding.title")}</h1>
      <MarketplaceNav />

      {success && (
        <div className="bg-green-500/10 text-green-600 p-4 rounded-md">
          {t("onboarding.returnSuccess")}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("onboarding.stripeConnect")}</CardTitle>
          <CardDescription>{t("onboarding.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {status.isOnboarded ? (
              <>
                <Check className="h-5 w-5 text-green-600" />
                <span className="font-medium">{t("onboarding.connected")}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {t("onboarding.active")}
                </Badge>
              </>
            ) : status.hasAccount ? (
              <>
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="font-medium">{t("onboarding.incomplete")}</span>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {t("onboarding.pending")}
                </Badge>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{t("onboarding.notStarted")}</span>
              </>
            )}
          </div>

          {status.details && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t("onboarding.chargesEnabled")}: {status.details.chargesEnabled ? t("onboarding.yes") : t("onboarding.no")}</p>
              <p>{t("onboarding.payoutsEnabled")}: {status.details.payoutsEnabled ? t("onboarding.yes") : t("onboarding.no")}</p>
            </div>
          )}

          <StripeConnectButton
            organizationId={activeOrgId}
            isOnboarded={status.isOnboarded}
          />
        </CardContent>
      </Card>
    </div>
  )
}
