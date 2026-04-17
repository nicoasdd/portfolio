import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

async function openPrimaryNav(page: Page) {
  const toggle = page.getByRole('button', { name: /toggle navigation/i });
  if (await toggle.isVisible()) {
    const expanded = await toggle.getAttribute('aria-expanded');
    if (expanded !== 'true') await toggle.click();
  }
}

function readLiveAboutFrontmatter() {
  const raw = readFileSync(
    join(process.cwd(), 'src', 'content', 'about', 'profile.md'),
    'utf8',
  );
  const fmBlock = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmBlock) throw new Error('Live profile.md is missing frontmatter');
  const fm = fmBlock[1];

  const headlineMatch = fm.match(/^headline:\s*"([^"]+)"/m);
  const nameMatch = fm.match(/^name:\s*"([^"]+)"/m);
  const skillsBlock = fm.match(/^skills:\n((?: {2}- "[^"]+"\n?)+)/m);
  const skills = skillsBlock
    ? Array.from(skillsBlock[1].matchAll(/- "([^"]+)"/g)).map((m) => m[1])
    : [];

  return {
    headline: headlineMatch?.[1] ?? '',
    name: nameMatch?.[1] ?? '',
    skills,
  };
}

test.describe('US1: About page — recruiter discovers who the owner is', () => {
  test('header "About" link is reachable from / and navigates to /about/', async ({ page }) => {
    await page.goto('/');
    await openPrimaryNav(page);
    const aboutLink = page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' });
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about\/?$/);
  });

  test('header "About" link is reachable from a category page', async ({ page }) => {
    await page.goto('/category/personal/');
    await openPrimaryNav(page);
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'About' })
      .click();
    await expect(page).toHaveURL(/\/about\/?$/);
  });

  test('header "About" link is reachable from a project detail page', async ({ page }) => {
    await page.goto('/projects/example-personal/');
    await openPrimaryNav(page);
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'About' })
      .click();
    await expect(page).toHaveURL(/\/about\/?$/);
  });

  test('about page renders required content above the fold', async ({ page }) => {
    await page.goto('/about/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('img', { name: /portrait of/i })).toBeVisible();
    await expect(page.getByRole('region', { name: /skills/i })).toBeVisible();
    const skillChips = page.getByRole('region', { name: /skills/i }).getByRole('listitem');
    expect(await skillChips.count()).toBeGreaterThan(0);
    await expect(page.getByRole('link', { name: /^email/i }).first()).toBeVisible();
  });

  test('email link uses mailto: scheme', async ({ page }) => {
    await page.goto('/about/');
    const emailLink = page.getByRole('link', { name: /^email/i }).first();
    const href = await emailLink.getAttribute('href');
    expect(href).toMatch(/^mailto:/);
  });

  test('social links open in a new tab with safe rel attributes', async ({ page }) => {
    await page.goto('/about/');
    const socialLinks = page
      .getByRole('region', { name: /social|elsewhere/i })
      .getByRole('link');
    const count = await socialLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const link = socialLinks.nth(i);
      await expect(link).toHaveAttribute('target', '_blank');
      const rel = (await link.getAttribute('rel')) ?? '';
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test('header "About" link is marked aria-current=page when on /about/', async ({ page }) => {
    await page.goto('/about/');
    await openPrimaryNav(page);
    const aboutLink = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'About' });
    await expect(aboutLink).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('US2: Landing page teaser drives About discovery', () => {
  test('landing page renders the AboutTeaser region with name, intro and CTA', async ({ page }) => {
    await page.goto('/');
    const teaser = page.getByRole('region', { name: /about the author|about/i });
    await expect(teaser).toBeVisible();
    await expect(teaser.getByRole('heading', { level: 2 })).toBeVisible();
    const cta = teaser.getByRole('link', { name: /more about|learn more|read more|about/i });
    await expect(cta).toBeVisible();
  });

  test('teaser CTA navigates to /about/', async ({ page }) => {
    await page.goto('/');
    const teaser = page.getByRole('region', { name: /about the author|about/i });
    const cta = teaser.getByRole('link', { name: /more about|learn more|read more|about/i });
    await cta.click();
    await expect(page).toHaveURL(/\/about\/?$/);
  });
});

test.describe('US3: Live profile.md is the source of truth for /about/', () => {
  test('rendered headline matches the value in src/content/about/profile.md', async ({ page }) => {
    const { headline } = readLiveAboutFrontmatter();
    expect(headline.length).toBeGreaterThan(0);
    await page.goto('/about/');
    await expect(page.getByText(headline, { exact: true }).first()).toBeVisible();
  });

  test('rendered skill chip count matches the skills array length in profile.md', async ({ page }) => {
    const { skills } = readLiveAboutFrontmatter();
    expect(skills.length).toBeGreaterThan(0);
    await page.goto('/about/');
    const chips = page.getByRole('region', { name: /skills/i }).getByRole('listitem');
    await expect(chips).toHaveCount(skills.length);
  });

  test('rendered name on /about/ matches the value in profile.md', async ({ page }) => {
    const { name } = readLiveAboutFrontmatter();
    expect(name.length).toBeGreaterThan(0);
    await page.goto('/about/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(name);
  });
});
