import { ArrowRight, ExternalLink } from 'lucide-react';
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
} from '@/lib/sourcebook';
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
                      공식 문서와 별개로 읽는 RHF 스터디 뷰
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                      mental model, 실무 선택 기준, 비교표, 근거 부록을 한 번에 보는 학습 전용
                      문서다. 원문 전문을 읽기 전에 여기서 큰 그림을 먼저 잡고 내려가는 용도로
                      붙였다.
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
                  공식 문서가 한 페이지인 경우에는 전문을 먼저 보여주고, 내부 목차 섹션은 아래에
                  묶어서 보여준다.
                </p>
              </div>

              {pageGroups.length > 0 ? (
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
                                  ? '공식 사이트에서는 하나의 페이지이며, 아래 목차 섹션들을 같은 문맥에서 이어 읽는다.'
                                  : page.sectionAnchor
                                    ? `원문 기준 섹션 앵커: #${page.sectionAnchor}`
                                    : '전체 페이지 또는 독립 API 문서를 읽는 항목.'}
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
                    title="아직 문서가 없습니다"
                    description="이 트랙은 예정 상태로만 보이고, 실제 수집은 아직 시작되지 않았다."
                  />
                </div>
              )}
            </section>
          </section>

          <aside className="mt-8 space-y-6 lg:mt-0 xl:sticky xl:top-5 xl:h-fit">
            <section className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                진행 상태
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <div className="flex items-center justify-between gap-4">
                  <span>전체 문서</span>
                  <strong>{track.counts.totalPages}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>원문 수집</span>
                  <strong>{track.counts.capturedPages}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>구조화</span>
                  <strong>{track.counts.structuredPages}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>오버레이</span>
                  <strong>{track.counts.overlayPages}</strong>
                </div>
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                반복되는 막힘
              </p>
              {track.confusionPatterns.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {track.confusionPatterns.map((pattern) => (
                    <article
                      key={pattern.label}
                      className="border-b border-black/8 pb-4 last:border-b-0 last:pb-0"
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
                </div>
              ) : (
                <div className="mt-4">
                  <EmptyState
                    title="아직 패턴이 없습니다"
                    description="공식 문서 질문이 쌓이면 여기서 반복 이유를 다시 볼 수 있다."
                  />
                </div>
              )}
            </section>

            <section className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                수집 순서
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                {track.manifest.intakeFlow.map((step, index) => (
                  <li key={step}>
                    <span className="mr-2 text-slate-400">{index + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
