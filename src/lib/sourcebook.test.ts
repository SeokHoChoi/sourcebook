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
    expect(career?.counts.totalPages).toBe(1);
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

  it('loads the system design interview track with the seeded study guide and no page reader yet', async () => {
    const track = await getTrack('career', 'system-design-interview');

    expect(track.manifest.title).toBe('대규모 시스템 설계 기초');
    expect(track.studyGuide).not.toBeNull();
    expect(track.studyGuide?.title).toBe('대규모 시스템 설계 기초 스터디');
    expect(track.studyGuide?.markdown).toContain('# 대규모 시스템 설계 기초 스터디');
    expect(track.studyGuide?.markdown).toContain('1장 사용자 수에 따른 규모 확장성');
    expect(track.studyGuide?.markdown).toContain('15장 구글 드라이브 설계');
    expect(track.studyGuide?.markdown).toContain('1장 · 14~15p 도입과 단일 서버');
    expect(track.counts.totalPages).toBe(1);
    expect(track.counts.capturedPages).toBe(1);
    expect(track.counts.structuredPages).toBe(1);
    expect(track.counts.overlayPages).toBe(1);
    expect(track.counts.openConfusions).toBe(4);
    expect(track.learnerEvents).toHaveLength(4);
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
    expect(page?.segmentCards).toHaveLength(8);
    expect(page?.segmentCards[1]?.directTranslation).toContain('프론트엔드도 이 범위 밖이 아니다');
    expect(page?.segmentCards[7]?.sourceText).toContain('DNS는 보');
    expect(page?.learnerEvents).toHaveLength(4);
    expect(page?.reviewItems).toHaveLength(4);
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
