"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  createConnectOnboardingLink,
  createConnectLoginLink,
} from "@/features/marketplace/actions/stripe-connect"

interface StripeConnectButtonProps {
  organizationId: string
  isOnboarded: boolean
}

export function StripeConnectButton({
  organizationId,
  isOnboarded,
}: StripeConnectButtonProps) {
  const t = useTranslations("marketplace.seller.onboarding")
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const url = isOnboarded
        ? await createConnectLoginLink(organizationId)
        : await createConnectOnboardingLink(organizationId)
      window.location.href = url
    } catch (error) {
      console.error("Stripe Connect error:", error)
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading
        ? t("loading")
        : isOnboarded
          ? t("manageDashboard")
          : t("startOnboarding")}
    </Button>
  )
}
