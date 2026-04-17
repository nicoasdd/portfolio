import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

const SOCIAL_ICON_VALUES = [
  'github',
  'linkedin',
  'x',
  'mastodon',
  'bluesky',
  'email',
  'website',
] as const;

const socialLinkSchema = z
  .object({
    label: z.string().min(1).max(40),
    url: z.string().url().regex(/^https?:\/\//),
    icon: z.enum(SOCIAL_ICON_VALUES).optional(),
  })
  .strict();

const resumeUrlSchema = z
  .string()
  .min(1)
  .refine((v) => /^https?:\/\//.test(v) || v.startsWith('/'));

const aboutSchema = z
  .object({
    name: z.string().min(1).max(80),
    headline: z.string().min(1).max(120),
    intro: z.string().min(1).max(240),
    photo: z.string().min(1),
    photoAlt: z.string().min(1).max(160).optional(),
    email: z.string().email(),
    location: z.string().min(1).max(80).optional(),
    availability: z.string().min(1).max(120).optional(),
    skills: z.array(z.string().min(1).max(40)).min(1).max(40),
    socialLinks: z.array(socialLinkSchema).max(10).default([]),
    resumeUrl: resumeUrlSchema.optional(),
  })
  .strict();

const VALID_ABOUT = {
  name: 'Test User',
  headline: 'Senior Engineer',
  intro: 'A short introduction.',
  photo: '/about/profile.svg',
  email: 'test@example.com',
  skills: ['TypeScript', 'Astro'],
};

describe('about frontmatter schema', () => {
  it('accepts a minimal valid about entry', () => {
    const result = aboutSchema.safeParse(VALID_ABOUT);
    expect(result.success).toBe(true);
  });

  it('applies defaults for socialLinks when omitted', () => {
    const result = aboutSchema.parse(VALID_ABOUT);
    expect(result.socialLinks).toEqual([]);
  });

  for (const field of ['name', 'headline', 'intro', 'photo', 'email', 'skills'] as const) {
    it(`rejects missing required field (${field})`, () => {
      const rest: Record<string, unknown> = { ...VALID_ABOUT };
      delete rest[field];
      const result = aboutSchema.safeParse(rest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((i) => i.path[0] === field)).toBe(true);
      }
    });
  }

  it('rejects empty skills array', () => {
    const result = aboutSchema.safeParse({ ...VALID_ABOUT, skills: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'skills')).toBe(true);
    }
  });

  it('rejects malformed email', () => {
    const result = aboutSchema.safeParse({ ...VALID_ABOUT, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'email')).toBe(true);
    }
  });

  it('rejects non-http(s) socialLinks[].url', () => {
    const result = aboutSchema.safeParse({
      ...VALID_ABOUT,
      socialLinks: [{ label: 'FTP', url: 'ftp://example.com' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts an absolute https socialLinks[].url with known icon', () => {
    const result = aboutSchema.safeParse({
      ...VALID_ABOUT,
      socialLinks: [{ label: 'GitHub', url: 'https://github.com/x', icon: 'github' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown socialLinks[].icon enum', () => {
    const result = aboutSchema.safeParse({
      ...VALID_ABOUT,
      socialLinks: [{ label: 'MySpace', url: 'https://myspace.com', icon: 'myspace' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown additional properties', () => {
    const result = aboutSchema.safeParse({ ...VALID_ABOUT, extraField: 'nope' });
    expect(result.success).toBe(false);
  });

  it('accepts resumeUrl as an absolute URL', () => {
    const result = aboutSchema.safeParse({ ...VALID_ABOUT, resumeUrl: 'https://example.com/cv.pdf' });
    expect(result.success).toBe(true);
  });

  it('accepts resumeUrl as a path beginning with "/"', () => {
    const result = aboutSchema.safeParse({ ...VALID_ABOUT, resumeUrl: '/about/resume.pdf' });
    expect(result.success).toBe(true);
  });

  it('rejects resumeUrl that is neither absolute nor begins with "/"', () => {
    const result = aboutSchema.safeParse({ ...VALID_ABOUT, resumeUrl: 'about/resume.pdf' });
    expect(result.success).toBe(false);
  });
});

describe('about helper logic (effectiveAlt + resumeHref + count guards)', () => {
  function effectiveAltOf(data: { name: string; photoAlt?: string }) {
    return data.photoAlt ?? `Portrait of ${data.name}`;
  }

  function resolveResumeHref(resumeUrl: string | undefined, basePath = '') {
    if (!resumeUrl) return undefined;
    if (/^https?:\/\//.test(resumeUrl)) return resumeUrl;
    return `${basePath}${resumeUrl}`;
  }

  function assertExactlyOne(entries: { id: string }[]) {
    if (entries.length === 0) {
      throw new Error(
        'About content is required at src/content/about/profile.md but no entry was found.',
      );
    }
    if (entries.length > 1) {
      const paths = entries.map((e) => e.id).join(', ');
      throw new Error(
        `Expected exactly one About entry under src/content/about/, found ${entries.length}: ${paths}`,
      );
    }
  }

  it('synthesizes effectiveAlt from name when photoAlt is omitted', () => {
    expect(effectiveAltOf({ name: 'Jane Doe' })).toBe('Portrait of Jane Doe');
  });

  it('uses explicit photoAlt when provided', () => {
    expect(effectiveAltOf({ name: 'Jane Doe', photoAlt: 'Custom alt' })).toBe('Custom alt');
  });

  it('returns undefined resumeHref when resumeUrl is omitted', () => {
    expect(resolveResumeHref(undefined)).toBeUndefined();
  });

  it('passes through absolute resume URLs unchanged', () => {
    expect(resolveResumeHref('https://example.com/cv.pdf')).toBe('https://example.com/cv.pdf');
  });

  it('prepends base path to relative resume paths', () => {
    expect(resolveResumeHref('/about/resume.pdf', '/portfolio')).toBe('/portfolio/about/resume.pdf');
  });

  it('throws when the about collection has zero entries', () => {
    expect(() => assertExactlyOne([])).toThrow(/About content is required/);
  });

  it('throws when the about collection has more than one entry', () => {
    expect(() => assertExactlyOne([{ id: 'profile' }, { id: 'profile-es' }])).toThrow(
      /Expected exactly one About entry/,
    );
  });
});

describe('live About content round-trips through the schema', () => {
  function parseFrontmatter(raw: string): Record<string, unknown> {
    const match = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!match) throw new Error('Live profile.md is missing a YAML frontmatter block');
    const fm: Record<string, unknown> = {};
    let currentArrayKey: string | null = null;
    let currentObjectArrayKey: string | null = null;
    let currentObject: Record<string, string> | null = null;

    for (const rawLine of match[1].split('\n')) {
      const line = rawLine.replace(/\s+$/, '');
      if (line.length === 0) continue;

      const objectItemMatch = line.match(/^( {2,4})- (\w+):\s*"?([^"]*)"?$/);
      const arrayItemMatch = line.match(/^( {2,4})- "?([^"]*)"?$/);
      const continuationKvMatch = line.match(/^( {4,6})(\w+):\s*"?([^"]*)"?$/);
      const topLevelKvMatch = line.match(/^(\w+):\s*"?([^"]*)"?$/);

      if (topLevelKvMatch && !line.startsWith(' ')) {
        const [, key, value] = topLevelKvMatch;
        if (value === '') {
          fm[key] = [];
          currentArrayKey = key;
          currentObjectArrayKey = key;
          currentObject = null;
        } else {
          fm[key] = value;
          currentArrayKey = null;
          currentObjectArrayKey = null;
          currentObject = null;
        }
      } else if (objectItemMatch && currentObjectArrayKey) {
        const [, , key, value] = objectItemMatch;
        currentObject = { [key]: value };
        (fm[currentObjectArrayKey] as Record<string, string>[]).push(currentObject);
      } else if (continuationKvMatch && currentObject) {
        const [, , key, value] = continuationKvMatch;
        currentObject[key] = value;
      } else if (arrayItemMatch && currentArrayKey) {
        const [, , value] = arrayItemMatch;
        const arr = fm[currentArrayKey] as unknown[];
        if (arr.length === 0 || typeof arr[0] === 'string') {
          (fm[currentArrayKey] as string[]).push(value);
        }
      }
    }

    return fm;
  }

  it('the live src/content/about/profile.md passes the schema unchanged', () => {
    const raw = readFileSync(
      join(process.cwd(), 'src', 'content', 'about', 'profile.md'),
      'utf8',
    );
    const fm = parseFrontmatter(raw);
    const result = aboutSchema.safeParse(fm);
    if (!result.success) {
      const issues = result.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n');
      throw new Error(
        `Live profile.md frontmatter does not pass the about schema:\n${issues}\n\nParsed:\n${JSON.stringify(fm, null, 2)}`,
      );
    }
    expect(result.success).toBe(true);
  });

  it('the live src/content/about/profile.md has a non-empty Markdown body', () => {
    const raw = readFileSync(
      join(process.cwd(), 'src', 'content', 'about', 'profile.md'),
      'utf8',
    );
    const body = raw.split(/\n---\n/, 2)[1] ?? '';
    expect(body.trim().length).toBeGreaterThan(0);
  });
});
