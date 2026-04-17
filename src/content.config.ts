import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const monthPattern = /^[0-9]{4}-(0[1-9]|1[0-2])$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const periodSchema = z
  .object({
    start: z.string().regex(monthPattern, 'period.start must be YYYY-MM'),
    end: z.union([
      z.string().regex(monthPattern, 'period.end must be YYYY-MM or "present"'),
      z.literal('present'),
    ]),
  })
  .refine(
    (p) => p.end === 'present' || p.end >= p.start,
    'period.end must be >= period.start',
  );

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
    slug: z.string().regex(slugPattern, 'slug must be kebab-case').min(1).max(80).optional(),
    role: z.string().min(1).max(80),
    period: periodSchema,
    techStack: z
      .array(z.string().min(1).max(30))
      .min(1, 'techStack must have at least one entry')
      .max(20),
    thumbnail: z.string().min(1),
    screenshots: z.array(z.string().min(1)).max(10).default([]),
    links: linksSchema,
    featured: z.boolean().default(false),
    order: z.number().int().min(0).default(100),
    draft: z.boolean().default(false),
  })
  .strict();

export type ProjectFrontmatter = z.infer<typeof projectSchema>;

const personal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects/personal' }),
  schema: projectSchema,
});

const startup = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects/startup' }),
  schema: projectSchema,
});

const corporate = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects/corporate' }),
  schema: projectSchema,
});

export const collections = { personal, startup, corporate };

export const CATEGORY_KEYS = ['personal', 'startup', 'corporate'] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  personal: 'Personal',
  startup: 'Startup',
  corporate: 'Corporate',
};
