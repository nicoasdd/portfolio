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
  const emailMatch = fm.match(/^email:\s*"([^"]+)"/m);

  return {
    headline: headlineMatch?.[1] ?? '',
    name: nameMatch?.[1] ?? '',
    skills,
    email: emailMatch?.[1] ?? '',
  };
}

test.describe('US3: About page chrome and cross-page navigation', () => {
  test('header "About" link is reachable from / and navigates to /about/', async ({ page }) => {
    await page.goto('/');
    await openPrimaryNav(page);
    const aboutLink = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'About' });
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

  test('header "About" link is marked aria-current=page when on /about/', async ({ page }) => {
    await page.goto('/about/');
    await openPrimaryNav(page);
    const aboutLink = page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('link', { name: 'About' });
    await expect(aboutLink).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('US3: About page identity hero', () => {
  test('renders ABOUT eyebrow, name H1, and role subtitle', async ({ page }) => {
    await page.goto('/about/');
    const { name, headline } = readLiveAboutFrontmatter();
    await expect(page.getByText(/^about$/i).first()).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText(name);
    await expect(page.getByText(headline, { exact: true }).first()).toBeVisible();
  });

  test('renders at least one availability pill', async ({ page }) => {
    await page.goto('/about/');
    const hero = page.locator('section[aria-labelledby="bp-about-hero-heading"]');
    const pills = hero.locator('.bp-about-hero__pills li');
    expect(await pills.count()).toBeGreaterThan(0);
  });

  test('renders email / github / linkedin contact lines', async ({ page }) => {
    await page.goto('/about/');
    const { email } = readLiveAboutFrontmatter();
    const mailLink = page.locator(`a[href="mailto:${email}"]`).first();
    await expect(mailLink).toBeVisible();
    const ghLink = page.locator('a[href^="https://github.com/"]').first();
    await expect(ghLink).toBeVisible();
    const liLink = page.locator('a[href^="https://www.linkedin.com/"]').first();
    await expect(liLink).toBeVisible();
  });
});

test.describe('US3: About page content blocks', () => {
  test('Skills section renders a chip per skill in profile.md', async ({ page }) => {
    const { skills } = readLiveAboutFrontmatter();
    expect(skills.length).toBeGreaterThan(0);
    await page.goto('/about/');
    const region = page.getByRole('region', { name: /skills/i });
    await expect(region).toBeVisible();
    const chips = region.getByRole('listitem');
    await expect(chips).toHaveCount(skills.length);
  });

  test('What I care about grid renders when values are populated', async ({ page }) => {
    await page.goto('/about/');
    const values = page.getByRole('region', { name: /what i care about/i });
    await expect(values).toBeVisible();
    const cards = values.getByRole('listitem');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('Why work with me banner renders the 5-step process flow', async ({ page }) => {
    await page.goto('/about/');
    const banner = page.getByRole('region', { name: /why work with me/i });
    await expect(banner).toBeVisible();
    const steps = banner.locator('.bp-process__step');
    await expect(steps).toHaveCount(5);
  });

  test('Elsewhere block renders one card per external profile', async ({ page }) => {
    await page.goto('/about/');
    const elsewhere = page.getByRole('region', { name: /elsewhere/i });
    await expect(elsewhere).toBeVisible();
    const cards = elsewhere.getByRole('listitem');
    expect(await cards.count()).toBeGreaterThanOrEqual(2);
  });

  test('bio body prose is rendered from Markdown', async ({ page }) => {
    await page.goto('/about/');
    const bio = page.getByRole('region', { name: /about me/i });
    await expect(bio).toBeVisible();
    await expect(bio.locator('p').first()).toBeVisible();
  });
});
