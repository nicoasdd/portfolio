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

const ARCH_ICON_KEYS = [
  'users',
  'api',
  'db',
  'cache',
  'queue',
  'server',
  'web',
  'messaging',
  'blockchain',
  'cloud',
] as const;

export type ArchIconKey = (typeof ARCH_ICON_KEYS)[number];

const archIconSchema = z.enum(ARCH_ICON_KEYS);

const highlightMetricSchema = z
  .object({
    label: z.string().min(1).max(40),
    value: z.string().min(1).max(20),
    trend: z.enum(['up', 'down', 'flat']).optional(),
  })
  .strict();

const metricTileSchema = z
  .object({
    label: z.string().min(1).max(20),
    value: z.string().min(1).max(20),
    unit: z.string().min(1).max(20).optional(),
  })
  .strict();

const narrativeSchema = z
  .object({
    challenge: z.array(z.string().min(1).max(160)).max(4).optional(),
    built: z.array(z.string().min(1).max(160)).max(4).optional(),
    impact: z.array(z.string().min(1).max(160)).max(4).optional(),
  })
  .strict();

const architectureNodeSchema = z
  .object({
    label: z.string().min(1).max(24),
    icon: archIconSchema,
    note: z.string().min(1).max(40).optional(),
  })
  .strict();

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
    highlightMetric: highlightMetricSchema.optional(),
    metrics: z.array(metricTileSchema).max(3).optional(),
    narrative: narrativeSchema.optional(),
    architecture: z.array(architectureNodeSchema).max(8).optional(),
    impactTagline: z.string().min(1).max(140).optional(),
  })
  .strict();

export type ProjectFrontmatter = z.infer<typeof projectSchema>;
export type ArchitectureNode = z.infer<typeof architectureNodeSchema>;
export type MetricTile = z.infer<typeof metricTileSchema>;
export type HighlightMetric = z.infer<typeof highlightMetricSchema>;
export type ProjectNarrative = z.infer<typeof narrativeSchema>;

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

const SOCIAL_ICON_VALUES = [
  'github',
  'linkedin',
  'x',
  'mastodon',
  'bluesky',
  'email',
  'website',
] as const;

export type SocialIcon = (typeof SOCIAL_ICON_VALUES)[number];

const socialLinkSchema = z
  .object({
    label: z.string().min(1).max(40),
    url: z.string().url().regex(/^https?:\/\//, 'socialLinks[].url must be an absolute http(s) URL'),
    icon: z.enum(SOCIAL_ICON_VALUES).optional(),
  })
  .strict();

const resumeUrlSchema = z
  .string()
  .min(1)
  .refine(
    (v) => /^https?:\/\//.test(v) || v.startsWith('/'),
    'resumeUrl must be an absolute http(s) URL or a path beginning with "/"',
  );

const PILL_ICON_VALUES = [
  'remote',
  'onsite',
  'hybrid',
  'collab',
  'opportunities',
  'contract',
  'sparkle',
] as const;

export type PillIcon = (typeof PILL_ICON_VALUES)[number];

const VALUE_ICON_VALUES = [
  'craft',
  'performance',
  'accessibility',
  'pragmatism',
  'security',
  'systems',
] as const;

export type ValueIcon = (typeof VALUE_ICON_VALUES)[number];

const availabilityPillSchema = z
  .object({
    icon: z.enum(PILL_ICON_VALUES),
    label: z.string().min(1).max(40),
  })
  .strict();

const contactSchema = z
  .object({
    email: z.string().email().optional(),
    github: z.string().min(1).max(120).optional(),
    linkedin: z.string().min(1).max(120).optional(),
  })
  .strict();

const valueCardSchema = z
  .object({
    icon: z.enum(VALUE_ICON_VALUES),
    title: z.string().min(1).max(24),
    body: z.string().min(1).max(200),
  })
  .strict();

const processSchema = z
  .array(z.string().min(1).max(16))
  .refine((arr) => arr.length === 5, 'process must have exactly 5 steps when supplied');

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
    skills: z.array(z.string().min(1).max(40)).min(1, 'skills must have at least one entry').max(40),
    socialLinks: z.array(socialLinkSchema).max(10).default([]),
    resumeUrl: resumeUrlSchema.optional(),
    availabilityPills: z.array(availabilityPillSchema).max(4).optional(),
    contact: contactSchema.optional(),
    values: z.array(valueCardSchema).max(4).optional(),
    process: processSchema.optional(),
    processStatement: z.string().min(1).max(240).optional(),
  })
  .strict();

export type AboutFrontmatter = z.infer<typeof aboutSchema>;
export type AvailabilityPill = z.infer<typeof availabilityPillSchema>;
export type ValueCard = z.infer<typeof valueCardSchema>;
export type AboutContact = z.infer<typeof contactSchema>;

const about = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/about' }),
  schema: aboutSchema,
});

const CREDIBILITY_ICON_VALUES = [
  'frontend',
  'fullstack',
  'architecture',
  'web3',
  'fintech',
  'marketplace',
  'cloud',
  'security',
  'mobile',
  'design',
] as const;

export type CredibilityIcon = (typeof CREDIBILITY_ICON_VALUES)[number];

const SYSTEMS_ICON_VALUES = [
  'aws',
  'azure',
  'cloudflare',
  'gcp',
  'app',
  'api',
  'db',
  'shield',
  'users',
  'globe',
  'lock',
  'code',
] as const;

export type SystemsIcon = (typeof SYSTEMS_ICON_VALUES)[number];

const credibilityItemSchema = z
  .object({
    icon: z.enum(CREDIBILITY_ICON_VALUES),
    label: z.string().min(1).max(28),
  })
  .strict();

const systemsGroupSchema = z
  .object({
    title: z.string().min(1).max(28),
    description: z.string().min(1).max(80),
    icons: z.array(z.enum(SYSTEMS_ICON_VALUES)).min(1).max(4),
  })
  .strict();

const categoryMissionsSchema = z
  .object({
    personal: z.string().min(1).max(200),
    startup: z.string().min(1).max(200),
    corporate: z.string().min(1).max(200),
  })
  .strict();

const siteSchema = z
  .object({
    credibilityStrip: z.array(credibilityItemSchema).min(4).max(8),
    systemsStrip: z.array(systemsGroupSchema).length(4),
    heroPrimaryCtaHref: z
      .string()
      .refine(
        (v) => v.startsWith('/') || /^https?:\/\//.test(v),
        'heroPrimaryCtaHref must be an absolute URL or a path starting with /',
      )
      .default('/category/personal/'),
    categoryMissions: categoryMissionsSchema,
  })
  .strict();

export type SiteFrontmatter = z.infer<typeof siteSchema>;
export type CredibilityItem = z.infer<typeof credibilityItemSchema>;
export type SystemsGroup = z.infer<typeof systemsGroupSchema>;

const site = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/site' }),
  schema: siteSchema,
});

export const collections = { personal, startup, corporate, about, site };

export const CATEGORY_KEYS = ['personal', 'startup', 'corporate'] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  personal: 'Personal',
  startup: 'Startup',
  corporate: 'Corporate',
};

export {
  SOCIAL_ICON_VALUES,
  PILL_ICON_VALUES,
  VALUE_ICON_VALUES,
  ARCH_ICON_KEYS,
  CREDIBILITY_ICON_VALUES,
  SYSTEMS_ICON_VALUES,
};
