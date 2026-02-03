import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireOrgMember } from "@/lib/auth"
import { isFeatureEnabled } from "@/lib/feature-flags"
import { Link } from "@/i18n/navigation"
import { getTranslations } from "next-intl/server"

export default async function WelcomePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const t = await getTranslations("organizations.welcome")
  const tRoles = await getTranslations("organizations.roles")
  const { id } = await params
  const { membership, organization } = await requireOrgMember(id)
  const isBetaEnabled = await isFeatureEnabled("beta_access", id)

  return (
    <div className="flex-1 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{t("title", { orgName: organization.name })}</CardTitle>
          <CardDescription>
            {t("description")}
            {membership &&
              ` ${t("asRole", { role: tRoles(membership.role) })}`}
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{t("accessMessage")}</p>
          <Button asChild className="w-full">
            <Link href="/protected">{t("goToDashboard")}</Link>
          </Button>
          {isBetaEnabled && (
            <Card className="mt-4 border-dashed border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("betaFeature.title")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("betaFeature.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {t("betaFeature.tryIt")}
                </Button>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
