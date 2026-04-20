import type { CategoryKey } from '../content.config';

export interface RequiredExample {
  category: CategoryKey;
  slug: string;
  filePath: string;
}

export const REQUIRED_EXAMPLES: readonly RequiredExample[] = [
  {
    category: 'personal',
    slug: 'example-personal',
    filePath: 'src/content/projects/personal/example-personal.md',
  },
  {
    category: 'startup',
    slug: 'example-startup',
    filePath: 'src/content/projects/startup/example-startup.md',
  },
  {
    category: 'corporate',
    slug: 'example-corporate',
    filePath: 'src/content/projects/corporate/example-corporate.md',
  },
] as const;

export function isExampleSlug(slug: string): boolean {
  return slug.startsWith('example-');
}

export interface IncludePolicy {
  slug: string;
  isDraft: boolean;
  isProd: boolean;
  hideExamplesEnabled: boolean;
}

export function shouldIncludeProject(p: IncludePolicy): boolean {
  if (p.isProd && p.isDraft) return false;
  if (p.hideExamplesEnabled && isExampleSlug(p.slug)) return false;
  return true;
}
