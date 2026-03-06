import { getTranslations } from "next-intl/server"
import { P2bComplaintForm } from "@/features/marketplace/components/p2b-complaint-form"

export default async function P2bComplaintPage() {
  const t = await getTranslations("legal.p2b")

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">{t("title")}</h1>
      <p className="text-muted-foreground mb-8">{t("description")}</p>
      <P2bComplaintForm />
    </div>
  )
}
