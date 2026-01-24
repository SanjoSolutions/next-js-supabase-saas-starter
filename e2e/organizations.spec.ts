import { expect, test } from "@playwright/test"

test("should create a new organization", async ({ page }) => {
  // 1. Go to login page
  await page.goto("/auth/login")

  // 2. Login
  await page.fill('input[id="email"]', "test@example.com")
  await page.fill('input[id="password"]', "password123")
  await page.click('button:has-text("Login")')

  // 3. Verify landing on protected page
  await expect(page).toHaveURL(/\/protected/)

  // 4. Click "Create Organization" in navigation
  await page.click('a:has-text("Create Organization")')
  await expect(page).toHaveURL(/\/organizations\/new/)

  // 5. Fill organization name
  const orgName = `E2E Org ${Date.now()}`

  // Listen for console errors
  page.on("console", (msg) => console.log("BROWSER:", msg.text()))

  await page.fill('input[id="name"]', orgName)
  await page.click('button:has-text("Create Organization")')

  // Wait for navigation
  await page.waitForLoadState("networkidle")

  // 6. Verify redirect back to protected
  await expect(page).toHaveURL(/\/protected/)

  // 7. Verify organization name appears in the switcher
  // We use .first() because there might be multiple nav elements (e.g. mobile vs desktop)
  const header = page.getByRole("navigation").first()
  await expect(header).toContainText(orgName)
})

test("should create an invite link", async ({ page }) => {
  page.on("console", (msg) => console.log("BROWSER:", msg.text()))

  // 1. Login
  await page.goto("/auth/login")
  await page.fill('input[id="email"]', "test@example.com")
  await page.fill('input[id="password"]', "password123")
  await page.click('button:has-text("Login")')
  await expect(page).toHaveURL(/\/protected/)

  // 2. Create organization
  await page.click('a:has-text("Create Organization")')
  const orgName = `Invite Org ${Date.now()}`
  await page.fill('input[id="name"]', orgName)
  await page.click('button:has-text("Create Organization")')
  await page.waitForLoadState("networkidle")
  await expect(page).toHaveURL(/\/protected/)

  // 3. Navigate to invites page
  await page.click('a:has-text("Invite")')
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000) // Give time for form to render

  // 4. Fill email (use unique address to avoid collisions)
  const newUserEmail = `new-user-${Date.now()}@example.com`
  await page.fill('input[id="email"]', newUserEmail)

  // 5. Submit
  await page.click('button:has-text("Create Invite")')
  await page.waitForLoadState("networkidle")

  // 6. Get the invite link from the success message
  await page.waitForSelector("text=Invite created successfully!")
  const linkText = await page
    .locator(".bg-green-500\\/10 .font-mono")
    .textContent()
  console.log("Extracted Invite Link:", linkText)
  const inviteLink = linkText!.trim()

  // 7. Open invite link in new context (simulating new user)
  await page.goto("/auth/sign-up")
  await page.fill('input[id="email"]', newUserEmail)
  await page.fill('input[id="password"]', "password123")
  await page.fill('input[id="repeat-password"]', "password123")
  await page.click('button:has-text("Sign up")')
  await page.waitForLoadState("networkidle")

  // Navigate to invite link
  await page.goto(inviteLink!)

  // 8. Wait for the client component to load data and render
  console.log("Step 9: Waiting for invite page to load...")
  await page.waitForLoadState("networkidle")

  // Give the client component time to fetch and render
  await page.waitForTimeout(2000)

  // Check if we're on the invite page or got redirected to auth
  const currentURL = page.url()
  console.log("Current URL after load:", currentURL)

  if (currentURL.includes("/auth/")) {
    console.log("Redirected to auth page, performing manual login...")

    // If on sign up page, go to login
    if (await page.isVisible("text=Already have an account?")) {
      await page.click("text=Login")
    }

    await page.fill('input[id="email"]', newUserEmail)
    await page.fill('input[id="password"]', "password123")
    await page.click('button:has-text("Login")')

    // Login might redirect to /protected or home. We need to go back to invite link.
    await page.waitForLoadState("networkidle")
    await page.waitForURL(/\/protected/, { timeout: 15000 }).catch(() => {})
    console.log(
      "Manual login done, navigating back to invite link: " + inviteLink,
    )
    await page.goto(inviteLink!)
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(2000)
  }

  // Now wait for the button to appear
  console.log("Waiting for Accept Invitation button...")
  try {
    await page.waitForSelector('button:has-text("Accept Invitation")', {
      timeout: 60000,
    })
    console.log("Button found, clicking...")
    await page.click('button:has-text("Accept Invitation")')
  } catch (e) {
    console.log("STEP 9 FINAL FAILURE - Page content:", await page.content())
    console.log("FINAL URL:", page.url())
    throw e
  }

  // Verify redirect to welcome page
  await expect(page).toHaveURL(/\/organizations\/[^/]+\/welcome/)
  await page.waitForLoadState("networkidle")

  // Verify welcome message is displayed
  await expect(page.locator("text=Welcome to")).toBeVisible()
  await expect(page.locator("text=successfully joined")).toBeVisible()

  // 10. Verify Membership
  const header = page.getByRole("navigation").first()
  await expect(header).toContainText(orgName)
})

