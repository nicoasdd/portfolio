import { getCollection, type CollectionEntry } from 'astro:content';
import type { SiteFrontmatter } from '../content.config';

export type SiteEntry = CollectionEntry<'site'>;

export interface SiteData {
  entry: SiteEntry;
  data: SiteFrontmatter;
}

export async function getSite(): Promise<SiteData> {
  const entries = await getCollection('site');

  if (entries.length === 0) {
    throw new Error(
      'Site content is required at src/content/site/site.md but no entry was found.',
    );
  }
  if (entries.length > 1) {
    const paths = entries.map((e) => e.id).join(', ');
    throw new Error(
      `Expected exactly one Site entry under src/content/site/, found ${entries.length}: ${paths}`,
    );
  }

  const entry = entries[0];
  return { entry, data: entry.data };
}
