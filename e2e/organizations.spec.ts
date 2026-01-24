import { expect, test } from '@playwright/test';

test('should create a new organization', async ({ page }) => {
  // 1. Go to login page
  await page.goto('/auth/login');

  // 2. Login
  await page.fill('input[id="email"]', 'test@example.com');
  await page.fill('input[id="password"]', 'password123');
  await page.click('button:has-text("Login")');

  // 3. Verify landing on protected page
  await expect(page).toHaveURL(/\/protected/);

  // 4. Click "Create Organization" in navigation
  await page.click('a:has-text("Create Organization")');
  await expect(page).toHaveURL(/\/organizations\/new/);

  // 5. Fill organization name
  const orgName = `E2E Org ${Date.now()}`;
  await page.fill('input[id="name"]', orgName);
  await page.click('button:has-text("Create Organization")');

  // 6. Verify redirect back to protected
  await expect(page).toHaveURL(/\/protected/);

  // 7. Verify organization name appears in the switcher
  // 7. Verify organization name appears in the switcher
  // We use .first() because there might be multiple nav elements (e.g. mobile vs desktop)
  const header = page.getByRole('navigation').first();
  await expect(header).toContainText(orgName);
});
