import { getFeatureModule, type FeatureModuleKey } from "@/features/registry"

// Enable optional feature bundles here when you want them included in the app shell.
export const ENABLED_FEATURE_MODULES: FeatureModuleKey[] = []

export function isFeatureModuleEnabledInCode(featureModule: FeatureModuleKey) {
  const featureDefinition = getFeatureModule(featureModule)
  return (
    featureDefinition.defaultEnabled ||
    ENABLED_FEATURE_MODULES.includes(featureModule)
  )
}
