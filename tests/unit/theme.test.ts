import { describe, expect, it, beforeEach } from 'vitest';
import {
  isTheme,
  resolveInitialTheme,
  readStoredTheme,
  writeStoredTheme,
  THEME_STORAGE_KEY,
  applyTheme,
  readCurrentTheme,
} from '../../src/lib/theme';

function createMemoryStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    length: 0,
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    getItem: (k) => (k in store ? store[k] : null),
    key: () => null,
    removeItem: (k) => {
      delete store[k];
    },
    setItem: (k, v) => {
      store[k] = v;
    },
  } as Storage;
}

interface FakeMeta {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
}

function createFakeMeta(initial = '#ffffff'): FakeMeta {
  let value = initial;
  return {
    getAttribute: () => value,
    setAttribute: (_name: string, v: string) => {
      value = v;
    },
  };
}

function createFakeRoot(initial?: string): HTMLElement {
  const dataset: Record<string, string> = initial ? { theme: initial } : {};
  return { dataset } as unknown as HTMLElement;
}

describe('isTheme', () => {
  it('accepts only "dark" or "light"', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('light')).toBe(true);
    expect(isTheme('system')).toBe(false);
    expect(isTheme(null)).toBe(false);
    expect(isTheme(undefined)).toBe(false);
    expect(isTheme(42)).toBe(false);
  });
});

describe('resolveInitialTheme precedence', () => {
  it('prefers stored value above all else', () => {
    expect(resolveInitialTheme({ stored: 'light', prefersDark: true })).toBe('light');
    expect(resolveInitialTheme({ stored: 'dark', prefersDark: false })).toBe('dark');
  });

  it('falls back to OS preference when no stored value', () => {
    expect(resolveInitialTheme({ stored: null, prefersDark: true })).toBe('dark');
    expect(resolveInitialTheme({ stored: null, prefersDark: false })).toBe('light');
  });

  it('falls back to dark when nothing is known', () => {
    expect(resolveInitialTheme({})).toBe('dark');
    expect(resolveInitialTheme({ fallback: 'light' })).toBe('light');
  });
});

describe('localStorage round-trip', () => {
  let storage: Storage;
  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it('stores and reads a theme', () => {
    expect(readStoredTheme(storage)).toBeNull();
    writeStoredTheme('light', storage);
    expect(readStoredTheme(storage)).toBe('light');
    writeStoredTheme('dark', storage);
    expect(readStoredTheme(storage)).toBe('dark');
  });

  it('returns null when the stored value is not a known theme', () => {
    storage.setItem(THEME_STORAGE_KEY, 'neon');
    expect(readStoredTheme(storage)).toBeNull();
  });
});

describe('applyTheme side effects', () => {
  it('sets data-theme on the provided root', () => {
    const root = createFakeRoot();
    applyTheme('dark', { root });
    expect(root.dataset.theme).toBe('dark');
    applyTheme('light', { root });
    expect(root.dataset.theme).toBe('light');
  });

  it('updates the provided meta content to the theme color', () => {
    const root = createFakeRoot();
    const meta = createFakeMeta();
    applyTheme('dark', { root, metaColor: meta as unknown as HTMLMetaElement });
    expect(meta.getAttribute('content')).toBe('#0b1326');
    applyTheme('light', { root, metaColor: meta as unknown as HTMLMetaElement });
    expect(meta.getAttribute('content')).toBe('#f2f5fb');
  });
});

describe('readCurrentTheme', () => {
  it('reads from dataset.theme when set', () => {
    const root = createFakeRoot('light');
    expect(readCurrentTheme(root)).toBe('light');
  });

  it('falls back to dark when dataset.theme is unknown', () => {
    expect(readCurrentTheme(createFakeRoot())).toBe('dark');
    expect(readCurrentTheme(createFakeRoot('neon'))).toBe('dark');
  });
});
