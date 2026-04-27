import { BookOpen, Clock3, Code2, ExternalLink, HelpCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InPageNav, type InPageNavItem } from '@/components/sourcebook/in-page-nav';
import { LearnerEventCard } from '@/components/sourcebook/learner-event-card';
import { StudyGuideFloatingNav } from '@/components/sourcebook/study-guide-floating-nav';
import { TrackSidebar } from '@/components/sourcebook/track-sidebar';
import { MetricTile, Panel } from '@/components/sourcebook/ui';
import { buttonVariants } from '@/components/ui/button';
import {
  findTrack,
  getLearnerEventJournalHref,
  getTrackStudyRouteParams,
  isStudyLearnerEvent,
  type LearnerEvent,
  resolveLearnerEventTarget,
  resolvePageTarget,
  type TrackPageRecord,
} from '@/lib/sourcebook';
import {
  parseBookTocMarkdown,
  type ParsedStudyGuideBookToc,
  parseStudyGuideMarkdown,
  splitMarkdownSections,
} from '@/lib/study-guide';
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

function buildStudyOutlineNavigation(
  headings: ReturnType<typeof parseStudyGuideMarkdown>['headings'],
  maxLevel: 2 | 3,
) {
  return headings
    .map((heading, index) => ({ heading, index }))
    .filter(({ heading, index }) => {
      if (index === 0 && heading.level === 1 && !heading.text.startsWith('PART ')) {
        return false;
      }

      return heading.level <= maxLevel;
    })
    .map(({ heading }) => ({
      id: `study-outline-${heading.id}`,
      label: heading.text,
      targetId: heading.id,
      depth: Math.max(0, heading.level - 1),
      badge: heading.level === 1 && heading.text.startsWith('PART ') ? 'part' : null,
    }));
}

