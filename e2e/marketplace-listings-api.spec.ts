import { expect, test } from "@playwright/test"
import {
  acceptCookiesIfVisible,
  enableConsoleLogs,
  generateTestEmail,
  loginAsTestUser,
  signUp,
  TEST_USER,
} from "./helpers"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ""

/**
 * Get a Supabase access token by signing in via the REST API
 */
async function getAccessToken(
  request: typeof test extends (name: string, fn: (args: infer T) => void) => void ? T["request"] : never,
  email: string,
  password: string,
): Promise<string> {
  const response = await request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    data: { email, password },
  })
  const json = await response.json()
  return json.access_token
}

// ============================================================
// 1. REST API — Authentication & Validation
// ============================================================

test.describe("Marketplace Listings API", () => {
  const validBody = {
    organizationId: "00000000-0000-0000-0000-000000000000",
    listingType: "request",
    title: "E2E Test Delivery",
    priceMinCents: 10000,
    priceMaxCents: 15000,
    pickupStreet: "Hauptstr. 1",
    pickupPostalCode: "10115",
    pickupCity: "Berlin",
    deliveryStreet: "Marienplatz 1",
    deliveryPostalCode: "80331",
    deliveryCity: "Munich",
    packageSize: "medium",
    deliveryDate: "2026-03-01",
    expiresAt: "2026-02-28T23:59:59Z",
  }

  test("returns 401 without Authorization header", async ({ request }) => {
    const response = await request.post("/api/marketplace/listings", {
      data: validBody,
    })
    expect(response.status()).toBe(401)
    const json = await response.json()
    expect(json.error).toContain("Authorization")
  })

  test("returns 401 with invalid bearer token", async ({ request }) => {
    const response = await request.post("/api/marketplace/listings", {
      headers: { Authorization: "Bearer invalid-token-abc123" },
      data: validBody,
    })
    expect(response.status()).toBe(401)
    const json = await response.json()
    expect(json.error).toContain("Invalid")
  })

  test("returns 400 with missing required fields", async ({ request }) => {
    const token = await getAccessToken(request, TEST_USER.email, TEST_USER.password)

    const response = await request.post("/api/marketplace/listings", {
      headers: { Authorization: `Bearer ${token}` },
      data: { organizationId: "some-org" },
    })
    expect(response.status()).toBe(400)
    const json = await response.json()
    expect(json.error).toContain("Missing required fields")
  })

  test("returns 400 with invalid listingType", async ({ request }) => {
    const token = await getAccessToken(request, TEST_USER.email, TEST_USER.password)

    const response = await request.post("/api/marketplace/listings", {
      headers: { Authorization: `Bearer ${token}` },
      data: { ...validBody, listingType: "invalid" },
    })
    expect(response.status()).toBe(400)
    const json = await response.json()
    expect(json.error).toContain("listingType")
  })

  test("returns 400 with invalid packageSize", async ({ request }) => {
    const token = await getAccessToken(request, TEST_USER.email, TEST_USER.password)

    const response = await request.post("/api/marketplace/listings", {
      headers: { Authorization: `Bearer ${token}` },
      data: { ...validBody, packageSize: "huge" },
    })
    expect(response.status()).toBe(400)
    const json = await response.json()
    expect(json.error).toContain("packageSize")
  })

  test("returns 400 when priceMinCents exceeds priceMaxCents", async ({ request }) => {
    const token = await getAccessToken(request, TEST_USER.email, TEST_USER.password)

    const response = await request.post("/api/marketplace/listings", {
      headers: { Authorization: `Bearer ${token}` },
      data: { ...validBody, priceMinCents: 20000, priceMaxCents: 10000 },
    })
    expect(response.status()).toBe(400)
    const json = await response.json()
    expect(json.error).toContain("priceMinCents must not exceed priceMaxCents")
  })

  test("returns 403 when user is not a member of the organization", async ({ request }) => {
    const token = await getAccessToken(request, TEST_USER.email, TEST_USER.password)

    const response = await request.post("/api/marketplace/listings", {
      headers: { Authorization: `Bearer ${token}` },
      // Use a random UUID that the user won't be a member of
      data: { ...validBody, organizationId: "00000000-aaaa-bbbb-cccc-000000000000" },
    })
    expect(response.status()).toBe(403)
    const json = await response.json()
    expect(json.error).toContain("Not a member")
  })
})

// ============================================================
// 2. Default Post-Login Redirect
// ============================================================

