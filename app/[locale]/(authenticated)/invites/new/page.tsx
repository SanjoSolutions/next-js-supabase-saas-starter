import { InviteForm } from "@/components/invite-form"
import { requireUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Suspense } from "react"

async function InviteFormWrapper() {
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  if (!activeOrgId) {
    redirect("/protected")
  }

  return <InviteForm activeOrgId={activeOrgId} />
}

export default async function Page() {
  await requireUser()
  
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div>Loading form...</div>}>
          <InviteFormWrapper />
        </Suspense>
      </div>
    </div>
  )
}
