import { expect, test } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import {
  createOrganization,
  enableConsoleLogs,
  generateTestEmail,
  login,
  signUp,
} from "./helpers"

/**
 * Helper to enable advanced_analytics feature flag for an organization
 */
async function enableActivityDashboard(orgId: string): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("Skipping feature flag enable: Missing env vars")
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Get the feature flag ID
  const { data: flag } = await supabase
    .from("feature_flags")
    .select("id")
    .eq("name", "advanced_analytics")
    .single()

  if (!flag) {
    console.log("advanced_analytics feature flag not found")
    return
  }

  // Enable it for the organization
  const { error } = await supabase
    .from("organization_features")
    .upsert({
      organization_id: orgId,
      feature_flag_id: flag.id,
      is_enabled: true,
    })

  if (error) {
    console.log("Error enabling feature flag:", error)
  } else {
    console.log("Enabled advanced_analytics for org:", orgId)
  }
}

/**
 * Helper to insert test activity logs
 */
async function insertTestActivityLogs(orgId: string): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  await supabase.from("activity_logs").insert([
    {
      organization_id: orgId,
      actor_email: "admin@example.com",
      activity_type: "member_joined",
      title: "Member joined",
      description: "admin@example.com joined the organization",
      metadata: { role: "owner" },
    },
    {
      organization_id: orgId,
      actor_email: "admin@example.com",
      activity_type: "member_invited",
      title: "Invitation sent",
      description: "admin@example.com invited newuser@example.com",
      metadata: { invited_email: "newuser@example.com" },
    },
    {
      organization_id: orgId,
      actor_email: "System",
      activity_type: "subscription_created",
      title: "Upgraded to Pro",
      description: "Plan changed from free to pro",
      metadata: { old_plan: "free", new_plan: "pro" },
    },
  ])
}

