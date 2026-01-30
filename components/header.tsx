import { AuthButton } from "@/components/auth-button"
import { EnvVarWarning } from "@/components/env-var-warning"
import { createClient } from "@/lib/supabase/server"
import { hasEnvVars } from "@/lib/utils"
import { cookies } from "next/headers"
import { Suspense } from "react"
import NavLink from "./nav-link"
import { OrgSwitcher } from "./org-switcher"

export async function Header() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  const cookieStore = await cookies()
  const activeOrgId = cookieStore.get("active_org_id")?.value

  // Get organizations where the user is a member
  const { data: memberships } = user
    ? await supabase
        .from("memberships")
        .select("organizations(id, name)")
        .eq("user_id", user.id)
    : { data: null }

  const organizations =
    (memberships
      ?.map((m: any) => m.organizations)
      .filter(Boolean) as any[]) || []

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <NavLink href={"/"} className="font-semibold">
            Next.js Supabase SaaS Starter
          </NavLink>
          {user && (
            <div className="flex items-center gap-4 ml-4 font-normal">
              <Suspense
                fallback={
                  <div className="h-8 w-32 bg-accent animate-pulse rounded" />
                }
              >
                {organizations.length > 0 ? (
                  <OrgSwitcher
                    organizations={organizations}
                    activeOrgId={activeOrgId}
                  />
                ) : null}
              </Suspense>
              {organizations.length > 0 ? (
                <>
                  <NavLink href={"/invites/new"} className="">
                    Invite
                  </NavLink>
                  {activeOrgId && (
                    <>
                      <NavLink
                        href={`/organizations/${activeOrgId}/members`}
                        className=""
                      >
                        Members
                      </NavLink>
                      <NavLink
                        href={`/organizations/${activeOrgId}/billing`}
                        className=""
                      >
                        Billing
                      </NavLink>
                    </>
                  )}
                </>
              ) : null}
              <NavLink href={"/organizations/new"} className="">
                Create Organization
              </NavLink>
            </div>
          )}
        </div>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense
            fallback={
              <div className="h-8 w-20 bg-accent animate-pulse rounded" />
            }
          >
            <AuthButton />
          </Suspense>
        )}
      </div>
    </nav>
  )
}
