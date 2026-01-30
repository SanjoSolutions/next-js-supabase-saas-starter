import { createClient } from "@/lib/supabase/server"

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
