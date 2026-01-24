"use server"

import { cookies } from "next/headers"

export async function setActiveOrganizationAction(orgId: string) {
  const cookieStore = await cookies()
  cookieStore.set("active_org_id", orgId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
}
