import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "::1"],
  // cacheComponents: true, // Temporarily disabled for build compatibility
}

export default withNextIntl(nextConfig)
