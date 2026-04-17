import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  { path: '/', name: 'landing' },
  { path: '/category/personal/', name: 'category-personal' },
  { path: '/category/startup/', name: 'category-startup' },
  { path: '/category/corporate/', name: 'category-corporate' },
  { path: '/projects/example-personal/', name: 'project-detail' },
  { path: '/about/', name: 'about' },
  { path: '/404.html', name: '404' },
];

test.describe('Accessibility (WCAG 2.1 AA)', () => {
  for (const route of ROUTES) {
    test(`${route.name} (${route.path}) has no serious or critical violations`, async ({ page }) => {
      await page.goto(route.path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const seriousOrCritical = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );

      const message = seriousOrCritical
        .map((v) => `${v.id} (${v.impact}): ${v.description}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`)
        .join('\n\n');

      expect(seriousOrCritical, message).toEqual([]);
    });
  }

  test('about page profile photo has a non-empty alt attribute', async ({ page }) => {
    await page.goto('/about/');
    const photo = page.getByRole('img', { name: /portrait of/i });
    await expect(photo).toBeVisible();
    const alt = await photo.getAttribute('alt');
    expect(alt).toBeTruthy();
    expect((alt ?? '').length).toBeGreaterThan(0);
  });
});
