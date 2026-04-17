import { test, expect } from '@playwright/test';

test.describe('US1: Browse projects by category', () => {
  test('landing page shows hero, featured projects and category nav', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'See projects' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Project categories' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /featured projects|recent projects/i })).toBeVisible();
  });

  test('clicking a category link filters projects', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Project categories' }).getByRole('link', { name: 'Startup' }).click();
    await expect(page).toHaveURL(/\/category\/startup\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/startup/i);
  });

  test('switching categories updates the visible list', async ({ page }) => {
    await page.goto('/category/personal/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/personal/i);
    await page.getByRole('navigation', { name: 'Project categories' }).getByRole('link', { name: 'Corporate' }).click();
    await expect(page).toHaveURL(/\/category\/corporate\/?$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/corporate/i);
  });

  test('all three category pages are reachable and produce no JS console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const cat of ['personal', 'startup', 'corporate']) {
      await page.goto(`/category/${cat}/`);
      await expect(page.getByRole('main')).toBeVisible();
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
