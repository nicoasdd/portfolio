import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/category/personal/', '/projects/example-startup/', '/about/'];

async function hasNoOverflow(page: import('@playwright/test').Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
}

test.describe('Responsive browsing — blueprint redesign', () => {
  for (const width of [320, 768, 1024, 1440] as const) {
    test.describe(`viewport ${width}px`, () => {
      test.use({ viewport: { width, height: 900 } });

      for (const route of ROUTES) {
        test(`${route} renders without horizontal overflow at ${width}px`, async ({ page }) => {
          await page.goto(route);
          await hasNoOverflow(page);
        });
      }
    });
  }

  test.describe('mobile 320px specifics', () => {
    test.use({ viewport: { width: 320, height: 800 } });

    test('mobile menu toggle is visible and opens on click', async ({ page }) => {
      await page.goto('/');
      const toggle = page.getByRole('button', { name: /toggle navigation/i });
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });

    test('wordmark stays visible while scrolling', async ({ page }) => {
      await page.goto('/');
      const wordmark = page.getByRole('link', { name: /— home$/i });
      await page.mouse.wheel(0, 800);
      await expect(wordmark.first()).toBeVisible();
    });
  });

  test.describe('desktop 1440px specifics', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('home featured grid renders at least 3 cards on one row', async ({ page }) => {
      await page.goto('/');
      const cards = page.locator('.bp-project-grid__list > li');
      expect(await cards.count()).toBeGreaterThanOrEqual(3);
    });
  });
});
