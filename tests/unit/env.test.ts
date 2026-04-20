import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { hideExamples, __test__ } from '../../src/lib/env';

const TRUTHY_VALUES = ['true', 'TRUE', 'True', '1', 'yes', 'YES', 'on', 'ON'];
const FALSY_VALUES = ['false', 'FALSE', '0', 'no', 'off', '', '   '];

describe('env.hideExamples()', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    __test__.warnedValues.clear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    warnSpy.mockRestore();
  });

  it('returns false when HIDE_EXAMPLES is unset', () => {
    vi.stubEnv('HIDE_EXAMPLES', undefined as unknown as string);
    expect(hideExamples()).toBe(false);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  for (const value of TRUTHY_VALUES) {
    it(`returns true for ${JSON.stringify(value)}`, () => {
      vi.stubEnv('HIDE_EXAMPLES', value);
      expect(hideExamples()).toBe(true);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  }

  for (const value of FALSY_VALUES) {
    it(`returns false for ${JSON.stringify(value)}`, () => {
      vi.stubEnv('HIDE_EXAMPLES', value);
      expect(hideExamples()).toBe(false);
      expect(warnSpy).not.toHaveBeenCalled();
    });
  }

  it('returns false and warns once for unrecognized values', () => {
    vi.stubEnv('HIDE_EXAMPLES', 'ture');
    expect(hideExamples()).toBe(false);
    expect(hideExamples()).toBe(false);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toContain('HIDE_EXAMPLES');
    expect(warnSpy.mock.calls[0]?.[0]).toContain('ture');
  });

  it('never throws regardless of input', () => {
    for (const value of ['', 'maybe', '🤷', 'true ', ' false ']) {
      vi.stubEnv('HIDE_EXAMPLES', value);
      expect(() => hideExamples()).not.toThrow();
    }
  });
});
