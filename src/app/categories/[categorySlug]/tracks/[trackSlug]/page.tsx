import { ArrowRight, ChevronRight, ExternalLink, FileText, FolderTree } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { TrackSidebar } from '@/components/sourcebook/track-sidebar';
import { EmptyState } from '@/components/sourcebook/ui';
import { buttonVariants } from '@/components/ui/button';
import {
  findTrack,
  getTrackRouteParams,
  type LearningStage,
  type PageType,
  resolvePageTarget,
  type TrackPageRecord,
  type TrackRecord,
} from '@/lib/sourcebook';
import { parseBookTocMarkdown } from '@/lib/study-guide';
import { cn } from '@/lib/utils';

type TrackPageProps = {
  params: Promise<{ categorySlug: string; trackSlug: string }>;
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

const learningStageLabels: Record<LearningStage, string> = {
  onboarding: 'Get Started',
  'core-api': '핵심 API',
  'control-context': '컨트롤과 컨텍스트',
  'dynamic-form': '동적 폼',
  'support-api': '보조 API',
  reference: '참조',
};

type PageGroup = {
  key: string;
  order: number;
  primaryPage: TrackPageRecord;
  sectionPages: TrackPageRecord[];
};

type TocExplorerSection = {
  title: string;
  pageLabel: string | null;
  pages: TrackPageRecord[];
  openQuestionCount: number;
};

type TocExplorerChapter = {
  title: string;
  pageLabel: string | null;
  sections: TocExplorerSection[];
  loadedBatchCount: number;
  loadedSectionCount: number;
  openQuestionCount: number;
};

type TocExplorer = {
  frontMatter: Array<{ title: string; pageLabel: string | null }>;
  chapters: TocExplorerChapter[];
};

function buildPageGroups(pages: TrackPageRecord[]): PageGroup[] {
  const sectionBuckets = new Map<string, TrackPageRecord[]>();

  for (const page of pages) {
    const target = resolvePageTarget({ pages }, page);

    if (target.relatedFullPage) {
      const bucket = sectionBuckets.get(target.relatedFullPage.slug) ?? [];
      bucket.push(page);
      sectionBuckets.set(target.relatedFullPage.slug, bucket);
    }
  }

  return pages
    .filter((page) => {
      if (page.sourceScope !== 'section') {
        return true;
      }

      const target = resolvePageTarget({ pages }, page);
      return target.relatedFullPage === null;
    })
    .map((page) => {
      const sectionPages = (sectionBuckets.get(page.slug) ?? []).sort(
        (left, right) => left.readOrder - right.readOrder,
      );
      const order =
        sectionPages.length > 0
          ? Math.min(page.readOrder, ...sectionPages.map((entry) => entry.readOrder))
          : page.readOrder;

      return {
        key: page.slug,
        order,
        primaryPage: page,
        sectionPages,
      };
    })
    .sort(
      (left, right) =>
        left.order - right.order || left.primaryPage.title.localeCompare(right.primaryPage.title),
    );
}

function buildTocExplorer(track: TrackRecord): TocExplorer | null {
  const tocMarkdown = track.studyGuide?.tocMarkdown;

  if (!tocMarkdown) {
    return null;
  }

  const toc = parseBookTocMarkdown(tocMarkdown);

  return {
    frontMatter: toc.frontMatter.map((entry) => ({
      title: entry.title,
      pageLabel: entry.pageLabel,
    })),
    chapters: toc.chapters.map((chapter) => {
      const chapterPages = track.pages
        .filter((page) => page.chapterLabel === chapter.title)
        .sort((left, right) => left.readOrder - right.readOrder);
      const sections = chapter.sections.map((section) => {
        const pages = chapterPages.filter((page) => page.sectionLabel === section.title);
        const openQuestionCount = pages.reduce(
          (count, page) =>
            count + page.learnerEvents.filter((event) => event.status === 'open').length,
          0,
        );

        return {
          title: section.title,
          pageLabel: section.pageLabel,
          pages,
          openQuestionCount,
        };
      });

      return {
        title: chapter.title,
        pageLabel: chapter.pageLabel,
        sections,
        loadedBatchCount: sections.reduce((count, section) => count + section.pages.length, 0),
        loadedSectionCount: sections.filter((section) => section.pages.length > 0).length,
        openQuestionCount: sections.reduce(
          (count, section) => count + section.openQuestionCount,
          0,
        ),
      };
    }),
  };
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getTrackRouteParams();
}

export async function generateMetadata({ params }: TrackPageProps): Promise<Metadata> {
  const { categorySlug, trackSlug } = await params;
  const track = await findTrack(categorySlug, trackSlug);

  if (!track) {
    return {};
  }

  return {
    title: track.manifest.title,
    description: track.manifest.description,
  };
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { categorySlug, trackSlug } = await params;
  const track = await findTrack(categorySlug, trackSlug);

  if (!track) {
    notFound();
  }

  const pageGroups = buildPageGroups(track.pages);
  const tocExplorer = buildTocExplorer(track);
  const firstLoadedChapterIndex =
    tocExplorer?.chapters.findIndex((chapter) => chapter.loadedBatchCount > 0) ?? -1;
  const pageEmptyState =
    track.manifest.status === 'planned'
      ? {
          title: '아직 문서가 없습니다',
          description: '이 트랙은 예정 상태로만 보이고, 실제 수집은 아직 시작되지 않았다.',
        }
      : track.studyGuide
        ? {
            title: '문서형 페이지는 아직 없습니다',
            description: '이 트랙은 문서 페이지 대신 스터디 문서와 질문 기록을 중심으로 쌓는다.',
          }
        : {
            title: '아직 문서가 없습니다',
            description: '이 트랙은 활성 상태지만 아직 읽을 문서를 추가하지 않았다.',
          };

  return (
    <main className="min-h-svh bg-[#f3eee4] text-slate-950">
      <div className="mx-auto max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="gap-8 lg:grid lg:grid-cols-[250px_minmax(0,1fr)_280px]">
          <TrackSidebar
            categorySlug={categorySlug}
            trackSlug={trackSlug}
            track={track}
            currentView="track"
          />

          <section className="mt-8 min-w-0 lg:mt-0">
            <header className="border-b border-black/10 pb-6">
              <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                track / {categorySlug}.{trackSlug}
              </p>
              <h1 className="font-heading mt-3 text-5xl font-semibold tracking-tight text-slate-950">
                {track.manifest.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
                {track.manifest.description}
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                {track.manifest.scope}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {track.studyGuide ? (
                  <Link
                    href={`/categories/${categorySlug}/tracks/${trackSlug}/study`}
                    className={cn(
                      buttonVariants({ variant: 'default' }),
                      'rounded-full bg-emerald-600 hover:bg-emerald-700',
                    )}
                  >
                    스터디 가이드
                    <ArrowRight className="size-4" />
                  </Link>
                ) : null}
                <Link
                  href={`/categories/${categorySlug}/tracks/${trackSlug}/journal`}
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'rounded-full border-black/10 bg-white',
                  )}
                >
                  학습 기록
                  <ArrowRight className="size-4" />
                </Link>
                {track.manifest.homepageUrl ? (
                  <Link
                    href={track.manifest.homepageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: 'default' }), 'rounded-full')}
                  >
                    공식 문서
                    <ExternalLink className="size-4" />
                  </Link>
                ) : null}
                {track.manifest.documentationRepoUrl ? (
                  <Link
                    href={track.manifest.documentationRepoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'rounded-full border-black/10 bg-white',
                    )}
                  >
                    문서 저장소
                    <ExternalLink className="size-4" />
                  </Link>
                ) : null}
              </div>
            </header>

            {track.studyGuide ? (
              <section className="mt-8 rounded-[2rem] border border-emerald-600/15 bg-white/82 p-6 shadow-[0_24px_80px_-48px_rgba(5,150,105,0.4)]">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                  <div>
                    <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-emerald-700 uppercase">
                      study section
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      {track.studyGuide.title}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                      {track.studyGuide.description}
                    </p>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                      원문 리더와 별개로, 개념 정리와 실무 판단 기준, 짧은 질문 아카이브를 한 번에
                      보는 학습 전용 문서다. 먼저 큰 그림을 잡고 필요할 때 세부 기록으로 다시
                      내려가는 흐름을 위해 붙였다.
                    </p>
                  </div>
                  <Link
                    href={`/categories/${categorySlug}/tracks/${trackSlug}/study`}
                    className={cn(
                      buttonVariants({ variant: 'default' }),
                      'rounded-full bg-slate-950 hover:bg-slate-800',
                    )}
                  >
                    스터디 시작
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </section>
            ) : null}

            <section className="mt-8">
              <div className="border-b border-black/10 pb-4">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  reading path
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  읽을 문서
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  책 차례가 있는 트랙은 파일 탐색기처럼 장과 절을 접고 펼칠 수 있게 보여준다. 적재된
                  배치는 해당 절 아래 파일처럼 붙고, 아직 안 온 절도 전체 구조 안에서 미리 보인다.
                </p>
              </div>

              {tocExplorer ? (
                <div className="mt-5 space-y-4">
                  {tocExplorer.frontMatter.length > 0 ? (
                    <details className="rounded-[1.7rem] border border-black/8 bg-white/78 px-5 py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <FolderTree className="size-4 shrink-0 text-slate-400" />
                          <div className="min-w-0">
                            <p className="text-lg font-semibold tracking-tight text-slate-950">
                              앞부분
                            </p>
                            <p className="text-sm leading-6 text-slate-600">
                              표지, 차례, 옮긴이의 글, 지은이의 글
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                          {tocExplorer.frontMatter.length}개
                        </span>
                      </summary>

                      <div className="mt-4 space-y-2 border-l border-black/8 pl-4">
                        {tocExplorer.frontMatter.map((entry) => (
                          <div
                            key={entry.title}
                            className="flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-white px-3 py-3 text-sm text-slate-700"
                          >
                            <span className="min-w-0">{entry.title}</span>
                            <span className="shrink-0 text-[0.66rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                              {entry.pageLabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : null}

                  {tocExplorer.chapters.map((chapter, chapterIndex) => (
                    <details
                      key={chapter.title}
                      open={chapterIndex === firstLoadedChapterIndex}
                      className="group rounded-[1.7rem] border border-black/8 bg-white/78 px-5 py-4"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <ChevronRight className="mt-1 size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-90" />
                          <div className="min-w-0">
                            <p className="text-xl font-semibold tracking-tight text-slate-950">
                              {chapter.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              절 {chapter.sections.length}개 중 {chapter.loadedSectionCount}개 절에
                              실제 배치가 연결되어 있다.
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                          {chapter.pageLabel ? (
                            <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                              {chapter.pageLabel}
                            </span>
                          ) : null}
                          <span
                            className={cn(
                              'rounded-full border px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] uppercase',
                              chapter.loadedBatchCount > 0
                                ? 'border-emerald-500/18 bg-emerald-500/10 text-emerald-800'
                                : 'border-dashed border-black/10 bg-slate-50 text-slate-500',
                            )}
                          >
                            {chapter.loadedBatchCount > 0
                              ? `적재 ${chapter.loadedBatchCount}개`
                              : '미적재'}
                          </span>
                          {chapter.openQuestionCount > 0 ? (
                            <span className="rounded-full border border-amber-500/18 bg-amber-500/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-amber-800 uppercase">
                              질문 {chapter.openQuestionCount}개
                            </span>
                          ) : null}
                        </div>
                      </summary>

                      <div className="mt-4 space-y-3 border-l border-black/8 pl-4">
                        {chapter.sections.map((section) => {
                          if (section.pages.length === 0) {
                            return (
                              <div
                                key={`${chapter.title}-${section.title}`}
                                className="rounded-2xl border border-dashed border-black/10 bg-slate-50/70 px-4 py-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800">
                                      {section.title}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      아직 이 절 아래 적재된 읽기 배치가 없다.
                                    </p>
                                  </div>
                                  <div className="flex shrink-0 items-center gap-2">
                                    {section.pageLabel ? (
                                      <span className="text-[0.66rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                        {section.pageLabel}
                                      </span>
                                    ) : null}
                                    <span className="rounded-full border border-dashed border-black/10 bg-white px-2.5 py-1 text-[0.66rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                      미적재
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <details
                              key={`${chapter.title}-${section.title}`}
                              open
                              className="group/section rounded-2xl border border-emerald-700/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,253,244,0.92))] px-4 py-3"
                            >
                              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                                <div className="flex min-w-0 items-start gap-3">
                                  <ChevronRight className="mt-1 size-4 shrink-0 text-slate-400 transition-transform group-open/section:rotate-90" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-900">
                                      {section.title}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                      이 절 아래 배치 {section.pages.length}개가 연결되어 있다.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                  {section.pageLabel ? (
                                    <span className="text-[0.66rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                      {section.pageLabel}
                                    </span>
                                  ) : null}
                                  {section.openQuestionCount > 0 ? (
                                    <span className="rounded-full border border-amber-500/18 bg-amber-500/10 px-2.5 py-1 text-[0.66rem] font-semibold tracking-[0.14em] text-amber-800 uppercase">
                                      질문 {section.openQuestionCount}
                                    </span>
                                  ) : null}
                                </div>
                              </summary>

                              <div className="mt-3 space-y-2 border-l border-emerald-700/12 pl-4">
                                {section.pages.map((page) => {
                                  const target = resolvePageTarget(track, page);
                                  const href = `/categories/${categorySlug}/tracks/${trackSlug}/pages/${target.pageSlug}${
                                    target.hash ? `#${target.hash}` : ''
                                  }`;

                                  return (
                                    <Link
                                      key={page.slug}
                                      href={href}
                                      className="group/file flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-white px-3 py-3 text-sm text-slate-700 transition-colors hover:border-black/15 hover:bg-slate-50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                                    >
                                      <span className="flex min-w-0 items-start gap-3">
                                        <FileText className="mt-0.5 size-4 shrink-0 text-slate-400" />
                                        <span className="min-w-0">
                                          <span className="block font-medium text-slate-900">
                                            {page.title}
                                          </span>
                                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                                            {page.canonicalUrl}
                                          </span>
                                        </span>
                                      </span>
                                      <div className="flex shrink-0 items-center gap-2">
                                        <span className="rounded-full border border-black/10 px-2.5 py-1 text-[0.66rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                          {captureModeLabels[page.captureMode]}
                                        </span>
                                        <ArrowRight className="size-4 text-slate-400 transition-transform group-hover/file:translate-x-0.5" />
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    </details>
                  ))}
                </div>
              ) : pageGroups.length > 0 ? (
                <div className="mt-4 divide-y divide-black/8">
                  {pageGroups.map((group) => {
                    const page = group.primaryPage;
                    const target = resolvePageTarget(track, page);
                    const href = `/categories/${categorySlug}/tracks/${trackSlug}/pages/${target.pageSlug}${
                      target.hash ? `#${target.hash}` : ''
                    }`;

                    return (
                      <article key={group.key} className="py-5">
                        <Link
                          href={href}
                          className="group block rounded-2xl px-1 transition-colors hover:bg-white/55 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                        >
                          <div className="grid gap-4 lg:grid-cols-[90px_minmax(0,1fr)_110px_120px] lg:items-start">
                            <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:block">
                              <span>{String(group.order).padStart(2, '0')}</span>
                              {page.learningStage ? (
                                <span className="ml-2 lg:mt-2 lg:ml-0 lg:block">
                                  {learningStageLabels[page.learningStage]}
                                </span>
                              ) : null}
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                                {page.title}
                              </h3>
                              <p className="mt-2 text-sm leading-7 text-slate-600">
                                {group.sectionPages.length > 0
                                  ? '원문은 하나의 페이지이며, 아래 하위 섹션들을 같은 문맥에서 이어 읽는다.'
                                  : page.sectionAnchor
                                    ? `원문 기준 섹션 앵커: #${page.sectionAnchor}`
                                    : '전체 페이지 또는 독립 읽기 항목.'}
                              </p>
                              <p className="mt-2 text-sm leading-7 text-slate-500">
                                {page.canonicalUrl}
                              </p>
                            </div>

                            <div className="rounded-xl border border-black/8 bg-white/80 px-3 py-3 text-sm text-slate-700 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                              <p className="text-[0.64rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                유형
                              </p>
                              <p className="mt-1 font-medium">
                                {page.pageType ? pageTypeLabels[page.pageType] : '문서'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-white/80 px-3 py-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                              <div>
                                <p className="text-[0.64rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                  상태
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-700">
                                  {captureModeLabels[page.captureMode]}
                                </p>
                              </div>
                              <ArrowRight className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </div>
                        </Link>

                        {group.sectionPages.length > 0 ? (
                          <div className="mt-4 space-y-2 border-l border-black/8 pl-4">
                            {group.sectionPages.map((sectionPage) => {
                              const sectionTarget = resolvePageTarget(track, sectionPage);
                              const sectionHref = `/categories/${categorySlug}/tracks/${trackSlug}/pages/${sectionTarget.pageSlug}${
                                sectionTarget.hash ? `#${sectionTarget.hash}` : ''
                              }`;

                              return (
                                <Link
                                  key={sectionPage.slug}
                                  href={sectionHref}
                                  className="flex items-center justify-between gap-3 rounded-xl border border-black/8 bg-white px-3 py-3 text-sm text-slate-700 transition-colors hover:border-black/15 hover:bg-slate-50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                                >
                                  <span className="min-w-0">
                                    {sectionPage.title.replace(/^Get Started -\s*/, '')}
                                  </span>
                                  <span className="shrink-0 rounded-full border border-black/10 px-2 py-0.5 text-[0.66rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                    목차
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title={pageEmptyState.title}
                    description={pageEmptyState.description}
                  />
                </div>
              )}
            </section>
          </section>

          <aside className="mt-8 lg:mt-0">
            <div className="space-y-4 xl:sticky xl:top-5 xl:max-h-[calc(100svh-2.5rem)] xl:overflow-y-auto xl:overscroll-contain xl:pr-2">
              <section className="rounded-[1.6rem] border border-black/8 bg-white/86 p-5 shadow-[0_18px_54px_-44px_rgba(15,23,42,0.32)]">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  진행 상태
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  현재 적재 현황
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm leading-6 text-slate-700">
                  {[
                    ['전체 문서', track.counts.totalPages],
                    ['원문 수집', track.counts.capturedPages],
                    ['구조화', track.counts.structuredPages],
                    ['오버레이', track.counts.overlayPages],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-black/7 bg-[#fbfaf7] px-3 py-3"
                    >
                      <p className="text-[0.64rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                        {label}
                      </p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <details className="group/rail rounded-[1.6rem] border border-black/8 bg-white/78 p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                      학습 기록
                    </span>
                    <span className="mt-2 block text-xl font-semibold tracking-tight text-slate-950">
                      막힌 지점 모아보기
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">
                      반복 질문은 필요할 때만 열어 확인한다.
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                      {track.confusionPatterns.length}개
                    </span>
                    <ChevronRight className="mt-1 size-4 text-slate-400 transition-transform group-open/rail:rotate-90" />
                  </span>
                </summary>

                {track.confusionPatterns.length > 0 ? (
                  <div className="mt-4 max-h-[38svh] space-y-3 overflow-y-auto overscroll-contain pr-1">
                    {track.confusionPatterns.map((pattern) => (
                      <article
                        key={pattern.label}
                        className="rounded-2xl border border-black/7 bg-[#fbfaf7] px-3 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-900">{pattern.label}</h3>
                          <span className="text-xs tracking-[0.16em] text-slate-400 uppercase">
                            {pattern.count}x
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {pattern.representativeQuestion}
                        </p>
                      </article>
                    ))}
                    <Link
                      href={`/categories/${categorySlug}/tracks/${trackSlug}/journal`}
                      className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-slate-950 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                    >
                      전체 학습 기록 보기
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4">
                    <EmptyState
                      title="아직 패턴이 없습니다"
                      description="질문 기록이 쌓이면 여기서 반복 이유를 다시 볼 수 있다."
                    />
                  </div>
                )}
              </details>

              <details className="group/rules rounded-[1.6rem] border border-black/8 bg-white/72 p-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                      운영 규칙
                    </span>
                    <span className="mt-2 block text-xl font-semibold tracking-tight text-slate-950">
                      캡처 수집 순서
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-slate-600">
                      OCR, 교차검증, 해설 반영 흐름을 접어 둔다.
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                      {track.manifest.intakeFlow.length}단계
                    </span>
                    <ChevronRight className="mt-1 size-4 text-slate-400 transition-transform group-open/rules:rotate-90" />
                  </span>
                </summary>
                <ol className="mt-4 max-h-[34svh] space-y-3 overflow-y-auto overscroll-contain pr-1 text-sm leading-7 text-slate-600">
                  {track.manifest.intakeFlow.map((step, index) => (
                    <li
                      key={step}
                      className="rounded-2xl border border-black/7 bg-[#fbfaf7] px-3 py-3"
                    >
                      <span className="mr-2 text-slate-400">{index + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </details>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
