import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('site content seed', () => {
  const siteFile = join(process.cwd(), 'src', 'content', 'site', 'site.md');
  const raw = readFileSync(siteFile, 'utf8');

  it('is present at src/content/site/site.md', () => {
    expect(raw.length).toBeGreaterThan(0);
  });

  it('declares exactly four systemsStrip groups', () => {
    // crude parse: count top-level `- title:` occurrences between the
    // `systemsStrip:` header and the next top-level key
    const sys = /systemsStrip:\n([\s\S]*?)\n[a-z]/i.exec(raw);
    expect(sys).not.toBeNull();
    const block = sys![1];
    const groupCount = (block.match(/^  - title:/gm) ?? []).length;
    expect(groupCount).toBe(4);
  });

  it('declares at least four credibilityStrip items', () => {
    const cred = /credibilityStrip:\n([\s\S]*?)\nsystemsStrip:/i.exec(raw);
    expect(cred).not.toBeNull();
    const block = cred![1];
    const itemCount = (block.match(/^  - \{/gm) ?? []).length;
    expect(itemCount).toBeGreaterThanOrEqual(4);
  });

  it('exposes all three categoryMissions', () => {
    expect(/personal:\s*"[^"]+"/.test(raw)).toBe(true);
    expect(/startup:\s*"[^"]+"/.test(raw)).toBe(true);
    expect(/corporate:\s*"[^"]+"/.test(raw)).toBe(true);
  });
});
