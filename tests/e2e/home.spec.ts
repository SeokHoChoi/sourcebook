import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('loads successfully', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();

    await expect(page).toHaveTitle(/Sourcebook/);
    await expect(page.getByRole('heading', { name: /sourcebook/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /get started/i })).toBeVisible();

    const headers = response?.headers() ?? {};

    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });
});