function buildStudyReaderShortcut(
  categorySlug: string,
  trackSlug: string,
  track: NonNullable<Awaited<ReturnType<typeof findTrack>>>,
) {
  const preferredPage =
    track.pages
      .filter((page) => page.captureMode !== 'pending')
      .sort((left, right) => left.readOrder - right.readOrder)[0] ?? null;

  if (!preferredPage) {
    return null;
  }

  const target = resolvePageTarget(track, preferredPage);

  return {
    href: `/categories/${categorySlug}/tracks/${trackSlug}/pages/${target.pageSlug}${
      target.hash ? `#${target.hash}` : ''
    }`,
    label: target.relatedFullPage ? target.relatedFullPage.title : preferredPage.title,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderStudyLearnerEventNoticeHtml({
  createdAt,
  question,
  questionRevision,
  confusionReason,
  answerSummary,
  journalHref,
  status,
}: {
  createdAt: string;
  question: string;
  questionRevision: string | undefined;
  confusionReason: string;
  answerSummary: string;
  journalHref: string;
  status: string;
}) {
  const revisionHtml = questionRevision
    ? `<div class="mt-3 rounded-2xl border border-emerald-600/16 bg-emerald-50/70 px-4 py-3">
        <p class="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">질문 다듬기</p>
        <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-800">${escapeHtml(
          questionRevision,
        )}</p>
      </div>`
    : '';

  return `<aside class="mt-5 rounded-[1.35rem] border border-amber-300/45 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.94))] px-4 py-4 shadow-[0_16px_36px_-30px_rgba(180,83,9,0.4)]">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full border border-amber-300/55 bg-amber-100 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-amber-900 uppercase">여기서 실제로 막혔음</span>
        <span class="rounded-full border border-black/8 bg-white px-2.5 py-1 text-[0.68rem] tracking-[0.14em] text-slate-500 uppercase">${escapeHtml(
          status,
        )}</span>
      </div>
      <span class="text-[0.72rem] text-slate-500">${escapeHtml(createdAt)}</span>
    </div>
    <div class="mt-3 rounded-2xl border border-amber-500/18 bg-amber-50/70 px-4 py-3">
      <p class="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">질문 원문</p>
      <p class="mt-2 whitespace-pre-line text-sm leading-7 font-semibold text-slate-950">${escapeHtml(
        question,
      )}</p>
    </div>
    ${revisionHtml}
    <p class="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700"><strong class="font-semibold text-slate-900">막힌 이유:</strong> ${escapeHtml(
      confusionReason,
    )}</p>
    <p class="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700"><strong class="font-semibold text-slate-900">짧은 정리:</strong> ${escapeHtml(
      answerSummary,
    )}</p>
    <div class="mt-4 flex flex-wrap gap-3">
      <a href="${escapeHtml(
        journalHref,
      )}" class="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-slate-950 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px">학습 기록에서 크게 보기</a>
    </div>
  </aside>`;
}

function injectStudyLearnerEventNotices({
  categorySlug,
  html,
  studyLearnerEvents,
  trackSlug,
}: {
  categorySlug: string;
  html: string;
  studyLearnerEvents: LearnerEvent[];
  trackSlug: string;
}) {
  const groupedEvents = new Map<string, LearnerEvent[]>();

  for (const event of studyLearnerEvents) {
    const anchorId = event.targetAnchorId;

    if (!anchorId) {
      continue;
    }

    const current = groupedEvents.get(anchorId) ?? [];
    current.push(event);
    groupedEvents.set(anchorId, current);
  }

  let nextHtml = html;

  for (const [anchorId, events] of groupedEvents.entries()) {
    const noticesHtml = events
      .map((event) =>
        renderStudyLearnerEventNoticeHtml({
          createdAt: event.createdAt,
          question: event.question,
          questionRevision: event.questionRevision,
          confusionReason: event.confusionReason,
          answerSummary: event.answerSummary,
          journalHref: getLearnerEventJournalHref(categorySlug, trackSlug, event),
          status: event.status,
        }),
      )
      .join('');
    const headingRegex = new RegExp(
      `(<h[1-6]\\s+id="${escapeRegExp(anchorId)}"[^>]*>[\\s\\S]*?<\\/h[1-6]>)`,
    );

    nextHtml = nextHtml.replace(
      headingRegex,
      `$1<div class="study-guide-inline-events">${noticesHtml}</div>`,
    );
  }

  return nextHtml;
}

type ChapterNoteCard = {
  id: string;
  title: string;
  html: string;
};

type ChapterNoteSummary = {
  introHtml: string | null;
  noteCards: ChapterNoteCard[];
};

type TocSectionView = {
  title: string;
  pageLabel: string | null;
  tocAnchorId: string;
  contentAnchorId: string;
  targetId: string;
  pages: TrackPageRecord[];
  questionCount: number;
  openQuestionCount: number;
};

type TocChapterView = {
  title: string;
  pageLabel: string | null;
  tocAnchorId: string;
  contentAnchorId: string;
  targetId: string;
  sections: TocSectionView[];
  loadedBatchCount: number;
  loadedSectionCount: number;
  questionCount: number;
  openQuestionCount: number;
  introHtml: string | null;
  noteCards: ChapterNoteCard[];
};

function slugifyStudyAnchorPart(value: string): string {
  return (
    value
      .toLowerCase()
      .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
      .replaceAll(/^-+|-+$/g, '') || 'section'
  );
}

function buildStudyAnchorId(prefix: string, ...parts: string[]): string {
  return [prefix, ...parts.map((part) => slugifyStudyAnchorPart(part))].join('-');
}

function takeMarkdownBeforeHeading(markdown: string, headingLevel: number): string {
  const lines = markdown.replaceAll('\r\n', '\n').split('\n');
  const headingRegex = new RegExp(`^#{${headingLevel}}\\s+`);
  const boundaryIndex = lines.findIndex((line) => headingRegex.test(line.trim()));

  return (boundaryIndex === -1 ? lines : lines.slice(0, boundaryIndex)).join('\n').trim();
}

function buildChapterNoteMap(markdown: string): Map<string, ChapterNoteSummary> {
  const sections = splitMarkdownSections(markdown);
  const part3 = sections.find(
    (section) => section.level === 1 && section.text === 'PART 3. 장별 학습 포인트',
  );
  const chapterNoteMap = new Map<string, ChapterNoteSummary>();

  if (!part3) {
    return chapterNoteMap;
  }

  const chapterSections = splitMarkdownSections(part3.contentMarkdown).filter(
    (section) => section.level === 2,
  );

  for (const chapterSection of chapterSections) {
    const subsectionBlocks = splitMarkdownSections(chapterSection.contentMarkdown).filter(
      (section) => section.level === 3,
    );
    const introMarkdown = takeMarkdownBeforeHeading(chapterSection.contentMarkdown, 3);

    chapterNoteMap.set(chapterSection.text, {
      introHtml: introMarkdown ? parseStudyGuideMarkdown(introMarkdown).html : null,
      noteCards: subsectionBlocks.map((subsection) => ({
        id: buildStudyAnchorId('chapter-note', chapterSection.text, subsection.text),
        title: subsection.text,
        html: parseStudyGuideMarkdown(subsection.contentMarkdown).html,
      })),
    });
  }

  return chapterNoteMap;
}

