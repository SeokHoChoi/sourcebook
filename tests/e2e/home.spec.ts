import { expect, test } from '@playwright/test';

test.describe('home page', () => {
  test('loads the category dashboard', async ({ page }) => {
    const response = await page.goto('/');

    expect(response).not.toBeNull();

    await expect(page).toHaveTitle(/Sourcebook/);
    await expect(page.getByRole('heading', { name: /문서 읽기 작업대/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /지금 열 수 있는 트랙/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /React Hook Form/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /대규모 시스템 설계 기초/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /질문 해결 노트/ }).first()).toBeVisible();
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
    await expect(page.getByText(/useForm이 반환하는 객체는 설정값 모음인가/)).toHaveCount(2);
    await expect(page.getByText('여기서 실제로 막혔음').first()).toBeVisible();
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
    await expect(page.getByRole('link', { name: /PART 1\. 빠른 진입/ }).first()).toBeVisible();
    await expect(
      page.getByText(/stable 버전 표기는 npm latest dist-tag 기준 7.72.1/),
    ).toBeVisible();
    await expect(page.getByText('Code Example').first()).toBeVisible();
    const domHeading = page.getByRole('heading', {
      level: 3,
      name: 'DOM이 관리한다는 말의 정확한 뜻',
    });
    const domNotice = domHeading.locator('xpath=following-sibling::*[1]');
    await expect(domHeading).toBeVisible();
    await expect(
      domNotice.getByText(/브라우저 DOM이 live value의 source of truth라는 뜻인지 헷갈렸다/),
    ).toBeVisible();
    await expect(domNotice.getByText('여기서 실제로 막혔음')).toBeVisible();
    await expect(
      page.locator(
        'a[href="/categories/frontend/tracks/react-hook-form/journal#event-rhf-event-008"]',
      ),
    ).toHaveCount(1);
  });

  test('renders the central learning journal with exact return links', async ({ page }) => {
    await page.goto('/categories/frontend/tracks/react-hook-form/journal');

    await expect(page.getByRole('heading', { name: /^학습 기록$/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: '질문에서 바로 뛰기' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'DOM vs RHF 내부 상태 구분 혼동' }),
    ).toBeVisible();
    await expect(
      page.locator(
        'a[href="/categories/frontend/tracks/react-hook-form/study#dom이-관리한다는-말의-정확한-뜻"]',
      ),
    ).toHaveCount(2);
  });

  test('renders the question log study and journal flow', async ({ page }) => {
    await page.goto('/categories/notes/tracks/question-log/study');

    await expect(page.getByRole('heading', { name: /^필드 노트 아카이브$/ })).toBeVisible();
    await expect(
      page.locator('h2', { hasText: '1. DevTools가 열려 있을 때만 네트워크를 기록하는 이유' }),
    ).toBeVisible();
    await expect(
      page.locator('h2', { hasText: '3. React 프로젝트에서 Node 버전을 관리하는 방법' }),
    ).toBeVisible();
    await expect(
      page.getByText(/DevTools는 브라우저 내부 로그를 아무 때나 들춰보는 창이 아니라/),
    ).toBeVisible();

    await page.goto('/categories/notes/tracks/question-log/journal');

    await expect(page.getByRole('heading', { name: /^학습 기록$/ })).toBeVisible();
    await expect(
      page
        .locator('#event-question-log-001')
        .getByText(/왜 Chrome DevTools는 열려 있던 시점 이후의 요청만 기록하고/),
    ).toBeVisible();
    await expect(
      page.locator(
        'a[href="/categories/notes/tracks/question-log/study#2-포털을-새로고침해야-새-배포가-보였던-이유"]',
      ),
    ).toHaveCount(1);
    await expect(
      page.locator(
        'a[href="/categories/notes/tracks/question-log/study#3-react-프로젝트에서-node-버전을-관리하는-방법"]',
      ),
    ).toHaveCount(1);
  });

  test('renders the system design study guide seeded from the provided table of contents', async ({
    page,
  }) => {
    await page.goto('/categories/career/tracks/system-design-interview/study');

    await expect(
      page.getByRole('heading', { name: /^대규모 시스템 설계 기초 스터디$/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/프론트엔드 개발자인 네가 시스템 설계를 공부하는 이유는/),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /PART 2\. 차례 원문 아카이브/ }).first(),
    ).toBeVisible();
    await expect(page.locator('h2', { hasText: '2. 차례' })).toBeVisible();
    await expect(page.getByText('1장 사용자 수에 따른 규모 확장성 14p')).toBeVisible();
    await expect(page.getByText('14장 유튜브 설계 260p')).toBeVisible();
    await expect(page.getByText('15장 구글 드라이브 설계 290p')).toBeVisible();
    await expect(
      page.locator(
        'a[href="/categories/career/tracks/system-design-interview/pages/get-started-full"]',
      ),
    ).toHaveCount(0);
  });

  test('renders the first system design reading batch as a real reader page', async ({ page }) => {
    await page.goto(
      '/categories/career/tracks/system-design-interview/pages/ch01-pp14-15-intro-single-server',
    );

    await expect(
      page.getByRole('heading', { name: /^1장 · 14~15p 도입과 단일 서버$/ }),
    ).toBeVisible();
    await expect(page.getByText(/OCR로 옮긴 원문과 쉬운 해설/)).toBeVisible();
    await expect(page.getByText('원문 아카이브').first()).toBeVisible();
    await expect(page.getByText('핵심 해설').first()).toBeVisible();
    await expect(page.getByText(/프론트엔드도 이 범위 밖이 아니다/).first()).toBeVisible();
    await expect(page.getByText(/여기서 실제로 막혔음/).first()).toBeVisible();
    await expect(
      page.getByText(/프론트엔드도 사용자 수의 영향을 직접 받는가/).first(),
    ).toBeVisible();
  });

  test('renders the system design journal with the captured chapter-1 questions', async ({
    page,
  }) => {
    await page.goto('/categories/career/tracks/system-design-interview/journal');

    await expect(page.getByRole('heading', { name: /^학습 기록$/ })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /프론트 확장성 범위 오판/ }).first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/웹 앱과 데이터베이스, 캐시가 서버 한 대에서 실행된다는 말이 정확히 무엇인가/)
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator(
          'a[href="/categories/career/tracks/system-design-interview/pages/ch01-pp14-15-intro-single-server#ch01-pp14-15-intro-single-server-seg-004"]',
        )
        .first(),
    ).toBeVisible();
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
