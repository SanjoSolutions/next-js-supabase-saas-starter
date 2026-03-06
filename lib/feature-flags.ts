import { createClient } from "@/lib/supabase/server"
import { isFeatureModuleEnabledInCode } from "@/features/config"
import { getFeatureModule, type FeatureModuleKey } from "@/features/registry"

export async function isFeatureEnabled(featureName: string, organizationId?: string) {
  const supabase = await createClient()
  
  // If no org ID is provided, we can't check for overrides, just return default or false
  if (!organizationId) {
    const { data } = await supabase
      .from("feature_flags")
      .select("default_value")
      .eq("name", featureName)
      .single()
    return data?.default_value ?? false
  }

  const { data, error } = await supabase.rpc("is_feature_enabled", {
    org_id: organizationId,
    feature_name: featureName
  })

  if (error) {
    console.error("Error checking feature flag:", error)
    return false
  }

  return !!data
}

export async function isMarketplaceEnabled(organizationId?: string) {
  if (!organizationId) {
    return false
  }

  return isFeatureModuleEnabled("marketplace", organizationId)
}

export async function isFeatureModuleEnabled(
  featureModule: FeatureModuleKey,
  organizationId?: string
) {
  if (!isFeatureModuleEnabledInCode(featureModule)) {
    return false
  }

  const featureDefinition = getFeatureModule(featureModule)
  if (!featureDefinition.flagName) {
    return true
  }

  if (!organizationId) {
    return false
  }

  return isFeatureEnabled(featureDefinition.flagName, organizationId)
}
