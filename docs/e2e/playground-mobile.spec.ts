import { test, expect } from '@playwright/test';

test.describe('Playground Mobile Viewer & Responsiveness', () => {
  test('playground home page loads without horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/open-pdf-generator/playground/index.html', { waitUntil: 'networkidle' });

    // Wait for the splash screen (LoadingPage has 2.2s timer)
    await page.waitForSelector('main', { timeout: 15000 });

    const overflowDetails = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      return {
        docWidth,
        scrollWidth,
        hasOverflow: scrollWidth > docWidth,
      };
    });

    expect(
      overflowDetails.hasOverflow,
      `Playground Home has horizontal overflow: docWidth=${overflowDetails.docWidth}, scrollWidth=${overflowDetails.scrollWidth}`
    ).toBe(false);
  });

  test('selecting a gallery template on mobile opens MobileTemplateViewer', async ({ page }) => {
    await page.goto('/open-pdf-generator/playground/index.html', { waitUntil: 'networkidle' });

    // Wait for Home page
    await page.waitForSelector('main', { timeout: 15000 });

    // Click the first gallery template card
    const galleryCard = page.locator('.group.relative.cursor-pointer').first();
    await expect(galleryCard).toBeVisible();
    await galleryCard.click();

    // Verify Mobile Viewer header & advisory banner are shown
    const advisoryBanner = page.locator('text=Modo Visualizador: edição avançada no canvas requer desktop');
    await expect(advisoryBanner).toBeVisible();

    // Verify subnav tabs exist
    const pdfTab = page.locator('button:has-text("Visualizar PDF")');
    const jsonTab = page.locator('button:has-text("Template JSON")');
    const dataTab = page.locator('button:has-text("Dados")');

    await expect(pdfTab).toBeVisible();
    await expect(jsonTab).toBeVisible();
    await expect(dataTab).toBeVisible();

    // Check switching to Template JSON tab
    await jsonTab.click();
    const preJson = page.locator('pre').first();
    await expect(preJson).toBeVisible();
    await expect(preJson).toContainText('page');

    // Check switching to Data tab
    await dataTab.click();
    const preData = page.locator('pre').first();
    await expect(preData).toBeVisible();

    // Check no horizontal page overflow in mobile viewer
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow, 'Mobile Viewer has horizontal overflow').toBe(false);

    // Click back button to return to Home
    const backBtn = page.locator('header button', { hasText: '←' }).first();
    await backBtn.click();

    // Verify return to Home
    await expect(page.locator('h1')).toContainText('Open PDF Template Studio');
  });

  test('narrow 320px viewport has no overflow on Playground Home', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto('/open-pdf-generator/playground/index.html', { waitUntil: 'networkidle' });

    await page.waitForSelector('main', { timeout: 15000 });

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasOverflow, 'Playground Home at 320px overflowed').toBe(false);
  });
});
