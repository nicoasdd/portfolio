import { test, expect } from '@playwright/test';

test.describe('US2: View project details', () => {
  test('clicking a project card navigates to its detail page', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.getByRole('article').first().getByRole('link').first();
    await firstCard.click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+\/?$/);
  });

  test('project detail page renders title, description, badge, tech stack, role and period', async ({ page }) => {
    await page.goto('/projects/example-startup/');
    await expect(page.getByRole('heading', { level: 1, name: 'Realtime Analytics Platform' })).toBeVisible();
    await expect(page.getByText('Co-founded a startup', { exact: false })).toBeVisible();
    await expect(page.getByText('Startup', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Co-founder & CTO')).toBeVisible();
    await expect(page.getByText('2021-06')).toBeVisible();
    for (const tech of ['Go', 'ClickHouse', 'React']) {
      await expect(page.getByText(tech, { exact: true }).first()).toBeVisible();
    }
  });

  test('project without a live link does not render a "Live demo" link', async ({ page }) => {
    await page.goto('/projects/example-personal/');
    await expect(page.getByRole('link', { name: /live demo/i })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /source code/i })).toBeVisible();
  });

  test('back-to-category link returns to the originating category', async ({ page }) => {
    await page.goto('/projects/example-corporate/');
    await page.getByRole('link', { name: /back to corporate/i }).click();
    await expect(page).toHaveURL(/\/category\/corporate\/?$/);
  });
});
