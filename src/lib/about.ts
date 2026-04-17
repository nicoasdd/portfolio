import { getCollection, type CollectionEntry } from 'astro:content';
import type { AboutFrontmatter } from '../content.config';
import { withBase } from './url';

export type AboutEntry = CollectionEntry<'about'>;

export interface AboutProfile {
  entry: AboutEntry;
  data: AboutFrontmatter;
  effectiveAlt: string;
  resumeHref: string | undefined;
}

function resolveResumeHref(resumeUrl: string | undefined): string | undefined {
  if (!resumeUrl) return undefined;
  if (/^https?:\/\//.test(resumeUrl)) return resumeUrl;
  return withBase(resumeUrl);
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

  return { entry, data, effectiveAlt, resumeHref };
}
