import { ChevronRight, ExternalLink, FileText, FolderTree } from 'lucide-react';
import Link from 'next/link';

import type { LearningStage, PageType, TrackPageRecord, TrackRecord } from '@/lib/sourcebook';
import { resolvePageTarget } from '@/lib/sourcebook';
import { cn } from '@/lib/utils';

const learningStageLabels: Record<LearningStage, string> = {
  onboarding: 'Get Started',
  'core-api': '핵심 API',
  'control-context': '컨트롤과 컨텍스트',
  'dynamic-form': '동적 폼',
  'support-api': '보조 API',
  reference: '참조',
};

const pageTypeLabels: Record<PageType, string> = {
  'api-page': 'API',
  'section-page': '섹션',
};

const captureModeLabels = {
  excerpt: '발췌',
  verbatim: '원문 전체',
  pending: '미수집',
} as const;

type TrackSidebarProps = {
  categorySlug: string;
  trackSlug: string;
  track: TrackRecord;
  currentPageSlug?: string;
  currentView?: 'track' | 'page' | 'study' | 'journal';
  navigationMode?: 'full' | 'study';
};

type SidebarContentProps = TrackSidebarProps & {
  className?: string;
};

type SidebarPageGroup = {
  order: number;
  primaryPage: TrackPageRecord;
  sectionPages: TrackPageRecord[];
};

type SidebarBookSection = {
  order: number;
  title: string;
  pages: TrackPageRecord[];
  openQuestionCount: number;
};

type SidebarBookChapter = {
  order: number;
  title: string;
  sections: SidebarBookSection[];
  loadedPageCount: number;
  openQuestionCount: number;
};

function buildSidebarBookChapters(track: TrackRecord): SidebarBookChapter[] {
  const chapterBuckets = new Map<
    string,
    {
      order: number;
      sections: Map<
        string,
        {
          order: number;
          pages: TrackPageRecord[];
        }
      >;
    }
  >();

  for (const page of track.pages) {
    if (!page.chapterLabel && !page.sectionLabel) {
      continue;
    }

    if (page.captureMode === 'pending') {
      continue;
    }

    const chapterTitle = page.chapterLabel ?? '기타';
    const sectionTitle = page.sectionLabel ?? '미분류';
    const chapter = chapterBuckets.get(chapterTitle) ?? {
      order: page.readOrder,
      sections: new Map<string, { order: number; pages: TrackPageRecord[] }>(),
    };
    const section = chapter.sections.get(sectionTitle) ?? {
      order: page.readOrder,
      pages: [],
    };

    chapter.order = Math.min(chapter.order, page.readOrder);
    section.order = Math.min(section.order, page.readOrder);
    section.pages.push(page);
    chapter.sections.set(sectionTitle, section);
    chapterBuckets.set(chapterTitle, chapter);
  }

  return [...chapterBuckets.entries()]
    .map(([title, chapter]) => {
      const sections = [...chapter.sections.entries()]
        .map(([sectionTitle, section]) => {
          const pages = section.pages.sort((left, right) => left.readOrder - right.readOrder);
          const openQuestionCount = pages.reduce(
            (count, page) =>
              count + page.learnerEvents.filter((event) => event.status === 'open').length,
            0,
          );

          return {
            order: section.order,
            title: sectionTitle,
            pages,
            openQuestionCount,
          };
        })
        .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
      const loadedPageCount = sections.reduce((count, section) => count + section.pages.length, 0);
      const openQuestionCount = sections.reduce(
        (count, section) => count + section.openQuestionCount,
        0,
      );

      return {
        order: chapter.order,
        title,
        sections,
        loadedPageCount,
        openQuestionCount,
      };
    })
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));
}

