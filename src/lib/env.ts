const TRUTHY = new Set(['true', '1', 'yes', 'on']);
const FALSY = new Set(['false', '0', 'no', 'off', '']);

const warnedValues = new Set<string>();

function coerceBoolean(raw: string | undefined, varName: string): boolean {
  if (raw === undefined) return false;
  const normalized = raw.trim().toLowerCase();
  if (TRUTHY.has(normalized)) return true;
  if (FALSY.has(normalized)) return false;
  if (!warnedValues.has(`${varName}=${normalized}`)) {
    warnedValues.add(`${varName}=${normalized}`);
    console.warn(
      `[env] Unrecognized value for ${varName}: ${JSON.stringify(raw)}. Falling back to false. Accepted: true/1/yes/on or false/0/no/off.`,
    );
  }
  return false;
}

export function hideExamples(): boolean {
  return coerceBoolean(process.env.HIDE_EXAMPLES, 'HIDE_EXAMPLES');
}

export const __test__ = { coerceBoolean, warnedValues };
