import { test, expect } from '@playwright/test';

const categories: Array<{ slug: string; label: RegExp }> = [
  { slug: 'personal', label: /personal/i },
  { slug: 'startup', label: /startup/i },
  { slug: 'corporate', label: /corporate/i },
];

test.describe('US2: Category pages', () => {
  for (const cat of categories) {
    test(`${cat.slug} page shows hero, breadcrumb, filter chips, and projects`, async ({ page }) => {
      await page.goto(`/category/${cat.slug}/`);

      // Breadcrumb
      const crumbs = page.getByRole('navigation', { name: /breadcrumb/i });
      await expect(crumbs).toBeVisible();
      await expect(crumbs.getByRole('link', { name: /home/i })).toBeVisible();

      // Hero H1 + mission
      await expect(page.getByRole('heading', { level: 1 })).toContainText(cat.label);

      // Filter chips
      const filterNav = page.getByRole('navigation', { name: /filter projects/i });
      await expect(filterNav).toBeVisible();
      for (const label of ['All', 'Personal', 'Startup', 'Corporate']) {
        await expect(filterNav.getByRole('link', { name: label })).toBeVisible();
      }

      // Active chip marked aria-current
      const active = filterNav.getByRole('link', {
        name: new RegExp(`^${cat.slug}$`, 'i'),
      });
      await expect(active).toHaveAttribute('aria-current', 'page');
    });
  }

  test('personal page includes the csgo-try featured card with metric panel', async ({ page }) => {
    await page.goto('/category/personal/');
    await expect(page.getByRole('heading', { level: 3, name: /csgo-try\.com/i })).toBeVisible();
    await expect(page.getByText(/70K/)).toBeVisible();
    await expect(page.getByText(/CONCURRENT/i)).toBeVisible();
  });

  test('clicking All filter returns to home', async ({ page }) => {
    await page.goto('/category/startup/');
    await page.getByRole('navigation', { name: /filter projects/i }).getByRole('link', { name: 'All' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
