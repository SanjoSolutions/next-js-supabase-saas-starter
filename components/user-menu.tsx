"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Users,
  Settings,
  CreditCard,
  Activity,
  UserPlus,
  Plus,
  LogOut,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface UserMenuProps {
  user: {
    email?: string
    user_metadata?: {
      first_name?: string
    }
  }
  activeOrgId?: string
  hasActivityDashboard?: boolean
}

export function UserMenu({
  user,
  activeOrgId,
  hasActivityDashboard,
}: UserMenuProps) {
  const t = useTranslations()
  const router = useRouter()

  const firstName = user.user_metadata?.first_name
  const email = user.email || ""
  const initials = firstName
    ? firstName.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {firstName && (
              <p className="text-sm font-medium leading-none">{firstName}</p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {activeOrgId && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/organizations/${activeOrgId}/members`)
                }
              >
                <Users className="mr-2 h-4 w-4" />
                <span>{t("nav.members")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/invites/new")}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>{t("nav.invite")}</span>
              </DropdownMenuItem>
              {hasActivityDashboard && (
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/organizations/${activeOrgId}/activity`)
                  }
                >
                  <Activity className="mr-2 h-4 w-4" />
                  <span>{t("nav.activity")}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/organizations/${activeOrgId}/billing`)
                }
              >
                <CreditCard className="mr-2 h-4 w-4" />
                <span>{t("nav.billing")}</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/organizations/new")}>
            <Plus className="mr-2 h-4 w-4" />
            <span>{t("nav.createOrganization")}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t("auth.button.logout")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
