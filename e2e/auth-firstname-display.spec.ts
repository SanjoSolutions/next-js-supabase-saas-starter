import { expect, test } from "@playwright/test"
import { loginAsTestUser, TEST_USER } from "./helpers"

test("should display first name after login", async ({ page }) => {
  await loginAsTestUser(page)
  
  // Verify first name is displayed
  await expect(page.locator(`text=Hey, ${TEST_USER.firstName}!`)).toBeVisible()
})