test("should only show organizations where user is a member", async ({
  page,
}) => {
  // This test verifies that the organization switcher only shows organizations
  // where the current user is a member, not all organizations in the system.

  // 1. Login as test user
  await page.goto("/auth/login")
  await page.fill('input[id="email"]', "test@example.com")
  await page.fill('input[id="password"]', "password123")
  await page.click('button:has-text("Login")')
  await expect(page).toHaveURL(/\/protected/)

  // 2. Create first organization
  await page.click('a:has-text("Create Organization")')
  const org1Name = `User1 Org ${Date.now()}`
  await page.fill('input[id="name"]', org1Name)
  await page.click('button:has-text("Create Organization")')
  await page.waitForLoadState("networkidle")
  await expect(page).toHaveURL(/\/protected/)
  // give the client a moment to update the nav
  await page.waitForTimeout(1000)

  // 3. Verify first org appears in switcher
  await expect(page.locator("nav").getByText(org1Name).first()).toBeVisible()

  // 4. Create second organization
  await page.click('a:has-text("Create Organization")')
  const org2Name = `User1 Another Org ${Date.now()}`
  await page.fill('input[id="name"]', org2Name)
  await page.click('button:has-text("Create Organization")')
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)

  // 5. Verify both orgs appear in switcher
  // Assert the org items exist in the nav (they may be hidden inside the switcher)
  await expect(page.locator("nav").getByText(org1Name)).toHaveCount(1)
  await expect(page.locator("nav").getByText(org2Name)).toHaveCount(1)

  // 6. Logout
  await page.click('button:has-text("Logout")')
  await page.waitForURL(/\/auth\/login/)

  // 7. Login as a different user (who will create their own org)
  await page.goto("/auth/sign-up")
  const otherUserEmail = `other-${Date.now()}@example.com`
  await page.fill('input[id="email"]', otherUserEmail)
  await page.fill('input[id="password"]', "password123")
  await page.fill('input[id="repeat-password"]', "password123")
  await page.click('button:has-text("Sign up")')
  await page.waitForLoadState("networkidle")

  // Navigate to protected page if not already there
  if (!page.url().includes("/protected")) {
    await page.goto("/protected")
    await page.waitForLoadState("networkidle")
  }

  // 8. Create organization as other user
  await page.click('a:has-text("Create Organization")')
  const org3Name = `User2 Org ${Date.now()}`
  await page.fill('input[id="name"]', org3Name)
  await page.click('button:has-text("Create Organization")')
  await page.waitForLoadState("networkidle")

  // 9. Verify other user only sees their own organization
  await expect(page.locator("nav").getByText(org3Name).first()).toBeVisible()

  // 10. Verify other user does NOT see the first user's organizations
  await expect(page.locator("nav").getByText(org1Name)).not.toBeVisible()
  await expect(page.locator("nav").getByText(org2Name)).not.toBeVisible()

  // 11. Logout and login back as first user
  await page.click('button:has-text("Logout")')
  await page.waitForURL(/\/auth\/login/)

  await page.fill('input[id="email"]', "test@example.com")
  await page.fill('input[id="password"]', "password123")
  await page.click('button:has-text("Login")')
  await expect(page).toHaveURL(/\/protected/)
  await page.waitForLoadState("networkidle")

  // Refresh to ensure organizations are loaded
  await page.reload()
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(2000) // Give time for organizations to load

  // 12. Verify first user still sees only their organizations
  try {
    await page.click('button:has-text("Select Organization")')
  } catch {
    await page.click("nav button")
  }
  await page.waitForTimeout(500)
  await expect(page.getByRole("menu").getByText(org1Name).first()).toBeVisible({
    timeout: 10000,
  })
  await expect(page.getByRole("menu").getByText(org2Name).first()).toBeVisible()

  // 13. Verify first user does NOT see the other user's organization
  await expect(page.locator("nav").getByText(org3Name)).not.toBeVisible()
})
