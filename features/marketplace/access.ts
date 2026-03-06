import { redirect } from "next/navigation"
import { isFeatureModuleEnabled } from "@/lib/feature-flags"

export const MARKETPLACE_DISABLED_ERROR =
  "Marketplace module is not enabled for this organization"

export async function requireMarketplaceAccess(organizationId?: string) {
  if (!organizationId) {
    redirect("/organizations/new")
  }

  const hasAccess = await isFeatureModuleEnabled("marketplace", organizationId)
  if (!hasAccess) {
    redirect("/protected")
  }

  return organizationId
}

export async function assertMarketplaceAccess(organizationId?: string) {
  if (!organizationId) {
    throw new Error("Organization is required")
  }

  const hasAccess = await isFeatureModuleEnabled("marketplace", organizationId)
  if (!hasAccess) {
    throw new Error(MARKETPLACE_DISABLED_ERROR)
  }
}