test.describe("Activity Dashboard", () => {
  test("should show upgrade prompt for free plan users", async ({ page }) => {
    enableConsoleLogs(page)

    const email = generateTestEmail("activity-free")
    const password = "password123"

    // Sign up and create org
    await signUp(page, { email, firstName: "FreeUser", password })
    await login(page, email, password)
    await createOrganization(page, "Free Org")

    // Wait for welcome page and extract org ID
    await page.waitForURL(/\/organizations\/.*\/welcome/)
    const url = page.url()
    const orgId = url.split("/organizations/")[1].split("/")[0]
    console.log("Created org ID:", orgId)

    // Navigate to activity page (feature flag NOT enabled)
    await page.goto(`/organizations/${orgId}/activity`)
    await page.waitForLoadState("networkidle")

    // Should show upgrade prompt (CardTitle renders as div, not h3)
    // Support both English and German
    await expect(page.getByText("Activity Dashboard", { exact: true }).or(page.getByText("Aktivitäts-Dashboard", { exact: true }))).toBeVisible()
    await expect(page.getByRole("link", { name: "Upgrade to Pro" }).or(page.getByRole("link", { name: "Zu Pro wechseln" }))).toBeVisible()
    await expect(page.getByText("complete audit log").or(page.getByText("vollständiges Protokoll"))).toBeVisible()
  })

  test("should display activity logs for Pro users", async ({ page }) => {
    test.setTimeout(60000)
    enableConsoleLogs(page)

    const email = generateTestEmail("activity-pro")
    const password = "password123"

    // Sign up and create org
    await signUp(page, { email, firstName: "ProUser", password })
    await login(page, email, password)
    await createOrganization(page, "Pro Org")

    // Wait for welcome page and extract org ID
    await page.waitForURL(/\/organizations\/.*\/welcome/)
    const url = page.url()
    const orgId = url.split("/organizations/")[1].split("/")[0]
    console.log("Created org ID:", orgId)

    // Enable feature flag and insert test data
    await enableActivityDashboard(orgId)
    await insertTestActivityLogs(orgId)

    // Navigate to activity page
    await page.goto(`/organizations/${orgId}/activity`)
    await page.waitForLoadState("networkidle")

    // Should show activity dashboard with logs (CardTitle renders as div, not h3)
    // Support both English and German
    await expect(page.getByText("Activity Dashboard", { exact: true }).or(page.getByText("Aktivitäts-Dashboard", { exact: true }))).toBeVisible()

    // Verify activity logs are displayed (use first() since there can be multiple with same text)
    // Support both English and German activity type translations
    await expect(page.getByText("Member Joined").or(page.getByText("Mitglied beigetreten")).first()).toBeVisible()
    await expect(page.getByText("Member Invited").or(page.getByText("Mitglied eingeladen")).first()).toBeVisible()
    await expect(page.getByText("Subscription Created").or(page.getByText("Abonnement erstellt")).first()).toBeVisible()

    // Verify table structure (supports English and German headers)
    await expect(page.locator("th:has-text('Event')").or(page.locator("th:has-text('Ereignis')"))).toBeVisible()
    await expect(page.locator("th:has-text('Actor')").or(page.locator("th:has-text('Akteur')"))).toBeVisible()
    await expect(page.locator("th:has-text('Details')")).toBeVisible()
    await expect(page.locator("th:has-text('Time')").or(page.locator("th:has-text('Zeit')"))).toBeVisible()
  })

  test("should show Activity link in user menu only when feature enabled", async ({ page }) => {
    enableConsoleLogs(page)

    const email = generateTestEmail("activity-nav")
    const password = "password123"

    // Sign up and create org
    await signUp(page, { email, firstName: "NavUser", password })
    await login(page, email, password)
    await createOrganization(page, "Nav Org")

    await page.waitForURL(/\/organizations\/.*\/welcome/)
    const url = page.url()
    const orgId = url.split("/organizations/")[1].split("/")[0]

    // Open user menu
    await page.locator("nav button").last().click()
    await page.waitForTimeout(300)

    // Activity link should NOT be visible (feature not enabled) - support English and German
    await expect(page.getByRole("menuitem", { name: "Activity" }).or(page.getByRole("menuitem", { name: "Aktivität" }))).not.toBeVisible()

    // Members and Billing links should be visible in the menu - support English and German
    await expect(page.getByRole("menuitem", { name: "Members" }).or(page.getByRole("menuitem", { name: "Mitglieder" }))).toBeVisible()
    await expect(page.getByRole("menuitem", { name: "Billing" }).or(page.getByRole("menuitem", { name: "Abrechnung" }))).toBeVisible()

    // Close menu
    await page.keyboard.press("Escape")

    // Enable feature flag
    await enableActivityDashboard(orgId)

    // Reload and check Activity link appears in user menu
    await page.reload()
    await page.waitForLoadState("networkidle")

    // Open user menu again
    await page.locator("nav button").last().click()
    await page.waitForTimeout(300)

    // Now Activity link should be visible - support English and German
    await expect(page.getByRole("menuitem", { name: "Activity" }).or(page.getByRole("menuitem", { name: "Aktivität" }))).toBeVisible()
  })

  test("should record member join activity automatically", async ({ page }) => {
    test.setTimeout(60000)
    enableConsoleLogs(page)

    const email = generateTestEmail("activity-trigger")
    const password = "password123"

    // Sign up and create org
    await signUp(page, { email, firstName: "TriggerUser", password })

    // Wait briefly for signup to complete, then check if we need to login
    await page.waitForTimeout(1000)

    // If already redirected to protected page after signup, skip login
    if (!page.url().includes("/protected")) {
      await login(page, email, password)
    }

    await createOrganization(page, "Trigger Org")

    await page.waitForURL(/\/organizations\/.*\/welcome/)
    const url = page.url()
    const orgId = url.split("/organizations/")[1].split("/")[0]

    // Enable feature flag
    await enableActivityDashboard(orgId)

    // Navigate to activity page
    await page.goto(`/organizations/${orgId}/activity`)
    await page.waitForLoadState("networkidle")

    // The trigger should have recorded the owner joining when org was created
    // Look for "Member Joined" activity (supports English and German)
    await expect(page.locator("text=Member Joined").or(page.locator("text=Mitglied beigetreten"))).toBeVisible()
  })
})
