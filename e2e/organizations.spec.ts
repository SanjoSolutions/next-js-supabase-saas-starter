import { expect, test } from "@playwright/test"
import {
    acceptInvite,
    createInvite,
    createOrganization,
    enableConsoleLogs,
    generateTestEmail,
    login,
    loginAsTestUser,
    logout,
    signUp,
    TEST_USER,
} from "./helpers"

test("should create a new organization", async ({ page }) => {
  enableConsoleLogs(page)

  // 1. Login
  await loginAsTestUser(page)

  // 2. Create organization
  const orgName = await createOrganization(page, "E2E Org")

  // 3. Verify redirect back to protected
  await expect(page).toHaveURL(/\/protected/)

  // 4. Verify organization name appears in the switcher
  const header = page.getByRole("navigation").first()
  await expect(header).toContainText(orgName)
})

test("should create an invite link", async ({ page }) => {
  enableConsoleLogs(page)

  // 1. Login
  await loginAsTestUser(page)

  // 2. Create organization
  const orgName = await createOrganization(page, "Invite Org")
  await expect(page).toHaveURL(/\/protected/)

  // 3. Create invite for new user
  const newUserEmail = generateTestEmail("new-user")
  const inviteLink = await createInvite(page, newUserEmail)
  console.log("Extracted Invite Link:", inviteLink)

  // 4. Sign up the new user
  await signUp(page, { email: newUserEmail, firstName: "Invited User" })

  // 5. Accept the invite
  await acceptInvite(page, inviteLink)

  // 6. Verify welcome message
  await expect(page.locator("text=Welcome to")).toBeVisible()
  await expect(page.locator("text=successfully joined")).toBeVisible()

  // 7. Verify Membership
  const header = page.getByRole("navigation").first()
  await expect(header).toContainText(orgName)
})

test("should only show organizations where user is a member", async ({
  page,
}) => {
  // 1. Login as test user
  await loginAsTestUser(page)

  // 2. Create first organization
  const org1Name = await createOrganization(page, "User1 Org")
  await expect(page).toHaveURL(/\/protected/)
  await page.waitForTimeout(1000)

  // 3. Verify first org appears in switcher
  await expect(page.locator("nav").getByText(org1Name).first()).toBeVisible()

  // 4. Create second organization
  const org2Name = await createOrganization(page, "User1 Another Org")
  await page.waitForTimeout(1000)

  // 5. Verify both orgs appear in switcher
  await page.click('button:has-text("User1 Another Org")')
  await expect(page.getByRole("menu").getByText(org1Name)).toBeVisible()
  await expect(page.getByRole("menu").getByText(org2Name)).toBeVisible()
  await page.keyboard.press("Escape") // Close switcher

  // 6. Logout
  await logout(page)

  // 7. Sign up as a different user
  const otherUserEmail = generateTestEmail("other")
  await signUp(page, { email: otherUserEmail, firstName: "Other User" })

  // Navigate to protected page if not already there
  if (!page.url().includes("/protected")) {
    await page.goto("/protected")
    await page.waitForLoadState("networkidle")
  }

  // 8. Create organization as other user
  const org3Name = await createOrganization(page, "User2 Org")

  // 9. Verify other user only sees their own organization
  await expect(page.locator("nav").getByText(org3Name).first()).toBeVisible()

  // 10. Verify other user does NOT see the first user's organizations
  await expect(page.locator("nav").getByText(org1Name)).not.toBeVisible()
  await expect(page.locator("nav").getByText(org2Name)).not.toBeVisible()

  // 11. Logout and login back as first user
  await logout(page)
  await login(page, TEST_USER.email, TEST_USER.password)
  await page.waitForLoadState("networkidle")

  // Refresh to ensure organizations are loaded
  await page.reload()
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(2000)

  // 12. Verify first user still sees only their organizations
  try {
    await page.click('button:has-text("Select Organization")')
  } catch {
    await page.click("nav button")
  }
  await page.waitForTimeout(500)
  await expect(
    page.getByRole("menu").getByText(org1Name).first()
  ).toBeVisible({ timeout: 10000 })
  await expect(page.getByRole("menu").getByText(org2Name).first()).toBeVisible()

  // 13. Verify first user does NOT see the other user's organization
  await expect(page.locator("nav").getByText(org3Name)).not.toBeVisible()
})

test("members page shows owner and invited member", async ({ page }) => {
  enableConsoleLogs(page)

  // 1. Login as owner
  await loginAsTestUser(page)

  // 2. Create organization
  const orgName = await createOrganization(page, "Members Test Org")
  await page.waitForTimeout(1000)

  // 3. Create invite for other user
  const otherUserEmail = generateTestEmail("member")
  const inviteLink = await createInvite(page, otherUserEmail)

  // 4. Sign up the other user and accept invite
  await signUp(page, { email: otherUserEmail, firstName: "Member User" })
  await acceptInvite(page, inviteLink)

  // 5. Logout and login back as owner
  await logout(page)
  await login(page, TEST_USER.email, TEST_USER.password)
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)

  // 6. Open Members page via header
  await page.click('a:has-text("Members")')
  await page.waitForLoadState("networkidle")
  await page.waitForTimeout(1000)

  // 7. Assert both owner and invited member emails are visible
  await expect(page.locator("table")).toContainText(TEST_USER.email)
  await expect(page.locator("table")).toContainText(otherUserEmail, {
    timeout: 60000,
  })
})
