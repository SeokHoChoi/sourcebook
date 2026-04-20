import { ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { EmptyState, TrackStatusBadge } from '@/components/sourcebook/ui';
import { getAppConfig } from '@/lib/app-config';
import { getCategoryOverviews } from '@/lib/sourcebook';

export default async function HomePage() {
  const { name } = getAppConfig();
  const categories = await getCategoryOverviews();
  const allTracks = categories.flatMap((category) => category.tracks);
  const activeTracks = allTracks.filter((track) => track.status === 'active');
  const totalPages = categories.reduce((acc, category) => acc + category.counts.totalPages, 0);
  const totalCaptured = categories.reduce(
    (acc, category) => acc + category.counts.capturedPages,
    0,
  );
  const totalDue = categories.reduce((acc, category) => acc + category.counts.dueReviewItems, 0);
  const totalConfusions = categories.reduce(
    (acc, category) => acc + category.counts.openConfusions,
    0,
  );

  return (
    <main className="min-h-svh bg-[#f3eee4] text-slate-950">
      <div className="mx-auto max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[220px_minmax(0,1fr)_280px]">
          <aside className="space-y-8 xl:sticky xl:top-5 xl:h-fit">
            <section className="border-b border-black/10 pb-6">
              <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-slate-400 uppercase">
                {name}
              </p>
              <h1 className="font-heading mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                문서 읽기 작업대
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                랜딩 카드가 아니라, 지금 읽을 트랙과 다음 이동 경로를 바로 고르는 작업 시작점.
              </p>
            </section>

            <section className="border-b border-black/10 pb-6">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                카테고리
              </p>
              <nav className="mt-4 space-y-1.5">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/categories/${category.slug}`}
                    className="group flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white/90 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                  >
                    <span>{category.title}</span>
                    <ChevronRight className="size-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </nav>
            </section>

            <section>
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                원칙
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>원문은 저장소 파일에 그대로 남긴다.</p>
                <p>직독직해와 용어 설명은 오버레이로 겹친다.</p>
                <p>공식 문서 질문만 learner history에 누적한다.</p>
              </div>
            </section>
          </aside>

          <section className="min-w-0">
            <header className="border-b border-black/10 pb-6">
              <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                active workspace
              </p>
              <h2 className="font-heading mt-3 text-5xl font-semibold tracking-tight text-slate-950">
                지금 열 수 있는 트랙
              </h2>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
                원문과 오버레이는 저장소 파일에 누적되고, 여기서는 트랙을 선택해 바로 읽기로
                들어간다.
              </p>
            </header>

            {activeTracks.length > 0 ? (
              <section className="mt-8">
                <div className="hidden grid-cols-[minmax(0,2.2fr)_110px_110px_110px_110px_110px] gap-4 border-b border-black/10 pb-3 text-[0.68rem] font-semibold tracking-[0.18em] text-slate-400 uppercase lg:grid">
                  <span>트랙</span>
                  <span>문서</span>
                  <span>수집</span>
                  <span>복습</span>
                  <span>미해결</span>
                  <span>상태</span>
                </div>

                <div className="divide-y divide-black/8">
                  {activeTracks.map((track) => (
                    <Link
                      key={`${track.categorySlug}-${track.trackSlug}`}
                      href={`/categories/${track.categorySlug}/tracks/${track.trackSlug}`}
                      className="group block rounded-2xl px-1 py-5 transition-colors hover:bg-white/55 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                    >
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,2.2fr)_110px_110px_110px_110px_110px] lg:items-center">
                        <div className="min-w-0">
                          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                            {track.categorySlug}
                          </p>
                          <div className="mt-2 flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                                {track.title}
                              </h3>
                              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                                {track.description}
                              </p>
                            </div>
                            <ArrowRight className="mt-1 size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 lg:hidden" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm lg:contents">
                          <div className="rounded-xl border border-black/8 bg-white/80 px-3 py-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                            <p className="text-[0.64rem] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">
                              문서
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700 lg:mt-0">
                              {track.counts.totalPages}
                            </p>
                          </div>
                          <div className="rounded-xl border border-black/8 bg-white/80 px-3 py-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                            <p className="text-[0.64rem] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">
                              수집
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700 lg:mt-0">
                              {track.counts.capturedPages}
                            </p>
                          </div>
                          <div className="rounded-xl border border-black/8 bg-white/80 px-3 py-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                            <p className="text-[0.64rem] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">
                              복습
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700 lg:mt-0">
                              {track.counts.dueReviewItems}
                            </p>
                          </div>
                          <div className="rounded-xl border border-black/8 bg-white/80 px-3 py-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                            <p className="text-[0.64rem] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">
                              미해결
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-700 lg:mt-0">
                              {track.counts.openConfusions}
                            </p>
                          </div>
                          <div className="col-span-2 flex items-center justify-between rounded-xl border border-black/8 bg-white/80 px-3 py-3 lg:col-span-1 lg:justify-start lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                            <p className="text-[0.64rem] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">
                              상태
                            </p>
                            <TrackStatusBadge status={track.status} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : (
              <section className="mt-8">
                <EmptyState
                  title="진행 중인 트랙이 없습니다"
                  description="catalog와 track manifest를 먼저 채워야 홈에서 바로 열 수 있다."
                />
              </section>
            )}

            <section className="mt-10 border-t border-black/10 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    quick entry
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                    바로 들어가기
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/categories/frontend/tracks/react-hook-form/study"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                  >
                    RHF 스터디 가이드
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/categories/frontend/tracks/react-hook-form/pages/get-started-full"
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                  >
                    Get Started 전문
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/categories/frontend/tracks/react-hook-form/pages/useform"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-black/20 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                  >
                    useForm 샘플
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </section>
          </section>

          <aside className="space-y-6 xl:sticky xl:top-5 xl:h-fit">
            <section className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                전체 현황
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <div className="flex items-center justify-between gap-4">
                  <span>문서</span>
                  <strong className="text-slate-950">{totalPages}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>수집</span>
                  <strong className="text-slate-950">{totalCaptured}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>복습</span>
                  <strong className="text-slate-950">{totalDue}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>미해결</span>
                  <strong className="text-slate-950">{totalConfusions}</strong>
                </div>
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                작업 흐름
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>1. 트랙을 고른다.</p>
                <p>2. 전문 페이지를 먼저 읽는다.</p>
                <p>3. 같은 페이지 안에서 직독직해와 코드 예시를 같이 본다.</p>
                <p>4. 헷갈린 질문만 learner history에 누적한다.</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
