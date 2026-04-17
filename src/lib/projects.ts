import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORY_KEYS, type CategoryKey } from '../content.config';
import { sortProjects as sortProjectsPure } from './sort';

export type ProjectEntry = CollectionEntry<CategoryKey>;

export interface ProjectWithMeta {
  entry: ProjectEntry;
  category: CategoryKey;
  slug: string;
  url: string;
}

const isProd = import.meta.env.PROD;

function shouldInclude(entry: ProjectEntry): boolean {
  return isProd ? !entry.data.draft : true;
}

function deriveSlug(entry: ProjectEntry): string {
  return entry.data.slug ?? entry.id;
}

function withMeta(entry: ProjectEntry, category: CategoryKey): ProjectWithMeta {
  const slug = deriveSlug(entry);
  return {
    entry,
    category,
    slug,
    url: `/projects/${slug}/`,
  };
}

export async function getAllProjects(): Promise<ProjectWithMeta[]> {
  const groups = await Promise.all(
    CATEGORY_KEYS.map(async (cat) => {
      const entries = await getCollection(cat, shouldInclude);
      return entries.map((entry) => withMeta(entry, cat));
    }),
  );
  return sortProjects(groups.flat());
}

export async function getByCategory(category: CategoryKey): Promise<ProjectWithMeta[]> {
  const entries = await getCollection(category, shouldInclude);
  return sortProjects(entries.map((entry) => withMeta(entry, category)));
}

export async function getFeatured(): Promise<ProjectWithMeta[]> {
  const all = await getAllProjects();
  return all.filter((p) => p.entry.data.featured);
}

export function sortProjects(projects: ProjectWithMeta[]): ProjectWithMeta[] {
  return sortProjectsPure(projects);
}
