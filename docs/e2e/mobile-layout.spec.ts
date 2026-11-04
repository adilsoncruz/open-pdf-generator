import { test, expect } from '@playwright/test';

const PAGES = [
  { name: 'Home (EN)', path: '/' },
  { name: 'Home (PT)', path: '/pt/' },
  { name: 'Home (ES)', path: '/es/' },
  { name: 'CLI Overview', path: '/cli/' },
  { name: 'CLI Commands', path: '/cli/commands.html' },
  { name: 'CLI Examples', path: '/cli/examples.html' },
  { name: 'CLI Installation', path: '/cli/installation.html' },
  { name: 'CLI Polyglot', path: '/cli/polyglot.html' },
  { name: 'Library Overview', path: '/lib/' },
  { name: 'Library Getting Started', path: '/lib/guide/getting-started.html' },
  { name: 'Library Table Element', path: '/lib/guide/elements/table.html' },
  { name: 'Library API Template', path: '/lib/api/template.html' },
  { name: 'Benchmark JasperReports', path: '/lib/benchmark.html' },
  { name: 'Benchmark Multi-language', path: '/lib/benchmark-multilang.html' },
  { name: 'Editor Overview', path: '/editor/' },
];

test.describe('Mobile Responsiveness & Layout Integrity', () => {
  for (const pageInfo of PAGES) {
    test(`no horizontal overflow on ${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
      await page.goto(pageInfo.path, { waitUntil: 'networkidle' });

      // Check window width vs scroll width
      const overflowDetails = await page.evaluate(() => {
        const docWidth = document.documentElement.clientWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const overflowingElements: Array<{ tag: string; className: string; id: string; width: number; right: number }> = [];

        if (scrollWidth > docWidth) {
          const all = document.querySelectorAll('*');
          all.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > docWidth + 1) {
              overflowingElements.push({
                tag: el.tagName.toLowerCase(),
                className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 100) : '',
                id: el.id || '',
                width: Math.round(rect.width),
                right: Math.round(rect.right),
              });
            }
          });
        }

        return {
          docWidth,
          scrollWidth,
          hasOverflow: scrollWidth > docWidth,
          overflowingElements: overflowingElements.slice(0, 10),
        };
      });

      expect(
        overflowDetails.hasOverflow,
        `Page ${pageInfo.path} has horizontal overflow! docWidth: ${overflowDetails.docWidth}, scrollWidth: ${overflowDetails.scrollWidth}. Elements: ${JSON.stringify(overflowDetails.overflowingElements, null, 2)}`
      ).toBe(false);
    });
  }

  test('hero slider on home does not cause overflow on any slide', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const dotButtons = page.locator('.dot-btn');
    const count = await dotButtons.count();

    for (let i = 0; i < count; i++) {
      await dotButtons.nth(i).click();
      await page.waitForTimeout(400); // allow transition

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasOverflow, `Slide ${i} caused horizontal overflow`).toBe(false);
    }
  });

  test('unified benchmark tabs do not cause overflow when switched', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const tabs = page.locator('.nav-tab');
    const count = await tabs.count();

    for (let i = 0; i < count; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(200);

      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasOverflow, `Tab ${i} caused horizontal overflow`).toBe(false);
    }
  });

  test('mobile navigation menu is accessible and toggleable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const hamburger = page.locator('.VPNavBarHamburger, button[aria-label="mobile navigation"]');
    if (await hamburger.count() > 0) {
      await expect(hamburger.first()).toBeVisible();
      await hamburger.first().click();
      const navScreen = page.locator('.VPNavScreen');
      await expect(navScreen).toBeVisible();
    }
  });

  test('narrow viewport (320px) has no overflow on Home', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 600 });
    await page.goto('/', { waitUntil: 'networkidle' });

    const overflowDetails = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const overflowingElements: Array<{ tag: string; className: string; id: string; width: number; right: number }> = [];

      if (scrollWidth > docWidth) {
        const all = document.querySelectorAll('*');
        all.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 1) {
            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 100) : '',
              id: el.id || '',
              width: Math.round(rect.width),
              right: Math.round(rect.right),
            });
          }
        });
      }

      return {
        docWidth,
        scrollWidth,
        hasOverflow: scrollWidth > docWidth,
        overflowingElements: overflowingElements.slice(0, 10),
      };
    });

    expect(
      overflowDetails.hasOverflow,
      `Home at 320px overflowed! docWidth: ${overflowDetails.docWidth}, scrollWidth: ${overflowDetails.scrollWidth}. Elements: ${JSON.stringify(overflowDetails.overflowingElements, null, 2)}`
    ).toBe(false);
  });
});
