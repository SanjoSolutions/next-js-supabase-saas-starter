"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PriceDisplay } from "@/components/marketplace/price-display"
import { createListing } from "@/actions/marketplace/listings"

interface ListingFormProps {
  organizationId: string
  marketplaceRole: string
}

export function ListingForm({ organizationId, marketplaceRole }: ListingFormProps) {
  const t = useTranslations("marketplace.listings")
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    listingType: marketplaceRole === "seller" ? "offer" : "request" as "request" | "offer",
    title: "",
    description: "",
    pickupStreet: "",
    pickupPostalCode: "",
    pickupCity: "",
    deliveryStreet: "",
    deliveryPostalCode: "",
    deliveryCity: "",
    packageSize: "small" as "small" | "medium" | "large" | "pallet",
    packageWeightKg: "",
    packageDescription: "",
    priceMinEur: "",
    priceMaxEur: "",
    deliveryDate: "",
    deliveryTimeStart: "",
    deliveryTimeEnd: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const priceMinCents = Math.round(parseFloat(formData.priceMinEur || "0") * 100)
  const priceMaxCents = Math.round(parseFloat(formData.priceMaxEur || "0") * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const expiresAt = new Date(formData.deliveryDate)
      expiresAt.setDate(expiresAt.getDate() + 1)

      if (priceMinCents > priceMaxCents) {
        setError(t("form.priceMinExceedsMax"))
        setLoading(false)
        return
      }

      await createListing({
        organizationId,
        listingType: formData.listingType,
        title: formData.title,
        description: formData.description || undefined,
        pickupStreet: formData.pickupStreet,
        pickupPostalCode: formData.pickupPostalCode,
        pickupCity: formData.pickupCity,
        deliveryStreet: formData.deliveryStreet,
        deliveryPostalCode: formData.deliveryPostalCode,
        deliveryCity: formData.deliveryCity,
        packageSize: formData.packageSize,
        packageWeightKg: formData.packageWeightKg
          ? parseFloat(formData.packageWeightKg)
          : undefined,
        packageDescription: formData.packageDescription || undefined,
        priceMinCents,
        priceMaxCents,
        deliveryDate: formData.deliveryDate,
        deliveryTimeStart: formData.deliveryTimeStart || undefined,
        deliveryTimeEnd: formData.deliveryTimeEnd || undefined,
        expiresAt: expiresAt.toISOString(),
      })
      router.push("/marketplace/listings")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("form.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("form.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketplaceRole === "both" && (
              <div className="space-y-2">
                <Label>{t("form.listingType")}</Label>
                <div className="flex gap-2">
                  {(["request", "offer"] as const).map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={formData.listingType === type ? "default" : "outline"}
                      onClick={() => updateField("listingType", type)}
                    >
                      {t(`types.${type}`)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">{t("form.title")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("form.description")}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.pickup")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickupStreet">{t("form.street")}</Label>
              <Input
                id="pickupStreet"
                value={formData.pickupStreet}
                onChange={(e) => updateField("pickupStreet", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupPostalCode">{t("form.postalCode")}</Label>
                <Input
                  id="pickupPostalCode"
                  value={formData.pickupPostalCode}
                  onChange={(e) => updateField("pickupPostalCode", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickupCity">{t("form.city")}</Label>
                <Input
                  id="pickupCity"
                  value={formData.pickupCity}
                  onChange={(e) => updateField("pickupCity", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.delivery")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryStreet">{t("form.street")}</Label>
              <Input
                id="deliveryStreet"
                value={formData.deliveryStreet}
                onChange={(e) => updateField("deliveryStreet", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryPostalCode">{t("form.postalCode")}</Label>
                <Input
                  id="deliveryPostalCode"
                  value={formData.deliveryPostalCode}
                  onChange={(e) => updateField("deliveryPostalCode", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryCity">{t("form.city")}</Label>
                <Input
                  id="deliveryCity"
                  value={formData.deliveryCity}
                  onChange={(e) => updateField("deliveryCity", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.packageDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("form.packageSize")}</Label>
              <div className="flex gap-2 flex-wrap">
                {(["small", "medium", "large", "pallet"] as const).map((size) => (
                  <Button
                    key={size}
                    type="button"
                    variant={formData.packageSize === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateField("packageSize", size)}
                  >
                    {t(`packageSizes.${size}`)}
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageWeightKg">{t("form.weight")}</Label>
                <Input
                  id="packageWeightKg"
                  type="number"
                  step="0.1"
                  value={formData.packageWeightKg}
                  onChange={(e) => updateField("packageWeightKg", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="packageDescription">{t("form.packageDescription")}</Label>
              <Input
                id="packageDescription"
                value={formData.packageDescription}
                onChange={(e) => updateField("packageDescription", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("form.priceAndSchedule")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priceMinEur">{t("form.priceMin")}</Label>
                <Input
                  id="priceMinEur"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.priceMinEur}
                  onChange={(e) => updateField("priceMinEur", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceMaxEur">{t("form.priceMax")}</Label>
                <Input
                  id="priceMaxEur"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.priceMaxEur}
                  onChange={(e) => updateField("priceMaxEur", e.target.value)}
                  required
                />
              </div>
            </div>
            {priceMinCents > 0 && (
              <PriceDisplay netCents={priceMinCents} priceMaxCents={priceMaxCents > 0 ? priceMaxCents : undefined} />
            )}
            <div className="space-y-2">
              <Label htmlFor="deliveryDate">{t("form.deliveryDate")}</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={formData.deliveryDate}
                onChange={(e) => updateField("deliveryDate", e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryTimeStart">{t("form.timeStart")}</Label>
                <Input
                  id="deliveryTimeStart"
                  type="time"
                  value={formData.deliveryTimeStart}
                  onChange={(e) => updateField("deliveryTimeStart", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryTimeEnd">{t("form.timeEnd")}</Label>
                <Input
                  id="deliveryTimeEnd"
                  type="time"
                  value={formData.deliveryTimeEnd}
                  onChange={(e) => updateField("deliveryTimeEnd", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t("form.saving") : t("form.submit")}
        </Button>
      </div>
    </form>
  )
}
