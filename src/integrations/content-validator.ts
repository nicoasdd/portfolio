import type { AstroIntegration } from 'astro';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assertNoCollisions, type SlugSource } from '../lib/slug';
import { getMissingImages } from './validator-helpers';

const CATEGORIES = ['personal', 'startup', 'corporate'] as const;

function listMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(listMarkdownFiles(full));
    } else if (entry.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function extractFrontmatter(content: string): Record<string, unknown> {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match) return {};
  const fm: Record<string, unknown> = {};
  const lines = match[1].split('\n');
  let currentKey: string | null = null;
  for (const line of lines) {
    const m = /^([a-zA-Z_]+):\s*(.*)$/.exec(line);
    if (m) {
      currentKey = m[1];
      const val = m[2].trim();
      if (val !== '') {
        fm[currentKey] = val.replace(/^["']|["']$/g, '');
      }
    } else if (currentKey && line.trim().startsWith('-')) {
      const list = (fm[currentKey] as string[] | undefined) ?? [];
      const item = line.trim().replace(/^-\s*/, '').replace(/^["']|["']$/g, '');
      list.push(item);
      fm[currentKey] = list;
    }
  }
  return fm;
}

export default function contentValidator(): AstroIntegration {
  return {
    name: 'portfolio-content-validator',
    hooks: {
      'astro:build:setup': () => {
        const root = process.cwd();
        const sources: SlugSource[] = [];
        const imagePaths: string[] = [];

        for (const category of CATEGORIES) {
          const dir = join(root, 'src', 'content', 'projects', category);
          const files = listMarkdownFiles(dir);
          for (const file of files) {
            const content = readFileSync(file, 'utf8');
            const fm = extractFrontmatter(content);
            const filename = file.split('/').pop()!.replace(/\.md$/, '');
            const slug = ((fm.slug as string | undefined) ?? filename).toLowerCase();
            sources.push({
              slug,
              filePath: file.replace(root + '/', ''),
              category,
            });
            const thumbnail = fm.thumbnail as string | undefined;
            if (thumbnail) imagePaths.push(thumbnail);
            const screenshots = fm.screenshots as string[] | undefined;
            if (Array.isArray(screenshots)) imagePaths.push(...screenshots);
          }
        }

        assertNoCollisions(sources);

        const missing = getMissingImages(imagePaths);
        if (missing.length > 0) {
          console.warn(
            `[content-validator] ${missing.length} referenced image(s) missing from public/: ${missing.join(', ')}`,
          );
        }

        console.warn(
          `[content-validator] Validated ${sources.length} project(s) across ${CATEGORIES.length} categories.`,
        );
      },
    },
  };
}
