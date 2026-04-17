import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = join(process.cwd(), 'public');
const PLACEHOLDER = '/projects/_placeholder.svg';

export interface AssetCheck {
  path: string;
  exists: boolean;
}

export function resolvePublicPath(relPath: string): string {
  const trimmed = relPath.startsWith('/') ? relPath.slice(1) : relPath;
  return join(PUBLIC_DIR, trimmed);
}

export function imageExists(relPath: string): boolean {
  return existsSync(resolvePublicPath(relPath));
}

export function safeImagePath(relPath: string): string {
  return imageExists(relPath) ? relPath : PLACEHOLDER;
}

export function checkImages(paths: string[]): AssetCheck[] {
  return paths.map((p) => ({ path: p, exists: imageExists(p) }));
}

export function getMissingImages(paths: string[]): string[] {
  return checkImages(paths)
    .filter((c) => !c.exists)
    .map((c) => c.path);
}
