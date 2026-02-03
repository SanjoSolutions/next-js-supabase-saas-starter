import { Page, expect } from "@playwright/test"

/**
 * Accept cookie consent banner if visible
 */
export async function acceptCookiesIfVisible(page: Page): Promise<void> {
  // Wait a moment for the banner to potentially appear
  await page.waitForTimeout(500)

  // Support both English and German button text
  const acceptButton = page.getByRole("button", { name: "Accept all" }).or(page.getByRole("button", { name: "Alle akzeptieren" }))

  try {
    // Check if banner is visible
    if (await acceptButton.isVisible({ timeout: 2000 })) {
      await acceptButton.click()
      // Wait for banner to disappear
      await acceptButton.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {})
      await page.waitForTimeout(300)
    }
  } catch {
    // Banner not visible, continue
  }
}

/**
 * Default test user credentials
 */
export const TEST_USER = {
  email: "test@example.com",
  password: "password123",
  firstName: "Existing User",
}

/**
 * Login as the default test user
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  await login(page, TEST_USER.email, TEST_USER.password)
}

/**
 * Login with custom credentials
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/auth/login")
  await page.waitForLoadState("networkidle")

  // Accept cookie consent if visible (blocks other interactions)
  await acceptCookiesIfVisible(page)

  await page.fill('input[id="email"]', email)
  await page.fill('input[id="password"]', password)

  // Support both English "Login" and German "Anmelden"
  const loginButton = page.locator('button:has-text("Login")').or(page.locator('button:has-text("Anmelden")'))

  // Scroll button into view to avoid cookie banner overlap
  await loginButton.scrollIntoViewIfNeeded()

  // Try normal click, then force click if intercepted
  try {
    await loginButton.click({ timeout: 5000 })
  } catch {
    await acceptCookiesIfVisible(page)
    await loginButton.click({ force: true })
  }

  await expect(page).toHaveURL(/\/protected/)
}

/**
 * Sign up a new user
 */
export async function signUp(
  page: Page,
  options: {
    email: string
    firstName: string
    password?: string
  }
): Promise<void> {
  const password = options.password ?? "password123"

  await page.goto("/auth/sign-up")
  await page.waitForLoadState("networkidle")

  // Accept cookie consent if visible (blocks other interactions)
  await acceptCookiesIfVisible(page)

  await page.fill('input[id="first-name"]', options.firstName)
  await page.fill('input[id="email"]', options.email)
  await page.fill('input[id="password"]', password)
  await page.fill('input[id="repeat-password"]', password)

  // Support both English "Sign up" and German "Registrieren"
  const signUpButton = page.locator('button:has-text("Sign up")').or(page.locator('button:has-text("Registrieren")'))

  // Scroll the button into view to avoid cookie banner overlap
  await signUpButton.scrollIntoViewIfNeeded()

  // Try normal click first, then force click if intercepted
  try {
    await signUpButton.click({ timeout: 5000 })
  } catch {
    // If intercepted, dismiss cookie consent again and retry with force
    await acceptCookiesIfVisible(page)
    await signUpButton.click({ force: true })
  }

  await page.waitForLoadState("networkidle")
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
  // Open user menu first (logout is now in dropdown)
  await page.locator("nav button").last().click()
  await page.waitForTimeout(300)
  // Support both English "Logout" and German "Abmelden"
  const logoutItem = page.getByRole("menuitem", { name: "Logout" }).or(page.getByRole("menuitem", { name: "Abmelden" }))
  await logoutItem.click()
  // After logout, user is redirected to home page (with locale prefix)
  await page.waitForLoadState("networkidle")
}

/**
 * Create a new organization with a unique name
 * Returns the organization name
 */
export async function createOrganization(
  page: Page,
  namePrefix: string = "E2E Org"
): Promise<string> {
  // Click user avatar to open menu
  await page.locator("nav button").last().click()
  await page.waitForTimeout(300)
  // Support both English "Create Organization" and German "Organisation erstellen"
  const createOrgItem = page.getByRole("menuitem", { name: "Create Organization" }).or(page.getByRole("menuitem", { name: "Organisation erstellen" }))
  await createOrgItem.click()
  const orgName = `${namePrefix} ${Date.now()}`
  await page.fill('input[id="name"]', orgName)
  // Support both English and German button text
  const submitButton = page.locator('button:has-text("Create Organization")').or(page.locator('button:has-text("Organisation erstellen")'))
  await submitButton.click()
  await page.waitForLoadState("networkidle")
  return orgName
}

