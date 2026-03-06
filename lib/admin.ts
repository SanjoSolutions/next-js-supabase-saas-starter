import { requireUser } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Checks if the current user is a super-admin.
 * Admin user IDs are defined in the ADMIN_USER_IDS env var (comma-separated).
 * Redirects to /protected if the user is not an admin.
 * Returns the user object.
 */
export async function requireAdmin() {
  const user = await requireUser()

  const adminUserIds = process.env.ADMIN_USER_IDS?.split(",").map((id) =>
    id.trim()
  ) ?? []

  if (!adminUserIds.includes(user.id)) {
    redirect("/protected")
  }

  return user
}
