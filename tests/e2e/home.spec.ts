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
    const tocSection = page
      .getByRole('heading', { name: '책 차례를 그대로 고정한 탐색판' })
      .locator('xpath=ancestor::section[1]');

    await expect(
      page.getByRole('heading', { name: /^대규모 시스템 설계 기초 스터디$/ }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/책 차례를 그대로 기준점으로 삼고, 지금까지 적재된 배치만/),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '책 차례를 그대로 고정한 탐색판' }),
    ).toBeVisible();
    await expect(
      tocSection.locator('h3', { hasText: '1장 사용자 수에 따른 규모 확장성' }).first(),
    ).toBeVisible();
    await expect(tocSection.getByText('단일 서버', { exact: true }).first()).toBeVisible();
    await expect(tocSection.locator('h3', { hasText: '14장 유튜브 설계' }).first()).toBeVisible();
    await expect(
      tocSection.locator('h3', { hasText: '15장 구글 드라이브 설계' }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '1장 · 14~15p 도입과 단일 서버', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '1장 · 16p 요청의 출발점과 클라이언트 종류' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '1장 · 17p 데이터베이스 분리와 선택' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '1장 · 18p NoSQL 선택과 규모 확장 방식' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '1장 · 19~21p 로드밸런서와 데이터베이스 다중화' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: '1장 · 24~26p 캐시와 CDN 도입' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '1장 · 27~29p CDN 동작과 무효화' }),
    ).toBeVisible();
    await expect(page.getByText('이 예시에서 쓰인 용어 풀이').first()).toBeVisible();
    await expect(page.getByText(/TTL: Time To Live의 줄임말/).first()).toBeVisible();
    await expect(page.getByText(/edge server: 사용자 가까운 곳에서 파일을/).first()).toBeVisible();
    await expect(page.getByText('전체 스터디 문서 펼치기')).toBeVisible();
    await expect(
      page.locator(
        'a[href="/categories/career/tracks/system-design-interview/pages/get-started-full"]',
      ),
    ).toHaveCount(0);
  });

  test('renders the system design track overview as a TOC-style file explorer', async ({
    page,
  }) => {
    await page.goto('/categories/career/tracks/system-design-interview');
    const readingSection = page
      .getByRole('heading', { name: '읽을 문서' })
      .locator('xpath=ancestor::section[1]');

    await expect(
      page.getByRole('heading', { name: /^대규모 시스템 설계 기초$/ }).first(),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: '읽을 문서' })).toBeVisible();
    await expect(page.getByText(/파일 탐색기처럼 장과 절을 접고 펼칠 수 있게/)).toBeVisible();
    await expect(
      readingSection.getByText('1장 사용자 수에 따른 규모 확장성', { exact: true }).first(),
    ).toBeVisible();
    await expect(readingSection.getByText('단일 서버', { exact: true }).first()).toBeVisible();
    await expect(
      readingSection.locator('a').filter({ hasText: '1장 · 14~15p 도입과 단일 서버' }).first(),
    ).toBeVisible();
    await expect(
      readingSection
        .locator('a')
        .filter({ hasText: '1장 · 16p 요청의 출발점과 클라이언트 종류' })
        .first(),
    ).toBeVisible();
    await expect(readingSection.getByText('데이터베이스', { exact: true }).first()).toBeVisible();
    await expect(
      readingSection.locator('a').filter({ hasText: '1장 · 17p 데이터베이스 분리와 선택' }).first(),
    ).toBeVisible();
    await expect(
      readingSection.getByText('수직적 규모 확장 vs 수평적 규모 확장', { exact: true }).first(),
    ).toBeVisible();
    await expect(
      readingSection
        .locator('a')
        .filter({ hasText: '1장 · 18p NoSQL 선택과 규모 확장 방식' })
        .first(),
    ).toBeVisible();
    await expect(
      readingSection
        .locator('a')
        .filter({ hasText: '1장 · 19~21p 로드밸런서와 데이터베이스 다중화' })
        .first(),
    ).toBeVisible();
    await expect(readingSection.getByText('캐시', { exact: true }).first()).toBeVisible();
    await expect(
      readingSection.locator('a').filter({ hasText: '1장 · 24~26p 캐시와 CDN 도입' }).first(),
    ).toBeVisible();
    await expect(
      readingSection.getByText('콘텐츠 전송 네트워크(CDN)', { exact: true }).first(),
    ).toBeVisible();
    await expect(
      readingSection.locator('a').filter({ hasText: '1장 · 27~29p CDN 동작과 무효화' }).first(),
    ).toBeVisible();
    await expect(
      readingSection.getByText('15장 구글 드라이브 설계', { exact: true }).first(),
    ).toBeVisible();
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

  test('renders the second system design reading batch with request-source clarifications', async ({
    page,
  }) => {
    await page.goto(
      '/categories/career/tracks/system-design-interview/pages/ch01-p16-request-clients-and-http',
    );

    await expect(
      page.getByRole('heading', { name: /^1장 · 16p 요청의 출발점과 클라이언트 종류$/ }),
    ).toBeVisible();
    await expect(
      page.getByText(/가능한 모든 요청 발신자를 전부 나열하는 문장은 아니다/).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/서버에서 서버로 요청하는 것도 HTTP 요청 아닌가/).first(),
    ).toBeVisible();
    await expect(page.getByText(/실제 웹 프론트도 JSON API를 많이 쓴다/)).toBeVisible();
  });

  test('renders the third system design reading batch with database split feedback', async ({
    page,
  }) => {
    await page.goto(
      '/categories/career/tracks/system-design-interview/pages/ch01-p17-database-split-and-database-choice',
    );

    await expect(
      page.getByRole('heading', { name: /^1장 · 17p 데이터베이스 분리와 선택$/ }),
    ).toBeVisible();
    const reader = page.locator('article').first();

    await expect(reader.getByText(/입장 인원이 정해진 극장/).first()).toBeVisible();
    await expect(reader.getByText(/차선이 줄어드는 교통 병목/).first()).toBeVisible();
    await expect(reader.getByText(/도메인 이름만 말하는 것도 아니고/).first()).toBeVisible();
    await expect(reader.getByText(/같은 JSON을 만들 수는 있어도/).first()).toBeVisible();
    await expect(reader.getByText(/문장 끝이 잘려 있다/).first()).toBeVisible();
  });

  test('renders the fourth system design reading batch with NoSQL and scaling feedback', async ({
    page,
  }) => {
    await page.goto(
      '/categories/career/tracks/system-design-interview/pages/ch01-p18-nosql-and-scaling',
    );

    await expect(
      page.getByRole('heading', { name: /^1장 · 18p NoSQL 선택과 규모 확장 방식$/ }),
    ).toBeVisible();
    await expect(
      page.getByText(/NoSQL은 데이터 사이에 관계가 없다는 뜻이 아니다/).first(),
    ).toBeVisible();
    await expect(page.getByText(/`API가 더 단순하다`는 말은/).first()).toBeVisible();
    await expect(
      page
        .getByText(
          /중복 데이터의 최신성 관리가 실패하면, 그 결과가 프론트에서는 stale UI로 드러날 수 있다/,
        )
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText(/정의에서 함의를 뽑아내는 연습이 부족했던 것/).first(),
    ).toBeVisible();
    await expect(page.getByText(/capacity를 키우는 이야기/).first()).toBeVisible();
    await expect(
      page.getByText(/이런 비-관계형 데이터베이스는 일반적으로 조인 연산/).first(),
    ).toBeVisible();
  });

  test('renders the fifth system design reading batch with load balancer and replication feedback', async ({
    page,
  }) => {
    await page.goto(
      '/categories/career/tracks/system-design-interview/pages/ch01-pp19-21-load-balancer-and-db-replication',
    );

    await expect(
      page.getByRole('heading', { name: /^1장 · 19~21p 로드밸런서와 데이터베이스 다중화$/ }),
    ).toBeVisible();
    await expect(page.getByText(/backend pool 또는 target group에 가깝다/).first()).toBeVisible();
    await expect(page.getByText(/웹 서버 한 대가 죽어도/).first()).toBeVisible();
    await expect(page.getByText(/공개 IP 주소/).first()).toBeVisible();
    await expect(
      page.getByText(/로컬 개발에서 네가 PostgreSQL 하나를 띄워서 개발하는 것과/).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/같은 리전 안의 다른 AZ에 standby를 자동으로/).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/로컬 DB, 스테이징 DB, 프로덕션 DB는 환경 구분이고/).first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/데이터를 지역적으로 떨어진 여러 장소에 다중화시켜 놓을 수 있기 때문이다/)
        .first(),
    ).toBeVisible();
  });

  test('renders the sixth system design reading batch with cache strategy feedback', async ({
    page,
  }) => {
    await page.goto(
      '/categories/career/tracks/system-design-interview/pages/ch01-pp24-26-cache-and-cdn',
    );

    await expect(
      page.getByRole('heading', { name: /^1장 · 24~26p 캐시와 CDN 도입$/ }),
    ).toBeVisible();
    await expect(page.getByText(/네트워크 왕복뿐 아니라/).first()).toBeVisible();
    await expect(page.getByText(/실무에서는 데이터가 어떤 조건으로/).first()).toBeVisible();
    await expect(page.getByText(/TanStack Query/).first()).toBeVisible();
    await expect(page.getByText('질문 원문').first()).toBeVisible();
    await expect(page.getByText('질문 다듬기').first()).toBeVisible();
    await expect(page.getByText(/캐싱 전략은 어떻게 잡으셨냐/).first()).toBeVisible();
    await expect(
      page
        .getByText(/서버 캐시 면접 답변과 프론트 캐시 면접 답변을 같은 말로 퉁치면 안 된다/)
        .first(),
    ).toBeVisible();
  });

  test('renders the seventh system design reading batch with CDN operation feedback', async ({
    page,
  }) => {
    await page.goto(
      '/categories/career/tracks/system-design-interview/pages/ch01-pp27-29-cdn-operation',
    );

    await expect(
      page.getByRole('heading', { name: /^1장 · 27~29p CDN 동작과 무효화$/ }),
    ).toBeVisible();
    await expect(page.getByText(/HTML은 정적인데 왜 동적 콘텐츠 캐싱이냐/).first()).toBeVisible();
    await expect(
      page.getByText(/S3를 origin으로 삼고 CloudFront의 edge network/).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/React 빌드 파일 뒤에 붙는 난수나 content hash/).first(),
    ).toBeVisible();
    await expect(page.getByText('질문 원문').first()).toBeVisible();
    await expect(page.getByText('질문 다듬기').first()).toBeVisible();
    await expect(
      page.getByText(/CDN은.. 지리적으로 분산된 서버의 네트워크이다/).first(),
    ).toBeVisible();
  });

  test('renders the system design journal with the captured chapter-1 questions', async ({
    page,
  }) => {
    await page.goto('/categories/career/tracks/system-design-interview/journal');

    await expect(page.getByRole('heading', { name: /^학습 기록$/ })).toBeVisible();
    await expect(page.getByText(/프론트 확장성 범위 오판/).first()).toBeVisible();
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
    await expect(
      page.getByText(/서버에서 서버로 요청하는 것도 HTTP 요청 아닌가/).first(),
    ).toBeVisible();
    await expect(page.getByText(/확장 이유와 해법 전개 구분/).first()).toBeVisible();
    await expect(page.getByText(/생략된 이유 추론과 관계 개념 혼동/).first()).toBeVisible();
    await expect(page.getByText(/비유 선택과 DB 선택 기준 추상어 혼동/).first()).toBeVisible();
    await expect(page.getByText(/같은 DTO면 차이 없음 오판/).first()).toBeVisible();
    await expect(page.getByText(/부하 분산 집합과 주-부 복제 용어 혼동/).first()).toBeVisible();
    await expect(page.getByText(/로컬 개발 DB와 운영 복제 토폴로지 혼동/).first()).toBeVisible();
    await expect(page.getByText(/캐시 계층과 액세스 패턴 범위 혼동/).first()).toBeVisible();
    await expect(page.getByText(/CDN 정적\/동적 콘텐츠와 버저닝 범위 혼동/).first()).toBeVisible();
    await expect(page.getByText(/질문 다듬기/).first()).toBeVisible();
    await expect(page.getByText(/액세스 패턴에 맞는 캐시 전략/).first()).toBeVisible();
    await expect(page.getByText(/데이터 모델, 질의 패턴, 일관성 요구/).first()).toBeVisible();
    await expect(
      page
        .getByText(
          /RDBMS는 정규화된 여러 테이블을 서버에서 join해 화면용 JSON으로 만들어 줄 수 있다/,
        )
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText(/부하 분산 집합에 또 하나의 웹 서버를 추가하고 나면/).first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/데이터를 지역적으로 떨어진 여러 장소에 다중화시켜 놓을 수 있기 때문이다/)
        .first(),
    ).toBeVisible();
    await expect(
      page.getByText(/이런 비-관계형 데이터베이스는 일반적으로 조인 연산/).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/CloudFront 같은 CDN에서 `edge server`, `origin`, `distribution`/).first(),
    ).toBeVisible();
    await expect(
      page
        .locator(
          'a[href="/categories/career/tracks/system-design-interview/pages/ch01-p16-request-clients-and-http#ch01-p16-request-clients-and-http-seg-003"]',
        )
        .first(),
    ).toBeVisible();
    await expect(
      page
        .locator(
          'a[href="/categories/career/tracks/system-design-interview/pages/ch01-pp19-21-load-balancer-and-db-replication#ch01-pp19-21-load-balancer-and-db-replication-seg-006"]',
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
