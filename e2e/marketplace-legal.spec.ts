import { expect, test } from "@playwright/test"
import { enableConsoleLogs } from "./helpers"

test.describe("Marketplace legal pages", () => {
  test("@smoke marketplace terms page loads", async ({ page }) => {
    enableConsoleLogs(page)

    await page.goto("/marketplace-terms")
    await page.waitForLoadState("networkidle")

    // Should display marketplace terms content
    await expect(
      page.getByRole("heading", {
        name: /Marketplace Terms & Conditions|Marktplatz-Nutzungsbedingungen/,
      })
    ).toBeVisible({ timeout: 10000 })
  })

  test("marketplace terms link is in footer", async ({ page }) => {
    enableConsoleLogs(page)

    await page.goto("/")
    await page.waitForLoadState("networkidle")

    // Footer should contain marketplace terms link
    const footer = page.locator("footer")
    await expect(
      footer
        .locator("text=Marketplace Terms")
        .or(footer.locator("text=Marktplatz-AGB"))
    ).toBeVisible({ timeout: 10000 })
  })

  test("marketplace dashboard requires auth", async ({ page }) => {
    enableConsoleLogs(page)

    await page.goto("/marketplace")
    await page.waitForLoadState("networkidle")

    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 })
  })
})
