import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000"

  const staticPages = [
    "",
    "/auth/login",
    "/auth/sign-up",
    "/legal-notice",
    "/privacy-policy",
    "/terms",
    "/marketplace-terms",
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const locale of routing.locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.5,
      })
    }
  }

  return entries
}
