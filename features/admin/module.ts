import type { FeatureModuleDefinition } from "@/features/types"

export const adminFeatureModule = {
  key: "admin",
  name: "Admin Dashboard",
  description: "Platform-wide admin dashboard for operators and internal staff.",
  ownedPaths: [
    "features/admin",
    "app/[locale]/(authenticated)/admin",
  ],
  routePrefixes: ["/admin"],
} satisfies FeatureModuleDefinition
