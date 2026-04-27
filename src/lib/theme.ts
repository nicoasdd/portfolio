export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'bp-theme';

const THEME_COLOR: Record<Theme, string> = {
  dark: '#0b1326',
  light: '#f2f5fb',
};

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

export function readStoredTheme(storage: Storage = safeStorage()): Theme | null {
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(theme: Theme, storage: Storage = safeStorage()): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — silently ignore */
  }
}

export interface ResolveOptions {
  stored?: Theme | null;
  prefersDark?: boolean;
  fallback?: Theme;
}

export function resolveInitialTheme(opts: ResolveOptions = {}): Theme {
  if (isTheme(opts.stored)) return opts.stored;
  if (typeof opts.prefersDark === 'boolean') return opts.prefersDark ? 'dark' : 'light';
  return opts.fallback ?? 'dark';
}

export interface ApplyTargets {
  root?: HTMLElement;
  metaColor?: HTMLMetaElement | null;
}

export function applyTheme(theme: Theme, targets: ApplyTargets = {}): void {
  const hasDocument = typeof document !== 'undefined';
  const root =
    targets.root ?? (hasDocument ? document.documentElement : undefined);
  if (root) {
    root.dataset.theme = theme;
  }
  const meta =
    targets.metaColor ??
    (hasDocument ? (document.getElementById('bp-theme-color') as HTMLMetaElement | null) : null);
  if (meta) meta.setAttribute('content', THEME_COLOR[theme]);
}

export function readCurrentTheme(root?: HTMLElement): Theme {
  const target =
    root ?? (typeof document !== 'undefined' ? document.documentElement : undefined);
  if (!target) return 'dark';
  const attr = target.dataset.theme;
  return isTheme(attr) ? attr : 'dark';
}

function safeStorage(): Storage {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  const fake: Record<string, string> = {};
  return {
    length: 0,
    clear: () => {
      for (const k of Object.keys(fake)) delete fake[k];
    },
    getItem: (k: string) => (k in fake ? fake[k] : null),
    key: () => null,
    removeItem: (k: string) => {
      delete fake[k];
    },
    setItem: (k: string, v: string) => {
      fake[k] = v;
    },
  } as Storage;
}
