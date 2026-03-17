import { test, expect } from '@playwright/test';

const BASE = 'https://keycard-preview.surge.sh';
const CARD_URL = `${BASE}/npub18ams6ewn5aj2n3wt2qawzglx9mr4nzksxhvrdc4gzrecw7n5tvjqctp424`;
const SCREENSHOTS = '/tmp/screenshots';

// Collect JS errors and network failures
const jsErrors: string[] = [];
const networkFailures: string[] = [];
const brokenImages: string[] = [];

test.describe('QA Overnight Audit - Desktop', () => {

  test('1. Landing page renders correctly', async ({ page }) => {
    const errors: string[] = [];
    const netFails: string[] = [];

    page.on('pageerror', (err) => errors.push(err.message));
    page.on('requestfailed', (req) => netFails.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`));

    const response = await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);

    await page.screenshot({ path: `${SCREENSHOTS}/01-landing-page.png`, fullPage: true });

    // Check page has content
    const body = await page.locator('body').innerText();
    expect(body.length).toBeGreaterThan(50);

    // Check for hero / main heading
    const h1 = page.locator('h1').first();
    if (await h1.count() > 0) {
      console.log('H1 text:', await h1.innerText());
    }

    // Check for key sections
    const allText = await page.locator('body').innerText();
    console.log('Page text length:', allText.length);
    console.log('JS errors on landing:', errors);
    console.log('Network failures on landing:', netFails);

    // Check all images loaded
    const images = page.locator('img');
    const imgCount = await images.count();
    console.log('Image count:', imgCount);
    for (let i = 0; i < imgCount; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      if (naturalWidth === 0) {
        console.log(`BROKEN IMAGE: ${src}`);
      }
    }
  });

  test('2. Card page renders fully', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    const response = await page.goto(CARD_URL, { waitUntil: 'networkidle', timeout: 30000 });
    expect(response?.status()).toBeLessThan(400);

    // Wait for content to load (Nostr data fetch)
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOTS}/02-card-page.png`, fullPage: true });

    const body = await page.locator('body').innerText();
    console.log('Card page text length:', body.length);
    console.log('Card page JS errors:', errors);

    // Look for profile elements
    const avatars = page.locator('img[src*="avatar"], img[src*="profile"], img[alt*="avatar"], img[alt*="profile"], img[class*="avatar"]');
    console.log('Avatar-like images:', await avatars.count());

    // Check for name display
    console.log('Card page text preview:', body.substring(0, 500));
  });

  test('3. QR button opens overlay', async ({ page }) => {
    await page.goto(CARD_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Look for QR button
    const qrButton = page.locator('button:has-text("QR"), button[aria-label*="QR"], button[aria-label*="qr"], [data-testid*="qr"], button:has(svg)').first();
    
    // Try multiple selectors for QR
    const qrSelectors = [
      'button:has-text("QR")',
      'button[aria-label*="QR"]',
      'button[aria-label*="qr"]',
      '[data-testid*="qr"]',
      'button:has-text("Share")',
      'button:has-text("share")',
    ];

    let found = false;
    for (const sel of qrSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        console.log(`Found QR button with selector: ${sel}`);
        await btn.click();
        await page.waitForTimeout(1000);
        found = true;
        break;
      }
    }

    if (!found) {
      // Try clicking any button that might be QR related
      const allButtons = page.locator('button');
      const btnCount = await allButtons.count();
      console.log(`Total buttons on card page: ${btnCount}`);
      for (let i = 0; i < btnCount; i++) {
        const btnText = await allButtons.nth(i).innerText().catch(() => '');
        const btnLabel = await allButtons.nth(i).getAttribute('aria-label').catch(() => '');
        console.log(`Button ${i}: text="${btnText}" aria-label="${btnLabel}"`);
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS}/03-qr-overlay.png`, fullPage: true });

    // Check if overlay/dialog appeared
    const dialog = page.locator('[role="dialog"], .modal, .overlay, [data-state="open"]');
    console.log('Dialog/overlay elements after QR click:', await dialog.count());
  });

  test('4. Create your card button opens auth modal', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Find the CTA button
    const ctaSelectors = [
      'button:has-text("Create your card")',
      'a:has-text("Create your card")',
      'button:has-text("Create")',
      'a:has-text("Create")',
      'button:has-text("Get Started")',
      'a:has-text("Get Started")',
      'button:has-text("Sign")',
      'button:has-text("Login")',
      'button:has-text("Log in")',
    ];

    let found = false;
    for (const sel of ctaSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.count() > 0) {
        console.log(`Found CTA with selector: ${sel}`);
        await btn.click();
        await page.waitForTimeout(1500);
        found = true;
        break;
      }
    }

    if (!found) {
      // List all buttons and links
      const allBtns = page.locator('button, a[href]');
      const count = await allBtns.count();
      console.log(`All interactive elements: ${count}`);
      for (let i = 0; i < Math.min(count, 20); i++) {
        const text = await allBtns.nth(i).innerText().catch(() => '');
        const href = await allBtns.nth(i).getAttribute('href').catch(() => '');
        console.log(`Element ${i}: text="${text.trim()}" href="${href}"`);
      }
    }

    await page.screenshot({ path: `${SCREENSHOTS}/04-auth-modal.png`, fullPage: true });

    const dialog = page.locator('[role="dialog"], .modal, [data-state="open"]');
    console.log('Auth dialog elements:', await dialog.count());
  });
});

test.describe('QA Overnight Audit - Mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('5. Mobile layout - landing page', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: `${SCREENSHOTS}/05-mobile-landing.png`, fullPage: true });

    // Check no horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 375;
    console.log(`Body scroll width: ${bodyWidth}, viewport: ${viewportWidth}`);
    if (bodyWidth > viewportWidth + 5) {
      console.log('WARNING: Horizontal overflow detected!');
    }

    console.log('Mobile JS errors:', errors);
  });

  test('6. Mobile layout - card page', async ({ page }) => {
    await page.goto(CARD_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: `${SCREENSHOTS}/06-mobile-card.png`, fullPage: true });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    console.log(`Mobile card body width: ${bodyWidth}`);
  });
});

test.describe('QA - Error Collection', () => {
  test('7. Comprehensive error check - landing', async ({ page }) => {
    const jsErrs: string[] = [];
    const netFails: string[] = [];
    const consoleErrs: string[] = [];

    page.on('pageerror', (err) => jsErrs.push(err.message));
    page.on('requestfailed', (req) => netFails.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrs.push(msg.text());
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log('=== JS Errors ===', jsErrs);
    console.log('=== Network Failures ===', netFails);
    console.log('=== Console Errors ===', consoleErrs);

    // Check all images
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
      if (!loaded) {
        console.log(`BROKEN IMAGE: ${src}`);
      }
    }
  });

  test('8. Comprehensive error check - card page', async ({ page }) => {
    const jsErrs: string[] = [];
    const netFails: string[] = [];
    const consoleErrs: string[] = [];

    page.on('pageerror', (err) => jsErrs.push(err.message));
    page.on('requestfailed', (req) => netFails.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`));
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrs.push(msg.text());
    });

    await page.goto(CARD_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);

    console.log('=== Card JS Errors ===', jsErrs);
    console.log('=== Card Network Failures ===', netFails);
    console.log('=== Card Console Errors ===', consoleErrs);

    // Check images
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
      if (!loaded) {
        console.log(`BROKEN IMAGE on card: ${src}`);
      }
    }
  });
});
