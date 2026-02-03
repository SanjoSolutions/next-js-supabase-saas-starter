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

    await expect(page.getByRole("button", { name: "Alle akzeptieren" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Nur notwendige" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Einstellungen" })).toBeVisible()
  })

  test("should hide banner after accepting all cookies", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Alle akzeptieren" }).click()

    await expect(page.getByRole("button", { name: "Alle akzeptieren" })).not.toBeVisible()
  })

  test("should hide banner after accepting necessary only", async ({
    page,
  }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Nur notwendige" }).click()

    await expect(page.getByRole("button", { name: "Alle akzeptieren" })).not.toBeVisible()
  })

  test("should remember consent after page reload", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Alle akzeptieren" }).click()
    await expect(page.getByRole("button", { name: "Alle akzeptieren" })).not.toBeVisible()

    // Reload the page
    await page.reload()
    await page.waitForTimeout(500)

    // Banner should not appear again
    await expect(page.getByRole("button", { name: "Alle akzeptieren" })).not.toBeVisible()
  })

  test("should show settings panel when clicking Einstellungen", async ({
    page,
  }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Einstellungen" }).click()

    // Should show cookie categories with labels
    await expect(page.getByLabel(/Notwendig/)).toBeVisible()
    await expect(page.getByLabel(/Analyse/)).toBeVisible()
    await expect(page.getByLabel(/Marketing/)).toBeVisible()

    // Should show save button
    await expect(page.getByRole("button", { name: "Auswahl speichern" })).toBeVisible()
  })

  test("should have necessary cookies checkbox disabled", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Einstellungen" }).click()

    // Necessary checkbox should be checked and disabled
    const necessaryCheckbox = page.getByRole("checkbox", { name: /Notwendig/ })
    await expect(necessaryCheckbox).toBeChecked()
    await expect(necessaryCheckbox).toBeDisabled()
  })

  test("should save custom preferences", async ({ page }) => {
    await page.goto("/")
    await page.waitForTimeout(500)

    await page.getByRole("button", { name: "Einstellungen" }).click()

    // Check analytics but not marketing
    await page.getByRole("checkbox", { name: /Analyse/ }).check()

    await page.getByRole("button", { name: "Auswahl speichern" }).click()

    await expect(page.getByRole("button", { name: "Alle akzeptieren" })).not.toBeVisible()

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

    await page.getByRole("button", { name: "Alle akzeptieren" }).click()

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

    // Support both English and German link text
    const privacyLink = page.getByRole("link", { name: "Datenschutzerklärung" }).or(page.getByRole("link", { name: "Privacy Policy" }))
    await expect(privacyLink).toBeVisible()
    // The link will have locale prefix, e.g., /de/datenschutz or /en/datenschutz
    await expect(privacyLink).toHaveAttribute("href", /\/datenschutz$/)
  })
})

test.describe("Legal Pages", () => {
  test("should display Impressum page", async ({ page }) => {
    await page.goto("/impressum")
    await page.waitForTimeout(500)

    // Check for main heading using text content
    await expect(page.locator("h1")).toContainText("Impressum")
    await expect(page.locator("text=Angaben gemäß § 5 TMG")).toBeVisible()
  })

  test("should display Datenschutz page", async ({ page }) => {
    await page.goto("/datenschutz")
    await page.waitForTimeout(500)

    await expect(page.locator("h1")).toContainText("Datenschutzerklärung")
    await expect(page.locator("text=Datenschutz auf einen Blick")).toBeVisible()
  })

  test("should display AGB page", async ({ page }) => {
    await page.goto("/agb")
    await page.waitForTimeout(500)

    await expect(page.locator("h1")).toContainText("Allgemeine Geschäftsbedingungen")
    await expect(page.locator("text=§ 1 Geltungsbereich")).toBeVisible()
  })

  test("footer should contain legal links", async ({ page }) => {
    await page.goto("/")

    // Accept cookies first to clear the banner
    await page.waitForTimeout(500)
    const acceptButton = page.getByRole("button", { name: "Alle akzeptieren" })
    if (await acceptButton.isVisible()) {
      await acceptButton.click()
    }

    // Check footer links
    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: "Impressum" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Datenschutz" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "AGB" })).toBeVisible()
  })

  test("legal links should navigate correctly", async ({ page }) => {
    await page.goto("/")

    // Accept cookies first
    await page.waitForTimeout(500)
    const acceptButton = page.getByRole("button", { name: "Alle akzeptieren" })
    if (await acceptButton.isVisible()) {
      await acceptButton.click()
    }

    // Click Impressum link in footer
    const footer = page.locator("footer")
    await footer.getByRole("link", { name: "Impressum" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/impressum/)

    // Go back and click Datenschutz
    await page.goto("/")
    await page.waitForTimeout(300)
    await page.locator("footer").getByRole("link", { name: "Datenschutz" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/datenschutz/)

    // Go back and click AGB
    await page.goto("/")
    await page.waitForTimeout(300)
    await page.locator("footer").getByRole("link", { name: "AGB" }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveURL(/\/agb/)
  })
})
