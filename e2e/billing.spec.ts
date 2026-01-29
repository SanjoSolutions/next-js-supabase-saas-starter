import { expect, test } from "@playwright/test"
import {
  createOrganization,
  enableConsoleLogs,
  fillStripeCheckout,
  loginAsTestUser,
  submitStripeCheckout,
} from "./helpers"

test("should define organization billing plan", async ({ page }) => {
  test.setTimeout(60000)
  enableConsoleLogs(page)

  // 1. Login
  console.log("Step 1: Login")
  await loginAsTestUser(page)

  // 2. Create organization
  console.log("Step 2: Create Org")
  await createOrganization(page, "Billing Org")

  // 3. Navigate to Billing
  console.log("Step 3: Navigate to Billing")
  if (await page.locator('button:has-text("Select Organization")').isVisible()) {
    await page.reload()
  }

  await page.click('a:has-text("Billing")')
  await expect(page.locator("h1")).toContainText("Billing & Plans")

  // 4. Verify Free Plan is active
  await expect(page.locator("text=Current Plan")).toBeVisible()
  await expect(page.locator("text=$0")).toBeVisible()

  // 5. Click Upgrade
  console.log("Step 5: Click Upgrade")
  await Promise.all([
    page
      .waitForResponse(
        (res) =>
          res.url().includes("checkout.stripe.com") && res.status() === 200,
        { timeout: 30000 }
      )
      .catch((e) => {
        console.log("Wait response failed:", e)
        return null
      }),
    page.click('button:has-text("Upgrade to Pro")'),
  ])

  // Wait for Stripe Checkout to load
  console.log("Waiting for Stripe URL...")
  await page.waitForURL(/checkout.stripe.com/, { timeout: 30000 })

  // Fill Stripe Checkout Form
  console.log("Filling Stripe Checkout...")
  try {
    await fillStripeCheckout(page)

    console.log("Submitting payment...")
    await submitStripeCheckout(page)
  } catch (e) {
    console.log("Stripe element filling failed. Page title:", await page.title())
    throw e
  }

  // Wait for redirect back to the app
  console.log("Waiting for redirect back...")
  await page.waitForURL(/\/billing\?success=true/, { timeout: 30000 })

  // 6. Verify Pro Plan is active
  console.log("Waiting for webhook to update DB...")

  await expect(async () => {
    console.log("Reloading to check plan...")
    await page.reload()
    await expect(page.locator("text=Pro Plan")).toBeVisible()
    await expect(
      page.locator('button:has-text("Manage Subscription")')
    ).toBeVisible()
  }).toPass({ timeout: 45000 })
})
