import { ChevronRight, ExternalLink } from 'lucide-react';
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

      {isStudyNavigation ? (
        <section className="space-y-3">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            빠른 왕복
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
                  className="flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-white/75 px-3 py-3 text-sm text-slate-700 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-white hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                >
                  <span className="min-w-0">{page.title}</span>
                  <span className="shrink-0 text-[0.62rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    리더
                  </span>
                </Link>
              );
            })}
          </div>
          <p className="text-xs leading-6 text-slate-500">
            전체 원문 목록은 트랙 개요 화면에서 보고, 스터디 화면에서는 지금 막힌 지점만 바로
            왕복하는 쪽이 덜 복잡하다.
          </p>
        </section>
      ) : null}

      {!isStudyNavigation ? (
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
        <div className="lg:sticky lg:top-6">
          <SidebarContent {...props} />
        </div>
      </aside>
    </>
  );
}
