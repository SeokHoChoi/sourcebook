import { describe, expect, it } from 'vitest';

import { buildContentSecurityPolicy, getSecurityHeaders } from '@/lib/security-headers';

function getHeaderValue(key: string, isDevelopment: boolean) {
  return getSecurityHeaders({ isDevelopment }).find((header) => header.key === key)?.value;
}

describe('security headers', () => {
  it('emits a stricter production CSP baseline', () => {
    const csp = buildContentSecurityPolicy({ isDevelopment: false });

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain('upgrade-insecure-requests');
    expect(csp).not.toContain("'unsafe-eval'");
  });

  it('keeps development CSP compatible with the local toolchain', () => {
    const csp = buildContentSecurityPolicy({ isDevelopment: true });

    expect(csp).toContain("'unsafe-eval'");
    expect(csp).toContain('ws:');
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('adds baseline security headers in production', () => {
    expect(getHeaderValue('X-Content-Type-Options', false)).toBe('nosniff');
    expect(getHeaderValue('X-Frame-Options', false)).toBe('DENY');
    expect(getHeaderValue('Referrer-Policy', false)).toBe('strict-origin-when-cross-origin');
    expect(getHeaderValue('Cross-Origin-Resource-Policy', false)).toBe('same-origin');
    expect(getHeaderValue('Strict-Transport-Security', false)).toContain('max-age=63072000');
  });

  it('omits HSTS in development', () => {
    expect(getHeaderValue('Strict-Transport-Security', true)).toBeUndefined();
  });
});
