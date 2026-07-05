import { test, expect } from '@playwright/test';

test('Sentari Software homepage loads and has key elements', async ({ page }) => {
  // Navigate to the live site
  await page.goto('https://sentarisoftware.com');

  // Wait for page to fully load
  await page.waitForLoadState('networkidle');

  // Check the page title
  await expect(page).toHaveTitle(/Sentari Software/i);

  // Take a full-page screenshot
  await page.screenshot({ path: 'test/screenshots/fullpage.png', fullPage: true });

  // Check the hero heading
  const hero = page.locator('h1').first();
  await expect(hero).toBeVisible();
  const heroText = await hero.textContent();
  console.log('Hero text:', heroText);

  // Check navigation exists
  const nav = page.locator('nav');
  await expect(nav).toBeVisible();

  // Check the logo
  const logo = page.locator('.logo');
  await expect(logo).toBeVisible();

  // Check buttons exist
  const buttons = page.locator('a.btn');
  await expect(buttons.first()).toBeVisible();

  // Check cards section exists
  const cards = page.locator('.card');
  const cardCount = await cards.count();
  console.log('Number of cards found:', cardCount);

  // Check dark section
  const darkSection = page.locator('.section-dark').first();
  await expect(darkSection).toBeVisible();

  // Check the document stream animation
  const docStream = page.locator('.doc-stream');
  await expect(docStream).toBeVisible();

  // Scroll through the page and capture sections
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test/screenshots/bottom-of-page.png' });

  // Check footer
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();
});
