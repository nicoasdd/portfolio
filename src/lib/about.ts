import { getCollection, type CollectionEntry } from 'astro:content';
import type {
  AboutFrontmatter,
  AvailabilityPill,
  ValueCard,
  PillIcon,
} from '../content.config';
import { withBase } from './url';

export type AboutEntry = CollectionEntry<'about'>;

export interface ResolvedContact {
  email: string | null;
  github: string | null;
  linkedin: string | null;
}

export interface AboutProfile {
  entry: AboutEntry;
  data: AboutFrontmatter;
  effectiveAlt: string;
  resumeHref: string | undefined;
  availabilityPills: AvailabilityPill[];
  values: ValueCard[];
  process: string[] | null;
  processStatement: string | null;
  contact: ResolvedContact;
}

function resolveResumeHref(resumeUrl: string | undefined): string | undefined {
  if (!resumeUrl) return undefined;
  if (/^https?:\/\//.test(resumeUrl)) return resumeUrl;
  return withBase(resumeUrl);
}

function deriveAvailabilityPills(data: AboutFrontmatter): AvailabilityPill[] {
  if (data.availabilityPills && data.availabilityPills.length > 0) {
    return data.availabilityPills;
  }
  const pills: AvailabilityPill[] = [];
  if (data.location) {
    const lower = data.location.toLowerCase();
    const icon: PillIcon = lower.includes('remote')
      ? 'remote'
      : lower.includes('hybrid')
        ? 'hybrid'
        : 'onsite';
    const label = data.location.split('·')[0]?.trim() ?? data.location;
    pills.push({ icon, label });
  }
  if (data.availability) {
    const lower = data.availability.toLowerCase();
    const icon: PillIcon = lower.includes('opportunit')
      ? 'opportunities'
      : lower.includes('collab')
        ? 'collab'
        : 'sparkle';
    pills.push({ icon, label: data.availability });
  }
  return pills;
}

function deriveContact(data: AboutFrontmatter): ResolvedContact {
  const configured = data.contact ?? {};
  const gh =
    configured.github ??
    data.socialLinks.find((s) => s.icon === 'github')?.url ??
    null;
  const li =
    configured.linkedin ??
    data.socialLinks.find((s) => s.icon === 'linkedin')?.url ??
    null;
  return {
    email: configured.email ?? data.email ?? null,
    github: gh,
    linkedin: li,
  };
}

export async function getAbout(): Promise<AboutProfile> {
  const entries = await getCollection('about');

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

  const entry = entries[0];
  const data = entry.data;

  const body = (entry.body ?? '').trim();
  if (body.length === 0) {
    throw new Error(
      `About content body is empty in src/content/about/${entry.id}.md — write the long-form bio in the Markdown body beneath the frontmatter.`,
    );
  }

  const effectiveAlt = data.photoAlt ?? `Portrait of ${data.name}`;
  const resumeHref = resolveResumeHref(data.resumeUrl);

  return {
    entry,
    data,
    effectiveAlt,
    resumeHref,
    availabilityPills: deriveAvailabilityPills(data),
    values: data.values ?? [],
    process: data.process ?? null,
    processStatement: data.processStatement ?? null,
    contact: deriveContact(data),
  };
}
