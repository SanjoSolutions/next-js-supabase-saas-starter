import { marketplaceFeatureModule } from "@/features/marketplace/module"

export const FEATURE_MODULES = {
  marketplace: marketplaceFeatureModule,
} as const

export type FeatureModuleKey = keyof typeof FEATURE_MODULES

export function getFeatureModule(key: FeatureModuleKey) {
  return FEATURE_MODULES[key]
}

export function listFeatureModules() {
  return Object.values(FEATURE_MODULES)
}
