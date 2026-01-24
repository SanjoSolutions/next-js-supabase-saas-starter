import { Header } from "@/components/header"
import { InviteAcceptContent } from "@/components/invite-accept-content"
import { Suspense } from "react"

export default function AcceptInvitePage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteContentWrapper {...props} />
    </Suspense>
  )
}

async function AcceptInviteContentWrapper({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          {!token ? (
            <div>Invalid invite link.</div>
          ) : (
            <InviteAcceptContent token={token} />
          )}
        </div>
      </div>
    </main>
  )
}
