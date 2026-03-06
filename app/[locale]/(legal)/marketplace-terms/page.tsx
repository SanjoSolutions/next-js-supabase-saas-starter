import { isFeatureModuleEnabledInCode } from "@/features/config"
import MarketplaceTermsPage from "@/features/marketplace/routes/legal/marketplace-terms/page"
import { notFound } from "next/navigation"

export default async function MarketplaceTermsPageRoute() {
  if (!isFeatureModuleEnabledInCode("marketplace")) {
    notFound()
  }

  return <MarketplaceTermsPage />
}
