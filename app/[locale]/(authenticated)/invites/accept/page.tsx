"use client"

import { InviteAcceptContent } from "@/components/invite-accept-content"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Suspense } from "react"

function InviteContent() {
  const t = useTranslations("invites.accept")
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  if (!token) {
    return <div>{t("notFound")}</div>
  }

  return <InviteAcceptContent token={token} />
}

export default function AcceptInvitePage() {
  const t = useTranslations("invites.accept")

  return (
    <div className="flex-1 flex items-center justify-center">
      <Suspense fallback={<div>{t("loading")}</div>}>
        <InviteContent />
      </Suspense>
    </div>
  )
}
