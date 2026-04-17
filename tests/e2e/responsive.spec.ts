import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/category/personal/', '/projects/example-startup/'];

test.describe('US4: Responsive browsing', () => {
  test.describe('mobile viewport (320px)', () => {
    test.use({ viewport: { width: 320, height: 800 } });

    for (const route of ROUTES) {
      test(`${route} has no horizontal overflow at 320px`, async ({ page }) => {
        await page.goto(route);
        const body = page.locator('body');
        const scrollWidth = await body.evaluate((el) => el.scrollWidth);
        const clientWidth = await body.evaluate((el) => el.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
      });
    }

    test('mobile menu toggle is visible and reachable', async ({ page }) => {
      await page.goto('/');
      const toggle = page.getByRole('button', { name: /toggle navigation/i });
      await expect(toggle).toBeVisible();
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('tablet viewport (768px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('landing page renders correctly at 768px', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const scrollWidth = await page.locator('body').evaluate((el) => el.scrollWidth);
      const clientWidth = await page.locator('body').evaluate((el) => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });
  });

  test.describe('desktop viewport (1280px)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('landing page renders correctly at 1280px', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const cards = page.getByRole('article');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
