import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import { notFound } from "next/navigation"
import { CookieConsentProvider } from "@/components/cookie-consent/cookie-consent-provider"
import { CookieConsentBanner } from "@/components/cookie-consent/cookie-consent-banner"
import { routing } from "@/i18n/routing"
import "../globals.css"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: {
    default: "Next.js + Supabase SaaS Starter",
    template: "%s | SaaS Starter",
  },
  description:
    "Production-ready SaaS starter kit with authentication, multi-tenant organizations, Stripe billing, usage-based credits, i18n, and a full B2B marketplace module.",
  openGraph: {
    title: "Next.js + Supabase SaaS Starter",
    description:
      "Ship your SaaS in days, not months. Auth, billing, teams, marketplace, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next.js + Supabase SaaS Starter",
    description:
      "Ship your SaaS in days, not months. Auth, billing, teams, marketplace, and more.",
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
          <CookieConsentProvider>
            {children}
            <CookieConsentBanner />
          </CookieConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
