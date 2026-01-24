import { Header } from "@/components/header"
import { InviteForm } from "@/components/invite-form"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function Page() {
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  if (!activeOrgId) {
    redirect("/protected")
  }

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <Header />
        <div className="flex-1 w-full flex flex-col gap-20 items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <InviteForm activeOrgId={activeOrgId} />
          </div>
        </div>
      </div>
    </main>
  )
}
