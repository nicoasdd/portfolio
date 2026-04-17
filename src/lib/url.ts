const RAW_BASE = (import.meta.env.BASE_URL ?? '/') as string;
const BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

export function withBase(path: string): string {
  if (!path) return `${BASE}/`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
  if (path.startsWith('//')) return path;
  if (path.startsWith('#') || path.startsWith('?')) return path;
  if (path.startsWith('mailto:') || path.startsWith('tel:')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${normalized}`;
}

export const BASE_URL = `${BASE}/`;
