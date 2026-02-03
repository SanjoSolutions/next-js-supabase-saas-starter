import { expect, test } from "@playwright/test"
import { generateTestEmail, signUp } from "./helpers"

test("should sign up with first name and display it", async ({ page }) => {
  const email = generateTestEmail("firstname")
  const firstName = "Test User"

  await signUp(page, { email, firstName })

  // Wait for navigation to protected (skipped confirmation)
  await expect(page).toHaveURL(/\/protected/, { timeout: 10000 })

  // Verify first name is stored in user metadata (shown in the user details JSON)
  // The JSON contains "first_name": "Test User"
  await expect(page.locator(`text=first_name`)).toBeVisible()
  await expect(page.locator(`text=${firstName}`)).toBeVisible()
})
