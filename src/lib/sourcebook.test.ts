import { promises as fs } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  findRelatedFullPage,
  findSectionHeadingIdForPage,
  findTrack,
  findTrackPage,
  getCatalog,
  getCategoryOverviewBySlug,
  getCategoryOverviews,
  getCategorySlugs,
  getLearnerEventJournalHref,
  getTrack,
  getTrackJournalRouteParams,
  getTrackPage,
  getTrackPageRouteParams,
  getTrackRouteParams,
  getTrackStudyRouteParams,
  resolveLearnerEventTarget,
  resolvePageTarget,
} from '@/lib/sourcebook';

describe('sourcebook catalog loader', () => {
  const interviewTrackPath = path.join(
    process.cwd(),
    'library',
    'career',
    'interview',
    'track.json',
  );
  const interviewTrackBackupPath = `${interviewTrackPath}.bak`;

  it('loads category slugs from catalog', async () => {
    const catalog = await getCatalog();
    const categorySlugs = await getCategorySlugs();

    expect(catalog.categories).toHaveLength(3);
    expect(categorySlugs).toEqual(['frontend', 'career', 'notes']);
  });

  it('falls back to planned summary when a catalog track manifest is missing', async () => {
    await fs.rename(interviewTrackPath, interviewTrackBackupPath);

    try {
      const categories = await getCategoryOverviews();
      const trackParams = await getTrackRouteParams();
      const pageParams = await getTrackPageRouteParams();
      const career = categories.find((category) => category.slug === 'career');

      expect(trackParams).toContainEqual({ categorySlug: 'career', trackSlug: 'interview' });
      expect(career?.counts.totalTracks).toBe(3);
      expect(career?.tracks.some((track) => track.trackSlug === 'interview')).toBe(true);
      expect(
        pageParams.some(
          (param) => param.categorySlug === 'career' && param.trackSlug === 'interview',
        ),
      ).toBe(false);
    } finally {
      await fs.rename(interviewTrackBackupPath, interviewTrackPath);
    }
  });

  it('builds multi-category overview with planned tracks', async () => {
    const categories = await getCategoryOverviews();
    const frontend = categories.find((category) => category.slug === 'frontend');
    const career = categories.find((category) => category.slug === 'career');
    const notes = categories.find((category) => category.slug === 'notes');

    expect(categories).toHaveLength(3);
    expect(frontend?.counts.totalTracks).toBe(3);
    expect(frontend?.counts.plannedTracks).toBe(2);
    expect(frontend?.counts.totalPages).toBe(35);
    expect(career?.counts.totalTracks).toBe(3);
    expect(career?.counts.activeTracks).toBe(1);
    expect(career?.counts.totalPages).toBe(13);
    expect(notes?.counts.totalTracks).toBe(1);
    expect(notes?.counts.activeTracks).toBe(1);
    expect(notes?.counts.totalPages).toBe(0);
    expect(notes?.counts.openConfusions).toBe(0);
  });

  it('loads the react-hook-form track with structure and overlays', async () => {
    const track = await getTrack('frontend', 'react-hook-form');

    expect(track.manifest.title).toBe('React Hook Form');
    expect(track.studyGuide).not.toBeNull();
    expect(track.studyGuide?.title).toBe('RHF 실전 학습 가이드');
    expect(track.studyGuide?.markdown).toContain('# React Hook Form 실전 학습 트랙');
    expect(track.studyGuide?.markdown).toContain('### 브라우저 프로세스부터 RHF 내부 저장소까지');
    expect(track.counts.totalPages).toBe(35);
    expect(track.counts.capturedPages).toBe(6);
    expect(track.counts.structuredPages).toBe(6);
    expect(track.counts.overlayPages).toBe(6);
    expect(track.counts.pendingPages).toBe(29);
    expect(track.confusionPatterns[0]).toMatchObject({
      label: '반환 형태 개념 혼동',
      count: 2,
    });
    expect(
      track.learnerEvents.some(
        (event) =>
          event.targetView === 'study' &&
          event.targetAnchorId === 'dom이-관리한다는-말의-정확한-뜻',
      ),
    ).toBe(true);
    expect(
      track.learnerEvents.some(
        (event) =>
          event.targetView === 'study' &&
          event.targetAnchorId === '브라우저-프로세스부터-rhf-내부-저장소까지',
      ),
    ).toBe(true);
  });

  it('loads the question log track with a study guide and resolved field notes', async () => {
    const track = await getTrack('notes', 'question-log');

    expect(track.manifest.title).toBe('질문 해결 노트');
    expect(track.studyGuide).not.toBeNull();
    expect(track.studyGuide?.title).toBe('필드 노트 아카이브');
    expect(track.studyGuide?.markdown).toContain('# 질문 해결 노트');
    expect(track.studyGuide?.markdown).toContain(
      'DevTools가 열려 있을 때만 네트워크를 기록하는 이유',
    );
    expect(track.studyGuide?.markdown).toContain('포털을 새로고침해야 새 배포가 보였던 이유');
    expect(track.studyGuide?.markdown).toContain('React 프로젝트에서 Node 버전을 관리하는 방법');
    expect(track.counts.totalPages).toBe(0);
    expect(track.counts.openConfusions).toBe(0);
    expect(track.learnerEvents).toHaveLength(3);
    expect(track.confusionPatterns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: '도구 연결 시점 혼동',
          count: 1,
        }),
        expect.objectContaining({
          label: '진입 주체 캐시 경로 혼동',
          count: 1,
        }),
        expect.objectContaining({
          label: 'Node 런타임 관리 절차 혼동',
          count: 1,
        }),
      ]),
    );
  });

  it('loads the system design interview track with the seeded study guide and chapter-1 page readers', async () => {
    const track = await getTrack('career', 'system-design-interview');

    expect(track.manifest.title).toBe('대규모 시스템 설계 기초');
    expect(track.studyGuide).not.toBeNull();
    expect(track.studyGuide?.title).toBe('대규모 시스템 설계 기초 스터디');
    expect(track.studyGuide?.markdown).toContain('# 대규모 시스템 설계 기초 스터디');
    expect(track.studyGuide?.tocMarkdown).toContain('1장 사용자 수에 따른 규모 확장성 14p');
    expect(track.studyGuide?.markdown).toContain('1장 사용자 수에 따른 규모 확장성');
    expect(track.studyGuide?.markdown).toContain('15장 구글 드라이브 설계');
    expect(track.studyGuide?.markdown).toContain('1장 · 14~15p 도입과 단일 서버');
    expect(track.studyGuide?.markdown).toContain('1장 · 16p 요청의 출발점과 클라이언트 종류');
    expect(track.studyGuide?.markdown).toContain('1장 · 17p 데이터베이스 분리와 선택');
    expect(track.studyGuide?.markdown).toContain('1장 · 18p NoSQL 선택과 규모 확장 방식');
    expect(track.studyGuide?.markdown).toContain('1장 · 19~21p 로드밸런서와 데이터베이스 다중화');
    expect(track.studyGuide?.markdown).toContain('1장 · 24~26p 캐시와 CDN 도입');
    expect(track.studyGuide?.markdown).toContain('1장 · 27~29p CDN 동작과 무효화');
    expect(track.studyGuide?.markdown).toContain('1장 · 30~32p 무상태 웹 계층');
    expect(track.studyGuide?.markdown).toContain('1장 · 33~35p 데이터 센터');
    expect(track.studyGuide?.markdown).toContain('1장 · 35p 메시지 큐 도입');
    expect(track.studyGuide?.markdown).toContain('1장 · 36p 메시지 큐 확장 예시');
    expect(track.studyGuide?.markdown).toContain('1장 · 36~38p 로그, 메트릭 그리고 자동화');
    expect(track.studyGuide?.markdown).toContain('1장 · 38p 데이터베이스 규모 확장 도입');
    expect(track.counts.totalPages).toBe(13);
    expect(track.counts.capturedPages).toBe(13);
    expect(track.counts.structuredPages).toBe(13);
    expect(track.counts.overlayPages).toBe(13);
    expect(track.counts.openConfusions).toBe(29);
    expect(track.learnerEvents).toHaveLength(29);
    expect(track.studyGuide?.markdown).toContain(
      '부하 분산 집합은 로드밸런서가 요청을 보낼 후보 서버 묶음이다',
    );
    expect(track.studyGuide?.markdown).toContain(
      '로컬 개발용 DB와 운영 복제 토폴로지는 다른 문제다',
    );
    expect(track.studyGuide?.markdown).toContain('캐시는 위치마다 목적과 조정 지점이 다르다');
    expect(track.studyGuide?.markdown).toContain(
      'CDN은 파일 저장소 하나가 아니라 edge와 origin의 배달 구조다',
    );
    expect(track.studyGuide?.markdown).toContain(
      '무상태는 상태가 없다는 뜻이 아니라 웹 서버에 묶지 않는다는 뜻이다',
    );
    expect(track.studyGuide?.markdown).toContain('데이터 센터는 한 URL 뒤에 숨은 여러 실제 경로다');
    expect(track.studyGuide?.markdown).toContain(
      '비유로는 props drilling을 줄이는 store처럼 직접 의존을 줄인다고 볼 수 있지만',
    );
    expect(track.studyGuide?.markdown).toContain('GA4/GTM은 전환·퍼널·이벤트 분석');
    expect(track.studyGuide?.markdown).toContain('DB는 무한대가 아니고 수직 확장으로도');
  });

  it('loads the first system design reading batch with OCR source, overlays, and learner events', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-pp14-15-intro-single-server',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('사용자 수에 따른 규모 확장성');
    expect(page?.rawSource).toContain('이 그림의 시스템 구성을 이해하기 위해서는');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('단일 서버');
    expect(page?.segmentCards).toHaveLength(8);
    expect(page?.segmentCards[1]?.directTranslation).toContain('프론트엔드도 이 범위 밖이 아니다');
    expect(page?.segmentCards[7]?.sourceText).toContain('DNS는 보');
    expect(page?.learnerEvents).toHaveLength(4);
    expect(page?.reviewItems).toHaveLength(4);
  });

  it('loads the second system design reading batch with request-source clarifications', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-p16-request-clients-and-http',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('이제 실제 요청이 어디로부터 오는지를 살펴보자.');
    expect(page?.rawSource).toContain('GET /users/12 - id가 12인 사용자 데이터 접근');
    expect(page?.segmentCards).toHaveLength(4);
    expect(page?.segmentCards[1]?.directTranslation).toContain(
      '가능한 모든 요청 발신자를 전부 나열하는 문장은 아니다',
    );
    expect(page?.segmentCards[2]?.devNote).toContain('실제 웹 프론트도 JSON API를 많이 쓴다');
    expect(page?.learnerEvents).toHaveLength(2);
    expect(page?.reviewItems).toHaveLength(2);
  });

  it('loads the third system design reading batch with database split feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-p17-database-split-and-database-choice',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('사용자가 늘면 서버 하나로는 충분하지 않아서');
    expect(page?.rawSource).toContain('read/write/update');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('데이터베이스');
    expect(page?.segmentCards).toHaveLength(7);
    expect(page?.segmentCards[1]?.devNote).toContain('1) 주장');
    expect(page?.segmentCards[1]?.trickySentenceExplanation).toContain('차선이 줄어드는 교통 병목');
    expect(page?.segmentCards[4]?.trickySentenceExplanation).toContain(
      '도메인 이름만 말하는 것도 아니고',
    );
    expect(page?.segmentCards[4]?.devNote).toContain('같은 JSON을 만들 수는 있어도');
    expect(page?.segmentCards[6]?.trickySentenceExplanation).toContain('문장 끝이 잘려 있다');
    expect(page?.learnerEvents).toHaveLength(2);
    expect(page?.reviewItems).toHaveLength(3);
  });

  it('loads the fourth system design reading batch with NoSQL and scaling feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-p18-nosql-and-scaling',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('일반적으로 조인 연산은 지');
    expect(page?.rawSource).toContain('수직적 규모 확장 vs 수평적 규모 확장');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('수직적 규모 확장 vs 수평적 규모 확장');
    expect(page?.segmentCards).toHaveLength(7);
    expect(page?.segmentCards[0]?.trickySentenceExplanation).toContain(
      'NoSQL은 데이터 사이에 관계가 없다는 뜻이 아니다',
    );
    expect(page?.segmentCards[4]?.devNote).toContain('정의에서 함의를 뽑아내는 연습');
    expect(page?.segmentCards[6]?.devNote).toContain('capacity를 키우는 이야기');
    expect(page?.segmentCards[1]?.devNote).toContain('`API가 더 단순하다`는 말은');
    expect(page?.segmentCards[1]?.devNote).toContain(
      '중복 데이터의 최신성 관리가 실패하면, 그 결과가 프론트에서는 stale UI로 드러날 수 있다',
    );
    expect(page?.learnerEvents).toHaveLength(2);
    expect(page?.reviewItems).toHaveLength(3);
  });

  it('loads the fifth system design reading batch with load balancer and replication feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-pp19-21-load-balancer-and-db-replication',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain(
      '로드밸런서는 부하 분산 집합(load balancing set)에 속한 웹 서버들에게',
    );
    expect(page?.rawSource).toContain(
      '데이터를 지역적으로 떨어진 여러 장소에 다중화시켜 놓을 수 있기 때문이다',
    );
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('수직적 규모 확장 vs 수평적 규모 확장');
    expect(page?.segmentCards).toHaveLength(6);
    expect(page?.segmentCards[2]?.trickySentenceExplanation).toContain(
      'backend pool 또는 target group에 가깝다',
    );
    expect(page?.segmentCards[2]?.devNote).toContain('웹 서버 한 대가 죽어도');
    expect(page?.segmentCards[3]?.trickySentenceExplanation).toContain(
      '문장이 다음 페이지로 잘린 부분',
    );
    expect(page?.segmentCards[4]?.devNote).toContain(
      '로컬 개발에서 네가 PostgreSQL 하나를 띄워서 개발하는 것과',
    );
    expect(page?.segmentCards[5]?.devNote).toContain('같은 리전 안의 다른 AZ에 standby를 자동으로');
    expect(page?.segmentCards[5]?.devNote).toContain(
      '로컬 DB, 스테이징 DB, 프로덕션 DB는 환경 구분',
    );
    expect(page?.learnerEvents).toHaveLength(2);
    expect(page?.reviewItems).toHaveLength(2);
  });

  it('loads the sixth system design reading batch with cache strategy feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-pp24-26-cache-and-cdn',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain(
      '애플리케이션의 성능은 데이터베이스를 얼마나 자주 호출하느냐',
    );
    expect(page?.rawSource).toContain('캐시 메모리가 너무 작으면');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('캐시');
    expect(page?.segmentCards).toHaveLength(8);
    expect(page?.segmentCards[0]?.trickySentenceExplanation).toContain('네트워크 왕복뿐 아니라');
    expect(page?.segmentCards[2]?.trickySentenceExplanation).toContain('액세스 패턴');
    expect(page?.segmentCards[6]?.devNote).toContain('TanStack Query');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('stale-while-revalidate');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('cache hit ratio');
    expect(page?.learnerEvents).toHaveLength(1);
    expect(page?.learnerEvents[0]?.questionRevision).toContain('더 좋은 질문으로 다듬으면');
    expect(page?.reviewItems).toHaveLength(2);
  });

  it('loads the seventh system design reading batch with CDN operation feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-pp27-29-cdn-operation',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('요청 경로(request path), 질의 문자열(query string)');
    expect(page?.rawSource).toContain('아마존(Amazon) S3 같은 온라인 저장소');
    expect(page?.rawSource).toContain('콘텐츠의 다른 버전을 서비스하도록 오브젝트 버저닝');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('콘텐츠 전송 네트워크(CDN)');
    expect(page?.segmentCards).toHaveLength(6);
    expect(page?.segmentCards[0]?.trickySentenceExplanation).toContain(
      'HTML은 정적인데 왜 동적 콘텐츠 캐싱이냐',
    );
    expect(page?.segmentCards[1]?.trickySentenceExplanation).toContain(
      'S3를 origin으로 삼고 CloudFront의 edge network',
    );
    expect(page?.segmentCards[2]?.devNote).toContain('S3는 `컴퓨터 한 대에 접속해서 파일을 둔다`');
    expect(page?.segmentCards[4]?.devNote).toContain(
      'React 빌드 파일 뒤에 붙는 난수나 content hash',
    );
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('Amazon S3');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('object versioning');
    expect(page?.learnerEvents).toHaveLength(1);
    expect(page?.learnerEvents[0]?.questionRevision).toContain('CloudFront 같은 CDN');
    expect(page?.reviewItems).toHaveLength(2);
  });

  it('loads the ninth system design reading batch with data center feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-pp33-35-data-center',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('통상 이 절차를 지리적 라우팅');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('데이터 센터');
    expect(page?.segmentCards).toHaveLength(5);
    expect(page?.segmentCards[1]?.trickySentenceExplanation).toContain('질문을 세 종류로 나누자');
    expect(page?.segmentCards[2]?.trickySentenceExplanation).toContain('데이터 센터 전체의 전력');
    expect(page?.segmentCards[3]?.trickySentenceExplanation).toContain('정적 자산 로딩');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('geoDNS');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('메시지 큐');
    expect(page?.learnerEvents).toHaveLength(5);
    expect(page?.learnerEvents[0]?.questionRevision).toContain('geoDNS는 사용자의 실제 GPS');
    expect(page?.reviewItems).toHaveLength(5);
  });

  it('loads the tenth system design reading batch with message queue feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-p35-message-queue-intro',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('메시지 큐는 메시지의 무손실');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('메시지 큐');
    expect(page?.segmentCards).toHaveLength(1);
    expect(page?.segmentCards[0]?.trickySentenceExplanation).toContain('Kafka도 넓은 의미');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('메시지 큐');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('Kafka');
    expect(page?.learnerEvents).toHaveLength(2);
    expect(page?.learnerEvents[0]?.questionRevision).toContain('무손실');
    expect(page?.reviewItems).toHaveLength(2);
  });

  it('loads the eleventh system design reading batch with message queue worker scaling feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-p36-message-queue-worker-scaling',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('서비스 또는 서버 간 결합이 느슨해져서');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('메시지 큐');
    expect(page?.segmentCards).toHaveLength(2);
    expect(page?.segmentCards[0]?.trickySentenceExplanation).toContain('Zustand 비유');
    expect(page?.segmentCards[1]?.devNote).toContain('화살표의 의미');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('느슨한 결합');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('queue depth');
    expect(page?.learnerEvents).toHaveLength(1);
    expect(page?.reviewItems).toHaveLength(1);
  });

  it('loads the twelfth system design reading batch with logs metrics automation feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-pp36-38-logs-metrics-automation',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('에러 로그를 모니터링하는 것은 중요하다');
    expect(page?.rawSource).toContain('호스트 단위 메트릭');
    expect(page?.rawSource).toContain('그림 1-19');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('로그, 메트릭 그리고 자동화');
    expect(page?.segmentCards).toHaveLength(4);
    expect(page?.segmentCards[0]?.trickySentenceExplanation).toContain('structured log');
    expect(page?.segmentCards[1]?.trickySentenceExplanation).toContain('GA4도 넓게 보면');
    expect(page?.segmentCards[3]?.trickySentenceExplanation).toContain('그림을 그냥 쓱 보는 습관');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('메트릭');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('observability');
    expect(page?.learnerEvents).toHaveLength(3);
    expect(page?.reviewItems).toHaveLength(3);
  });

  it('loads the thirteenth system design reading batch with database scaling intro feedback', async () => {
    const page = await getTrackPage(
      'career',
      'system-design-interview',
      'ch01-p38-database-scaling-intro',
    );

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain(
      '저장할 데이터가 많아지면 데이터베이스에 대한 부하도 증가한다',
    );
    expect(page?.rawSource).toContain('p38 하단에서 문장이 다음 페이지로 이어진다');
    expect(page?.chapterLabel).toBe('1장 사용자 수에 따른 규모 확장성');
    expect(page?.sectionLabel).toBe('데이터베이스의 규모 확장');
    expect(page?.segmentCards).toHaveLength(2);
    expect(page?.segmentCards[0]?.trickySentenceExplanation).toContain('데이터 양 자체가 늘면');
    expect(page?.segmentCards[1]?.trickySentenceExplanation).toContain(
      '물리적으로 무한대는 불가능',
    );
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('working set');
    expect(page?.glossaryTerms.map((term) => term.term)).toContain('connection pool');
    expect(page?.learnerEvents).toHaveLength(1);
    expect(page?.reviewItems).toHaveLength(1);
  });

  it('exposes segment cards and learner events for useform', async () => {
    const page = await getTrackPage('frontend', 'react-hook-form', 'useform');

    expect(page).not.toBeNull();
    expect(page?.rawSource).toContain('custom hook for managing forms with ease');
    expect(page?.segmentCards).toHaveLength(3);
    expect(page?.segmentCards[1]?.directTranslation).toContain('커스텀 훅');
    expect(page?.learnerEvents).toHaveLength(2);
    expect(page?.reviewItems).toHaveLength(2);
  });

  it('loads the full get-started page with the restored onboarding sections', async () => {
    const page = await getTrackPage('frontend', 'react-hook-form', 'get-started-full');

    expect(page).not.toBeNull();
    expect(page?.segmentCards.length).toBe(52);
    expect(
      page?.segmentCards.some((segment) =>
        segment.sourceText?.includes('React Web Video Tutorial'),
      ),
    ).toBe(true);
    expect(
      page?.segmentCards.some((segment) =>
        segment.sourceText?.includes('Integrating an existing form should be simple'),
      ),
    ).toBe(true);
    expect(
      page?.segmentCards.some((segment) =>
        segment.sourceText?.includes('import Select from "react-select"'),
      ),
    ).toBe(true);
    expect(
      page?.segmentCards.some((segment) =>
        segment.sourceText?.includes(
          "This library doesn't require you to rely on a state management library",
        ),
      ),
    ).toBe(true);
    expect(
      page?.segmentCards.some((segment) =>
        segment.sourceText?.includes(
          'You will get the same performance boost and enhancement in React Native',
        ),
      ),
    ).toBe(true);
  });

  it('resolves get-started section pages to the full page and matching heading anchor', async () => {
    const track = await getTrack('frontend', 'react-hook-form');
    const page = await getTrackPage('frontend', 'react-hook-form', 'gs-installation-example');

    if (!page) {
      throw new Error('gs-installation-example page is missing');
    }

    const target = resolvePageTarget(track, page);

    expect(target.pageSlug).toBe('get-started-full');
    expect(target.hash).toBe('get-started-full-seg-003');
    expect(target.relatedFullPage?.slug).toBe('get-started-full');
  });

  it('keeps independent full-page docs on their own route', async () => {
    const track = await getTrack('frontend', 'react-hook-form');
    const page = await getTrackPage('frontend', 'react-hook-form', 'useform');

    if (!page) {
      throw new Error('useform page is missing');
    }

    expect(findRelatedFullPage(track, page)).toBeNull();
    expect(resolvePageTarget(track, page)).toEqual({
      pageSlug: 'useform',
      hash: null,
      relatedFullPage: null,
    });
  });

  it('returns null when a section heading cannot be matched', async () => {
    const fullPage = await getTrackPage('frontend', 'react-hook-form', 'get-started-full');

    if (!fullPage) {
      throw new Error('get-started-full page is missing');
    }

    expect(
      findSectionHeadingIdForPage(fullPage, {
        sectionAnchor: '',
        title: '',
        canonicalUrl: '',
      }),
    ).toBeNull();

    expect(
      findSectionHeadingIdForPage(fullPage, {
        sectionAnchor: 'UnknownSection',
        title: 'Get Started - Unknown Section',
        canonicalUrl: 'https://react-hook-form.com/get-started#unknownsection',
      }),
    ).toBeNull();
  });

  it('returns null for missing resources', async () => {
    await expect(findTrack('frontend', 'missing-track')).resolves.toBeNull();
    await expect(findTrackPage('frontend', 'missing-track', 'useform')).resolves.toBeNull();
    await expect(findTrackPage('frontend', 'react-hook-form', 'missing-page')).resolves.toBeNull();
  });

  it('returns route params for track and page routes', async () => {
    const trackParams = await getTrackRouteParams();
    const pageParams = await getTrackPageRouteParams();
    const studyParams = await getTrackStudyRouteParams();
    const journalParams = await getTrackJournalRouteParams();

    expect(trackParams).toContainEqual({ categorySlug: 'frontend', trackSlug: 'react-hook-form' });
    expect(trackParams).toContainEqual({ categorySlug: 'career', trackSlug: 'interview' });
    expect(trackParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
    });
    expect(trackParams).toContainEqual({ categorySlug: 'notes', trackSlug: 'question-log' });
    expect(studyParams).toContainEqual({
      categorySlug: 'frontend',
      trackSlug: 'react-hook-form',
    });
    expect(studyParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
    });
    expect(studyParams).toContainEqual({
      categorySlug: 'notes',
      trackSlug: 'question-log',
    });
    expect(studyParams).not.toContainEqual({
      categorySlug: 'career',
      trackSlug: 'interview',
    });
    expect(journalParams).toContainEqual({
      categorySlug: 'frontend',
      trackSlug: 'react-hook-form',
    });
    expect(journalParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
    });
    expect(journalParams).toContainEqual({
      categorySlug: 'notes',
      trackSlug: 'question-log',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'frontend',
      trackSlug: 'react-hook-form',
      pageSlug: 'useform',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'frontend',
      trackSlug: 'react-hook-form',
      pageSlug: 'gs-installation-example',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'frontend',
      trackSlug: 'react-hook-form',
      pageSlug: 'get-started-full',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'frontend',
      trackSlug: 'react-hook-form',
      pageSlug: 'reset',
    });
    expect(
      pageParams.some(
        (param) => param.categorySlug === 'notes' && param.trackSlug === 'question-log',
      ),
    ).toBe(false);
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-pp14-15-intro-single-server',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-p16-request-clients-and-http',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-p17-database-split-and-database-choice',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-p18-nosql-and-scaling',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-pp19-21-load-balancer-and-db-replication',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-pp24-26-cache-and-cdn',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-pp27-29-cdn-operation',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-pp30-32-stateless-web-tier',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-pp33-35-data-center',
    });
    expect(pageParams).toContainEqual({
      categorySlug: 'career',
      trackSlug: 'system-design-interview',
      pageSlug: 'ch01-p35-message-queue-intro',
    });
  });

  it('resolves learner event targets for both page and study records', async () => {
    const track = await getTrack('frontend', 'react-hook-form');
    const pageEvent = track.learnerEvents.find((event) => event.id === 'rhf-event-001');
    const studyEvent = track.learnerEvents.find((event) => event.id === 'rhf-event-008');
    const runtimeEvent = track.learnerEvents.find((event) => event.id === 'rhf-event-009');

    if (!pageEvent || !studyEvent || !runtimeEvent) {
      throw new Error('expected learner events are missing');
    }

    expect(
      resolveLearnerEventTarget(track, 'frontend', 'react-hook-form', pageEvent),
    ).toMatchObject({
      href: '/categories/frontend/tracks/react-hook-form/pages/useform#useform-seg-002',
      scopeLabel: '공식 문서',
    });
    expect(
      resolveLearnerEventTarget(track, 'frontend', 'react-hook-form', studyEvent),
    ).toMatchObject({
      href: '/categories/frontend/tracks/react-hook-form/study#dom이-관리한다는-말의-정확한-뜻',
      scopeLabel: '스터디 가이드',
    });
    expect(
      resolveLearnerEventTarget(track, 'frontend', 'react-hook-form', runtimeEvent),
    ).toMatchObject({
      href: '/categories/frontend/tracks/react-hook-form/study#브라우저-프로세스부터-rhf-내부-저장소까지',
      scopeLabel: '스터디 가이드',
    });
    expect(getLearnerEventJournalHref('frontend', 'react-hook-form', studyEvent)).toBe(
      '/categories/frontend/tracks/react-hook-form/journal#event-rhf-event-008',
    );
    expect(getLearnerEventJournalHref('frontend', 'react-hook-form', runtimeEvent)).toBe(
      '/categories/frontend/tracks/react-hook-form/journal#event-rhf-event-009',
    );
  });

  it('resolves learner event targets for question log study records', async () => {
    const track = await getTrack('notes', 'question-log');
    const devtoolsEvent = track.learnerEvents.find((event) => event.id === 'question-log-001');
    const portalEvent = track.learnerEvents.find((event) => event.id === 'question-log-002');
    const nodeVersionEvent = track.learnerEvents.find((event) => event.id === 'question-log-003');

    if (!devtoolsEvent || !portalEvent || !nodeVersionEvent) {
      throw new Error('expected question log learner events are missing');
    }

    expect(resolveLearnerEventTarget(track, 'notes', 'question-log', devtoolsEvent)).toMatchObject({
      href: '/categories/notes/tracks/question-log/study#1-devtools가-열려-있을-때만-네트워크를-기록하는-이유',
      scopeLabel: '스터디 가이드',
    });
    expect(resolveLearnerEventTarget(track, 'notes', 'question-log', portalEvent)).toMatchObject({
      href: '/categories/notes/tracks/question-log/study#2-포털을-새로고침해야-새-배포가-보였던-이유',
      scopeLabel: '스터디 가이드',
    });
    expect(
      resolveLearnerEventTarget(track, 'notes', 'question-log', nodeVersionEvent),
    ).toMatchObject({
      href: '/categories/notes/tracks/question-log/study#3-react-프로젝트에서-node-버전을-관리하는-방법',
      scopeLabel: '스터디 가이드',
    });
    expect(getLearnerEventJournalHref('notes', 'question-log', devtoolsEvent)).toBe(
      '/categories/notes/tracks/question-log/journal#event-question-log-001',
    );
  });

  it('returns null for unknown category overview', async () => {
    await expect(getCategoryOverviewBySlug('unknown')).resolves.toBeNull();
  });
});
