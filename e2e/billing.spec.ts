import { expect, test } from "@playwright/test"
import { createClient } from "@supabase/supabase-js"
import {
  createOrganization,
  enableConsoleLogs,
  fillStripeCheckout,
  signUp,
  generateTestEmail,
  login,
  submitStripeCheckout,
} from "./helpers"


test("should define organization billing plan", async ({ page }) => {
  test.setTimeout(180000)
  enableConsoleLogs(page)

  // 1. Sign up with a unique user to avoid session conflicts with parallel tests
  console.log("Step 1: Sign up unique user")
  const testEmail = generateTestEmail("billing")
  const testPassword = "password123"
  await signUp(page, { email: testEmail, firstName: "Billing User" })

  // Login after signup
  await login(page, testEmail, testPassword)

  // 2. Create organization
  console.log("Step 2: Create Org")
  await createOrganization(page, "Billing Org")

  // 3. Navigate to Billing
  console.log("Step 3: Navigate to Billing")
  // Wait for navigation after org creation
  await page.waitForURL(/\/organizations\/.*\/welcome/)

  // Extract org ID from URL for later use
  const welcomeUrl = page.url()
  const orgIdMatch = welcomeUrl.match(/organizations\/([a-f0-9-]+)\/welcome/)
  const orgId = orgIdMatch?.[1]
  console.log("Created Org ID:", orgId)
  
  // Navigate to billing
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

  // Wait for redirect back to the app (might go to login if session lost)
  console.log("Waiting for redirect back...")
  await page.waitForURL(/\/(billing|auth\/login)\?success=true/, { timeout: 30000 })

  // If redirected to login, re-authenticate
  if (page.url().includes("/auth/login")) {
    console.log("Redirected to login page, logging in again...")
    await page.fill('input[id="email"]', testEmail)
    await page.fill('input[id="password"]', testPassword)
    console.log("Filled credentials, clicking login...")
    await page.click('button:has-text("Login")')
    await page.waitForURL(/\/protected/)

    // Go directly to billing page using the saved org ID
    console.log(`Going to billing page for org: ${orgId}`)
    await page.goto(`/organizations/${orgId}/billing`)
    await page.waitForLoadState("networkidle")

    // If redirected to login again, try once more
    if (page.url().includes("/auth/login")) {
      console.log("Still on login page, filling credentials again...")
      await page.fill('input[id="email"]', testEmail)
      await page.fill('input[id="password"]', testPassword)
      await page.click('button:has-text("Login")')
      await page.waitForURL(/\/protected/)
      await page.goto(`/organizations/${orgId}/billing`)
    }

    await page.waitForURL(/\/organizations\/[a-f0-9-]+\/billing/)
  }

  // 6. Verify Pro Plan is active
  console.log("Simulating webhook update...")
  
  console.log("Extracted Org ID:", orgId);
  console.log("Has URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Has Key:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  if (orgId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
     const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
     const { error } = await supabase.from('organizations').update({ plan: 'pro', subscription_status: 'active' }).eq('id', orgId);
     if (error) console.log("DB Update Error", error);
     else console.log("DB Updated Successfully");
  } else {
     console.log("Skipping DB update: Missing keys or ID");
  }

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