function buildTocChapterViews(
  bookToc: ParsedStudyGuideBookToc,
  chapterNoteMap: Map<string, ChapterNoteSummary>,
  track: NonNullable<Awaited<ReturnType<typeof findTrack>>>,
) {
  return bookToc.chapters
    .map((chapter) => {
      const chapterPages = track.pages
        .filter((page) => page.chapterLabel === chapter.title)
        .sort((left, right) => left.readOrder - right.readOrder);
      const chapterNotes = chapterNoteMap.get(chapter.title);
      const sectionViews: TocSectionView[] = chapter.sections.map((section) => {
        const pages = chapterPages.filter((page) => page.sectionLabel === section.title);
        const questionCount = pages.reduce((count, page) => count + page.learnerEvents.length, 0);
        const openQuestionCount = pages.reduce(
          (count, page) =>
            count + page.learnerEvents.filter((event) => event.status === 'open').length,
          0,
        );
        const tocAnchorId = buildStudyAnchorId('toc-section', chapter.title, section.title);
        const contentAnchorId = buildStudyAnchorId('chapter-section', chapter.title, section.title);

        return {
          title: section.title,
          pageLabel: section.pageLabel,
          tocAnchorId,
          contentAnchorId,
          targetId: pages.length > 0 ? contentAnchorId : tocAnchorId,
          pages,
          questionCount,
          openQuestionCount,
        };
      });
      const loadedBatchCount = chapterPages.length;
      const loadedSectionCount = sectionViews.filter((section) => section.pages.length > 0).length;
      const questionCount = sectionViews.reduce(
        (count, section) => count + section.questionCount,
        0,
      );
      const openQuestionCount = sectionViews.reduce(
        (count, section) => count + section.openQuestionCount,
        0,
      );
      const tocAnchorId = buildStudyAnchorId('toc-chapter', chapter.title);
      const contentAnchorId = buildStudyAnchorId('chapter', chapter.title);

      return {
        title: chapter.title,
        pageLabel: chapter.pageLabel,
        tocAnchorId,
        contentAnchorId,
        targetId:
          loadedBatchCount > 0 ||
          chapterNotes?.introHtml ||
          (chapterNotes?.noteCards.length ?? 0) > 0
            ? contentAnchorId
            : tocAnchorId,
        sections: sectionViews,
        loadedBatchCount,
        loadedSectionCount,
        questionCount,
        openQuestionCount,
        introHtml: chapterNotes?.introHtml ?? null,
        noteCards: chapterNotes?.noteCards ?? [],
      };
    })
    .filter(
      (chapter) =>
        chapter.loadedBatchCount > 0 || Boolean(chapter.introHtml) || chapter.noteCards.length > 0,
    );
}

function buildBookTocNavigation(
  bookToc: ParsedStudyGuideBookToc,
  chapterViews: TocChapterView[],
): InPageNavItem[] {
  const chapterViewMap = new Map(chapterViews.map((chapter) => [chapter.title, chapter]));
  const items: InPageNavItem[] = [];

  if (bookToc.frontMatter.length > 0) {
    items.push({
      id: 'study-front-matter',
      label: '표지와 앞부분',
      targetId: 'study-front-matter',
      badge: `${bookToc.frontMatter.length}개`,
    });

    for (const entry of bookToc.frontMatter) {
      items.push({
        id: `study-front-matter-${entry.title}`,
        label: entry.title,
        targetId: buildStudyAnchorId('toc-front-matter', entry.title),
        badge: entry.pageLabel,
        depth: 1,
      });
    }
  }

  for (const chapter of bookToc.chapters) {
    const chapterView = chapterViewMap.get(chapter.title);

    items.push({
      id: `study-nav-${chapter.title}`,
      label: chapter.title,
      targetId: chapterView?.targetId ?? buildStudyAnchorId('toc-chapter', chapter.title),
      badge: chapter.pageLabel,
    });

    for (const section of chapter.sections) {
      const sectionView = chapterView?.sections.find(
        (candidate) => candidate.title === section.title,
      );

      items.push({
        id: `study-nav-${chapter.title}-${section.title}`,
        label: section.title,
        targetId:
          sectionView?.targetId ?? buildStudyAnchorId('toc-section', chapter.title, section.title),
        badge: section.pageLabel,
        depth: 1,
      });
    }
  }

  return items;
}

