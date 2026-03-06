import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { CookieConsentBanner } from "@/features/cookie-consent/components/cookie-consent-banner"
import { CookieConsentProvider } from "@/features/cookie-consent/components/cookie-consent-provider"
import { isFeatureModuleEnabledInCode } from "@/features/config"
import { routing } from "@/i18n/routing"
import { getAppUrl } from "@/lib/app-url"
import "../globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "Next.js + Supabase SaaS Starter",
    template: "%s | SaaS Starter",
  },
  description:
    "Production-ready SaaS starter kit with authentication, multi-tenant organizations, Stripe billing, usage-based credits, i18n, and an optional B2B marketplace module.",
  openGraph: {
    title: "Next.js + Supabase SaaS Starter",
    description:
      "Ship your SaaS in days, not months. Auth, billing, teams, and optional feature modules like marketplace.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js + Supabase SaaS Starter",
    description:
      "Ship your SaaS in days, not months. Auth, billing, teams, and optional feature modules like marketplace.",
  },
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const cookieConsentEnabled = isFeatureModuleEnabledInCode("cookieConsent")
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as "en" | "de")) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Get messages for the current locale
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={`${geistSans.className} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {cookieConsentEnabled ? (
            <CookieConsentProvider>
              {children}
              <CookieConsentBanner />
            </CookieConsentProvider>
          ) : (
            children
          )}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
