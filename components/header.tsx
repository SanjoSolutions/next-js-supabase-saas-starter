import { AuthButton } from "@/components/auth-button"
import { EnvVarWarning } from "@/components/env-var-warning"
import { createClient } from "@/lib/supabase/server"
import { hasEnvVars } from "@/lib/utils"
import { cookies } from "next/headers"
import Link from "next/link"
import { Suspense } from "react"
import { OrgSwitcher } from "./org-switcher"

export async function Header() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  // Get organizations where the user is a member
  const { data: memberships } = user 
    ? await supabase
        .from("memberships")
        .select("organizations!inner(id, name)")
        .eq("user_id", user.sub)
    : { data: null }

  const organizations = memberships?.map(m => m.organizations).filter(Boolean) || null

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}>Next.js Supabase Starter</Link>
          {user && (
            <div className="flex items-center gap-4 ml-4 font-normal">
              <Suspense fallback={<div className="h-8 w-32 bg-accent animate-pulse rounded" />}>
                {organizations && organizations.length > 0 && (
                  <OrgSwitcher organizations={organizations} activeOrgId={activeOrgId} />
                )}
              </Suspense>
              {organizations && organizations.length > 0 && (
                <>
                  <Link
                    href={"/invites/new"}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Invite
                  </Link>
                  {activeOrgId && (
                    <Link
                      href={`/organizations/${activeOrgId}/members`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Members
                    </Link>
                  )}
                </>
              )}
              <Link
                href={"/organizations/new"}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Create Organization
              </Link>
            </div>
          )}
        </div>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense fallback={<div className="h-8 w-20 bg-accent animate-pulse rounded" />}>
            <AuthButton />
          </Suspense>
        )}
      </div>
    </nav>
  )
}
