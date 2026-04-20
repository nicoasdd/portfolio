import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REQUIRED_EXAMPLES, isExampleSlug } from '../../src/lib/examples';

const repoRoot = resolve(__dirname, '../..');

const README_HINT =
  'These files double as template examples and end-to-end test fixtures. ' +
  'See README → "Common Issues" → "Don\'t delete the example projects". ' +
  'To hide them from your published site without deleting them, set HIDE_EXAMPLES=true.';

describe('REQUIRED_EXAMPLES registry', () => {
  it('lists exactly three examples (one per category)', () => {
    expect(REQUIRED_EXAMPLES).toHaveLength(3);
    const cats = REQUIRED_EXAMPLES.map((e) => e.category).sort();
    expect(cats).toEqual(['corporate', 'personal', 'startup']);
  });

  it('every entry has a slug recognized by isExampleSlug', () => {
    for (const entry of REQUIRED_EXAMPLES) {
      expect(isExampleSlug(entry.slug)).toBe(true);
    }
  });

  for (const entry of REQUIRED_EXAMPLES) {
    it(`required example exists on disk: ${entry.filePath}`, () => {
      const abs = resolve(repoRoot, entry.filePath);
      const exists = existsSync(abs);
      if (!exists) {
        throw new Error(
          `Missing required example fixture: ${entry.filePath}\n` +
            `Category: ${entry.category}, expected slug: ${entry.slug}\n${README_HINT}`,
        );
      }
      expect(exists).toBe(true);
    });

    it(`required example file matches its registry slug: ${entry.slug}`, () => {
      const abs = resolve(repoRoot, entry.filePath);
      if (!existsSync(abs)) {
        return;
      }
      const raw = readFileSync(abs, 'utf-8');
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter = fmMatch?.[1] ?? '';
      const slugLine = frontmatter
        .split('\n')
        .find((line) => /^slug\s*:/.test(line));
      const slug =
        slugLine?.replace(/^slug\s*:\s*['"]?([^'"\s]+)['"]?\s*$/, '$1').trim() ??
        entry.filePath.replace(/^.*\/(.*)\.md$/, '$1');
      expect(slug).toBe(entry.slug);
    });
  }
});
