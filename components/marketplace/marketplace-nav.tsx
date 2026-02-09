"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ListOrdered,
  GitCompareArrows,
  FileText,
  AlertTriangle,
} from "lucide-react"

export function MarketplaceNav() {
  const t = useTranslations("marketplace.nav")
  const pathname = usePathname()

  const links = [
    {
      href: "/marketplace",
      label: t("dashboard"),
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: "/marketplace/listings",
      label: t("listings"),
      icon: ListOrdered,
    },
    {
      href: "/marketplace/matches",
      label: t("matches"),
      icon: GitCompareArrows,
    },
    {
      href: "/marketplace/contracts",
      label: t("contracts"),
      icon: FileText,
    },
    {
      href: "/marketplace/disputes/new",
      label: t("disputes"),
      icon: AlertTriangle,
    },
  ]

  return (
    <nav className="flex gap-1 border-b pb-2 mb-6 overflow-x-auto">
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{link.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
