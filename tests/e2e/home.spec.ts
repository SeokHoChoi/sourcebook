import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('loads the category dashboard', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();

    await expect(page).toHaveTitle(/Sourcebook/);
    await expect(page.getByRole('heading', { name: /문서 읽기 작업대/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /지금 열 수 있는 트랙/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /React Hook Form/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /RHF 스터디 가이드/ })).toBeVisible();

    const headers = response?.headers() ?? {};

    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  test('renders the useForm segment reader page', async ({ page }) => {
    await page.goto('/categories/frontend/tracks/react-hook-form/pages/useform');

    await expect(page.getByRole('heading', { name: /^useForm$/ })).toBeVisible();
    await expect(
      page.getByText(/원문과 직독직해, 코드 읽기 포인트를 같은 문맥 안에서/),
    ).toBeVisible();
    await expect(
      page.getByText(/useForm은 폼을 더 쉽게 관리하기 위한 커스텀 훅이다/),
    ).toBeVisible();
    await expect(page.getByText(/학습 로그/)).toBeVisible();
    await page.getByText('학습 로그').click();
    await expect(page.getByText(/useForm이 반환하는 객체는 설정값 모음인가/)).toBeVisible();
  });

  test('renders the RHF study guide page', async ({ page }) => {
    await page.goto('/categories/frontend/tracks/react-hook-form/study');

    await expect(page.getByRole('heading', { name: /^RHF 실전 학습 가이드$/ })).toBeVisible();
    await expect(
      page.getByText(/개념 이해와 실전 판단을 빠르게 붙이기 위한 스터디 전용 문서다/),
    ).toBeVisible();
    await expect(page.locator('h1', { hasText: 'React Hook Form 실전 학습 트랙' })).toBeVisible();
    await expect(
      page.locator('h2', { hasText: '2-3. watch / useWatch / getValues / subscribe' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /PART 1\. 빠른 진입/ })).toBeVisible();
    await expect(
      page.getByText(/stable 버전 표기는 npm latest dist-tag 기준 7.72.1/),
    ).toBeVisible();
    await expect(page.getByText('Code Example').first()).toBeVisible();
  });

  test('renders code examples as editor-style blocks with inline guidance', async ({ page }) => {
    await page.goto('/categories/frontend/tracks/react-hook-form/pages/get-started-full');

    const codeBlock = page
      .getByText('import { useForm, SubmitHandler } from "react-hook-form"')
      .first()
      .locator('xpath=ancestor::section[1]');

    await expect(codeBlock.getByText(/헷갈리기 쉬운 포인트/)).toBeVisible();
    await expect(
      codeBlock.getByText(/register, handleSubmit, watch, errors를/).first(),
    ).toBeVisible();
    await expect(codeBlock.getByText(/코드 읽기/)).toHaveCount(0);
  });

  test('renders the full get-started intake page', async ({ page }) => {
    await page.goto('/categories/frontend/tracks/react-hook-form/pages/get-started-full');

    await expect(page.locator('h1', { hasText: 'Get Started' })).toBeVisible();
    await expect(page.getByText(/Get Started 목차/)).toBeVisible();
    await expect(page.getByText(/React Hook Form 설치는/).first()).toBeVisible();
    await expect(page.getByText(/custom register를 직접 쓸 자유도/).first()).toBeVisible();
    await expect(page.getByText(/읽으면서 생각하기/).first()).toBeVisible();
    await expect(page.getByText(/회상 질문 · 말하기 전이 펼치기/)).toHaveCount(0);
    await expect(page.getByText(/영문 문장/)).toHaveCount(0);
    await expect(page.getByText(/직독 라인/)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: /^Installation$/ }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Schema Validation$/ }).first()).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Integrating with UI libraries/ }),
    ).toBeVisible();
    const uiLibrariesArticle = page
      .getByRole('heading', { level: 2, name: /^Integrating with UI libraries$/ })
      .locator('xpath=ancestor::article[1]');
    await expect(uiLibrariesArticle.getByText(/^UI 라이브러리와 연동하기$/)).toBeVisible();
    await expect(
      uiLibrariesArticle.getByText(/import Select from "react-select"/).first(),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /React Native/ })).toBeVisible();
    await expect(page.getByText(/복붙 원문 아카이브 펼치기/)).toHaveCount(0);
    await expect(page.getByText(/내용은 보존하고 보기만 정리한 raw source/)).toHaveCount(0);
  });

  test('keeps full-page menu anchors aligned and avoids duplicate key warnings', async ({
    page,
  }) => {
    const duplicateKeyWarnings: string[] = [];

    page.on('console', (message) => {
      if (message.text().includes('Encountered two children with the same key')) {
        duplicateKeyWarnings.push(message.text());
      }
    });

    await page.goto('/categories/frontend/tracks/react-hook-form/pages/get-started-full');

    const navigation = page.getByRole('navigation', { name: 'Get Started 목차' });
    const videoTutorialLink = navigation.getByRole('link', {
      name: /React Web Video Tutorial/,
    });
    const globalStateLink = navigation.getByRole('link', {
      name: /Integrating with global state/,
    });
    const controlledInputsLink = navigation.getByRole('link', {
      name: /Integrating Controlled Inputs/,
    });
    const controlledInputsHref = await controlledInputsLink.getAttribute('href');

    expect(controlledInputsHref).not.toBeNull();

    await videoTutorialLink.click();
    await page.waitForTimeout(400);
    await expect(videoTutorialLink).toHaveAttribute('aria-current', 'location');
    await expect(
      page
        .getByRole('heading', { level: 2, name: /^React Web Video Tutorial$/ })
        .locator('xpath=ancestor::article[1]')
        .getByText(/^섹션 02$/),
    ).toBeVisible();

    await globalStateLink.click();
    await page.waitForTimeout(400);
    await expect(globalStateLink).toHaveAttribute('aria-current', 'location');
    await expect(
      page
        .getByRole('heading', { level: 2, name: /^Integrating with global state$/ })
        .locator('xpath=ancestor::article[1]')
        .getByText(/^섹션 08$/),
    ).toBeVisible();

    await controlledInputsLink.click();
    await page.waitForTimeout(400);
    await expect(controlledInputsLink).toHaveAttribute('aria-current', 'location');

    const controlledInputsAnchor = controlledInputsHref ?? '';
    const controlledInputsTarget = page.locator(controlledInputsAnchor).first();
    await expect(controlledInputsTarget).toBeVisible();

    await expect
      .poll(async () => (await controlledInputsTarget.boundingBox())?.y ?? null)
      .toBeGreaterThan(40);
    await expect
      .poll(async () => (await controlledInputsTarget.boundingBox())?.y ?? null)
      .toBeLessThan(220);
    expect(duplicateKeyWarnings).toEqual([]);
  });

  test('redirects excerpt get-started routes to the full document page', async ({ page }) => {
    await page.goto('/categories/frontend/tracks/react-hook-form/pages/gs-installation-example');

    await expect(page).toHaveURL(/\/pages\/get-started-full#get-started-full-seg-003$/);
    await expect(page.locator('h1', { hasText: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Installation$/ }).first()).toBeVisible();
    await expect(page.getByText(/React Hook Form 설치는/).first()).toBeVisible();
  });

  test('refreshing a hashed full-page route does not trigger hydration mismatch', async ({
    page,
  }) => {
    const hydrationMessages: string[] = [];

    page.on('console', (message) => {
      const text = message.text();

      if (
        text.includes('Hydration failed') ||
        text.includes('Recoverable Error') ||
        text.includes("server rendered text didn't match")
      ) {
        hydrationMessages.push(text);
      }
    });

    await page.goto(
      '/categories/frontend/tracks/react-hook-form/pages/get-started-full#get-started-full-seg-032',
    );
    await page.reload();

    await expect(page.getByRole('link', { name: /Design and philosophy/ })).toHaveAttribute(
      'aria-current',
      'location',
    );
    await expect(page.getByText(/Recoverable Error/)).toHaveCount(0);
    expect(hydrationMessages).toEqual([]);
  });
});
