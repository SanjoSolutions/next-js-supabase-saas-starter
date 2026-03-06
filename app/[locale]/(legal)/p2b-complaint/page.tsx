import { isFeatureModuleEnabledInCode } from "@/features/config"
import P2bComplaintPage from "@/features/marketplace/routes/legal/p2b-complaint/page"
import { notFound } from "next/navigation"

export default async function P2bComplaintPageRoute() {
  if (!isFeatureModuleEnabledInCode("marketplace")) {
    notFound()
  }

  return <P2bComplaintPage />
}