function renderTocRowStatus({
  loadedBatchCount,
  openQuestionCount,
}: {
  loadedBatchCount: number;
  openQuestionCount: number;
}) {
  if (loadedBatchCount === 0) {
    return (
      <span className="rounded-full border border-dashed border-black/10 bg-slate-50 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
        준비중
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-emerald-800 uppercase">
        적재 {loadedBatchCount}개
      </span>
      {openQuestionCount > 0 ? (
        <span className="rounded-full border border-amber-500/18 bg-amber-500/10 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-amber-800 uppercase">
          질문 {openQuestionCount}개
        </span>
      ) : null}
    </div>
  );
}

function TocDrivenStudyLayout({
  bookNavigation,
  bookToc,
  categorySlug,
  chapterViews,
  readerShortcut,
  studyGuideHtml,
  track,
  trackSlug,
}: {
  bookNavigation: InPageNavItem[];
  bookToc: ParsedStudyGuideBookToc;
  categorySlug: string;
  chapterViews: TocChapterView[];
  readerShortcut: ReturnType<typeof buildStudyReaderShortcut>;
  studyGuideHtml: string;
  track: NonNullable<Awaited<ReturnType<typeof findTrack>>>;
  trackSlug: string;
}) {
  const totalBatches = chapterViews.reduce((count, chapter) => count + chapter.loadedBatchCount, 0);
  const totalOpenQuestions = chapterViews.reduce(
    (count, chapter) => count + chapter.openQuestionCount,
    0,
  );

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
            <StudyGuideFloatingNav
              items={bookNavigation}
              title="책 차례"
              subtitle="네가 준 목차 그대로 장과 절을 고정했다. 적재된 절은 본문으로, 아직 안 온 절은 차례 위치로 이동한다."
              showOrdinal={false}
            />

            <header className="border-b border-black/10 pb-6">
              <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                study / {categorySlug}.{trackSlug}
              </p>
              <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-4xl">
                  <h1 className="font-heading text-5xl font-semibold tracking-tight text-slate-950">
                    {track.studyGuide?.title}
                  </h1>
                  <p className="mt-4 text-base leading-8 text-slate-700">
                    책 차례를 그대로 기준점으로 삼고, 지금까지 적재된 배치만 해당 장과 절 아래에
                    누적하는 전자책형 스터디 뷰다.
                  </p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                    지금은 1장이 열려 있고, `단일 서버` 절 아래에 14~16p 배치와 그때 실제로 막힌
                    질문이 붙어 있다. 앞으로도 새 캡처가 오면 같은 방식으로 목차 위치에 정확히
                    연결한다.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/categories/${categorySlug}/tracks/${trackSlug}/journal`}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'rounded-full border-black/10 bg-white/95',
                    )}
                  >
                    학습 기록
                  </Link>
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
                label="책 장수"
                value={String(bookToc.chapters.length)}
                detail="네가 준 전자책 차례를 그대로 고정해 둔 전체 장 수다."
              />
              <MetricTile
                label="적재된 장"
                value={String(chapterViews.length)}
                detail="현재는 1장만 열려 있고, 새 캡처가 오면 해당 장이 순서대로 열린다."
              />
              <MetricTile
                label="적재 배치"
                value={String(totalBatches)}
                detail="네가 `여기까지 읽고 보내보자`라고 보낸 실제 읽기 배치 수다."
              />
              <MetricTile
                label="열린 질문"
                value={String(totalOpenQuestions)}
                detail="막힌 이유와 바로잡은 정리를 목차 위치에 그대로 매단 질문 수다."
              />
            </section>

            <section className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <Panel
                eyebrow="읽는 순서"
                title="이제는 통문서가 아니라 장/절 기준으로 읽는다"
                description="현재 스터디 화면의 기준점은 마크다운 헤딩이 아니라 책 차례다."
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <BookOpen className="size-4 text-slate-500" />
                      차례 우선
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      오른쪽과 모바일 내비는 네가 준 책 차례와 정확히 같은 순서로만 움직인다.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Code2 className="size-4 text-slate-500" />
                      배치 누적
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      <code>1장 &gt; 단일 서버 &gt; 14~15p</code>,{' '}
                      <code>1장 &gt; 단일 서버 &gt; 16p</code>처럼 보낸 분량이 해당 절 아래에
                      누적된다.
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <HelpCircle className="size-4 text-slate-500" />
                      질문 분리
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      막힌 질문은 더 이상 한 덩어리로 두지 않고, 해당 장과 절, 배치 아래에 묶는다.
                    </p>
                  </div>
                </div>
              </Panel>

              <Panel
                eyebrow="최종 검토 기준"
                title="이번 화면에서 유지한 검증 원칙"
                description="OCR 다회 대조와 학습 메모 분리 원칙은 그대로 유지한다."
              >
                <ul className="space-y-3 text-sm leading-7 text-slate-600">
                  {track.studyGuide?.verificationNotes?.map((note) => (
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
                  ebook toc
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  책 차례를 그대로 고정한 탐색판
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  적재된 절은 바로 아래 워크스페이스로 연결되고, 아직 오지 않은 절은 차례 위치에
                  머물러 둔다. 이렇게 해야 지금 1장을 읽는 중이어도 전체 책 구조를 잃지 않는다.
                </p>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <article
                  id="study-front-matter"
                  className="scroll-mt-28 rounded-[1.5rem] border border-black/8 bg-[#fbfaf7] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        front matter
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                        표지와 앞부분
                      </h3>
                    </div>
                    <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                      {bookToc.frontMatter.length}개 항목
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {bookToc.frontMatter.map((entry) => {
                      const entryAnchorId = buildStudyAnchorId('toc-front-matter', entry.title);

                      return (
                        <div
                          key={entry.title}
                          id={entryAnchorId}
                          className="scroll-mt-28 rounded-2xl border border-black/7 bg-white px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-800">{entry.title}</p>
                            <span className="text-[0.72rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                              {entry.pageLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>

                {bookToc.chapters.map((chapter) => {
                  const chapterView = chapterViews.find(
                    (candidate) => candidate.title === chapter.title,
                  );
                  const chapterAnchorId = buildStudyAnchorId('toc-chapter', chapter.title);

                  return (
                    <article
                      key={chapter.title}
                      id={chapterAnchorId}
                      className="scroll-mt-28 rounded-[1.5rem] border border-black/8 bg-[#fbfaf7] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                            chapter
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                            {chapter.title}
                          </h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                            {chapter.pageLabel}
                          </span>
                          {renderTocRowStatus({
                            loadedBatchCount: chapterView?.loadedBatchCount ?? 0,
                            openQuestionCount: chapterView?.openQuestionCount ?? 0,
                          })}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {chapter.sections.map((section) => {
                          const sectionView = chapterView?.sections.find(
                            (candidate) => candidate.title === section.title,
                          );
                          const sectionAnchorId = buildStudyAnchorId(
                            'toc-section',
                            chapter.title,
                            section.title,
                          );
                          const sectionTargetId = sectionView?.targetId ?? sectionAnchorId;

                          return (
                            <div
                              key={`${chapter.title}-${section.title}`}
                              id={sectionAnchorId}
                              className="scroll-mt-28 rounded-2xl border border-black/7 bg-white"
                            >
                              <a
                                href={`#${sectionTargetId}`}
                                className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-800">
                                    {section.title}
                                  </p>
                                  {sectionView?.pages.length ? (
                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      현재 {sectionView.pages.length}개 배치가 이 절 아래에 붙어
                                      있다.
                                    </p>
                                  ) : null}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[0.72rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                                    {section.pageLabel}
                                  </span>
                                  {sectionView
                                    ? renderTocRowStatus({
                                        loadedBatchCount: sectionView.pages.length,
                                        openQuestionCount: sectionView.openQuestionCount,
                                      })
                                    : null}
                                </div>
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 space-y-6">
              <div className="border-b border-black/10 pb-4">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  chapter workspace
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                  현재 적재된 장
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  지금은 `1장 사용자 수에 따른 규모 확장성`만 열려 있다. 앞으로 다른 장 캡처가
                  들어오면 같은 패턴으로 장 카드가 추가된다.
                </p>
              </div>

              {chapterViews.map((chapter) => (
                <article
                  key={chapter.title}
                  id={chapter.contentAnchorId}
                  className="scroll-mt-28 rounded-[1.85rem] border border-black/6 bg-white/94 p-6 shadow-[0_18px_56px_-42px_rgba(15,23,42,0.24)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/8 pb-5">
                    <div className="min-w-0">
                      <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                        loaded chapter
                      </p>
                      <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                        {chapter.title}
                      </h3>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                        이 장은 현재 {chapter.loadedSectionCount}개 절, {chapter.loadedBatchCount}개
                        배치가 적재되어 있다. 질문은 해당 절 아래에 바로 매달아 다시 찾기 쉽게
                        정리한다.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {chapter.pageLabel ? (
                        <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                          시작 {chapter.pageLabel}
                        </span>
                      ) : null}
                      <span className="rounded-full border border-emerald-500/18 bg-emerald-500/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-emerald-800 uppercase">
                        배치 {chapter.loadedBatchCount}개
                      </span>
                      {chapter.openQuestionCount > 0 ? (
                        <span className="rounded-full border border-amber-500/18 bg-amber-500/10 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-amber-800 uppercase">
                          열린 질문 {chapter.openQuestionCount}개
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {chapter.introHtml ? (
                    <div
                      className="study-guide mt-6 rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-5"
                      dangerouslySetInnerHTML={{ __html: chapter.introHtml }}
                    />
                  ) : null}

                  <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    {chapter.sections.map((section) => (
                      <section
                        key={`${chapter.title}-${section.title}`}
                        id={section.contentAnchorId}
                        className={cn(
                          'scroll-mt-28 rounded-[1.45rem] border p-5',
                          section.pages.length > 0
                            ? 'border-emerald-700/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,253,244,0.9))]'
                            : 'border-dashed border-black/10 bg-slate-50/75',
                        )}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                              section
                            </p>
                            <h4 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                              {section.title}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {section.pageLabel ? (
                              <span className="rounded-full border border-black/8 bg-white px-3 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                {section.pageLabel}
                              </span>
                            ) : null}
                            {renderTocRowStatus({
                              loadedBatchCount: section.pages.length,
                              openQuestionCount: section.openQuestionCount,
                            })}
                          </div>
                        </div>

                        {section.pages.length > 0 ? (
                          <div className="mt-5 space-y-4">
                            {section.pages.map((page) => {
                              const target = resolvePageTarget(track, page);
                              const href = `/categories/${categorySlug}/tracks/${trackSlug}/pages/${target.pageSlug}${
                                target.hash ? `#${target.hash}` : ''
                              }`;

                              return (
                                <article
                                  key={page.slug}
                                  className="rounded-[1.25rem] border border-black/7 bg-white px-4 py-4 shadow-[0_16px_32px_-28px_rgba(15,23,42,0.26)]"
                                >
                                  <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                                        reading batch
                                      </p>
                                      <h5 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                                        {page.title}
                                      </h5>
                                      <p className="mt-2 text-sm leading-7 text-slate-600">
                                        {page.canonicalUrl}
                                      </p>
                                    </div>
                                    <Link
                                      href={href}
                                      className="inline-flex items-center rounded-full border border-black/10 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
                                    >
                                      리더로 이동
                                    </Link>
                                  </div>

                                  {page.learnerEvents.length > 0 ? (
                                    <div className="mt-4 space-y-3">
                                      {page.learnerEvents.map((event) => (
                                        <LearnerEventCard
                                          key={event.id}
                                          event={event}
                                          target={resolveLearnerEventTarget(
                                            track,
                                            categorySlug,
                                            trackSlug,
                                            event,
                                          )}
                                          className="bg-[#fbfaf7]"
                                        />
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="mt-4 rounded-2xl border border-dashed border-black/10 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
                                      아직 이 배치에 매달린 질문 기록은 없다. 다음에 막히는 포인트가
                                      오면 이 배치 아래에 바로 붙인다.
                                    </div>
                                  )}
                                </article>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="mt-5 rounded-2xl border border-dashed border-black/10 bg-white/75 px-4 py-4 text-sm leading-7 text-slate-600">
                            아직 이 절의 OCR 적재가 없다. 다음 캡처가 오면 이 자리 아래에 배치,
                            질문, 보강 설명이 함께 붙는다.
                          </div>
                        )}
                      </section>
                    ))}
                  </div>

                  {chapter.noteCards.length > 0 ? (
                    <section className="mt-6 border-t border-black/8 pt-6">
                      <div className="max-w-3xl">
                        <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                          correction notes
                        </p>
                        <h4 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                          이 장에서 실제로 바로잡은 오해
                        </h4>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          장 본문을 읽다가 실제로 막힌 포인트를 따로 분리해 둔 정리다. 절 카드와
                          질문 카드만 보면 빠르고, 여기까지 보면 왜 그 오해가 생겼는지까지 복원된다.
                        </p>
                      </div>

                      <div className="mt-5 grid gap-4 xl:grid-cols-2">
                        {chapter.noteCards.map((note) => (
                          <article
                            key={note.id}
                            id={note.id}
                            className="scroll-mt-28 rounded-[1.35rem] border border-black/8 bg-[#fbfaf7] p-5"
                          >
                            <h5 className="text-lg font-semibold tracking-tight text-slate-950">
                              {note.title}
                            </h5>
                            <div
                              className="study-guide mt-4"
                              dangerouslySetInnerHTML={{ __html: note.html }}
                            />
                          </article>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </article>
              ))}
            </section>

            <section className="mt-8">
              <details className="group rounded-[1.85rem] border border-black/6 bg-white/94 p-6 shadow-[0_18px_56px_-42px_rgba(15,23,42,0.24)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                      full study document
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                      전체 스터디 문서 펼치기
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      통문서가 필요할 때만 펼쳐서 본다. 기본 화면은 장/절 워크스페이스를 우선한다.
                    </p>
                  </div>
                  <span className="rounded-full border border-black/10 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white transition-colors group-open:bg-slate-800">
                    펼치기
                  </span>
                </summary>

                <article
                  className="study-guide mt-8 rounded-[1.35rem] border border-black/7 bg-[#fbfaf7] p-5"
                  dangerouslySetInnerHTML={{ __html: studyGuideHtml }}
                />
              </details>
            </section>
          </section>

          <aside className="mt-8 lg:col-span-2 xl:col-span-1 xl:mt-0">
            <div className="space-y-6 xl:sticky xl:top-6 xl:max-h-[calc(100svh-3rem)] xl:overflow-y-auto xl:overscroll-contain xl:pr-2">
              <section className="rounded-[1.5rem] border border-black/6 bg-white/94 p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.22)]">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  ebook toc
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  책 차례
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  책 목차와 정확히 같은 순서로 고정한 빠른 이동 영역이다. 적재된 절은 본문으로, 아직
                  안 온 절은 차례 위치로 이동한다.
                </p>
                <div className="mt-5 max-h-[min(64vh,760px)] overflow-auto pr-1">
                  <InPageNav
                    ariaLabel={`${track.studyGuide?.title} 책 차례`}
                    items={bookNavigation}
                    variant="compact"
                    showOrdinal={false}
                  />
                </div>

                <div className="mt-5 rounded-[1.1rem] border border-black/7 bg-[#fbfaf7] p-4 text-sm leading-7 text-slate-600">
                  <p>
                    지금은 1장만 열려 있다. 네가 다음 장을 보내면 같은 카드 구조가 늘어나고, 오른쪽
                    차례는 그대로 유지된다.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/categories/${categorySlug}/tracks/${trackSlug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
                    >
                      트랙 개요
                    </Link>
                    {readerShortcut ? (
                      <Link
                        href={readerShortcut.href}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
                      >
                        {readerShortcut.label}
                      </Link>
                    ) : null}
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

export default async function TrackStudyPage({ params }: TrackStudyPageProps) {
  const { categorySlug, trackSlug } = await params;
  const track = await findTrack(categorySlug, trackSlug);

  if (!track?.studyGuide) {
    notFound();
  }

  const parsedGuide = parseStudyGuideMarkdown(track.studyGuide.markdown);
  const bookToc = track.studyGuide.tocMarkdown
    ? parseBookTocMarkdown(track.studyGuide.tocMarkdown)
    : null;
  const chapterNoteMap = bookToc ? buildChapterNoteMap(track.studyGuide.markdown) : null;
  const chapterViews =
    bookToc && chapterNoteMap ? buildTocChapterViews(bookToc, chapterNoteMap, track) : [];
  const bookNavigation =
    bookToc && chapterViews.length > 0 ? buildBookTocNavigation(bookToc, chapterViews) : [];
  const partNavigation = buildPartNavigation(parsedGuide.headings);
  const outlineNavigation = buildStudyOutlineNavigation(parsedGuide.headings, 2);
  const floatingOutlineNavigation = buildStudyOutlineNavigation(parsedGuide.headings, 3);
  const studyLearnerEvents = track.learnerEvents.filter((event) => isStudyLearnerEvent(event));
  const readerShortcut = buildStudyReaderShortcut(categorySlug, trackSlug, track);
  const studyGuideHtml = injectStudyLearnerEventNotices({
    categorySlug,
    html: parsedGuide.html,
    studyLearnerEvents,
    trackSlug,
  });

  if (bookToc && chapterViews.length > 0) {
    return (
      <TocDrivenStudyLayout
        bookNavigation={bookNavigation}
        bookToc={bookToc}
        categorySlug={categorySlug}
        chapterViews={chapterViews}
        readerShortcut={readerShortcut}
        studyGuideHtml={studyGuideHtml}
        track={track}
        trackSlug={trackSlug}
      />
    );
  }

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
            <StudyGuideFloatingNav
              items={floatingOutlineNavigation}
              title={track.studyGuide.title}
            />

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
                    href={`/categories/${categorySlug}/tracks/${trackSlug}/journal`}
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'rounded-full border-black/10 bg-white/95',
                    )}
                  >
                    학습 기록
                  </Link>
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
                eyebrow="이 문서에서 막혔던 지점"
                title="스터디 본문에 직접 연결된 질문"
                description="mental model 단계에서 막힌 질문은 여기 모인다. 클릭하면 본문 정확한 위치로 바로 돌아간다."
              >
                {studyLearnerEvents.length > 0 ? (
                  <div className="space-y-4">
                    {studyLearnerEvents.map((event) => (
                      <LearnerEventCard
                        key={event.id}
                        event={event}
                        target={resolveLearnerEventTarget(track, categorySlug, trackSlug, event)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[1.35rem] border border-dashed border-black/10 bg-slate-100/70 px-5 py-4 text-sm leading-6 text-slate-600">
                    아직 스터디 본문에 연결된 질문 기록이 없다. 앞으로 막히는 지점은 중앙 학습
                    기록과 함께 여기에 누적한다.
                  </div>
                )}
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
                dangerouslySetInnerHTML={{ __html: studyGuideHtml }}
              />
            </section>
          </section>

          <aside className="mt-8 lg:col-span-2 xl:col-span-1 xl:mt-0">
            <div className="space-y-6 xl:sticky xl:top-6 xl:max-h-[calc(100svh-3rem)] xl:overflow-y-auto xl:overscroll-contain xl:pr-2">
              <section className="rounded-[1.5rem] border border-black/6 bg-white/94 p-5 shadow-[0_18px_48px_-40px_rgba(15,23,42,0.22)]">
                <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                  ebook toc
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  문서 목차
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  전자책처럼 따라다니는 빠른 이동 영역이다. 현재 문서의 큰 흐름과 주요 절을 바로
                  오갈 수 있다.
                </p>
                <div className="mt-5 max-h-[min(60vh,720px)] overflow-auto pr-1">
                  <InPageNav
                    ariaLabel={`${track.studyGuide.title} 문서 목차`}
                    items={outlineNavigation}
                    variant="compact"
                  />
                </div>
                {partNavigation.length > 0 ? (
                  <div className="mt-5 border-t border-black/8 pt-5">
                    <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                      part jump
                    </p>
                    <div className="mt-3">
                      <InPageNav
                        ariaLabel={`${track.studyGuide.title} PART 탐색`}
                        items={partNavigation}
                        variant="compact"
                      />
                    </div>
                  </div>
                ) : null}
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
                    {readerShortcut ? (
                      <Link
                        href={readerShortcut.href}
                        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
                      >
                        {readerShortcut.label}
                      </Link>
                    ) : null}
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
