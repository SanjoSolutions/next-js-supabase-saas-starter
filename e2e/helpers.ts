import { Page, expect } from "@playwright/test"

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
  await page.fill('input[id="email"]', email)
  await page.fill('input[id="password"]', password)
  await page.click('button:has-text("Login")')
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
  await page.fill('input[id="first-name"]', options.firstName)
  await page.fill('input[id="email"]', options.email)
  await page.fill('input[id="password"]', password)
  await page.fill('input[id="repeat-password"]', password)
  await page.click('button:has-text("Sign up")')
  await page.waitForLoadState("networkidle")
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
  await page.click('button:has-text("Logout")')
  await page.waitForURL(/\/auth\/login/)
}

/**
 * Create a new organization with a unique name
 * Returns the organization name
 */
export async function createOrganization(
  page: Page,
  namePrefix: string = "E2E Org"
): Promise<string> {
  await page.click('a:has-text("Create Organization")')
  const orgName = `${namePrefix} ${Date.now()}`
  await page.fill('input[id="name"]', orgName)
  await page.click('button:has-text("Create Organization")')
  await page.waitForLoadState("networkidle")
  return orgName
}

/**
 * Create an invite for an email address
 * Returns the invite link
 */
export async function createInvite(page: Page, email: string): Promise<string> {
  await page.click('a:has-text("Invite")')
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000) // Give time for form to render

  await page.fill('input[id="email"]', email)
  await page.click('button:has-text("Create Invite")')
  await page.waitForLoadState("networkidle")

  await page.waitForSelector("text=Invite created successfully!")
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
    await page.waitForSelector('button:has-text("Accept Invitation")', {
      timeout: 60000,
    })
    await page.click('button:has-text("Accept Invitation")')
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
