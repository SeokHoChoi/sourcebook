import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EmptyState, TrackStatusBadge } from '@/components/sourcebook/ui';
import { getCategoryOverviewBySlug, getCategorySlugs } from '@/lib/sourcebook';

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const categorySlugs = await getCategorySlugs();
  return categorySlugs.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await getCategoryOverviewBySlug(categorySlug);

  if (!category) {
    return {};
  }

  return {
    title: category.title,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = await getCategoryOverviewBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-svh bg-[#f3eee4] text-slate-950">
      <div className="mx-auto max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0">
            <header className="border-b border-black/10 pb-6">
              <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                category / {category.slug}
              </p>
              <h1 className="font-heading mt-3 text-5xl font-semibold tracking-tight text-slate-950">
                {category.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
                {category.description}
              </p>
            </header>

            {category.tracks.length > 0 ? (
              <section className="mt-8">
                <div className="hidden grid-cols-[minmax(0,2fr)_120px_120px_120px_120px] gap-4 border-b border-black/10 pb-3 text-[0.68rem] font-semibold tracking-[0.18em] text-slate-400 uppercase lg:grid">
                  <span>트랙</span>
                  <span>문서</span>
                  <span>수집</span>
                  <span>복습</span>
                  <span>상태</span>
                </div>

                <div className="divide-y divide-black/8">
                  {category.tracks.map((track) => (
                    <Link
                      key={track.trackSlug}
                      href={`/categories/${track.categorySlug}/tracks/${track.trackSlug}`}
                      className="group block rounded-2xl px-1 py-5 transition-colors hover:bg-white/55 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                    >
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_120px_120px_120px_120px] lg:items-center">
                        <div className="min-w-0">
                          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                            {track.title}
                          </h2>
                          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                            {track.description || '예정된 트랙이다. 아직 수집된 콘텐츠가 없다.'}
                          </p>
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
                          <div className="col-span-2 flex items-center justify-between rounded-xl border border-black/8 bg-white/80 px-3 py-3 lg:col-span-1 lg:justify-start lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                            <p className="text-[0.64rem] font-semibold tracking-[0.16em] text-slate-400 uppercase lg:hidden">
                              상태
                            </p>
                            <TrackStatusBadge status={track.status} />
                          </div>
                        </div>

                        <ArrowRight className="hidden size-4 text-slate-400 transition-transform group-hover:translate-x-0.5 lg:block" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : (
              <section className="mt-8">
                <EmptyState
                  title="트랙이 없습니다"
                  description="이 카테고리에 트랙을 추가해야 읽기 워크스페이스가 만들어진다."
                />
              </section>
            )}
          </section>

          <aside className="space-y-6 xl:sticky xl:top-5 xl:h-fit">
            <section className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                카테고리 현황
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                <div className="flex items-center justify-between gap-4">
                  <span>트랙</span>
                  <strong>{category.counts.totalTracks}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>활성</span>
                  <strong>{category.counts.activeTracks}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>예정</span>
                  <strong>{category.counts.plannedTracks}</strong>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span>문서</span>
                  <strong>{category.counts.totalPages}</strong>
                </div>
              </div>
            </section>

            <section className="rounded-[1.6rem] border border-black/8 bg-white/80 p-5">
              <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                학습 상태
              </p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <p>원문 수집 {category.counts.capturedPages}</p>
                <p>복습 {category.counts.dueReviewItems}</p>
                <p>미해결 {category.counts.openConfusions}</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
