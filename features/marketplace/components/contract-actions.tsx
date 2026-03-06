"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { updateContractStatus } from "@/features/marketplace/actions/contracts"

interface ContractActionsProps {
  contractId: string
  organizationId: string
  status: string
  isBuyer: boolean
  isSeller: boolean
}

export function ContractActions({
  contractId,
  organizationId,
  status,
  isBuyer,
  isSeller,
}: ContractActionsProps) {
  const t = useTranslations("marketplace.contracts")
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      await updateContractStatus(contractId, organizationId, newStatus)
      router.refresh()
    } catch (error) {
      console.error("Status update error:", error)
    } finally {
      setLoading(false)
    }
  }

  const actions: { label: string; status: string; variant?: "default" | "destructive" }[] = []

  if (status === "paid" && isSeller) {
    actions.push({ label: t("actions.startWork"), status: "in_progress" })
  }
  if (status === "in_progress" && isSeller) {
    actions.push({ label: t("actions.confirmPickup"), status: "pickup_confirmed" })
  }
  if (status === "pickup_confirmed" && isSeller) {
    actions.push({ label: t("actions.markDelivered"), status: "delivered" })
  }
  if (status === "delivered" && isBuyer) {
    actions.push({ label: t("actions.confirmComplete"), status: "completed" })
  }

  if (actions.length === 0) return null

  return (
    <div className="flex gap-3">
      {actions.map((action) => (
        <Button
          key={action.status}
          variant={action.variant || "default"}
          onClick={() => handleStatusUpdate(action.status)}
          disabled={loading}
        >
          {action.label}
        </Button>
      ))}
      {["paid", "in_progress", "pickup_confirmed", "delivered"].includes(status) && (
        <Button
          variant="outline"
          onClick={() => router.push("/marketplace/disputes/new")}
        >
          {t("actions.fileDispute")}
        </Button>
      )}
    </div>
  )
}
