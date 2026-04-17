import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const monthPattern = /^[0-9]{4}-(0[1-9]|1[0-2])$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const periodSchema = z
  .object({
    start: z.string().regex(monthPattern),
    end: z.union([z.string().regex(monthPattern), z.literal('present')]),
  })
  .refine((p) => p.end === 'present' || p.end >= p.start);

const linksSchema = z
  .object({
    source: z.string().url().regex(/^https?:\/\//).optional(),
    live: z.string().url().regex(/^https?:\/\//).optional(),
    caseStudy: z.string().url().regex(/^https?:\/\//).optional(),
  })
  .strict()
  .default({});

const projectSchema = z
  .object({
    title: z.string().min(1).max(80),
    description: z.string().min(1).max(240),
    slug: z.string().regex(slugPattern).min(1).max(80).optional(),
    role: z.string().min(1).max(80),
    period: periodSchema,
    techStack: z.array(z.string().min(1).max(30)).min(1).max(20),
    thumbnail: z.string().min(1),
    screenshots: z.array(z.string().min(1)).max(10).default([]),
    links: linksSchema,
    featured: z.boolean().default(false),
    order: z.number().int().min(0).default(100),
    draft: z.boolean().default(false),
  })
  .strict();

const VALID_PROJECT = {
  title: 'Test Project',
  description: 'A short, sensible description.',
  role: 'Lead Engineer',
  period: { start: '2024-01', end: 'present' as const },
  techStack: ['TypeScript', 'Astro'],
  thumbnail: '/projects/test/thumb.svg',
};

describe('project frontmatter schema', () => {
  it('accepts a minimal valid project', () => {
    const result = projectSchema.safeParse(VALID_PROJECT);
    expect(result.success).toBe(true);
  });

  it('applies defaults for optional fields', () => {
    const result = projectSchema.parse(VALID_PROJECT);
    expect(result.featured).toBe(false);
    expect(result.order).toBe(100);
    expect(result.draft).toBe(false);
    expect(result.screenshots).toEqual([]);
  });

  it('rejects missing required field (title)', () => {
    const rest: Record<string, unknown> = { ...VALID_PROJECT };
    delete rest.title;
    const result = projectSchema.safeParse(rest);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'title')).toBe(true);
    }
  });

  it('rejects empty techStack', () => {
    const result = projectSchema.safeParse({ ...VALID_PROJECT, techStack: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'techStack')).toBe(true);
    }
  });

  it('rejects invalid slug pattern', () => {
    const result = projectSchema.safeParse({ ...VALID_PROJECT, slug: 'Not_Valid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === 'slug')).toBe(true);
    }
  });

  it('rejects period.end before period.start', () => {
    const result = projectSchema.safeParse({
      ...VALID_PROJECT,
      period: { start: '2024-06', end: '2024-03' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown additional properties', () => {
    const result = projectSchema.safeParse({ ...VALID_PROJECT, extraField: 'nope' });
    expect(result.success).toBe(false);
  });

  it('rejects non-https URL in links', () => {
    const result = projectSchema.safeParse({
      ...VALID_PROJECT,
      links: { live: 'ftp://example.com' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts links with only some fields populated', () => {
    const result = projectSchema.safeParse({
      ...VALID_PROJECT,
      links: { source: 'https://github.com/x/y' },
    });
    expect(result.success).toBe(true);
  });
});
