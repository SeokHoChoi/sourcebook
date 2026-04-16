import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_APP_NAME, DEFAULT_APP_URL, getAppConfig } from '@/lib/app-config';

const ENV_KEYS = [
  'APP_ENV',
  'NEXT_PUBLIC_APP_ENV',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_APP_URL',
] as const;

const originalEnv = new Map<string, string | undefined>(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

function restoreTrackedEnv() {
  for (const key of ENV_KEYS) {
    const originalValue = originalEnv.get(key);

    if (originalValue === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = originalValue;
  }
}

afterEach(() => {
  restoreTrackedEnv();
});

describe('getAppConfig', () => {
  it('loads public app config from environment', () => {
    expect(getAppConfig()).toEqual({
      env: 'test',
      name: 'Sourcebook',
      url: 'http://localhost:3000',
    });
  });

  it('falls back to defaults when env vars are missing', () => {
    process.env.APP_ENV = 'development';
    delete process.env.NEXT_PUBLIC_APP_NAME;
    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(getAppConfig()).toEqual({
      env: 'development',
      name: DEFAULT_APP_NAME,
      url: DEFAULT_APP_URL,
    });
  });

  it('fails fast in staging when the public url is missing', () => {
    process.env.APP_ENV = 'staging';
    process.env.NEXT_PUBLIC_APP_NAME = 'Sourcebook';
    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(() => getAppConfig()).toThrow(/NEXT_PUBLIC_APP_URL/);
  });

  it('normalizes configured public urls', () => {
    process.env.APP_ENV = 'staging';
    process.env.NEXT_PUBLIC_APP_NAME = 'Sourcebook';
    process.env.NEXT_PUBLIC_APP_URL = 'https://staging.sourcebook.example/';

    expect(getAppConfig()).toEqual({
      env: 'staging',
      name: 'Sourcebook',
      url: 'https://staging.sourcebook.example',
    });
  });
});
