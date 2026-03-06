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
  Code2,
  CreditCard,
  Database,
  Globe,
  KeyRound,
  LayoutDashboard,
  Puzzle,
  Shield,
  ShoppingBag,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

export async function LandingPage() {
  const t = await getTranslations("landing")
  const tBilling = await getTranslations("billing")

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            {t("hero.badge")}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
            {t("hero.title")}{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t("hero.titleHighlight")}
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("hero.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/auth/sign-up">
                {t("hero.cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base px-8">
              <Link href="/auth/login">{t("hero.ctaSecondary")}</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("hero.trustedBy")}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              {t("features.badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("features.title")}
            </h2>
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
              icon={<Sparkles className="h-6 w-6" />}
              title={t("features.credits.title")}
              description={t("features.credits.description")}
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
            <FeatureCard
              icon={<LayoutDashboard className="h-6 w-6" />}
              title={t("features.admin.title")}
              description={t("features.admin.description")}
            />
            <FeatureCard
              icon={<Puzzle className="h-6 w-6" />}
              title={t("features.modular.title")}
              description={t("features.modular.description")}
            />
          </div>
        </div>
      </section>

      {/* Marketplace Showcase */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              {t("showcase.badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("showcase.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("showcase.description")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <CardTitle>{t("showcase.marketplace.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {t("showcase.marketplace.feature1")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {t("showcase.marketplace.feature2")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {t("showcase.marketplace.feature3")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {t("showcase.marketplace.feature4")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <KeyRound className="h-6 w-6" />
                </div>
                <CardTitle>{t("showcase.compliance.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {t("showcase.compliance.feature1")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {t("showcase.compliance.feature2")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {t("showcase.compliance.feature3")}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {t("showcase.compliance.feature4")}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("techStack.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("techStack.description")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <TechCard icon={<Code2 className="h-8 w-8" />} name="Next.js 16" description={t("techStack.nextjs")} />
            <TechCard icon={<Database className="h-8 w-8" />} name="Supabase" description={t("techStack.supabase")} />
            <TechCard icon={<CreditCard className="h-8 w-8" />} name="Stripe" description={t("techStack.stripe")} />
            <TechCard icon={<Zap className="h-8 w-8" />} name="TypeScript" description={t("techStack.typescript")} />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              {t("pricing.badge")}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("pricing.title")}
            </h2>
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

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("faq.title")}
            </h2>
          </div>
          <div className="space-y-6">
            <FaqItem
              question={t("faq.q1.question")}
              answer={t("faq.q1.answer")}
            />
            <FaqItem
              question={t("faq.q2.question")}
              answer={t("faq.q2.answer")}
            />
            <FaqItem
              question={t("faq.q3.question")}
              answer={t("faq.q3.answer")}
            />
            <FaqItem
              question={t("faq.q4.question")}
              answer={t("faq.q4.answer")}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("cta.title")}</h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t("cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/auth/sign-up">
                {t("cta.button")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
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
    <Card className="transition-colors hover:border-primary/50">
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

function TechCard({
  icon,
  name,
  description,
}: {
  icon: React.ReactNode
  name: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="font-semibold mb-1">{name}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
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

function FaqItem({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <details className="group border rounded-lg">
      <summary className="flex cursor-pointer items-center justify-between p-4 font-medium">
        {question}
        <span className="ml-2 transition-transform group-open:rotate-180">
          <ArrowRight className="h-4 w-4 rotate-90" />
        </span>
      </summary>
      <div className="px-4 pb-4 text-muted-foreground">
        {answer}
      </div>
    </details>
  )
}
