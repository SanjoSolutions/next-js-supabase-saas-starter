import { expect, test } from "@playwright/test"

test("should display first name after login", async ({ page }) => {
  await page.goto("/auth/login")
  await page.fill('input[id="email"]', "test@example.com")
  await page.fill('input[id="password"]', "password123")
  await page.click('button:has-text("Login")')
  
  await expect(page).toHaveURL(/\/protected/)
  
  // Verify first name is displayed
  await expect(page.locator("text=Hey, Existing User!")).toBeVisible()
})
