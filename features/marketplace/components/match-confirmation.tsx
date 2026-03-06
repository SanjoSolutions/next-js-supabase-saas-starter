"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { confirmMatch, rejectMatch } from "@/features/marketplace/actions/matches"

interface MatchConfirmationProps {
  matchId: string
  organizationId: string
  matchStatus: string
}

export function MatchConfirmation({
  matchId,
  organizationId,
  matchStatus,
}: MatchConfirmationProps) {
  const t = useTranslations("marketplace.matches")
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading("confirm")
    try {
      await confirmMatch(matchId, organizationId)
      router.refresh()
    } catch (error) {
      console.error("Confirm error:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleReject = async () => {
    setLoading("reject")
    try {
      await rejectMatch(matchId, organizationId)
      router.refresh()
    } catch (error) {
      console.error("Reject error:", error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleConfirm}
        disabled={loading !== null}
      >
        {loading === "confirm" ? t("confirming") : t("confirm")}
      </Button>
      <Button
        variant="destructive"
        onClick={handleReject}
        disabled={loading !== null}
      >
        {loading === "reject" ? t("rejecting") : t("reject")}
      </Button>
      {(matchStatus === "buyer_confirmed" || matchStatus === "seller_confirmed") && (
        <p className="text-sm text-muted-foreground self-center">
          {t("waitingForOther")}
        </p>
      )}
    </div>
  )
}
