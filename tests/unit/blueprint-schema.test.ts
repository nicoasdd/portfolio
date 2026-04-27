import { describe, expect, it } from 'vitest';
import { z } from 'zod';

/*
  Mirror of the additive schema deltas in src/content.config.ts so we can
  exercise them with Zod directly without booting Astro's content-config loader.
  Must stay in sync with contracts/content-schema.md.
*/

const ARCH_ICON_KEYS = [
  'users', 'api', 'db', 'cache', 'queue',
  'server', 'web', 'messaging', 'blockchain', 'cloud',
] as const;

const PILL_ICON_VALUES = [
  'remote', 'onsite', 'hybrid', 'collab', 'opportunities', 'contract', 'sparkle',
] as const;

const VALUE_ICON_VALUES = [
  'craft', 'performance', 'accessibility', 'pragmatism', 'security', 'systems',
] as const;

const CREDIBILITY_ICON_VALUES = [
  'frontend', 'fullstack', 'architecture', 'web3',
  'fintech', 'marketplace', 'cloud', 'security', 'mobile', 'design',
] as const;

const SYSTEMS_ICON_VALUES = [
  'aws', 'azure', 'cloudflare', 'gcp',
  'app', 'api', 'db', 'shield',
  'users', 'globe', 'lock', 'code',
] as const;

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

const architectureNodeSchema = z
  .object({
    label: z.string().min(1).max(24),
    icon: z.enum(ARCH_ICON_KEYS),
    note: z.string().min(1).max(40).optional(),
  })
  .strict();

const narrativeSchema = z
  .object({
    challenge: z.array(z.string().min(1).max(160)).max(4).optional(),
    built: z.array(z.string().min(1).max(160)).max(4).optional(),
    impact: z.array(z.string().min(1).max(160)).max(4).optional(),
  })
  .strict();

const availabilityPillSchema = z
  .object({
    icon: z.enum(PILL_ICON_VALUES),
    label: z.string().min(1).max(40),
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

const siteSchema = z
  .object({
    credibilityStrip: z.array(credibilityItemSchema).min(4).max(8),
    systemsStrip: z.array(systemsGroupSchema).length(4),
    heroPrimaryCtaHref: z
      .string()
      .refine((v) => v.startsWith('/') || /^https?:\/\//.test(v))
      .default('/category/personal/'),
    categoryMissions: z
      .object({
        personal: z.string().min(1).max(200),
        startup: z.string().min(1).max(200),
        corporate: z.string().min(1).max(200),
      })
      .strict(),
  })
  .strict();

describe('blueprint project schema deltas', () => {
  it('accepts a project-fragment with all new optional fields', () => {
    expect(() =>
      highlightMetricSchema.parse({ label: 'users', value: '70K', trend: 'up' }),
    ).not.toThrow();
    expect(() =>
      metricTileSchema.parse({ label: 'PEAK USERS', value: '~500', unit: 'CONCURRENT' }),
    ).not.toThrow();
    expect(() =>
      architectureNodeSchema.parse({ label: 'USERS', icon: 'users', note: '70K' }),
    ).not.toThrow();
    expect(() =>
      narrativeSchema.parse({
        challenge: ['Build a trustworthy platform'],
        built: ['Real-time engine'],
        impact: ['70K users'],
      }),
    ).not.toThrow();
  });

  it('rejects architecture nodes with an unknown icon', () => {
    expect(() =>
      architectureNodeSchema.parse({ label: 'Unknown', icon: 'nope' }),
    ).toThrow();
  });

  it('enforces metric array max length of 3', () => {
    const metrics = z.array(metricTileSchema).max(3);
    expect(() =>
      metrics.parse([
        { label: 'a', value: '1' },
        { label: 'b', value: '2' },
        { label: 'c', value: '3' },
        { label: 'd', value: '4' },
      ]),
    ).toThrow();
  });
});

describe('blueprint about schema deltas', () => {
  it('requires exactly 5 process steps when supplied', () => {
    expect(() => processSchema.parse(['Understand', 'Design', 'Build', 'Iterate', 'Deliver'])).not.toThrow();
    expect(() => processSchema.parse(['Understand', 'Design', 'Build', 'Iterate'])).toThrow();
    expect(() => processSchema.parse(['a', 'b', 'c', 'd', 'e', 'f'])).toThrow();
  });

  it('accepts availability pills with valid icon vocabulary', () => {
    expect(() =>
      availabilityPillSchema.parse({ icon: 'remote', label: 'Remote' }),
    ).not.toThrow();
    expect(() =>
      availabilityPillSchema.parse({ icon: 'bogus', label: 'Remote' }),
    ).toThrow();
  });

  it('accepts up to 4 value cards', () => {
    const arr = z.array(valueCardSchema).max(4);
    expect(() =>
      arr.parse([
        { icon: 'craft', title: 'Craft', body: 'x' },
        { icon: 'performance', title: 'Performance', body: 'x' },
        { icon: 'accessibility', title: 'Accessibility', body: 'x' },
        { icon: 'pragmatism', title: 'Pragmatism', body: 'x' },
      ]),
    ).not.toThrow();
  });
});

describe('site schema', () => {
  const VALID_SITE = {
    credibilityStrip: [
      { icon: 'frontend', label: 'Frontend' },
      { icon: 'fullstack', label: 'Full-stack' },
      { icon: 'architecture', label: 'Architecture' },
      { icon: 'web3', label: 'Web3' },
    ],
    systemsStrip: [
      { title: 'Cloud Infrastructure', description: 'x', icons: ['aws'] },
      { title: 'Systems Thinking', description: 'x', icons: ['users', 'app'] },
      { title: 'Built For Scale', description: 'x', icons: ['app'] },
      { title: 'Open Systems', description: 'x', icons: ['globe'] },
    ],
    heroPrimaryCtaHref: '/category/personal/',
    categoryMissions: {
      personal: 'Self-initiated products.',
      startup: 'Founding-team work on early-stage products.',
      corporate: 'Large-scale platforms.',
    },
  };

  it('accepts a valid seed', () => {
    expect(() => siteSchema.parse(VALID_SITE)).not.toThrow();
  });

  it('rejects systemsStrip with length !== 4', () => {
    expect(() =>
      siteSchema.parse({ ...VALID_SITE, systemsStrip: VALID_SITE.systemsStrip.slice(0, 3) }),
    ).toThrow();
    expect(() =>
      siteSchema.parse({
        ...VALID_SITE,
        systemsStrip: [...VALID_SITE.systemsStrip, VALID_SITE.systemsStrip[0]],
      }),
    ).toThrow();
  });

  it('rejects credibilityStrip shorter than 4', () => {
    expect(() =>
      siteSchema.parse({
        ...VALID_SITE,
        credibilityStrip: VALID_SITE.credibilityStrip.slice(0, 3),
      }),
    ).toThrow();
  });

  it('rejects an unknown systems icon', () => {
    expect(() =>
      siteSchema.parse({
        ...VALID_SITE,
        systemsStrip: [
          { title: 'X', description: 'x', icons: ['bogus'] as string[] as never[] },
          ...VALID_SITE.systemsStrip.slice(1),
        ],
      }),
    ).toThrow();
  });

  it('rejects heroPrimaryCtaHref that is neither absolute URL nor leading /', () => {
    expect(() =>
      siteSchema.parse({ ...VALID_SITE, heroPrimaryCtaHref: 'about.html' }),
    ).toThrow();
  });
});