/**
 * Create an invite for an email address
 * Returns the invite link
 */
export async function createInvite(page: Page, email: string): Promise<string> {
  // Click user avatar to open menu
  await page.locator("nav button").last().click()
  await page.waitForTimeout(300)
  // Support both English "Invite" and German "Einladen"
  const inviteItem = page.getByRole("menuitem", { name: "Invite" }).or(page.getByRole("menuitem", { name: "Einladen" }))
  await inviteItem.click()
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000) // Give time for form to render

  await page.fill('input[id="email"]', email)
  // Support both English and German button text
  const submitButton = page.locator('button:has-text("Create Invite")').or(page.locator('button:has-text("Einladung erstellen")'))
  await submitButton.click()
  await page.waitForLoadState("networkidle")

  // Support both English and German success message
  const successMessage = page.locator("text=Invite created successfully!").or(page.locator("text=Einladung erfolgreich erstellt!"))
  await successMessage.waitFor({ timeout: 10000 })
  const linkText = await page
    .locator(".bg-green-500\\/10 .font-mono")
    .textContent()
  return linkText!.trim()
}

/**
 * Accept an organization invite
 * Assumes the user is already logged in
 */
export async function acceptInvite(
  page: Page,
  inviteLink: string
): Promise<void> {
  await page.goto(inviteLink)
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(2000)

  // Check if we're on the invite page or got redirected to auth
  const currentURL = page.url()

  if (currentURL.includes("/auth/")) {
    // If on sign up page, go to login
    if (await page.isVisible("text=Already have an account?")) {
      await page.click("text=Login")
    }
    throw new Error("User not authenticated. Please login before accepting invite.")
  }

  try {
    // Support both English and German button text
    const acceptButton = page.locator('button:has-text("Accept Invitation")').or(page.locator('button:has-text("Einladung annehmen")'))
    await acceptButton.waitFor({ timeout: 60000 })
    await acceptButton.click()
  } catch (e) {
    console.log("Failed to find Accept Invitation button. Page URL:", page.url())
    throw e
  }

  await expect(page).toHaveURL(/\/organizations\/[^/]+\/welcome/)
  await page.waitForLoadState("networkidle")
}

/**
 * Fill Stripe checkout form with test card details
 */
export async function fillStripeCheckout(
  page: Page,
  options?: {
    cardNumber?: string
    expiry?: string
    cvc?: string
    cardholderName?: string
    email?: string
    zip?: string
  }
): Promise<void> {
  const {
    cardNumber = "4242424242424242",
    expiry = "1234",
    cvc = "123",
    cardholderName = "Test User",
    email = "test@example.com",
    zip = "12345",
  } = options ?? {}

  // Wait for form to be interactive
  await page.waitForTimeout(5000)

  // Fill email if asked
  if (await page.getByLabel("Email").isVisible()) {
    await page.getByLabel("Email").fill(email)
  }

  // Stripe's checkout uses a combined card input widget
  const cardInput = page
    .getByPlaceholder("1234 1234 1234 1234")
    .or(page.getByLabel("Card number"))
  await cardInput.fill(cardNumber)

  // Tab to expiration and fill it
  await page.keyboard.press("Tab")
  await page.keyboard.type(expiry)

  // Tab to CVC and fill it
  await page.keyboard.press("Tab")
  await page.keyboard.type(cvc)

  // Cardholder name is required
  const nameInput = page.getByLabel("Cardholder name")
  await nameInput.fill(cardholderName)

  // ZIP might be needed
  if (await page.getByLabel("ZIP").isVisible()) {
    await page.getByLabel("ZIP").fill(zip)
  }
}

/**
 * Submit Stripe checkout form
 */
export async function submitStripeCheckout(page: Page): Promise<void> {
  await page.click('button[type="submit"]')
}

/**
 * Generate a unique email address for testing
 */
export function generateTestEmail(prefix: string = "test"): string {
  return `${prefix}-${Date.now()}@example.com`
}

/**
 * Enable console logging for debugging
 */
export function enableConsoleLogs(page: Page): void {
  page.on("console", (msg) => console.log("BROWSER:", msg.text()))
}
