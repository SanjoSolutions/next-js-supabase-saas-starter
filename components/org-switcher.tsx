"use client"

import { setActiveOrganizationAction } from "@/app/[locale]/(authenticated)/organizations/actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Check, ChevronsUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslations } from "next-intl"

interface Organization {
  id: string
  name: string
}

interface OrgSwitcherProps {
  organizations: Organization[]
  activeOrgId?: string
}

export function OrgSwitcher({ organizations, activeOrgId }: OrgSwitcherProps) {
  const t = useTranslations("organizations.switcher")
  const router = useRouter()
  const activeOrg = organizations.find((org) => org.id === activeOrgId)
  const [isPending, setIsPending] = useState(false)

  const handleSelect = async (orgId: string) => {
    setIsPending(true)
    try {
      await setActiveOrganizationAction(orgId)
      router.refresh()
    } catch (error) {
      console.error("Failed to switch organization", error)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 px-2 hover:bg-accent"
          disabled={isPending}
        >
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate font-medium">
            {activeOrg?.name || t("select")}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleSelect(org.id)}
            className="flex items-center justify-between"
          >
            <span className="truncate">{org.name}</span>
            {org.id === activeOrgId && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        {organizations.length === 0 && (
          <DropdownMenuItem disabled className="text-muted-foreground italic">
            {t("noOrganizations")}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