function buildSidebarPageGroups(track: TrackRecord): Array<[string, SidebarPageGroup[]]> {
  const buckets = new Map<string, TrackPageRecord[]>();

  for (const page of track.pages) {
    const target = resolvePageTarget(track, page);

    if (target.relatedFullPage) {
      const list = buckets.get(target.relatedFullPage.slug) ?? [];
      list.push(page);
      buckets.set(target.relatedFullPage.slug, list);
    }
  }

  const groupsByStage = new Map<string, SidebarPageGroup[]>();

  for (const page of track.pages) {
    const target = resolvePageTarget(track, page);

    if (page.sourceScope === 'section' && target.relatedFullPage) {
      continue;
    }

    const stage = page.learningStage ?? 'reference';
    const sectionPages = (buckets.get(page.slug) ?? []).sort(
      (left, right) => left.readOrder - right.readOrder,
    );
    const order =
      sectionPages.length > 0
        ? Math.min(page.readOrder, ...sectionPages.map((entry) => entry.readOrder))
        : page.readOrder;

    const list = groupsByStage.get(stage) ?? [];
    list.push({
      order,
      primaryPage: page,
      sectionPages,
    });
    groupsByStage.set(stage, list);
  }

  return [...groupsByStage.entries()]
    .sort(([leftKey], [rightKey]) => {
      const order: LearningStage[] = [
        'onboarding',
        'core-api',
        'control-context',
        'dynamic-form',
        'support-api',
        'reference',
      ];

      return order.indexOf(leftKey as LearningStage) - order.indexOf(rightKey as LearningStage);
    })
    .map(([stage, groups]) => [
      stage,
      groups.sort(
        (left, right) =>
          left.order - right.order || left.primaryPage.title.localeCompare(right.primaryPage.title),
      ),
    ]);
}

function buildStudyQuickLinks(track: TrackRecord) {
  const hasBookHierarchy = track.pages.some((page) =>
    Boolean(page.chapterLabel ?? page.sectionLabel),
  );

  if (hasBookHierarchy) {
    return track.pages
      .filter((page) => page.captureMode !== 'pending')
      .sort((left, right) => left.readOrder - right.readOrder)
      .slice(0, 6);
  }

  const preferredOrder = ['get-started-full', 'useform', 'register', 'controller'];

  const preferredMatches = preferredOrder
    .map((slug) => track.pages.find((page) => page.slug === slug))
    .filter((page): page is TrackPageRecord => Boolean(page));

  if (preferredMatches.length > 0) {
    return preferredMatches;
  }

  const primaryPages: TrackPageRecord[] = [];
  const seenPrimarySlugs = new Set<string>();

  for (const page of track.pages) {
    const target = resolvePageTarget(track, page);

    if (seenPrimarySlugs.has(target.pageSlug)) {
      continue;
    }

    const primaryPage = track.pages.find((candidate) => candidate.slug === target.pageSlug);

    if (!primaryPage) {
      continue;
    }

    seenPrimarySlugs.add(primaryPage.slug);
    primaryPages.push(primaryPage);
  }

  return primaryPages.sort((left, right) => left.readOrder - right.readOrder).slice(0, 4);
}

