"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createDispute } from "@/actions/marketplace/disputes"

interface DisputeFormProps {
  organizationId: string
  contracts: Array<{
    id: string
    tracking_code: string
    counterparty_name: string
    status: string
  }>
}

export function DisputeForm({ organizationId, contracts }: DisputeFormProps) {
  const t = useTranslations("marketplace.disputes")
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [contractId, setContractId] = useState("")
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contractId) return

    setLoading(true)
    setError(null)

    try {
      const dispute = await createDispute({
        contractId,
        organizationId,
        reason,
        description,
      })
      router.push(`/marketplace/disputes/${dispute.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("form.error"))
    } finally {
      setLoading(false)
    }
  }

  if (contracts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("form.noContracts")}
        </CardContent>
      </Card>
    )
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

          <div className="space-y-2">
            <Label htmlFor="contract">{t("form.contract")}</Label>
            <select
              id="contract"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              required
            >
              <option value="">{t("form.selectContract")}</option>
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tracking_code} - {c.counterparty_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{t("form.reason")}</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("form.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
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
