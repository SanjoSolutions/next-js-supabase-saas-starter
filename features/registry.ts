import type { FeatureModuleDefinition } from "@/features/types"
import { activityDashboardFeatureModule } from "@/features/activity-dashboard/module"
import { adminFeatureModule } from "@/features/admin/module"
import { cookieConsentFeatureModule } from "@/features/cookie-consent/module"
import { creditsFeatureModule } from "@/features/credits/module"
import { marketplaceFeatureModule } from "@/features/marketplace/module"
import { notificationsFeatureModule } from "@/features/notifications/module"

export const FEATURE_MODULES = {
  activityDashboard: activityDashboardFeatureModule,
  admin: adminFeatureModule,
  cookieConsent: cookieConsentFeatureModule,
  credits: creditsFeatureModule,
  marketplace: marketplaceFeatureModule,
  notifications: notificationsFeatureModule,
} satisfies Record<string, FeatureModuleDefinition>

export type FeatureModuleKey = keyof typeof FEATURE_MODULES

export function getFeatureModule(
  key: FeatureModuleKey
): FeatureModuleDefinition {
  return FEATURE_MODULES[key]
}

export function listFeatureModules(): FeatureModuleDefinition[] {
  return Object.values(FEATURE_MODULES)
}
