import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const nextConfig: NextConfig = {
  // cacheComponents: true, // Temporarily disabled for build compatibility
}

export default withNextIntl(nextConfig)
