import { expect, test } from "@playwright/test"

test("should sign up with first name and display it", async ({ page }) => {
  const email = `firstname-${Date.now()}@example.com`
  const firstName = "Test User"

  await page.goto("/auth/sign-up")

  // Fill form
  await page.fill('input[id="first-name"]', firstName)
  await page.fill('input[id="email"]', email)
  await page.fill('input[id="password"]', "password123")
  await page.fill('input[id="repeat-password"]', "password123")
  
  // Submit
  await page.click('button:has-text("Sign up")')
  
  // Wait for navigation to protected (skipped confirmation)
  await expect(page).toHaveURL(/\/protected/, { timeout: 10000 })

  // Verify first name is displayed
  await expect(page.locator("text=Hey, Test User!")).toBeVisible()
})
