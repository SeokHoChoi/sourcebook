import { getAppStage, readPublicEnv, readPublicUrl } from '@/lib/env';

export const DEFAULT_APP_NAME = 'Sourcebook';
export const DEFAULT_APP_URL = 'http://localhost:3000';

export type AppConfig = {
  env: ReturnType<typeof getAppStage>;
  name: string;
  url: string;
};

export function getAppConfig(): AppConfig {
  return {
    env: getAppStage(),
    name: readPublicEnv('NEXT_PUBLIC_APP_NAME', DEFAULT_APP_NAME),
    url: readPublicUrl('NEXT_PUBLIC_APP_URL', DEFAULT_APP_URL),
  };
}
