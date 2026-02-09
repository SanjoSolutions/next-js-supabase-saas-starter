"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPaymentForContract } from "@/actions/marketplace/payments"

interface PaymentFormProps {
  contractId: string
  grossCents: number
}

export function PaymentForm({ contractId, grossCents }: PaymentFormProps) {
  const t = useTranslations("marketplace.payments")
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePay = async () => {
    setLoading(true)
    setError(null)

    try {
      const { clientSecret } = await createPaymentForContract(contractId)

      // In a full implementation, use Stripe Elements here with the clientSecret
      // For now, we redirect to the contract page with a note
      if (clientSecret) {
        // The payment intent was created — in production, you'd mount Stripe Elements
        // and confirm the payment. For now, this creates the PaymentIntent server-side.
        router.push(`/marketplace/contracts/${contractId}?payment_initiated=true`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
            {error}
          </div>
        )}
        <p className="text-sm text-muted-foreground">{t("description")}</p>
        <Button onClick={handlePay} disabled={loading} className="w-full">
          {loading ? t("processing") : t("payNow", { amount: (grossCents / 100).toFixed(2) })}
        </Button>
      </CardContent>
    </Card>
  )
}