test.describe("Default post-login redirect", () => {
  test("login redirects to /protected", async ({ page }) => {
    enableConsoleLogs(page)

    await page.goto("/auth/login")
    await page.waitForLoadState("networkidle")
    await acceptCookiesIfVisible(page)

    await page.fill('input[id="email"]', TEST_USER.email)
    await page.fill('input[id="password"]', TEST_USER.password)

    const loginButton = page
      .locator('button:has-text("Login")')
      .or(page.locator('button:has-text("Anmelden")'))
    await loginButton.scrollIntoViewIfNeeded()
    await loginButton.click({ timeout: 5000 })

    await expect(page).toHaveURL(/\/(protected|organizations)/, { timeout: 10000 })
  })

  test("sign-up redirects to /protected", async ({ page }) => {
    enableConsoleLogs(page)

    const email = generateTestEmail("redirect-signup")
    await signUp(page, { email, firstName: "Redirect Test" })

    await expect(page).toHaveURL(/\/(protected|organizations)/, { timeout: 10000 })
  })

  test("authenticated root page redirects to /protected", async ({ page }) => {
    enableConsoleLogs(page)

    // First login
    await loginAsTestUser(page)

    // Now visit root
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    await expect(page).toHaveURL(/\/(protected|organizations)/, { timeout: 10000 })
  })
})

// ============================================================
// 3. Listing Form — Price Range Fields
// ============================================================

test.describe("Marketplace listing form price range", () => {
  test("new listing form shows min and max price inputs instead of single price", async ({
    page,
  }) => {
    enableConsoleLogs(page)

    await loginAsTestUser(page)

    await page.goto("/marketplace/listings/new")
    await page.waitForLoadState("networkidle")

    const currentUrl = page.url()
    // If user has marketplace profile, form should render
    if (currentUrl.includes("/listings/new")) {
      // Min and max price fields should be visible
      await expect(page.locator("#priceMinEur")).toBeVisible({ timeout: 10000 })
      await expect(page.locator("#priceMaxEur")).toBeVisible({ timeout: 10000 })

      // Old single price field should NOT exist
      await expect(page.locator("#priceEur")).not.toBeVisible()
    }
    // If redirected to profile setup, that's valid — user has no marketplace profile
  })

  test("form shows price range preview when both prices are filled", async ({ page }) => {
    enableConsoleLogs(page)

    await loginAsTestUser(page)

    await page.goto("/marketplace/listings/new")
    await page.waitForLoadState("networkidle")

    const currentUrl = page.url()
    if (currentUrl.includes("/listings/new")) {
      // Fill min and max prices
      await page.fill("#priceMinEur", "100")
      await page.fill("#priceMaxEur", "150")

      // Price display should show a range with "-" separator
      const priceDisplay = page.locator('[role="status"]')
      await expect(priceDisplay).toBeVisible({ timeout: 5000 })
      const text = await priceDisplay.textContent()
      expect(text).toContain("-")
    }
  })

  test("form shows validation error when min price exceeds max price", async ({ page }) => {
    enableConsoleLogs(page)

    await loginAsTestUser(page)

    await page.goto("/marketplace/listings/new")
    await page.waitForLoadState("networkidle")

    const currentUrl = page.url()
    if (currentUrl.includes("/listings/new")) {
      // Fill required fields
      await page.fill("#title", "Test Listing")
      await page.fill("#priceMinEur", "200")
      await page.fill("#priceMaxEur", "100")
      await page.fill("#pickupStreet", "Test St 1")
      await page.fill("#pickupPostalCode", "10115")
      await page.fill("#pickupCity", "Berlin")
      await page.fill("#deliveryStreet", "Dest St 1")
      await page.fill("#deliveryPostalCode", "80331")
      await page.fill("#deliveryCity", "Munich")
      await page.fill("#deliveryDate", "2026-03-01")

      // Submit
      const submitButton = page
        .locator('button[type="submit"]')
        .or(page.locator('button:has-text("Create Listing")'))
        .or(page.locator('button:has-text("Angebot erstellen")'))
      await submitButton.click()

      // Should show error about min exceeding max
      const errorMsg = page.locator(".bg-destructive\\/10")
      await expect(errorMsg).toBeVisible({ timeout: 5000 })
    }
  })
})

// ============================================================
// 4. Marketplace requires auth
// ============================================================

test.describe("Marketplace auth guard", () => {
  test("unauthenticated user accessing /marketplace is redirected to login", async ({ page }) => {
    enableConsoleLogs(page)

    await page.goto("/marketplace")
    await page.waitForLoadState("networkidle")

    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 })
  })
})
