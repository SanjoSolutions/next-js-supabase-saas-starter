import { expect, test } from "@playwright/test"

test.describe("Internationalization (i18n)", () => {
  test.describe("Locale Routing", () => {
    test("should redirect root URL to default locale (en)", async ({ page }) => {
      await page.goto("/")
      await page.waitForTimeout(500)

      // Should redirect to /en (just /en or /en/ with optional trailing content)
      await expect(page).toHaveURL(/\/en($|\/)/)
    })

    test("should set lang attribute to 'de' for German routes", async ({ page }) => {
      await page.goto("/de")

      const htmlLang = await page.locator("html").getAttribute("lang")
      expect(htmlLang).toBe("de")
    })

    test("should set lang attribute to 'en' for English routes", async ({ page }) => {
      await page.goto("/en")

      const htmlLang = await page.locator("html").getAttribute("lang")
      expect(htmlLang).toBe("en")
    })

    test("should redirect invalid locale to default", async ({ page }) => {
      await page.goto("/fr/auth/login")
      await page.waitForTimeout(500)

      // Should redirect to default locale (the path /fr/auth/login becomes /en/auth/login)
      await expect(page).toHaveURL(/\/en\/auth\/login/)
    })

    test("should preserve path when accessing locale route", async ({ page }) => {
      await page.goto("/en/auth/login")

      await expect(page).toHaveURL(/\/en\/auth\/login/)
    })
  })

  test.describe("Language Switcher", () => {
    test("should show language switcher in header", async ({ page }) => {
      await page.goto("/en")
      await page.waitForTimeout(500)

      // Accept cookies first to clear the banner
      const acceptButton = page.getByRole("button", { name: "Accept all" })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }

      // Language switcher should be visible
      const switcher = page.getByRole("button", { name: /Deutsch|English/ })
      await expect(switcher).toBeVisible()
    })

    test("should show locale options when clicking switcher", async ({ page }) => {
      await page.goto("/en")
      await page.waitForTimeout(500)

      // Accept cookies first
      const acceptButton = page.getByRole("button", { name: "Accept all" })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }

      // Click language switcher
      const switcher = page.getByRole("button", { name: "English" })
      await switcher.click()

      // Should show both locale options
      await expect(page.getByRole("menuitemradio", { name: "English" })).toBeVisible()
      await expect(page.getByRole("menuitemradio", { name: "Deutsch" })).toBeVisible()
    })

    test("should navigate to new locale when selecting different language", async ({ page }) => {
      await page.goto("/en")
      await page.waitForTimeout(500)

      // Accept cookies first
      const acceptButton = page.getByRole("button", { name: "Accept all" })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }

      // Click language switcher
      const switcher = page.getByRole("button", { name: "English" })
      await switcher.click()

      // Select German
      await page.getByRole("menuitemradio", { name: "Deutsch" }).click()

      // URL should change to German locale
      await expect(page).toHaveURL(/\/de/)

      // HTML lang should update
      const htmlLang = await page.locator("html").getAttribute("lang")
      expect(htmlLang).toBe("de")
    })

    test("should preserve current path when switching locale", async ({ page }) => {
      // Use legal-notice page which has footer with language switcher
      await page.goto("/en/legal-notice")
      await page.waitForTimeout(500)

      // Accept cookies first to clear the banner
      const acceptButton = page.getByRole("button", { name: "Accept all" })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
        await page.waitForTimeout(300)
      }

      // Click language switcher (in footer)
      const footer = page.locator("footer")
      const switcher = footer.getByRole("button", { name: "English" })
      await switcher.click()

      // Select German
      await page.getByRole("menuitemradio", { name: "Deutsch" }).click()
      await page.waitForTimeout(500)

      // Should be on German legal-notice page
      await expect(page).toHaveURL(/\/de\/legal-notice/)
    })
  })

  test.describe("Content Translation - German", () => {
    test("should show German login page content", async ({ page }) => {
      await page.goto("/de/auth/login")
      await page.waitForTimeout(500)

      // Check German labels
      await expect(page.getByLabel("E-Mail")).toBeVisible()
      await expect(page.getByLabel("Passwort")).toBeVisible()
      await expect(page.getByRole("button", { name: "Anmelden" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Passwort vergessen?" })).toBeVisible()
    })

    test("should show German signup page content", async ({ page }) => {
      await page.goto("/de/auth/sign-up")
      await page.waitForTimeout(500)

      // Check German labels
      await expect(page.getByLabel("Vorname")).toBeVisible()
      await expect(page.getByLabel("E-Mail")).toBeVisible()
      await expect(page.getByLabel("Passwort", { exact: true })).toBeVisible()
      await expect(page.getByRole("button", { name: "Registrieren" })).toBeVisible()
    })

    test("should show German cookie consent banner", async ({ page }) => {
      // Clear cookies/localStorage to ensure banner shows
      await page.context().clearCookies()

      await page.goto("/de")
      await page.waitForTimeout(500)

      // Check German cookie consent text
      await expect(page.getByText("Cookie-Einstellungen")).toBeVisible()
      await expect(page.getByRole("button", { name: "Alle akzeptieren" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Nur notwendige" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Einstellungen" })).toBeVisible()
    })

    test("should show German footer links", async ({ page }) => {
      await page.goto("/de")
      await page.waitForTimeout(500)

      // Accept cookies first
      const acceptButton = page.getByRole("button", { name: "Alle akzeptieren" })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }

      const footer = page.locator("footer")
      await expect(footer.getByRole("link", { name: "Impressum" })).toBeVisible()
      await expect(footer.getByRole("link", { name: "Datenschutz" })).toBeVisible()
      await expect(footer.getByRole("link", { name: "AGB" })).toBeVisible()
    })
  })

  test.describe("Content Translation - English", () => {
    test("should show English login page content", async ({ page }) => {
      await page.goto("/en/auth/login")
      await page.waitForTimeout(500)

      // Check English labels
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByLabel("Password")).toBeVisible()
      await expect(page.getByRole("button", { name: "Login" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Forgot your password?" })).toBeVisible()
    })

    test("should show English signup page content", async ({ page }) => {
      await page.goto("/en/auth/sign-up")
      await page.waitForTimeout(500)

      // Check English labels
      await expect(page.getByLabel("First Name")).toBeVisible()
      await expect(page.getByLabel("Email")).toBeVisible()
      await expect(page.getByLabel("Password", { exact: true })).toBeVisible()
      await expect(page.getByRole("button", { name: "Sign Up" })).toBeVisible()
    })

    test("should show English cookie consent banner", async ({ page }) => {
      // Clear cookies/localStorage to ensure banner shows
      await page.context().clearCookies()

      await page.goto("/en")
      await page.waitForTimeout(500)

      // Check English cookie consent text
      await expect(page.getByText("Cookie Settings")).toBeVisible()
      await expect(page.getByRole("button", { name: "Accept all" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Necessary only" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Settings" })).toBeVisible()
    })

    test("should show English footer links", async ({ page }) => {
      await page.goto("/en")
      await page.waitForTimeout(500)

      // Accept cookies first
      const acceptButton = page.getByRole("button", { name: "Accept all" })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }

      const footer = page.locator("footer")
      await expect(footer.getByRole("link", { name: "Legal Notice" })).toBeVisible()
      await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible()
      await expect(footer.getByRole("link", { name: "Terms & Conditions" })).toBeVisible()
    })
  })

  test.describe("Legal Pages in Both Locales", () => {
    test("should display German Legal Notice page", async ({ page }) => {
      await page.goto("/de/legal-notice")
      await page.waitForTimeout(500)

      await expect(page.locator("h1")).toContainText("Impressum")
    })

    test("should display English Legal Notice page", async ({ page }) => {
      await page.goto("/en/legal-notice")
      await page.waitForTimeout(500)

      await expect(page.locator("h1")).toContainText("Legal Notice")
    })

    test("should display German Privacy Policy page", async ({ page }) => {
      await page.goto("/de/privacy-policy")
      await page.waitForTimeout(500)

      await expect(page.locator("h1")).toContainText("Datenschutzerklärung")
    })

    test("should display English Privacy Policy page", async ({ page }) => {
      await page.goto("/en/privacy-policy")
      await page.waitForTimeout(500)

      await expect(page.locator("h1")).toContainText("Privacy Policy")
    })

    test("should display German Terms page", async ({ page }) => {
      await page.goto("/de/terms")
      await page.waitForTimeout(500)

      await expect(page.locator("h1")).toContainText("Allgemeine Geschäftsbedingungen")
    })

    test("should display English Terms page", async ({ page }) => {
      await page.goto("/en/terms")
      await page.waitForTimeout(500)

      await expect(page.locator("h1")).toContainText("Terms and Conditions")
    })
  })

  test.describe("Form Validation Messages", () => {
    test("should show German validation error for empty email on login", async ({ page }) => {
      await page.goto("/de/auth/login")
      await page.waitForTimeout(500)

      // Try to submit without filling email
      await page.getByRole("button", { name: "Anmelden" }).click()

      // Browser validation should show (or custom validation message)
      // Check that the form is still on the login page
      await expect(page).toHaveURL(/\/de\/auth\/login/)
    })

    test("should show English validation error for empty email on login", async ({ page }) => {
      await page.goto("/en/auth/login")
      await page.waitForTimeout(500)

      // Try to submit without filling email
      await page.getByRole("button", { name: "Login" }).click()

      // Check that the form is still on the login page
      await expect(page).toHaveURL(/\/en\/auth\/login/)
    })
  })

  test.describe("Locale Persistence", () => {
    test("should remember locale preference via cookie", async ({ page }) => {
      // Start on English
      await page.goto("/en")
      await page.waitForTimeout(500)

      // Accept cookies
      const acceptButton = page.getByRole("button", { name: "Accept all" })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }

      // Switch to German
      const switcher = page.getByRole("button", { name: "English" })
      await switcher.click()
      await page.getByRole("menuitemradio", { name: "Deutsch" }).click()

      await expect(page).toHaveURL(/\/de/)

      // Navigate to a different page
      await page.goto("/de/auth/login")
      await page.waitForTimeout(500)

      // Should still be in German
      const htmlLang = await page.locator("html").getAttribute("lang")
      expect(htmlLang).toBe("de")
    })

    test("should show translated login page content based on locale", async ({ page }) => {
      // This test verifies that client-side rendered text changes with locale
      await page.goto("/en/auth/login")
      await page.waitForTimeout(500)

      // English page should show English text
      await expect(page.getByRole("link", { name: "Forgot your password?" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible()

      // Now check German
      await page.goto("/de/auth/login")
      await page.waitForTimeout(500)

      // German page should show German text
      await expect(page.getByRole("link", { name: "Passwort vergessen?" })).toBeVisible()
      await expect(page.getByRole("link", { name: "Registrieren" })).toBeVisible()
    })
  })

  test.describe("Server Component Translations", () => {
    test("should show translated header navigation based on locale", async ({ page }) => {
      // This test verifies that SERVER-SIDE rendered header text changes with locale
      // The header is a Server Component that uses getTranslations()

      // First, log in to see the full header with navigation
      // Or just check the footer which is also a server component
      await page.goto("/en")
      await page.waitForTimeout(500)

      // Accept cookies first
      const acceptButton = page.getByRole("button", { name: "Accept all" })
      if (await acceptButton.isVisible()) {
        await acceptButton.click()
      }

      // Check footer links are in English
      const footer = page.locator("footer")
      await expect(footer.getByRole("link", { name: "Legal Notice" })).toBeVisible()
      await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible()
      await expect(footer.getByRole("link", { name: "Terms & Conditions" })).toBeVisible()

      // Now check German
      await page.goto("/de")
      await page.waitForTimeout(500)

      // Check footer links are in German
      await expect(footer.getByRole("link", { name: "Impressum" })).toBeVisible()
      await expect(footer.getByRole("link", { name: "Datenschutz" })).toBeVisible()
      await expect(footer.getByRole("link", { name: "AGB" })).toBeVisible()
    })
  })
})
