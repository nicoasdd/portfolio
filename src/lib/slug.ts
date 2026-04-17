const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value);
}

export function normalizeSlug(value: string): string {
  return value.toLowerCase().trim();
}

export interface SlugSource {
  slug: string;
  filePath: string;
  category: string;
}

export class SlugCollisionError extends Error {
  constructor(
    public readonly slug: string,
    public readonly sources: SlugSource[],
  ) {
    const lines = sources.map((s) => `  - [${s.category}] ${s.filePath}`).join('\n');
    super(`Duplicate project slug "${slug}" found in:\n${lines}`);
    this.name = 'SlugCollisionError';
  }
}

export function assertNoCollisions(sources: SlugSource[]): void {
  const buckets = new Map<string, SlugSource[]>();
  for (const src of sources) {
    const list = buckets.get(src.slug) ?? [];
    list.push(src);
    buckets.set(src.slug, list);
  }
  for (const [slug, list] of buckets) {
    if (list.length > 1) {
      throw new SlugCollisionError(slug, list);
    }
  }
}
