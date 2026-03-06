import { expect, test } from "@playwright/test"
import { loginAsTestUser, TEST_USER } from "./helpers"

test("should display first name after login", async ({ page }) => {
  await loginAsTestUser(page)

  // Navigate to protected page which shows user metadata JSON
  await page.goto("/protected")
  await page.waitForLoadState("networkidle")

  // Verify first name is stored in user metadata (shown in the user details JSON on protected page)
  // The JSON contains "first_name": "Existing User"
  await expect(page.locator(`text=first_name`)).toBeVisible()
  await expect(page.locator(`text=${TEST_USER.firstName}`)).toBeVisible()
})
