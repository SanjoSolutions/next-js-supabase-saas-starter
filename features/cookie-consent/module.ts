import type { FeatureModuleDefinition } from "@/features/types"

export const cookieConsentFeatureModule = {
  key: "cookieConsent",
  flagName: "cookie_consent",
  name: "Cookie Consent",
  description:
    "Cookie consent banner and preference storage for analytics and marketing cookies.",
  defaultEnabled: true,
  ownedPaths: [
    "features/cookie-consent",
    "app/[locale]/layout.tsx",
  ],
} satisfies FeatureModuleDefinition
