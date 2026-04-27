import { test, expect } from '@playwright/test';

test.describe('US5: Theme toggle', () => {
  test('clicking the toggle flips the data-theme attribute', async ({ page }) => {
    await page.goto('/');
    const initial = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(initial === 'dark' || initial === 'light').toBe(true);

    await page.getByRole('switch', { name: /toggle color theme/i }).click();
    const swapped = await page.evaluate(() => document.documentElement.dataset.theme);
    expect(swapped).not.toBe(initial);
    expect(swapped === 'dark' || swapped === 'light').toBe(true);
  });

  test('theme-color meta is kept in sync with the active theme', async ({ page }) => {
    await page.goto('/');
    const beforeTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    const beforeColor = await page
      .locator('meta[name="theme-color"]')
      .getAttribute('content');
    expect(beforeColor).toBe(beforeTheme === 'dark' ? '#0b1326' : '#f2f5fb');

    await page.getByRole('switch', { name: /toggle color theme/i }).click();
    const afterTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    const afterColor = await page
      .locator('meta[name="theme-color"]')
      .getAttribute('content');
    expect(afterColor).toBe(afterTheme === 'dark' ? '#0b1326' : '#f2f5fb');
    expect(afterColor).not.toBe(beforeColor);
  });

  test('theme choice persists across navigation and reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('switch', { name: /toggle color theme/i }).click();
    const chosen = await page.evaluate(() => document.documentElement.dataset.theme);

    await page.goto('/about/');
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(chosen);

    await page.reload();
    expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(chosen);
  });

  test('toggle exposes aria-checked state', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('switch', { name: /toggle color theme/i });
    const initialChecked = await toggle.getAttribute('aria-checked');
    expect(['true', 'false']).toContain(initialChecked);
    await toggle.click();
    const nextChecked = await toggle.getAttribute('aria-checked');
    expect(nextChecked).not.toBe(initialChecked);
  });
});
