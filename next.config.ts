import type { NextConfig } from 'next';

import { getSecurityHeaders } from './src/lib/security-headers';

const isDevelopment = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: getSecurityHeaders({ isDevelopment }),
      },
    ];
  },
};

export default nextConfig;
