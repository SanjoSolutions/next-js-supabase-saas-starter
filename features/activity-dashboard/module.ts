import type { FeatureModuleDefinition } from "@/features/types"

export const activityDashboardFeatureModule = {
  key: "activityDashboard",
  flagName: "advanced_analytics",
  name: "Activity Dashboard",
  description: "Organization activity dashboard with audit log browsing and pagination.",
  ownedPaths: [
    "features/activity-dashboard",
    "app/[locale]/(authenticated)/organizations/[id]/activity",
  ],
  routePrefixes: ["/organizations/[id]/activity"],
} satisfies FeatureModuleDefinition
