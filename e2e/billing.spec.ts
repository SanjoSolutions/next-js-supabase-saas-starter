import { expect, test } from "@playwright/test";

test("should define organization billing plan", async ({ page }) => {
  test.setTimeout(60000); // Increase timeout to 60s
  page.on("console", (msg) => console.log("BROWSER:", msg.text()));

  // 1. Login
  console.log("Step 1: Login")
  await page.goto("/auth/login")
  await page.fill('input[id="email"]', "test@example.com")
  await page.fill('input[id="password"]', "password123")
  await page.click('button:has-text("Login")')
  await expect(page).toHaveURL(/\/protected/)

  // 2. Create organization
  console.log("Step 2: Create Org")
  await page.click('a:has-text("Create Organization")')
  const orgName = `Billing Org ${Date.now()}`
  await page.fill('input[id="name"]', orgName)
  await page.click('button:has-text("Create Organization")')
  await page.waitForLoadState("networkidle")

  // 3. Navigate to Billing
  console.log("Step 3: Navigate to Billing")
  // Ensure the link is visible
  if (await page.locator('button:has-text("Select Organization")').isVisible()) {
     // Wait for nav to update or reload
     await page.reload()
  }
  
  await page.click('a:has-text("Billing")')
  await expect(page.locator("h1")).toContainText("Billing & Plans")

  // 4. Verify Free Plan is active
  await expect(page.locator("text=Current Plan")).toBeVisible()
  await expect(page.locator("text=$0")).toBeVisible()

  // 5. Click Upgrade
  console.log("Step 5: Click Upgrade")
  const [response] = await Promise.all([
    page.waitForResponse(res => res.url().includes("checkout.stripe.com") && res.status() === 200, { timeout: 30000 }).catch(e => { console.log('Wait response failed:', e); return null; }),
    page.click('button:has-text("Upgrade to Pro")')
  ])
  
  if (!response) {
      console.log("Warning: Stripe checkout response not intercepted, but continuing if URL changes...")
  }
  
  // Wait for Stripe Checkout to load
  console.log("Waiting for Stripe URL...")
  await page.waitForURL(/checkout.stripe.com/, { timeout: 30000 });
  
  // Fill Stripe Checkout Form (Test Mode)
  console.log("Filling Stripe Checkout...")
  
  // Stripe Checkout is tricky. It might be in a different context or have dynamic IDs.
  // We'll try common labels.
  try {
      // Sometimes it takes a moment for the form to interact
      await page.waitForTimeout(5000); 

      // Fill email if asked (sometimes it's prefilled, sometimes not)
      if (await page.getByLabel("Email").isVisible()) {
          await page.getByLabel("Email").fill("test@example.com");
      }

      // Stripe's checkout uses a combined card input widget
      // We need to Tab between card number, expiration, and CVC fields
      const cardInput = page.getByPlaceholder("1234 1234 1234 1234").or(page.getByLabel("Card number"));
      await cardInput.fill("4242424242424242");
      
      // Tab to expiration and fill it
      await page.keyboard.press("Tab");
      await page.keyboard.type("1234"); // MM/YY format without slash
      
      // Tab to CVC and fill it
      await page.keyboard.press("Tab");
      await page.keyboard.type("123");
      
      // Cardholder name is required by Stripe checkout
      const nameInput = page.getByLabel("Cardholder name");
      await nameInput.fill("Test User");

      // Zip might be needed
      if (await page.getByLabel("ZIP").isVisible()) {
        await page.getByLabel("ZIP").fill("12345");
      }
      
      console.log("Submitting payment...")
      // Click the Pay button. It usually has the amount.
      await page.click('button[type="submit"]'); 

  } catch (e) {
      console.log("Stripe element filling failed. Dumping content:");
      // cannot dump huge content, but title helps
      console.log(await page.title());
      throw e;
  }
  
  // Wait for redirect back to the app
  
  // Wait for redirect back to the app
  console.log("Waiting for redirect back...")
  await page.waitForURL(/\/billing\?success=true/, { timeout: 30000 });
  
  // 6. Verify Pro Plan is active
  // The webhook might take a second to process. reload until it updates.
  console.log("Waiting for webhook to update DB...")
  
  await expect(async () => {
    console.log("Reloading to check plan...")
    await page.reload();
    await expect(page.locator("text=Pro Plan")).toBeVisible();
    await expect(page.locator('button:has-text("Manage Subscription")')).toBeVisible(); 
  }).toPass({ timeout: 45000 }); // Give it 45s for the webhook to land
})
