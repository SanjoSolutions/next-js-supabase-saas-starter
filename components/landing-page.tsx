import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@/i18n/navigation"
import {
  ArrowRight,
  Bell,
  Check,
  CreditCard,
  Database,
  Globe,
  Shield,
  Users,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

export async function LandingPage() {
  const t = await getTranslations("landing")
  const tBilling = await getTranslations("billing")

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            {t("hero.badge")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {t("hero.title")}{" "}
            <span className="text-primary">{t("hero.titleHighlight")}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/auth/sign-up">
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="/auth/login">{t("hero.ctaSecondary")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("features.title")}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("features.description")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title={t("features.auth.title")}
              description={t("features.auth.description")}
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title={t("features.teams.title")}
              description={t("features.teams.description")}
            />
            <FeatureCard
              icon={<CreditCard className="h-6 w-6" />}
              title={t("features.billing.title")}
              description={t("features.billing.description")}
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              title={t("features.i18n.title")}
              description={t("features.i18n.description")}
            />
            <FeatureCard
              icon={<Database className="h-6 w-6" />}
              title={t("features.database.title")}
              description={t("features.database.description")}
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title={t("features.notifications.title")}
              description={t("features.notifications.description")}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("pricing.title")}</h2>
            <p className="text-lg text-muted-foreground">
              {t("pricing.description")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t("pricing.free.name")}
                </CardTitle>
                <CardDescription>
                  {t("pricing.free.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {tBilling("free.price")}
                  </span>
                  <span className="text-muted-foreground">
                    {t("pricing.perMonth")}
                  </span>
                </div>
                <ul className="space-y-3 mb-6">
                  <PricingFeature>
                    {t("pricing.free.features.1")}
                  </PricingFeature>
                  <PricingFeature>
                    {t("pricing.free.features.2")}
                  </PricingFeature>
                  <PricingFeature>
                    {t("pricing.free.features.3")}
                  </PricingFeature>
                  <PricingFeature>
                    {t("pricing.free.features.4")}
                  </PricingFeature>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/sign-up">{t("pricing.getStarted")}</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge>{t("pricing.pro.popular")}</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t("pricing.pro.name")}
                </CardTitle>
                <CardDescription>
                  {t("pricing.pro.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {tBilling("pro.price")}
                  </span>
                  <span className="text-muted-foreground">
                    {t("pricing.perMonth")}
                  </span>
                </div>
                <ul className="space-y-3 mb-6">
                  <PricingFeature>{t("pricing.pro.features.1")}</PricingFeature>
                  <PricingFeature>{t("pricing.pro.features.2")}</PricingFeature>
                  <PricingFeature>{t("pricing.pro.features.3")}</PricingFeature>
                  <PricingFeature>{t("pricing.pro.features.4")}</PricingFeature>
                  <PricingFeature>{t("pricing.pro.features.5")}</PricingFeature>
                  <PricingFeature>{t("pricing.pro.features.6")}</PricingFeature>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/auth/sign-up">{t("pricing.getStarted")}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t("cta.description")}
          </p>
          <Button asChild size="lg" className="text-base">
            <Link href="/auth/sign-up">
              {t("cta.button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <Check className="h-4 w-4 text-primary flex-shrink-0" />
      <span className="text-sm">{children}</span>
    </li>
  )
}
