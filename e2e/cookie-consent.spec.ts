import { expect, test } from "@playwright/test"

test.describe("Cookie Consent Banner", () => {
  test.beforeEach(async ({ context }) => {
    // Clear localStorage before each test to ensure banner shows
    await context.clearCookies()
  })

  test("should show cookie banner on first visit", async ({ page }) => {
    await page.goto("/")

    // Wait for hydration
    await page.waitForTimeout(500)

    // Default locale is now English
    await expect(page.getByRole("button", { name: "Accept all" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Necessary only" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Settings" })).toBeVisible()
  })

  test("should hide banner after accepting all cookies", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Accept all" }).click()

    await expect(page.getByRole("button", { name: "Accept all" })).not.toBeVisible()
  })

  test("should hide banner after accepting necessary only", async ({
    page,
  }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Necessary only" }).click()

    await expect(page.getByRole("button", { name: "Accept all" })).not.toBeVisible()
  })

  test("should remember consent after page reload", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Accept all" }).click()
    await expect(page.getByRole("button", { name: "Accept all" })).not.toBeVisible()

    // Reload the page
    await page.reload()
    await page.waitForTimeout(500)

    // Banner should not appear again
    await expect(page.getByRole("button", { name: "Accept all" })).not.toBeVisible()
  })

  test("should show settings panel when clicking Settings", async ({
    page,
  }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Settings" }).click()

    // Should show cookie categories with labels
    await expect(page.getByLabel(/Necessary/)).toBeVisible()
    await expect(page.getByLabel(/Analytics/)).toBeVisible()
    await expect(page.getByLabel(/Marketing/)).toBeVisible()

    // Should show save button
    await expect(page.getByRole("button", { name: "Save preferences" })).toBeVisible()
  })

  test("should have necessary cookies checkbox disabled", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Settings" }).click()

    // Necessary checkbox should be checked and disabled
    const necessaryCheckbox = page.getByRole("checkbox", { name: /Necessary/ })
    await expect(necessaryCheckbox).toBeChecked()
    await expect(necessaryCheckbox).toBeDisabled()
  })

  test("should save custom preferences", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Settings" }).click()

    // Check analytics but not marketing
    await page.getByRole("checkbox", { name: /Analytics/ }).check()

    await page.getByRole("button", { name: "Save preferences" }).click()

    await expect(page.getByRole("button", { name: "Accept all" })).not.toBeVisible()

    // Verify consent was saved correctly in localStorage
    const consent = await page.evaluate(() => {
      const stored = localStorage.getItem("cookie-consent")
      return stored ? JSON.parse(stored) : null
    })

    expect(consent).not.toBeNull()
    expect(consent.necessary).toBe(true)
    expect(consent.analytics).toBe(true)
    expect(consent.marketing).toBe(false)
  })

  test("should store consent with timestamp and version", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Accept all" }).click()

    const consent = await page.evaluate(() => {
      const stored = localStorage.getItem("cookie-consent")
      return stored ? JSON.parse(stored) : null
    })

    expect(consent).not.toBeNull()
    expect(consent.timestamp).toBeDefined()
    expect(consent.version).toBe("1.0")
  })

  test("should link to privacy policy", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    // Default is English now - look specifically within the cookie banner
    const cookieBanner = page.locator('[class*="fixed bottom-0"]')
    const privacyLink = cookieBanner.getByRole("link", { name: "Privacy Policy" })
    await expect(privacyLink).toBeVisible()
    // The link will have locale prefix, e.g., /en/privacy-policy
    await expect(privacyLink).toHaveAttribute("href", /\/privacy-policy$/)
  })
})

test.describe("Legal Pages", () => {
  test("should display Legal Notice page", async ({ page }) => {
    await page.goto("/legal-notice")
    await page.waitForTimeout(500)

    // Default locale is English, so we see "Legal Notice"
    await expect(page.locator("h1")).toContainText("Legal Notice")
    await expect(page.locator("text=Information according to § 5 TMG")).toBeVisible()
  })

  test("should display Privacy Policy page", async ({ page }) => {
    await page.goto("/privacy-policy")
    await page.waitForTimeout(500)

    await expect(page.locator("h1")).toContainText("Privacy Policy")
    await expect(page.locator("text=Privacy at a Glance")).toBeVisible()
  })

  test("should display Terms page", async ({ page }) => {
    await page.goto("/terms")
    await page.waitForTimeout(500)

    await expect(page.locator("h1")).toContainText("Terms and Conditions")
    await expect(page.locator("text=§ 1 Scope")).toBeVisible()
  })

  test("footer should contain legal links", async ({ page }) => {
    await page.goto("/")

    // Accept cookies first to clear the banner
    await page.waitForTimeout(500)
    const acceptButton = page.getByRole("button", { name: "Accept all" })
    if (await acceptButton.isVisible()) {
      await acceptButton.click()
    }

    // Check footer links (default is English)
    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: "Legal Notice" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Terms & Conditions" })).toBeVisible()
  })

  test("legal links should navigate correctly", async ({ page }) => {
    await page.goto("/")

    // Accept cookies first
    await page.waitForTimeout(500)
    const acceptButton = page.getByRole("button", { name: "Accept all" })
    if (await acceptButton.isVisible()) {
      await acceptButton.click()
    }

    // Click Legal Notice link in footer
    const footer = page.locator("footer")
    await footer.getByRole("link", { name: "Legal Notice" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/legal-notice/)

    // Go back and click Privacy Policy
    await page.goto("/")
    await page.waitForTimeout(300)
    await page.locator("footer").getByRole("link", { name: "Privacy Policy" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/privacy-policy/)

    // Go back and click Terms
    await page.goto("/")
    await page.waitForTimeout(300)
    await page.locator("footer").getByRole("link", { name: "Terms & Conditions" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/terms/)
  })
})
