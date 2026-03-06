"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createMarketplaceProfile } from "@/features/marketplace/actions/profile"

interface ProfileSetupFormProps {
  organizationId: string
}

type Step = "role" | "business" | "address" | "contact"

export function ProfileSetupForm({ organizationId }: ProfileSetupFormProps) {
  const t = useTranslations("marketplace.profile")
  const router = useRouter()
  const [step, setStep] = useState<Step>("role")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    marketplaceRole: "" as "buyer" | "seller" | "both" | "",
    businessType: "" as "company" | "sole_proprietor" | "",
    companyName: "",
    taxId: "",
    vatId: "",
    streetAddress: "",
    postalCode: "",
    city: "",
    country: "DE",
    contactEmail: "",
    contactPhone: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.marketplaceRole || !formData.businessType) return

    setLoading(true)
    setError(null)

    try {
      await createMarketplaceProfile({
        organizationId,
        marketplaceRole: formData.marketplaceRole,
        businessType: formData.businessType,
        companyName: formData.companyName,
        taxId: formData.taxId || undefined,
        vatId: formData.vatId || undefined,
        streetAddress: formData.streetAddress,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
      })
      router.push("/marketplace")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"))
    } finally {
      setLoading(false)
    }
  }

  const steps: Step[] = ["role", "business", "address", "contact"]
  const currentIndex = steps.indexOf(step)

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{t("setup.title")}</CardTitle>
        <CardDescription>
          {t("setup.step", { current: currentIndex + 1, total: steps.length })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        {step === "role" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{t("setup.roleDescription")}</p>
            <div className="grid gap-3">
              {(["buyer", "seller", "both"] as const).map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant={formData.marketplaceRole === role ? "default" : "outline"}
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => updateField("marketplaceRole", role)}
                >
                  <div className="text-left">
                    <div className="font-medium">{t(`setup.roles.${role}`)}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {t(`setup.roles.${role}Description`)}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <Button
              onClick={() => setStep("business")}
              disabled={!formData.marketplaceRole}
              className="w-full"
            >
              {t("setup.next")}
            </Button>
          </div>
        )}

        {step === "business" && (
          <div className="space-y-4">
            <div className="grid gap-3">
              {(["company", "sole_proprietor"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={formData.businessType === type ? "default" : "outline"}
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => updateField("businessType", type)}
                >
                  {t(`setup.businessTypes.${type}`)}
                </Button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">{t("setup.companyName")}</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => updateField("companyName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxId">{t("setup.taxId")}</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => updateField("taxId", e.target.value)}
                placeholder={t("setup.optional")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vatId">{t("setup.vatId")}</Label>
              <Input
                id="vatId"
                value={formData.vatId}
                onChange={(e) => updateField("vatId", e.target.value)}
                placeholder={t("setup.optional")}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("role")} className="flex-1">
                {t("setup.back")}
              </Button>
              <Button
                onClick={() => setStep("address")}
                disabled={!formData.businessType || !formData.companyName}
                className="flex-1"
              >
                {t("setup.next")}
              </Button>
            </div>
          </div>
        )}

        {step === "address" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="streetAddress">{t("setup.streetAddress")}</Label>
              <Input
                id="streetAddress"
                value={formData.streetAddress}
                onChange={(e) => updateField("streetAddress", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t("setup.postalCode")}</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t("setup.city")}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">{t("setup.country")}</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateField("country", e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("business")} className="flex-1">
                {t("setup.back")}
              </Button>
              <Button
                onClick={() => setStep("contact")}
                disabled={!formData.streetAddress || !formData.postalCode || !formData.city}
                className="flex-1"
              >
                {t("setup.next")}
              </Button>
            </div>
          </div>
        )}

        {step === "contact" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">{t("setup.contactEmail")}</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">{t("setup.contactPhone")}</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                placeholder={t("setup.optional")}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep("address")} className="flex-1">
                {t("setup.back")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.contactEmail}
                className="flex-1"
              >
                {loading ? t("setup.saving") : t("setup.submit")}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
