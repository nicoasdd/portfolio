import type { AstroIntegration } from 'astro';
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REQUIRED_EXAMPLES } from '../lib/examples';
import { assertNoCollisions, type SlugSource } from '../lib/slug';
import { getMissingImages } from './validator-helpers';

const CATEGORIES = ['personal', 'startup', 'corporate'] as const;

const ABOUT_REQUIRED_FIELDS = ['name', 'headline', 'intro', 'photo', 'email', 'skills'] as const;

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

        const missingExamples = REQUIRED_EXAMPLES.filter(
          (e) => !existsSync(join(root, e.filePath)),
        );
        if (missingExamples.length > 0) {
          const list = missingExamples.map((e) => `  - ${e.filePath}`).join('\n');
          console.warn(
            `[content-validator] Missing required example file(s):\n${list}\n` +
              `These files double as template examples and end-to-end test fixtures; ` +
              `the unit suite (tests/unit/examples.test.ts) will fail without them. ` +
              `See README → "Common Issues" → "Don't delete the example projects". ` +
              `To hide examples from your published site without deleting them, set HIDE_EXAMPLES=true.`,
          );
        }

        const featuredWithoutRichData: string[] = [];

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

            // Soft nudge: if a project is featured but supplies neither metrics
            // nor narrative, the large FeaturedProjectCard will still render but
            // with reduced visual richness. Warn so authors can opt into the
            // full treatment without surprise.
            const isFeatured = String(fm.featured ?? '').trim() === 'true';
            const hasMetrics = 'metrics' in fm;
            const hasNarrative = 'narrative' in fm;
            if (isFeatured && !hasMetrics && !hasNarrative) {
              featuredWithoutRichData.push(file.replace(root + '/', ''));
            }
          }
        }

        if (featuredWithoutRichData.length > 0) {
          const list = featuredWithoutRichData.map((p) => `  - ${p}`).join('\n');
          console.warn(
            `[content-validator] ${featuredWithoutRichData.length} featured project(s) have no metrics or narrative blocks:\n${list}\n` +
              `Add frontmatter 'metrics', 'narrative.challenge', 'narrative.built', 'narrative.impact', or 'architecture' ` +
              `to light up the large featured-card blocks on category pages.`,
          );
        }

        assertNoCollisions(sources);

        const aboutDir = join(root, 'src', 'content', 'about');
        const aboutFiles = listMarkdownFiles(aboutDir);

        if (aboutFiles.length === 0) {
          throw new Error(
            '[content-validator] About content is required at src/content/about/profile.md but no .md file was found.',
          );
        }
        if (aboutFiles.length > 1) {
          const paths = aboutFiles.map((f) => f.replace(root + '/', '')).join(', ');
          throw new Error(
            `[content-validator] Expected exactly one About entry under src/content/about/, found ${aboutFiles.length}: ${paths}`,
          );
        }

        const aboutFile = aboutFiles[0];
        const aboutContent = readFileSync(aboutFile, 'utf8');
        const aboutFm = extractFrontmatter(aboutContent);
        const aboutRelPath = aboutFile.replace(root + '/', '');

        const missingFields: string[] = [];
        for (const field of ABOUT_REQUIRED_FIELDS) {
          const value = aboutFm[field];
          const isMissing =
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '') ||
            (Array.isArray(value) && value.length === 0);
          if (isMissing) missingFields.push(field);
        }
        if (missingFields.length > 0) {
          throw new Error(
            `[content-validator] About content at ${aboutRelPath} is missing required field(s): ${missingFields.join(', ')}.`,
          );
        }

        const aboutPhoto = aboutFm.photo as string | undefined;
        if (aboutPhoto) imagePaths.push(aboutPhoto);

        const aboutSkillsCount = Array.isArray(aboutFm.skills) ? aboutFm.skills.length : 0;

        const siteDir = join(root, 'src', 'content', 'site');
        const siteFiles = listMarkdownFiles(siteDir);
        if (siteFiles.length === 0) {
          throw new Error(
            '[content-validator] Site content is required at src/content/site/site.md but no .md file was found. ' +
              "Restore the seed from 'specs/005-blueprint-redesign/data-model.md' §3.",
          );
        }
        if (siteFiles.length > 1) {
          const paths = siteFiles.map((f) => f.replace(root + '/', '')).join(', ');
          throw new Error(
            `[content-validator] Expected exactly one Site entry under src/content/site/, found ${siteFiles.length}: ${paths}`,
          );
        }

        const missing = getMissingImages(imagePaths);
        if (missing.length > 0) {
          console.warn(
            `[content-validator] ${missing.length} referenced image(s) missing from public/: ${missing.join(', ')}`,
          );
        }

        console.warn(
          `[content-validator] Validated ${sources.length} project(s) across ${CATEGORIES.length} categories.`,
        );
        console.warn(
          `[content-validator] About profile validated: ${aboutRelPath.split('/').pop()} (${aboutSkillsCount} skills).`,
        );
      },
    },
  };
}
