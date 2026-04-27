import { test, expect } from '@playwright/test';

test.describe('Sticky header & cross-page navigation', () => {
  test('home page renders hero, credibility strip, and featured grid', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /view selected work/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /about me/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /what i bring/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /featured projects/i })).toBeVisible();
  });

  test('top nav links point to every main route', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toBeVisible();
    for (const label of ['Home', 'About', 'Personal', 'Startup', 'Corporate']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
  });

  test('clicking a category link loads that category page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Startup' }).click();
    await expect(page).toHaveURL(/\/category\/startup\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/startup/i);
  });

  test('the current page link shows an active state', async ({ page }) => {
    await page.goto('/category/personal/');
    const active = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', {
      name: 'Personal',
    });
    await expect(active).toHaveAttribute('aria-current', 'page');
  });

  test('all three category pages are reachable without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const cat of ['personal', 'startup', 'corporate']) {
      await page.goto(`/category/${cat}/`);
      await expect(page.getByRole('main')).toBeVisible();
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
