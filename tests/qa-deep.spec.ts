import { test, expect } from '@playwright/test';

const BASE = 'https://keycard-preview.surge.sh';
const CARD_URL = `${BASE}/npub18ams6ewn5aj2n3wt2qawzglx9mr4nzksxhvrdc4gzrecw7n5tvjqctp424`;
const SCREENSHOTS = '/tmp/screenshots';

test('Landing page - scroll to reveal all sections', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Scroll through the page to trigger IntersectionObserver
  await page.evaluate(async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const height = document.body.scrollHeight;
    for (let i = 0; i < height; i += 300) {
      window.scrollTo(0, i);
      await delay(200);
    }
    // Scroll back to top
    window.scrollTo(0, 0);
    await delay(500);
  });

  await page.screenshot({ path: `${SCREENSHOTS}/07-landing-after-scroll.png`, fullPage: true });

  // Check specific sections
  const howItWorks = page.locator('text=How it works');
  expect(await howItWorks.count()).toBeGreaterThan(0);
  console.log('How it works visible:', await howItWorks.isVisible());

  const whyKeycard = page.locator('text=Why key.card?');
  expect(await whyKeycard.count()).toBeGreaterThan(0);
  console.log('Why key.card visible:', await whyKeycard.isVisible());

  const comparison = page.locator('text=key.card vs. the competition');
  expect(await comparison.count()).toBeGreaterThan(0);
  console.log('Comparison visible:', await comparison.isVisible());

  const finalCta = page.locator('text=Ready to own your identity?');
  expect(await finalCta.count()).toBeGreaterThan(0);
  console.log('Final CTA visible:', await finalCta.isVisible());
});

test('Card page - handle 404 from surge and check SPA routing', async ({ page }) => {
  // Surge serves 404.html with 404 status - but React Router should still work
  const response = await page.goto(CARD_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('Card page status:', response?.status());

  await page.waitForTimeout(5000);
  await page.screenshot({ path: `${SCREENSHOTS}/08-card-page-content.png`, fullPage: true });

  const bodyText = await page.locator('body').innerText();
  console.log('Card page text (first 1000 chars):', bodyText.substring(0, 1000));

  // Check if card rendered or if we got the NotFound page
  const notFoundText = page.locator('text=404');
  const notFoundCount = await notFoundText.count();
  console.log('404 text elements:', notFoundCount);

  // Check if profile loaded
  const derekName = page.locator('text=Derek Ross');
  console.log('Derek Ross name found:', await derekName.count());
});

test('QR overlay content check', async ({ page }) => {
  // Go to card page (even with 404 status, React Router may handle it)
  await page.goto(CARD_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Find and click QR button
  const qrBtn = page.locator('button:has-text("QR")').first();
  if (await qrBtn.count() > 0) {
    await qrBtn.click();
    await page.waitForTimeout(1500);

    // Check QR overlay content
    const dialogContent = page.locator('[role="dialog"]');
    if (await dialogContent.count() > 0) {
      const text = await dialogContent.innerText();
      console.log('QR dialog content:', text.substring(0, 500));

      // Check for QR code image/canvas
      const qrImage = page.locator('[role="dialog"] img, [role="dialog"] canvas, [role="dialog"] svg');
      console.log('QR image/canvas/svg elements:', await qrImage.count());
    }

    await page.screenshot({ path: `${SCREENSHOTS}/09-qr-overlay-detail.png`, fullPage: true });
  }
});

test('Auth modal content check', async ({ page }) => {
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const createBtn = page.locator('button:has-text("Create your card")').first();
  await createBtn.click();
  await page.waitForTimeout(1500);

  const dialog = page.locator('[role="dialog"]');
  if (await dialog.count() > 0) {
    const text = await dialog.innerText();
    console.log('Auth modal content:', text.substring(0, 500));

    // Check for buttons/inputs in dialog
    const dialogButtons = dialog.locator('button');
    const btnCount = await dialogButtons.count();
    console.log('Buttons in auth modal:', btnCount);
    for (let i = 0; i < btnCount; i++) {
      console.log(`  Button ${i}: "${await dialogButtons.nth(i).innerText()}"`);
    }
  }

  await page.screenshot({ path: `${SCREENSHOTS}/10-auth-modal-detail.png`, fullPage: true });
});
