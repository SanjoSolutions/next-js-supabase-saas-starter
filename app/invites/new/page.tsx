import { Header } from "@/components/header"
import { InviteForm } from "@/components/invite-form"
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

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Suspense fallback={<div className="h-16 w-full border-b" />}>
          <Header />
        </Suspense>
        <div className="flex-1 w-full flex flex-col gap-20 items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <Suspense fallback={<div>Loading form...</div>}>
              <InviteFormWrapper />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  )
}
