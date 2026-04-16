import { afterEach, describe, expect, it } from 'vitest';

import { getAppStage, isStrictAppStage, readPublicEnv, readPublicUrl } from '@/lib/env';

const trackedEnv = process.env as Record<string, string | undefined>;

const ENV_KEYS = [
  'APP_ENV',
  'NEXT_PUBLIC_APP_ENV',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_URL',
  'NODE_ENV',
  'VERCEL_ENV',
] as const;

const originalEnv = new Map<string, string | undefined>(
  ENV_KEYS.map((key) => [key, trackedEnv[key]]),
);

function restoreTrackedEnv() {
  for (const key of ENV_KEYS) {
    const originalValue = originalEnv.get(key);

    if (originalValue === undefined) {
      delete trackedEnv[key];
      continue;
    }

    trackedEnv[key] = originalValue;
  }
}

afterEach(() => {
  restoreTrackedEnv();
});

describe('env helpers', () => {
  it('defaults to development when no explicit app stage is provided', () => {
    delete trackedEnv.APP_ENV;
    delete trackedEnv.NEXT_PUBLIC_APP_ENV;
    delete trackedEnv.VERCEL_ENV;
    delete trackedEnv.NODE_ENV;

    expect(getAppStage()).toBe('development');
    expect(isStrictAppStage()).toBe(false);
  });

  it('maps Vercel preview deployments to the staging stage', () => {
    delete trackedEnv.APP_ENV;
    delete trackedEnv.NEXT_PUBLIC_APP_ENV;
    trackedEnv.VERCEL_ENV = 'preview';

    expect(getAppStage()).toBe('staging');
    expect(isStrictAppStage()).toBe(true);
  });

  it('allows fallback values in test and development stages', () => {
    trackedEnv.APP_ENV = 'test';
    delete trackedEnv.NEXT_PUBLIC_APP_NAME;
    delete trackedEnv.NEXT_PUBLIC_APP_URL;

    expect(readPublicEnv('NEXT_PUBLIC_APP_NAME', 'Fallback App')).toBe('Fallback App');
    expect(readPublicUrl('NEXT_PUBLIC_APP_URL', 'http://localhost:3000/')).toBe(
      'http://localhost:3000',
    );
  });

  it('fails fast when required public env is missing in strict stages', () => {
    trackedEnv.APP_ENV = 'production';
    delete trackedEnv.NEXT_PUBLIC_APP_NAME;

    expect(() => readPublicEnv('NEXT_PUBLIC_APP_NAME', 'Fallback App')).toThrow(
      /Missing required environment variable "NEXT_PUBLIC_APP_NAME"/,
    );
  });

  it('validates absolute http or https urls', () => {
    trackedEnv.APP_ENV = 'staging';
    trackedEnv.NEXT_PUBLIC_APP_URL = 'not-a-url';

    expect(() => readPublicUrl('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')).toThrow(
      /must be an absolute URL/,
    );

    trackedEnv.NEXT_PUBLIC_APP_URL = 'ftp://example.com';

    expect(() => readPublicUrl('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')).toThrow(
      /must use http or https/,
    );
  });
});
