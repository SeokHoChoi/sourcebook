export type AppStage = 'development' | 'test' | 'staging' | 'production';

const DEFAULT_STAGE: AppStage = 'development';

function normalizeStage(value: string | undefined): AppStage | null {
  switch (value) {
    case 'development':
    case 'test':
    case 'staging':
    case 'production': {
      return value;
    }
    case 'preview': {
      return 'staging';
    }
    default: {
      return null;
    }
  }
}

export function getAppStage(): AppStage {
  return (
    normalizeStage(process.env.APP_ENV) ??
    normalizeStage(process.env.NEXT_PUBLIC_APP_ENV) ??
    normalizeStage(process.env.VERCEL_ENV) ??
    DEFAULT_STAGE
  );
}

export function isStrictAppStage(stage = getAppStage()): boolean {
  return stage === 'staging' || stage === 'production';
}

export function readPublicEnv(
  name: 'NEXT_PUBLIC_APP_NAME' | 'NEXT_PUBLIC_APP_URL',
  fallback: string,
) {
  const value = process.env[name]?.trim();

  if (value) {
    return value;
  }

  const stage = getAppStage();

  if (!isStrictAppStage(stage)) {
    return fallback;
  }

  throw new Error(
    `[env] Missing required environment variable "${name}" for the "${stage}" stage.`,
  );
}

export function readPublicUrl(name: 'NEXT_PUBLIC_APP_URL', fallback: string): string {
  const value = readPublicEnv(name, fallback);

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error(`[env] "${name}" must be an absolute URL. Received: "${value}".`);
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(`[env] "${name}" must use http or https. Received: "${parsedUrl.protocol}".`);
  }

  return parsedUrl.toString().replace(/\/$/, '');
}
