import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const CREDIT_COSTS = {
  message: 10,
  apiCall: 5,
  export: 20,
} as const

export type CreditTransactionType =
  | "purchase"
  | "usage"
  | "refund"
  | "bonus"
  | "adjustment"

/**
 * Get the credit balance for an organization.
 */
export async function getBalance(organizationId: string): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("credits")
    .select("balance")
    .eq("organization_id", organizationId)
    .single()

  if (error) {
    console.error("Error fetching credit balance:", error)
    return 0
  }

  return data?.balance ?? 0
}

/**
 * Atomically deduct credits from an organization.
 * Returns { success, balance } — balance is -1 if insufficient funds.
 */
export async function deductCredits(
  organizationId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; balance: number }> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc("deduct_credits", {
    org_id: organizationId,
    amount,
    description,
  })

  if (error) {
    console.error("Error deducting credits:", error)
    return { success: false, balance: -1 }
  }

  const newBalance = data as number
  return {
    success: newBalance >= 0,
    balance: newBalance,
  }
}

/**
 * Atomically add credits to an organization.
 * Returns the new balance.
 */
export async function addCredits(
  organizationId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<number> {
  const admin = createAdminClient()
  const { data, error } = await admin.rpc("add_credits", {
    org_id: organizationId,
    amount,
    description,
    ref_id: referenceId ?? null,
  })

  if (error) {
    console.error("Error adding credits:", error)
    return -1
  }

  return data as number
}

/**
 * Get recent credit transactions for an organization.
 */
export async function getTransactions(
  organizationId: string,
  limit = 20
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching transactions:", error)
    return []
  }

  return data ?? []
}