function SidebarContent({
  categorySlug,
  trackSlug,
  track,
  currentPageSlug,
  currentView = 'page',
  navigationMode = 'full',
  className,
}: SidebarContentProps) {
  const groupedPages = buildSidebarPageGroups(track);
  const bookChapters = buildSidebarBookChapters(track);
  const studyQuickLinks = buildStudyQuickLinks(track);
  const isStudyNavigation = navigationMode === 'study';

  return (
    <div className={cn('space-y-8', className)}>
      <div className="space-y-3 border-b border-black/10 pb-6">
        <div className="flex flex-wrap gap-2 text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          <Link
            href="/"
            className="rounded-sm transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
          >
            Sourcebook
          </Link>
          <span>/</span>
          <Link
            href={`/categories/${categorySlug}`}
            className="rounded-sm transition-colors hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
          >
            {categorySlug}
          </Link>
        </div>
        <div className="space-y-2">
          <Link
            href={`/categories/${categorySlug}/tracks/${trackSlug}`}
            aria-current={currentView === 'track' ? 'page' : undefined}
            data-clickable="true"
            className={cn(
              'group flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px',
              currentView === 'track'
                ? 'border-slate-900 bg-slate-900 text-white shadow-[0_16px_32px_-22px_rgba(15,23,42,0.65)]'
                : 'border-black/8 bg-white text-slate-900 hover:-translate-y-px hover:border-black/15 hover:bg-white hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)]',
            )}
          >
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase opacity-70">
                트랙 개요
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight">{track.manifest.title}</p>
              <p className="mt-2 text-sm leading-6 opacity-80">{track.manifest.phase}</p>
            </div>
            <ChevronRight
              className={cn(
                'mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                currentView === 'track' ? 'text-white/70' : 'text-slate-400',
              )}
            />
          </Link>
          {track.studyGuide ? (
            <Link
              href={`/categories/${categorySlug}/tracks/${trackSlug}/study`}
              aria-current={currentView === 'study' ? 'page' : undefined}
              data-clickable="true"
              className={cn(
                'group flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px',
                currentView === 'study'
                  ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_16px_32px_-22px_rgba(4,120,87,0.42)]'
                  : 'border-black/8 bg-white text-slate-900 hover:-translate-y-px hover:border-black/15 hover:bg-white hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)]',
              )}
            >
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase opacity-70">
                  스터디
                </p>
                <p className="mt-2 text-lg font-semibold tracking-tight">
                  {track.studyGuide.title}
                </p>
                {currentView === 'study' ? (
                  <p className="mt-2 text-sm leading-6 opacity-80">
                    개념 정리, 실무 판단 기준, 근거 부록을 한 번에 보는 학습 전용 뷰
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 opacity-80">
                    개념과 판단 기준을 먼저 잡는 별도 학습 문서
                  </p>
                )}
              </div>
              <ChevronRight
                className={cn(
                  'mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                  currentView === 'study' ? 'text-white/70' : 'text-slate-400',
                )}
              />
            </Link>
          ) : null}
          <Link
            href={`/categories/${categorySlug}/tracks/${trackSlug}/journal`}
            aria-current={currentView === 'journal' ? 'page' : undefined}
            data-clickable="true"
            className={cn(
              'group flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px',
              currentView === 'journal'
                ? 'border-amber-700 bg-amber-700 text-white shadow-[0_16px_32px_-22px_rgba(180,83,9,0.42)]'
                : 'border-black/8 bg-white text-slate-900 hover:-translate-y-px hover:border-black/15 hover:bg-white hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)]',
            )}
          >
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold tracking-[0.18em] uppercase opacity-70">
                학습 기록
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight">막힌 지점 모아보기</p>
              <p className="mt-2 text-sm leading-6 opacity-80">
                질문, 이유, 정리, 정확한 원래 위치를 한 화면에서 다시 본다.
              </p>
            </div>
            <ChevronRight
              className={cn(
                'mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                currentView === 'journal' ? 'text-white/70' : 'text-slate-400',
              )}
            />
          </Link>
          <p className="text-sm leading-7 text-slate-600">{track.manifest.description}</p>
          {track.manifest.homepageUrl ? (
            <Link
              href={track.manifest.homepageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
            >
              공식 문서
              <ExternalLink className="size-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      {bookChapters.length > 0 ? (
        <nav className="space-y-4" aria-label={`${track.manifest.title} 책 위치 네비게이션`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                책 위치
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                지금 적재된 캡처를 장과 절 아래 파일처럼 묶었다.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-black/10 bg-white px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
              {bookChapters.reduce((count, chapter) => count + chapter.loadedPageCount, 0)}개
            </span>
          </div>

          <div className="space-y-2.5">
            {bookChapters.map((chapter, chapterIndex) => {
              const hasActivePage = chapter.sections.some((section) =>
                section.pages.some((page) => {
                  const target = resolvePageTarget(track, page);
                  return page.slug === currentPageSlug || target.pageSlug === currentPageSlug;
                }),
              );

              return (
                <details
                  key={chapter.title}
                  open={hasActivePage || chapterIndex === 0}
                  className="group/chapter rounded-2xl border border-black/8 bg-white/76 px-3 py-3"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 rounded-xl focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none">
                    <span className="flex min-w-0 items-start gap-2.5">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-slate-400 transition-transform group-open/chapter:rotate-90" />
                      <span className="min-w-0">
                        <span className="block text-sm leading-6 font-semibold text-slate-950">
                          {chapter.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                          절 {chapter.sections.length}개 · 배치 {chapter.loadedPageCount}개
                        </span>
                      </span>
                    </span>
                    <FolderTree className="mt-1 size-4 shrink-0 text-slate-300" />
                  </summary>

                  <div className="mt-3 space-y-3 border-l border-black/8 pl-3">
                    {chapter.sections.map((section) => (
                      <div key={`${chapter.title}-${section.title}`} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 px-1">
                          <p className="min-w-0 text-xs leading-5 font-semibold text-slate-600">
                            {section.title}
                          </p>
                          {section.openQuestionCount > 0 ? (
                            <span className="shrink-0 rounded-full border border-amber-500/18 bg-amber-500/10 px-2 py-0.5 text-[0.58rem] font-semibold tracking-[0.12em] text-amber-800 uppercase">
                              질문 {section.openQuestionCount}
                            </span>
                          ) : null}
                        </div>

                        <div className="space-y-1">
                          {section.pages.map((page) => {
                            const target = resolvePageTarget(track, page);
                            const href = `/categories/${categorySlug}/tracks/${trackSlug}/pages/${target.pageSlug}${
                              target.hash ? `#${target.hash}` : ''
                            }`;
                            const isActive =
                              page.slug === currentPageSlug || target.pageSlug === currentPageSlug;

                            return (
                              <Link
                                key={page.slug}
                                href={href}
                                aria-current={isActive ? 'page' : undefined}
                                data-clickable="true"
                                className={cn(
                                  'group/file flex items-start justify-between gap-2 rounded-xl border px-3 py-2.5 text-xs leading-5 transition-all focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px',
                                  isActive
                                    ? 'border-slate-900 bg-slate-900 text-white shadow-[0_14px_28px_-24px_rgba(15,23,42,0.7)]'
                                    : 'border-black/7 bg-white/75 text-slate-700 hover:-translate-y-px hover:border-black/15 hover:bg-white hover:text-slate-950',
                                )}
                              >
                                <span className="flex min-w-0 items-start gap-2">
                                  <FileText
                                    className={cn(
                                      'mt-0.5 size-3.5 shrink-0',
                                      isActive ? 'text-white/60' : 'text-slate-300',
                                    )}
                                  />
                                  <span className="min-w-0">
                                    <span className="block font-semibold">{page.title}</span>
                                    <span
                                      className={cn(
                                        'mt-0.5 block',
                                        isActive ? 'text-white/60' : 'text-slate-400',
                                      )}
                                    >
                                      {page.canonicalUrl}
                                    </span>
                                  </span>
                                </span>
                                <ChevronRight
                                  className={cn(
                                    'mt-0.5 size-3.5 shrink-0 transition-transform group-hover/file:translate-x-0.5',
                                    isActive ? 'text-white/60' : 'text-slate-300',
                                  )}
                                />
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })}
          </div>

          <p className="rounded-2xl border border-black/7 bg-white/55 px-3 py-3 text-xs leading-6 text-slate-500">
            전체 목차와 아직 미적재된 절은 트랙 개요의 읽을 문서 영역에서 관리한다.
          </p>
        </nav>
      ) : isStudyNavigation ? (
        <section className="space-y-3">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            현재 적재 배치
          </p>
          <div className="space-y-1.5">
            {studyQuickLinks.map((page) => {
              const target = resolvePageTarget(track, page);
              const href = `/categories/${categorySlug}/tracks/${trackSlug}/pages/${target.pageSlug}${
                target.hash ? `#${target.hash}` : ''
              }`;

              return (
                <Link
                  key={page.slug}
                  href={href}
                  data-clickable="true"
                  className="flex items-start justify-between gap-3 rounded-xl border border-black/8 bg-white/75 px-3 py-3 text-sm text-slate-700 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                >
                  <span className="min-w-0">
                    {page.chapterLabel || page.sectionLabel ? (
                      <span className="block text-[0.68rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                        {[page.chapterLabel, page.sectionLabel].filter(Boolean).join(' / ')}
                      </span>
                    ) : null}
                    <span className="mt-1 block">{page.title}</span>
                  </span>
                  <span className="shrink-0 text-[0.62rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    리더
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs leading-6 text-slate-500">
            스터디 화면에서는 책의 장과 절 흐름을 유지한 채, 지금 적재된 배치만 빠르게 왕복하는 쪽이
            덜 복잡하다.
          </p>
        </section>
      ) : null}

      {!isStudyNavigation && bookChapters.length === 0 ? (
        <nav className="space-y-7" aria-label={`${track.manifest.title} 문서 네비게이션`}>
          {groupedPages.map(([stage, pages]) => (
            <section key={stage} className="space-y-3">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                {learningStageLabels[stage as LearningStage]}
              </p>
              <div className="space-y-1.5">
                {pages.map((group) => {
                  const page = group.primaryPage;
                  const target = resolvePageTarget(track, page);
                  const href = `/categories/${categorySlug}/tracks/${trackSlug}/pages/${target.pageSlug}${
                    target.hash ? `#${target.hash}` : ''
                  }`;
                  const isActive =
                    page.slug === currentPageSlug || target.pageSlug === currentPageSlug;

                  return (
                    <div key={page.slug} className="space-y-2">
                      <Link
                        href={href}
                        aria-current={isActive ? 'page' : undefined}
                        data-clickable="true"
                        className={cn(
                          'group flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 transition-all focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px',
                          isActive
                            ? 'border-slate-900 bg-slate-900 text-white shadow-[0_16px_32px_-22px_rgba(15,23,42,0.65)]'
                            : 'border-black/8 bg-white/70 text-slate-900 hover:-translate-y-px hover:border-black/15 hover:bg-white hover:shadow-[0_12px_24px_-20px_rgba(15,23,42,0.35)]',
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <p
                              className={cn(
                                'text-[0.68rem] font-semibold tracking-[0.16em] uppercase',
                                isActive ? 'text-white/65' : 'text-slate-400',
                              )}
                            >
                              {String(group.order).padStart(2, '0')}
                            </p>
                            <p
                              className={cn(
                                'text-[0.68rem] font-semibold tracking-[0.14em] uppercase',
                                isActive ? 'text-white/70' : 'text-slate-400',
                              )}
                            >
                              {page.pageType ? pageTypeLabels[page.pageType] : ''}
                            </p>
                          </div>
                          <p className="mt-2 text-sm leading-6 font-semibold">{page.title}</p>
                          <p
                            className={cn(
                              'mt-1 text-xs leading-5',
                              isActive ? 'text-white/70' : 'text-slate-500',
                            )}
                          >
                            {group.sectionPages.length > 0
                              ? `전문 + 목차 ${group.sectionPages.length}개`
                              : page.sectionAnchor
                                ? `#${page.sectionAnchor}`
                                : captureModeLabels[page.captureMode]}
                          </p>
                        </div>
                        <ChevronRight
                          className={cn(
                            'mt-1 size-4 shrink-0 transition-transform group-hover:translate-x-0.5',
                            isActive ? 'text-white/70' : 'text-slate-400',
                          )}
                        />
                      </Link>

                      {group.sectionPages.length > 0 ? (
                        <div className="space-y-1 pl-3">
                          {group.sectionPages.map((sectionPage) => {
                            const sectionTarget = resolvePageTarget(track, sectionPage);
                            const sectionHref = `/categories/${categorySlug}/tracks/${trackSlug}/pages/${sectionTarget.pageSlug}${
                              sectionTarget.hash ? `#${sectionTarget.hash}` : ''
                            }`;

                            return (
                              <Link
                                key={sectionPage.slug}
                                href={sectionHref}
                                data-clickable="true"
                                className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs leading-5 text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                              >
                                <span className="min-w-0">
                                  {sectionPage.title.replace(/^Get Started -\s*/, '')}
                                </span>
                                <span className="shrink-0 text-[0.62rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                  목차
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

export function TrackSidebar(props: TrackSidebarProps) {
  return (
    <>
      <div className="lg:hidden">
        <details className="group rounded-[1.5rem] border border-black/8 bg-white px-4 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl border border-black/8 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-colors hover:border-black/15 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px">
            <span>문서 탐색 열기</span>
            <ChevronRight className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
          </summary>
          <SidebarContent {...props} className="mt-5" />
        </details>
      </div>

      <aside className="hidden lg:block">
        <div className="lg:sticky lg:top-6 lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto lg:overscroll-contain lg:pr-2">
          <SidebarContent {...props} />
        </div>
      </aside>
    </>
  );
}
