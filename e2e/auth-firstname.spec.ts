import { expect, test } from "@playwright/test"
import { generateTestEmail, signUp } from "./helpers"

test("should sign up with first name and display it", async ({ page }) => {
  const email = generateTestEmail("firstname")
  const firstName = "Test User"

  await signUp(page, { email, firstName })

  // Wait for navigation to marketplace (default post-login page)
  await expect(page).toHaveURL(/\/marketplace/, { timeout: 10000 })

  // Navigate to protected page which shows user metadata JSON
  await page.goto("/protected")
  await page.waitForLoadState("networkidle")

  // Verify first name is stored in user metadata (shown in the user details JSON)
  // The JSON contains "first_name": "Test User"
  await expect(page.locator(`text=first_name`)).toBeVisible()
  await expect(page.locator(`text=${firstName}`)).toBeVisible()
})
