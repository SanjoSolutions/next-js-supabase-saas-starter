"use server"

import {
  addCredits,
  deductCredits,
  getBalance,
  getTransactions,
} from "@/features/credits/lib"
import { isFeatureModuleEnabledInCode } from "@/features/config"
import { requireOrgMember } from "@/lib/auth"
import { cookies } from "next/headers"

async function getActiveOrgId() {
  const cookieStore = await cookies()
  return cookieStore.get("active_org_id")?.value
}

export async function getCreditsBalance() {
  if (!isFeatureModuleEnabledInCode("credits")) {
    return 0
  }

  const orgId = await getActiveOrgId()
  if (!orgId) return 0
  await requireOrgMember(orgId)
  return getBalance(orgId)
}

export async function getCreditsTransactions(limit = 20) {
  if (!isFeatureModuleEnabledInCode("credits")) {
    return []
  }

  const orgId = await getActiveOrgId()
  if (!orgId) return []
  await requireOrgMember(orgId)
  return getTransactions(orgId, limit)
}

export async function useCredits(amount: number, description: string) {
  if (!isFeatureModuleEnabledInCode("credits")) {
    throw new Error("Credits feature is disabled")
  }

  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error("No active organization")
  await requireOrgMember(orgId)
  return deductCredits(orgId, amount, description)
}

export async function purchaseCredits(amount: number, referenceId: string) {
  if (!isFeatureModuleEnabledInCode("credits")) {
    throw new Error("Credits feature is disabled")
  }

  const orgId = await getActiveOrgId()
  if (!orgId) throw new Error("No active organization")
  const { membership } = await requireOrgMember(orgId)

  if (membership.role !== "owner" && membership.role !== "admin") {
    throw new Error("Only owners or admins can purchase credits")
  }

  return addCredits(orgId, amount, "Credit purchase", referenceId)
}
