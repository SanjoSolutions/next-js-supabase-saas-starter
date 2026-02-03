import { expect, test } from "@playwright/test"
import {
    createOrganization,
    enableConsoleLogs,
    generateTestEmail,
    signUp
} from "./helpers"

test.describe("Notification System", () => {
  test("should display notification center in header", async ({ page }) => {
    const email = generateTestEmail("notif")
    const password = "password123"

    enableConsoleLogs(page)

    // Sign up and create org
    await signUp(page, { email, firstName: "NotifUser", password })
    await page.waitForURL(/\/protected/)
    await createOrganization(page, "Notif Org")
    await page.waitForURL(/\/organizations\/.*\/welcome/)

    // Verify notification bell is visible (supports English and German)
    const bellBtn = page.getByLabel("Notifications").or(page.getByLabel("Benachrichtigungen"))
    await expect(bellBtn).toBeVisible()

    // Click the bell icon to open dropdown
    await bellBtn.click()

    // Verify the dropdown content appears (menu is open with notifications title)
    await expect(page.getByRole("menu", { name: "Notifications" }).or(page.getByRole("menu", { name: "Benachrichtigungen" }))).toBeVisible()

    // Verify "No notifications yet" is shown for a new user (supports English and German)
    await expect(page.locator("text=No notifications yet").or(page.locator("text=Noch keine Benachrichtigungen"))).toBeVisible()
  })

  test("should show notification bell without badge when no unread notifications", async ({ page }) => {
    const email = generateTestEmail("nobadge")
    const password = "password123"

    enableConsoleLogs(page)

    await signUp(page, { email, firstName: "NoBadgeUser", password })
    await page.waitForURL(/\/protected/)
    await createOrganization(page, "No Badge Org")
    await page.waitForURL(/\/organizations\/.*\/welcome/)

    // Bell should be visible (supports English and German)
    const bellBtn = page.getByLabel("Notifications").or(page.getByLabel("Benachrichtigungen"))
    await expect(bellBtn).toBeVisible()

    // Unread badge should NOT be visible (no notifications) - supports English and German
    await expect(page.getByLabel(/unread notifications/).or(page.getByLabel(/ungelesene Benachrichtigungen/))).not.toBeVisible()
  })
})
