export { FEATURE_MODULE_STATE } from "@/features/module-state"
import { FEATURE_MODULE_STATE } from "@/features/module-state"
import { getFeatureModule, type FeatureModuleKey } from "@/features/registry"

// Toggle optional feature bundles here when you want them included in the app shell.
// Database-backed modules still need their backing feature flag enabled where applicable.
const _featureModuleState: Record<FeatureModuleKey, boolean> = FEATURE_MODULE_STATE

export function isFeatureModuleEnabledInCode(featureModule: FeatureModuleKey) {
  getFeatureModule(featureModule)
  return _featureModuleState[featureModule]
}
