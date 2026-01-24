"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export default function NavLink({
  href,
  children,
  className = "",
}: NavLinkProps) {
  const pathname = usePathname() || "/"
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
  const classes = `${className ? className + " " : ""}${isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"} transition-colors`

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
