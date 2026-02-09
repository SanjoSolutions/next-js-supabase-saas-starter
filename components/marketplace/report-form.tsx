"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createContentReport } from "@/actions/marketplace/reports"

export function ReportForm() {
  const t = useTranslations("marketplace.reports")
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [listingId, setListingId] = useState("")
  const [reportType, setReportType] = useState<"illegal_content" | "fraud" | "misleading" | "other">("other")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await createContentReport({
        listingId: listingId || undefined,
        reportType,
        description,
      })
      setSuccess(true)
      setDescription("")
      setListingId("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("form.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("form.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 text-green-600 p-3 rounded-md text-sm">
              {t("form.success")}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="listingId">{t("form.listingId")}</Label>
            <Input
              id="listingId"
              value={listingId}
              onChange={(e) => setListingId(e.target.value)}
              placeholder={t("form.optional")}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("form.type")}</Label>
            <div className="flex gap-2 flex-wrap">
              {(["illegal_content", "fraud", "misleading", "other"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={reportType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setReportType(type)}
                >
                  {t(`types.${type}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportDescription">{t("form.description")}</Label>
            <Textarea
              id="reportDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? t("form.submitting") : t("form.submit")}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
