import { describe, expect, it } from 'vitest';
import {
  assertNoCollisions,
  isValidSlug,
  normalizeSlug,
  SlugCollisionError,
  type SlugSource,
} from '../../src/lib/slug';

describe('isValidSlug', () => {
  it.each([
    ['my-project', true],
    ['x', true],
    ['a1b2-c3', true],
    ['MyProject', false],
    ['my_project', false],
    ['-leading', false],
    ['trailing-', false],
    ['double--dash', false],
    ['', false],
    ['has space', false],
    ['has.dot', false],
  ])('%s -> %s', (input, expected) => {
    expect(isValidSlug(input)).toBe(expected);
  });
});

describe('normalizeSlug', () => {
  it('lowercases and trims', () => {
    expect(normalizeSlug('  MyProject ')).toBe('myproject');
  });
});

describe('assertNoCollisions', () => {
  it('passes when all slugs are unique', () => {
    const sources: SlugSource[] = [
      { slug: 'a', filePath: 'p/a.md', category: 'personal' },
      { slug: 'b', filePath: 'p/b.md', category: 'startup' },
      { slug: 'c', filePath: 'p/c.md', category: 'corporate' },
    ];
    expect(() => assertNoCollisions(sources)).not.toThrow();
  });

  it('throws SlugCollisionError when duplicates exist', () => {
    const sources: SlugSource[] = [
      { slug: 'dup', filePath: 'p/personal/dup.md', category: 'personal' },
      { slug: 'dup', filePath: 'p/startup/dup.md', category: 'startup' },
      { slug: 'unique', filePath: 'p/corporate/unique.md', category: 'corporate' },
    ];
    expect(() => assertNoCollisions(sources)).toThrow(SlugCollisionError);
  });

  it('reports both file paths in the error', () => {
    const sources: SlugSource[] = [
      { slug: 'dup', filePath: 'src/content/projects/personal/dup.md', category: 'personal' },
      { slug: 'dup', filePath: 'src/content/projects/startup/dup.md', category: 'startup' },
    ];
    try {
      assertNoCollisions(sources);
      throw new Error('Expected to throw');
    } catch (err) {
      const e = err as Error;
      expect(e.message).toContain('"dup"');
      expect(e.message).toContain('src/content/projects/personal/dup.md');
      expect(e.message).toContain('src/content/projects/startup/dup.md');
    }
  });
});
