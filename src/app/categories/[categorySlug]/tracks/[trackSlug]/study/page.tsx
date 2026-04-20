import { BookOpen, Clock3, Code2, ExternalLink, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InPageNav } from '@/components/sourcebook/in-page-nav';
import { TrackSidebar } from '@/components/sourcebook/track-sidebar';
import { MetricTile, Panel } from '@/components/sourcebook/ui';
import { buttonVariants } from '@/components/ui/button';
import { findTrack, getTrackStudyRouteParams } from '@/lib/sourcebook';
import { parseStudyGuideMarkdown } from '@/lib/study-guide';
import { cn } from '@/lib/utils';

type TrackStudyPageProps = {
  params: Promise<{ categorySlug: string; trackSlug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getTrackStudyRouteParams();
}

export async function generateMetadata({ params }: TrackStudyPageProps): Promise<Metadata> {
  const { categorySlug, trackSlug } = await params;
  const track = await findTrack(categorySlug, trackSlug);

  if (!track?.studyGuide) {
    return {};
  }

  return {
    title: `${track.studyGuide.title} | ${track.manifest.title}`,
    description: track.studyGuide.description,
  };
}

function buildPartNavigation(headings: ReturnType<typeof parseStudyGuideMarkdown>['headings']) {
  const partIndexes = headings
    .map((heading, index) => ({ heading, index }))
    .filter(({ heading }) => heading.level === 1 && heading.text.startsWith('PART '));

  return partIndexes.map(({ heading, index }, itemIndex) => {
    const nextPart = partIndexes[itemIndex + 1];
    const sectionCount = headings
      .slice(index + 1, nextPart?.index ?? headings.length)
      .filter((candidate) => candidate.level === 2 && /^\d/.test(candidate.text)).length;

    return {
      id: `study-part-${heading.id}`,
      label: heading.text.replace(/^PART\s+/, 'PART '),
      targetId: heading.id,
      badge: sectionCount > 0 ? `${sectionCount}개 장` : null,
    };
  });
}

export default async function TrackStudyPage({ params }: TrackStudyPageProps) {
  const { categorySlug, trackSlug } = await params;
  const track = await findTrack(categorySlug, trackSlug);

  if (!track?.studyGuide) {
    notFound();
  }

  const parsedGuide = parseStudyGuideMarkdown(track.studyGuide.markdown);
  const partNavigation = buildPartNavigation(parsedGuide.headings);

  return (
    <main className="min-h-svh bg-[#f7f5ef] text-slate-950">
      <div className="mx-auto max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="gap-8 lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)] xl:grid-cols-[16.5rem_minmax(0,1fr)_18rem] xl:gap-10">
          <TrackSidebar
            categorySlug={categorySlug}
            trackSlug={trackSlug}
            track={track}
            currentView="study"
            navigationMode="study"
          />

          <section className="mt-8 min-w-0 lg:mt-0">
            <header className="border-b border-black/10 pb-6">
              <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                study / {categorySlug}.{trackSlug}
              </p>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-4xl">
                  <h1 className="font-heading text-5xl font-semibold tracking-tight text-slate-950">
                    {track.studyGuide.title}
                  </h1>
                  <p className="mt-4 text-base leading-8 text-slate-700">
                    {track.studyGuide.description}
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    공식 문서 원문 리더와 별개로, 개념 이해와 실전 판단을 빠르게 붙이기 위한 스터디
                    전용 문서다. 먼저 여기서 mental model을 잡고, 이어서 공식 문서 섹션 리더로
                    내려가면 학습 전환 비용이 줄어든다.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
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

            <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricTile
                label="PART"
                value={String(parsedGuide.stats.partCount)}
                detail="빠른 진입, 핵심 패턴, 실전 아키텍처, 고급 부록, 근거 부록"
              />
              <MetricTile
                label="코드 예시"
                value={String(parsedGuide.stats.codeBlockCount)}
                detail="최소 실행 예제와 실무 패턴 예제를 분리해 읽도록 구성했다."
              />
              <MetricTile
                label="회고 질문"
                value={String(parsedGuide.stats.reflectionPromptCount)}
                detail="self-explanation과 retrieval practice를 바로 돌릴 수 있게 배치했다."
              />
              <MetricTile
                label="예상 시간"
                value={`${parsedGuide.stats.readingTimeMinutes}분`}
                detail="한 번에 다 읽기보다 PART 단위로 나눠 읽는 것을 전제로 계산했다."
              />
            </section>

            <section className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <Panel
                eyebrow="학습 사용법"
                title="이 화면은 이렇게 쓰는 편이 가장 효율적이다"
                description="연구적으로도, 긴 텍스트를 무작정 처음부터 끝까지 읽기보다 목적에 따라 경로를 나눠 읽는 편이 더 낫다."
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <BookOpen className="size-4 text-slate-500" />
                      먼저 읽을 때
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      PART 1 전체와 PART 2에서 현재 막힌 장만 먼저 읽는다. 공식 문서 전문은 이후에
                      내려가서 확인한다.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Code2 className="size-4 text-slate-500" />
                      구현 직전에
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      비교표가 있는 장을 먼저 보고 A와 B의 선택 기준을 확인한 뒤, 예제를 그대로
                      붙이지 말고 현재 폼 구조에 맞게 바꿔 읽는다.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <HelpCircle className="size-4 text-slate-500" />
                      막히는 순간
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      자기 설명 질문과 회상 질문을 바로 말로 풀어본다. 설명이 막히면 그 지점만 공식
                      문서 리더로 내려가 원문을 다시 본다.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Clock3 className="size-4 text-slate-500" />
                      복습할 때
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      PART 4와 PART 5는 처음부터 외우지 않는다. 실제 구현 중 헷갈릴 때만 사전처럼
                      찾아보는 구조가 맞다.
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel
                eyebrow="최종 검토 기준"
                title="이번 최종본에 반영한 교차검증 포인트"
                description="시간 민감한 항목은 공식 소스 우선, 실무 혼동은 커뮤니티를 보조 근거로 사용했다."
              >
                <ul className="space-y-3 text-sm leading-7 text-slate-600">
                  {track.studyGuide.verificationNotes?.map((note) => (
                    <li
                      key={note}
                      className="rounded-[1.2rem] border border-black/8 bg-white px-4 py-3"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
              </Panel>
            </section>

            <section className="mt-8 rounded-[1.85rem] border border-black/6 bg-white/94 p-6 shadow-[0_18px_56px_-42px_rgba(15,23,42,0.24)]">
              <div className="border-b border-black/8 pb-5">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  study document
                </p>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  비교표, 코드, 근거 부록까지 포함한 전체 문서다. 프로젝트 안에서는 문서형으로 읽고,
                  구현이 필요할 때는 오른쪽 PART 점프와 상단 요약 카드로 왕복하면 된다.
                </p>
              </div>

              <article
                className="study-guide mt-8"
                dangerouslySetInnerHTML={{ __html: parsedGuide.html }}
              />
            </section>
          </section>

          <aside className="mt-8 space-y-6 lg:col-span-2 xl:col-span-1 xl:mt-0">
            <div className="xl:sticky xl:top-6 xl:space-y-6">
              <section className="rounded-[1.5rem] border border-black/6 bg-white/94 p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.22)]">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  part jump
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  큰 흐름부터 이동
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  세부 장 이동은 본문 목차를 쓰고, 여기서는 PART 단위로만 빠르게 점프한다.
                </p>
                <div className="mt-5 max-h-[min(60vh,720px)] overflow-auto pr-1">
                  <InPageNav
                    ariaLabel={`${track.studyGuide.title} PART 탐색`}
                    items={partNavigation}
                    variant="compact"
                  />
                </div>
                <div className="mt-5 rounded-[1.1rem] border border-black/7 bg-[#fbfaf7] p-4 text-sm leading-7 text-slate-600">
                  <p>
                    스터디 가이드에서 mental model을 잡고, 실제 API 세부 문장은 왼쪽의 빠른 왕복
                    링크나 아래 버튼으로 내려가 확인하면 된다.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/categories/${categorySlug}/tracks/${trackSlug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
                    >
                      트랙 개요
                    </Link>
                    <Link
                      href={`/categories/${categorySlug}/tracks/${trackSlug}/pages/get-started-full`}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
                    >
                      Get Started 전문
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
