import { ArrowRight, BookMarked, Brain, ExternalLink, NotebookPen } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LearnerEventCard } from '@/components/sourcebook/learner-event-card';
import { TrackSidebar } from '@/components/sourcebook/track-sidebar';
import { EmptyState, MetricTile, Panel } from '@/components/sourcebook/ui';
import { buttonVariants } from '@/components/ui/button';
import {
  findTrack,
  getTrackJournalRouteParams,
  isStudyLearnerEvent,
  resolveLearnerEventTarget,
} from '@/lib/sourcebook';
import { cn } from '@/lib/utils';

type TrackJournalPageProps = {
  params: Promise<{ categorySlug: string; trackSlug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getTrackJournalRouteParams();
}

export async function generateMetadata({ params }: TrackJournalPageProps): Promise<Metadata> {
  const { categorySlug, trackSlug } = await params;
  const track = await findTrack(categorySlug, trackSlug);

  if (!track) {
    return {};
  }

  return {
    title: `학습 기록 | ${track.manifest.title}`,
    description: `${track.manifest.title}에서 막혔던 지점을 한 번에 모아 보는 학습 기록`,
  };
}

export default async function TrackJournalPage({ params }: TrackJournalPageProps) {
  const { categorySlug, trackSlug } = await params;
  const track = await findTrack(categorySlug, trackSlug);

  if (!track) {
    notFound();
  }

  const orderedEvents = [...track.learnerEvents].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
  const activeEvents = orderedEvents.filter((event) => event.status !== 'resolved');
  const studyEvents = orderedEvents.filter((event) => isStudyLearnerEvent(event));
  const officialDocEvents = orderedEvents.filter((event) => !isStudyLearnerEvent(event));
  const focusEvents = activeEvents.slice(0, 3);
  const focusStudyEvents = studyEvents.filter((event) => event.status !== 'resolved');
  const focusOfficialDocEvents = officialDocEvents.filter((event) => event.status !== 'resolved');

  const journalEventId = (eventId: string) => `event-${eventId}`;
  const getPatternHref = (patternLabel: string) => {
    const matchedEvent =
      activeEvents.find((event) => event.patternLabel === patternLabel) ??
      orderedEvents.find((event) => event.patternLabel === patternLabel);

    return matchedEvent ? `#${journalEventId(matchedEvent.id)}` : null;
  };
  const getSourceSectionHref = (scope: 'study' | 'official') =>
    scope === 'study' ? '#source-study' : '#source-official';

  return (
    <main className="min-h-svh bg-[#f6f2ea] text-slate-950">
      <div className="mx-auto max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="gap-8 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)_18rem] xl:gap-10">
          <TrackSidebar
            categorySlug={categorySlug}
            trackSlug={trackSlug}
            track={track}
            currentView="journal"
          />

          <section className="mt-8 min-w-0 lg:mt-0">
            <header className="border-b border-black/10 pb-6">
              <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                learning journal / {categorySlug}.{trackSlug}
              </p>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-4xl">
                  <h1 className="font-heading text-5xl font-semibold tracking-tight text-slate-950">
                    학습 기록
                  </h1>
                  <p className="mt-4 text-base leading-8 text-slate-700">
                    막혔던 질문을 흩어놓지 않고, 질문 자체와 왜 막혔는지, 정리한 답, 원래 위치를 한
                    화면에서 다시 보는 곳이다.
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    여기서는 요약보다 질문 카드를 먼저 본다. 위쪽에서 질문을 고르고, 바로 아래
                    카드에서 왜 막혔는지 확인한 뒤, 원래 문서 위치로 다시 돌아가는 흐름으로 쓴다.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {track.studyGuide ? (
                    <Link
                      href={`/categories/${categorySlug}/tracks/${trackSlug}/study`}
                      className={cn(
                        buttonVariants({ variant: 'outline' }),
                        'rounded-full border-black/10 bg-white/95',
                      )}
                    >
                      스터디 가이드
                      <ArrowRight className="size-4" />
                    </Link>
                  ) : null}
                  <Link
                    href={`/categories/${categorySlug}/tracks/${trackSlug}`}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'rounded-full border-black/10 bg-white/95',
                    )}
                  >
                    트랙 개요
                  </Link>
                  {track.manifest.homepageUrl ? (
                    <Link
                      href={track.manifest.homepageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        buttonVariants({ variant: 'default' }),
                        'rounded-full bg-slate-950 text-white hover:bg-slate-800',
                      )}
                    >
                      공식 문서
                      <ExternalLink className="size-4" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </header>

            <section
              id="focus-now"
              className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]"
            >
              <Panel
                eyebrow="즉시 보기"
                title="지금 바로 다시 봐야 하는 질문"
                description="설명보다 질문 카드가 먼저 보여야 찾기 쉽다. 현재 열린 질문을 최상단에 고정했다."
              >
                {focusEvents.length > 0 ? (
                  <div className="space-y-4">
                    {focusEvents.map((event) => (
                      <LearnerEventCard
                        key={event.id}
                        className="border-amber-300/35 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))]"
                        event={event}
                        target={resolveLearnerEventTarget(track, categorySlug, trackSlug, event)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="지금 바로 다시 볼 질문이 없습니다"
                    description="열려 있는 질문이 생기면 이 위치에 가장 먼저 노출된다."
                  />
                )}
              </Panel>

              <Panel
                eyebrow="빠른 인덱스"
                title="질문에서 바로 뛰기"
                description="카드 전체를 다 스크롤하지 않고, 질문 문장만 훑고 바로 해당 카드로 이동한다."
              >
                {orderedEvents.length > 0 ? (
                  <div className="space-y-2">
                    {orderedEvents.map((event, index) => {
                      const target = resolveLearnerEventTarget(
                        track,
                        categorySlug,
                        trackSlug,
                        event,
                      );

                      return (
                        <Link
                          key={event.id}
                          href={`#${journalEventId(event.id)}`}
                          className="block rounded-[1.1rem] border border-black/8 bg-white px-4 py-3 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-[#fffdf8] focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                {String(index + 1).padStart(2, '0')} · {target.scopeLabel}
                              </p>
                              <p className="mt-1 text-sm leading-6 font-semibold text-slate-950">
                                {event.question}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {target.targetLabel}
                              </p>
                            </div>
                            <ArrowRight className="mt-1 size-4 shrink-0 text-slate-400" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="질문 인덱스가 비어 있습니다"
                    description="질문이 쌓이면 여기서 문장만 빠르게 훑고 원하는 카드로 이동한다."
                  />
                )}
              </Panel>
            </section>

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricTile
                label="전체 기록"
                value={String(orderedEvents.length)}
                detail="해결 여부와 상관없이 누적된 질문의 총개수다."
              />
              <MetricTile
                label="현재 막힘"
                value={String(activeEvents.length)}
                detail="아직 다시 봐야 하거나 복습 예정인 질문만 모은 수치다."
              />
              <MetricTile
                label="스터디 문서"
                value={String(studyEvents.length)}
                detail="공식 문서 이전의 mental model 단계에서 막힌 질문들이다."
              />
              <MetricTile
                label="공식 문서"
                value={String(officialDocEvents.length)}
                detail="실제 API 페이지나 원문 리더에서 생긴 질문들이다."
              />
            </section>

            <section className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <Panel
                eyebrow="기록 원칙"
                title="앞으로의 질문 기록은 이렇게 쌓는다"
                description="질문을 남길 때는 단순 요약보다 사고 흔적이 남아야 나중에 복습 가치가 생긴다."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <NotebookPen className="size-4 text-slate-500" />
                      질문
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      무엇이 헷갈렸는지 한 문장으로 적는다. ‘이게 뭐지’보다 ‘A와 B를 어떻게
                      구분하지?’ 가 더 좋다.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Brain className="size-4 text-slate-500" />
                      막힌 이유
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      번역 문제인지, 개념 경계 문제인지, 구현 경험 부족인지 원인을 따로 적어야
                      패턴이 보인다.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <BookMarked className="size-4 text-slate-500" />
                      정리
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      ‘정답’만 적지 말고 다시 볼 때 바로 이해될 정도로 구조를 분명히 적는다.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <ArrowRight className="size-4 text-slate-500" />
                      정확한 위치
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      반드시 원래 페이지와 앵커를 연결한다. 그래야 나중에 질문만이 아니라 맥락까지
                      되살아난다.
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel
                eyebrow="반복 패턴"
                title="지금 가장 자주 막히는 축"
                description="질문이 쌓일수록 개별 질문보다 반복 패턴을 보는 편이 더 중요해진다."
              >
                {track.confusionPatterns.length > 0 ? (
                  <div className="space-y-3">
                    {track.confusionPatterns.slice(0, 6).map((pattern) => (
                      <article
                        key={pattern.label}
                        className="rounded-[1.2rem] border border-black/8 bg-white px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-sm font-semibold text-slate-900">{pattern.label}</h2>
                          <span className="text-xs tracking-[0.16em] text-slate-400 uppercase">
                            {pattern.count}x
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {pattern.representativeQuestion}
                        </p>
                        {getPatternHref(pattern.label) ? (
                          <Link
                            href={getPatternHref(pattern.label) ?? '#focus-now'}
                            className="mt-3 inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-slate-950 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                          >
                            대표 막힘으로 이동
                          </Link>
                        ) : null}
                      </article>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="아직 패턴이 없습니다"
                    description="질문이 누적되면 여기서 반복되는 사고 마찰을 다시 묶어 본다."
                  />
                )}
              </Panel>
            </section>

            <section id="source-study" className="mt-8">
              <div className="border-b border-black/10 pb-4">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  study source
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  스터디 문서에서 막힌 질문
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  mental model이나 비교 기준을 읽다가 막힌 기록만 따로 모아 다시 본다.
                </p>
              </div>
              <div className="mt-4 space-y-4">
                {studyEvents.length > 0 ? (
                  studyEvents.map((event) => (
                    <LearnerEventCard
                      key={event.id}
                      articleId={journalEventId(event.id)}
                      event={event}
                      target={resolveLearnerEventTarget(track, categorySlug, trackSlug, event)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="스터디 문서 질문이 없습니다"
                    description="스터디 본문에서 막히는 지점이 생기면 이 섹션에 바로 누적된다."
                  />
                )}
              </div>
            </section>

            <section id="source-official" className="mt-8">
              <div className="border-b border-black/10 pb-4">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  official doc source
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  공식 문서 리더에서 막힌 질문
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  실제 API 설명, 예제, 원문 직독직해 과정에서 생긴 질문을 위치와 함께 다시 본다.
                </p>
              </div>
              <div className="mt-4 space-y-4">
                {officialDocEvents.length > 0 ? (
                  officialDocEvents.map((event) => (
                    <LearnerEventCard
                      key={event.id}
                      articleId={journalEventId(event.id)}
                      event={event}
                      target={resolveLearnerEventTarget(track, categorySlug, trackSlug, event)}
                    />
                  ))
                ) : (
                  <EmptyState
                    title="공식 문서 질문이 없습니다"
                    description="원문 리더에서 막히는 질문이 생기면 이 섹션에 바로 누적된다."
                  />
                )}
              </div>
            </section>
          </section>

          <aside className="mt-8 space-y-6 lg:col-span-2 xl:col-span-1 xl:mt-0">
            <div className="xl:sticky xl:top-6 xl:space-y-6">
              <section className="rounded-[1.5rem] border border-black/6 bg-white/94 p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.22)]">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  source split
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  질문이 나온 위치
                </h2>
                <div className="mt-5 space-y-3">
                  <Link
                    href={getSourceSectionHref('study')}
                    className="block rounded-[1.2rem] border border-black/8 bg-[#fbfaf7] px-4 py-4 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                  >
                    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                      스터디 가이드
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      {studyEvents.length}
                    </p>
                    {focusStudyEvents[0] ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {focusStudyEvents[0].question}
                      </p>
                    ) : null}
                  </Link>
                  <Link
                    href={getSourceSectionHref('official')}
                    className="block rounded-[1.2rem] border border-black/8 bg-[#fbfaf7] px-4 py-4 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                  >
                    <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                      공식 문서 리더
                    </p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      {officialDocEvents.length}
                    </p>
                    {focusOfficialDocEvents[0] ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {focusOfficialDocEvents[0].question}
                      </p>
                    ) : null}
                  </Link>
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-black/6 bg-white/94 p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.22)]">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  question jump
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  가장 최근 질문 바로 이동
                </h2>
                <div className="mt-4 space-y-2">
                  {orderedEvents.slice(0, 5).map((event) => (
                    <Link
                      key={event.id}
                      href={`#${journalEventId(event.id)}`}
                      className="block rounded-[1rem] border border-black/8 bg-[#fbfaf7] px-3 py-3 text-sm leading-6 text-slate-700 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                    >
                      {event.question}
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-[1.5rem] border border-black/6 bg-white/94 p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.22)]">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  workflow
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  권장 흐름
                </h2>
                <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                  <li>1. 질문이 생기면 이 화면 기준으로 질문, 이유, 정리를 남긴다.</li>
                  <li>2. 중앙에서 반복 패턴을 확인한다.</li>
                  <li>3. 정확한 위치로 돌아가 원문 문맥까지 다시 본다.</li>
                </ol>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
