import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load .env.local
try {
  const envPath = path.resolve(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    console.log(`Loading env from ${envPath}`);
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const idx = line.indexOf('=');
      if (idx > 0) {
         let key = line.substring(0, idx).trim();
         let val = line.substring(idx + 1).trim();
         if (key.startsWith('export ')) key = key.substring(7).trim();
         if (key.startsWith('#')) return;
         
         // Remove surrounding quotes
         if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
             val = val.substring(1, val.length - 1);
         }
         
         if (!process.env[key]) {
             process.env[key] = val;
         }
      }
    });
  }
} catch (e) {
  console.error("Error loading .env.local in config", e);
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 60 * 1000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    locale: 'de-DE', // Set German locale for consistent i18n test behavior
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
