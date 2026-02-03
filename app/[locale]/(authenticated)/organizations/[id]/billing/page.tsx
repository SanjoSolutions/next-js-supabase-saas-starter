import { createCheckoutSession, createCustomerPortalSession } from "@/actions/stripe"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireOrgMember } from "@/lib/auth"
import { Check } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const t = await getTranslations("billing")
  const { id } = await params
  const { success, canceled } = await searchParams

  const { organization: org } = await requireOrgMember(id)

  const isPro = org.plan === "pro" && org.subscription_status === "active"

  return (
    <div className="flex-1 flex flex-col gap-8 w-full">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      {success && (
        <div className="bg-green-500/10 text-green-600 p-4 rounded-md">
          {t("successMessage")}
        </div>
      )}

      {canceled && (
        <div className="bg-yellow-500/10 text-yellow-600 p-4 rounded-md">
          {t("canceledMessage")}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <Card className={!isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>{t("free.title")}</CardTitle>
            <CardDescription>{t("free.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="text-3xl font-bold">
              {t("free.price")}
              <span className="text-sm font-normal text-muted-foreground">
                {t("free.perMonth")}
              </span>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />{" "}
                {t("free.features.members")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />{" "}
                {t("free.features.basic")}
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
              <Button variant="outline" disabled className="w-full">
                {t("included")}
              </Button>
            ) : (
              <Button variant="outline" disabled className="w-full">
                {t("currentPlan")}
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={isPro ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>{t("pro.title")}</CardTitle>
            <CardDescription>{t("pro.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="text-3xl font-bold">
              {t("pro.price")}
              <span className="text-sm font-normal text-muted-foreground">
                {t("pro.perMonth")}
              </span>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />{" "}
                {t("pro.features.members")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />{" "}
                {t("pro.features.analytics")}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />{" "}
                {t("pro.features.support")}
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {isPro ? (
              <form
                action={createCustomerPortalSession.bind(null, id)}
                className="w-full"
              >
                <Button type="submit" variant="default" className="w-full">
                  {t("manageSubscription")}
                </Button>
              </form>
            ) : (
              <form
                action={createCheckoutSession.bind(null, id)}
                className="w-full"
              >
                <Button type="submit" className="w-full">
                  {t("upgradeToPro")}
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
