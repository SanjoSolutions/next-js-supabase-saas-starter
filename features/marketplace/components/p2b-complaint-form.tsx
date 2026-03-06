"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createP2bComplaint } from "@/features/marketplace/actions/p2b"

export function P2bComplaintForm() {
  const t = useTranslations("legal.p2b.form")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [organizationId, setOrganizationId] = useState("")
  const [complaintType, setComplaintType] = useState<"listing_removed" | "account_restricted" | "ranking" | "other">("other")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organizationId) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await createP2bComplaint({
        organizationId,
        complaintType,
        subject,
        description,
      })
      setSuccess(true)
      setSubject("")
      setDescription("")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 text-green-600 p-3 rounded-md text-sm">
              {t("success")}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="orgId">{t("organizationId")}</Label>
            <Input
              id="orgId"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t("type")}</Label>
            <div className="flex gap-2 flex-wrap">
              {(["listing_removed", "account_restricted", "ranking", "other"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={complaintType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setComplaintType(type)}
                >
                  {t(`types.${type}`)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">{t("subject")}</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="p2bDescription">{t("description")}</Label>
            <Textarea
              id="p2bDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? t("submitting") : t("submit")}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}
