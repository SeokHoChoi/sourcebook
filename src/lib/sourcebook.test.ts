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
  getTrack,
  getTrackPage,
  getTrackPageRouteParams,
  getTrackRouteParams,
  getTrackStudyRouteParams,
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

    expect(catalog.categories).toHaveLength(2);
    expect(categorySlugs).toEqual(['frontend', 'career']);
  });

  it('falls back to planned summary when a catalog track manifest is missing', async () => {
    await fs.rename(interviewTrackPath, interviewTrackBackupPath);

    try {
      const categories = await getCategoryOverviews();
      const trackParams = await getTrackRouteParams();
      const pageParams = await getTrackPageRouteParams();
      const career = categories.find((category) => category.slug === 'career');

      expect(trackParams).toContainEqual({ categorySlug: 'career', trackSlug: 'interview' });
      expect(career?.counts.totalTracks).toBe(2);
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

    expect(categories).toHaveLength(2);
    expect(frontend?.counts.totalTracks).toBe(3);
    expect(frontend?.counts.plannedTracks).toBe(2);
    expect(frontend?.counts.totalPages).toBe(35);
    expect(career?.counts.totalTracks).toBe(2);
    expect(career?.counts.totalPages).toBe(0);
  });

  it('loads the react-hook-form track with structure and overlays', async () => {
    const track = await getTrack('frontend', 'react-hook-form');

    expect(track.manifest.title).toBe('React Hook Form');
    expect(track.studyGuide).not.toBeNull();
    expect(track.studyGuide?.title).toBe('RHF 실전 학습 가이드');
    expect(track.studyGuide?.markdown).toContain('# React Hook Form 실전 학습 트랙');
    expect(track.counts.totalPages).toBe(35);
    expect(track.counts.capturedPages).toBe(6);
    expect(track.counts.structuredPages).toBe(6);
    expect(track.counts.overlayPages).toBe(6);
    expect(track.counts.pendingPages).toBe(29);
    expect(track.confusionPatterns[0]).toMatchObject({
      label: '반환 형태 개념 혼동',
      count: 2,
    });
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

    expect(trackParams).toContainEqual({ categorySlug: 'frontend', trackSlug: 'react-hook-form' });
    expect(trackParams).toContainEqual({ categorySlug: 'career', trackSlug: 'interview' });
    expect(studyParams).toContainEqual({
      categorySlug: 'frontend',
      trackSlug: 'react-hook-form',
    });
    expect(studyParams).not.toContainEqual({
      categorySlug: 'career',
      trackSlug: 'interview',
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
  });

  it('returns null for unknown category overview', async () => {
    await expect(getCategoryOverviewBySlug('unknown')).resolves.toBeNull();
  });
});
