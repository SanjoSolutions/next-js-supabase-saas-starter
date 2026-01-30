import { InviteAcceptContent } from "@/components/invite-accept-content"

export default async function AcceptInvitePage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await props.searchParams

  return (
    <div className="flex-1 flex items-center justify-center">
      {!token ? (
        <div>Invalid invite link.</div>
      ) : (
        <InviteAcceptContent token={token} />
      )}
    </div>
  )
}
