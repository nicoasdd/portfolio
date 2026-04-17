import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function getMissingImages(paths: string[]): string[] {
  const publicDir = join(process.cwd(), 'public');
  return paths.filter((p) => {
    const trimmed = p.startsWith('/') ? p.slice(1) : p;
    return !existsSync(join(publicDir, trimmed));
  });
}
