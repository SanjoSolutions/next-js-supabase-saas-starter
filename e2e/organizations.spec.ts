import { expect, test } from '@playwright/test'

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
  
  // Listen for console errors
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  await page.fill('input[id="name"]', orgName);
  await page.click('button:has-text("Create Organization")');
  
  // Wait for navigation
  await page.waitForLoadState('networkidle');

  // 6. Verify redirect back to protected
  await expect(page).toHaveURL(/\/protected/);

  // 7. Verify organization name appears in the switcher
  // 7. Verify organization name appears in the switcher
  // We use .first() because there might be multiple nav elements (e.g. mobile vs desktop)
  const header = page.getByRole('navigation').first();
  await expect(header).toContainText(orgName);
});

test('should create an invite link', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  // 1. Login
  await page.goto('/auth/login');
  await page.fill('input[id="email"]', 'test@example.com');
  await page.fill('input[id="password"]', 'password123');
  await page.click('button:has-text("Login")');
  await expect(page).toHaveURL(/\/protected/);
  await page.waitForLoadState('networkidle');

  // 2. Create Organization
  const orgName = `Invite Org ${Date.now()}`;
  await page.click('a:has-text("Create Organization")');
  await expect(page).toHaveURL(/\/organizations\/new/);
  await page.fill('input[id="name"]', orgName);
  await page.click('button:has-text("Create Organization")');
  await expect(page).toHaveURL(/\/protected/);
  await page.waitForLoadState('networkidle');

  // 3. Create Invite
  // Wait for the Invite link to appear and click it
  await page.waitForSelector('a:has-text("Invite")');
  await page.click('a:has-text("Invite")');
  await expect(page).toHaveURL(/\/invites\/new/);

  await expect(page.locator('text=Invite Member')).toBeVisible();
  await page.fill('form input[id="email"]', 'new-user@example.com');
  await page.click('button:has-text("Create Invite")');

  await expect(page.locator('text=Invite created successfully!')).toBeVisible();
  const linkText = await page.locator('text=Link:').innerText();
  const match = linkText.match(/https?:\/\/[^\s]+/);
  if (!match) throw new Error(`Could not find URL in: ${linkText}`);
  const inviteLink = match[0];
  console.log('Extracted Invite Link:', inviteLink);

  // 4. Logout
  await page.click('button:has-text("Logout")');
  await expect(page).toHaveURL(/\/auth\/login/);

  // 5. Go to Invite Link
  await page.goto(inviteLink, { waitUntil: 'networkidle' });
  try {
    await expect(page.locator('text=Organization Invitation')).toBeVisible({ timeout: 15000 });
  } catch (e) {
    console.log('PAGE BODY ON FAILURE:', await page.textContent('body'));
    throw e;
  }

  // 6. Click Accept (should redirect to sign-up since not logged in)
  await page.click('button:has-text("Accept Invitation")');
  await expect(page).toHaveURL(/\/auth\/sign-up\?(.*)?return_url=.*/, { timeout: 10000 });

  // 7. Sign up as New User
  const newUserEmail = `invited-${Date.now()}@example.com`;
  await page.fill('input[id="email"]', newUserEmail);
  await page.fill('input[id="password"]', 'password123');
  await page.fill('input[id="repeat-password"]', 'password123');
  await page.click('button:has-text("Sign up")');

  // 8. Should be redirected back to the invite page
  await expect(page).toHaveURL(/invites\/accept\?token=.*/, { timeout: 10000 });
  
  // 9. Now it should work since we're logged in
  // We might be redirected to sign-up if not logged in (session not persisted).
  
  // 9. Wait for the client component to load data and render
  console.log('Step 9: Waiting for invite page to load...');
  await page.waitForLoadState('networkidle');
  
  // Give the client component time to fetch and render
  await page.waitForTimeout(2000);
  
  // Check if we're on the invite page or got redirected to auth
  const currentURL = page.url();
  console.log('Current URL after load:', currentURL);
  
  if (currentURL.includes('/auth/')) {
       console.log('Redirected to auth page, performing manual login...');
       
       // If on sign up page, go to login
       if (await page.isVisible('text=Already have an account?')) {
           await page.click('text=Login');
       }
       
       await page.fill('input[name="email"]', newUserEmail);
       await page.fill('input[name="password"]', 'password123');
       await page.click('button:has-text("Login")');
       
       // Login might redirect to /protected or home. We need to go back to invite link.
       await page.waitForLoadState('networkidle');
       console.log('Manual login done, navigating back to invite link: ' + inviteLink);
       await page.goto(inviteLink);
       await page.waitForLoadState('networkidle');
       await page.waitForTimeout(2000);
  }

  // Now wait for the button to appear
  console.log('Waiting for Accept Invitation button...');
  try {
        await page.waitForSelector('button:has-text("Accept Invitation")', { timeout: 25000 });
        console.log('Button found, clicking...');
        await page.click('button:has-text("Accept Invitation")');
  } catch(e) {
      console.log('STEP 9 FINAL FAILURE - Page content:', await page.content());
      console.log('FINAL URL:', page.url());
      throw e;
  }
  
  // Verify redirect to welcome page
  await expect(page).toHaveURL(/\/organizations\/[^/]+\/welcome/);
  await page.waitForLoadState('networkidle');

  // Verify welcome message is displayed
  await expect(page.locator('text=Welcome to')).toBeVisible();
  await expect(page.locator('text=successfully joined')).toBeVisible();

  // 10. Verify Membership
  const header = page.getByRole('navigation').first();
  await expect(header).toContainText(orgName);
});
