import { test, expect } from '@playwright/test';

test.describe('US1: Blueprint home page', () => {
  test('hero greeting, H1, subcopy, and both CTAs are visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/hi, i'm/i)).toBeVisible();
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText(/selected work/i);
    await expect(h1).toContainText(/personal.*startup.*corporate/is);
    await expect(page.getByRole('link', { name: /view selected work/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /about me/i })).toBeVisible();
  });

  test('primary CTA links to a valid internal or external target', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /view selected work/i });
    const href = await cta.getAttribute('href');
    expect(href).toBeTruthy();
    expect(/^https?:\/\//.test(href!) || href!.startsWith('/')).toBe(true);
  });

  test('credibility strip has at least 4 icon chips', async ({ page }) => {
    await page.goto('/');
    const strip = page.getByRole('region', { name: /what i bring/i });
    await expect(strip).toBeVisible();
    const items = strip.locator('li');
    expect(await items.count()).toBeGreaterThanOrEqual(4);
  });

  test('featured grid renders at least one card with index + title + tech pill', async ({ page }) => {
    await page.goto('/');
    const grid = page.locator('.bp-project-grid__list');
    await expect(grid).toBeVisible();
    const cards = grid.locator('article');
    expect(await cards.count()).toBeGreaterThan(0);
    const first = cards.first();
    await expect(first.getByRole('heading')).toBeVisible();
  });

  test('footer author card and systems strip are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('contentinfo').or(page.locator('footer'))).toBeVisible();
    const systems = page.getByRole('region', { name: /systems strip/i });
    await expect(systems).toBeVisible();
  });

  test('renders without horizontal scroll across viewports', async ({ page }) => {
    for (const width of [320, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const doc = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(doc.scrollWidth).toBeLessThanOrEqual(doc.clientWidth + 1);
    }
  });
});
