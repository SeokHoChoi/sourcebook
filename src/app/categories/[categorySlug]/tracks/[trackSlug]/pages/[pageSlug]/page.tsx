import { ArrowRight, ArrowUpRight, ChevronRight, Link2 } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { InPageNav, type InPageNavItem } from '@/components/sourcebook/in-page-nav';
import { InlineLearnerEventNotice } from '@/components/sourcebook/inline-learner-event-notice';
import { LearnerEventCard } from '@/components/sourcebook/learner-event-card';
import {
  PageGlossaryRail,
  type PageGlossaryRailEntry,
} from '@/components/sourcebook/page-glossary-rail';
import { TrackSidebar } from '@/components/sourcebook/track-sidebar';
import { EmptyState } from '@/components/sourcebook/ui';
import { buttonVariants } from '@/components/ui/button';
import {
  findTrack,
  findTrackPage,
  getLearnerEventAnchorId,
  getLearnerEventJournalHref,
  getTrackPageRouteParams,
  type LearnerEvent,
  type OverlayGloss,
  type PageStructure,
  resolveLearnerEventTarget,
  resolvePageTarget,
  type SegmentCard,
} from '@/lib/sourcebook';
import { cn } from '@/lib/utils';

type TrackDocPageProps = {
  params: Promise<{ categorySlug: string; trackSlug: string; pageSlug: string }>;
};

type PageSection = {
  id: string;
  order: number;
  title: string;
  heading: SegmentCard | null;
  items: SegmentCard[];
  codeCount: number;
};

const reviewStatusLabels: Record<string, string> = {
  due: '오늘',
  scheduled: '예정',
  done: '완료',
};

const codeChromeTokens = new Set(['Copy', 'CodeSandbox', 'TS', 'JS', 'Expo', 'shadcn/ui']);
const codeKeywords = new Set([
  'as',
  'const',
  'default',
  'else',
  'enum',
  'export',
  'extends',
  'false',
  'from',
  'function',
  'if',
  'import',
  'interface',
  'null',
  'return',
  'true',
  'type',
  'undefined',
]);
const codeBuiltinTokens = new Set(['console']);
const codeAnnotationStopwords = new Set([
  'Copy',
  'CodeSandbox',
  'JS',
  'TS',
  'The',
  'This',
  'and',
  'are',
  'before',
  'field',
  'for',
  'hook',
  'input',
  'into',
  'invoke',
  'invoking',
  'of',
  'or',
  'required',
  'return',
  'the',
  'validation',
  'value',
  'will',
  'your',
]);

type CodeAnnotation = {
  lineIndex: number;
  text: string;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getTrackPageRouteParams();
}

export async function generateMetadata({ params }: TrackDocPageProps): Promise<Metadata> {
  const { categorySlug, trackSlug, pageSlug } = await params;
  const page = await findTrackPage(categorySlug, trackSlug, pageSlug);

  if (!page) {
    return {};
  }

  return {
    title: `${page.title} | Sourcebook`,
    description: `${page.title} 읽기 리더`,
  };
}

function normalizeDocToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function getRawLines(rawSource: string | null): string[] {
  return rawSource?.split(/\r?\n/) ?? [];
}

function getSectionTitle(segment: SegmentCard): string {
  const source = segment.sourceText ?? '';
  const firstLine = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstLine) {
    return segment.id;
  }

  return firstLine.replace(/^#+\s*/, '').trim() || segment.id;
}

function getBlocks(text: string | null): string[] {
  if (!text) {
    return [];
  }

  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

function getLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function getOutlineLabels(rawSource: string | null): string[] {
  const lines = getRawLines(rawSource).map((line) => line.trim());
  const menuStart = lines.findIndex((line) => line === 'Menu');
  const menuEnd = lines.findIndex(
    (line, index) => index > menuStart && line.toLowerCase() === 'ads via carbon',
  );

  if (menuStart < 0 || menuEnd <= menuStart) {
    return [];
  }

  return lines.slice(menuStart + 1, menuEnd).filter((line) => line && line !== '</>');
}

function buildPageSections(segments: SegmentCard[], outlineLabels: string[] = []): PageSection[] {
  const sections: PageSection[] = [];
  const outlineTokens = new Set(
    outlineLabels
      .map((label) => normalizeDocToken(label))
      .filter((token) => token.length > 0 && token !== 'quickstart'),
  );
  const useOutlineAsSectionBoundary = outlineTokens.size > 0;
  let currentSection: PageSection | null = null;

  for (const segment of segments) {
    if (segment.kind === 'heading') {
      const startsNewSection =
        !useOutlineAsSectionBoundary ||
        !currentSection ||
        outlineTokens.has(normalizeDocToken(getSectionTitle(segment)));

      if (startsNewSection) {
        currentSection = {
          id: segment.id,
          order: segment.order,
          title: getSectionTitle(segment),
          heading: segment,
          items: [],
          codeCount: 0,
        };
        sections.push(currentSection);
        continue;
      }

      if (!currentSection) {
        continue;
      }

      currentSection.items.push(segment);
      continue;
    }

    if (!currentSection) {
      currentSection = {
        id: segment.id,
        order: segment.order,
        title: 'Overview',
        heading: null,
        items: [],
        codeCount: 0,
      };
      sections.push(currentSection);
    }

    currentSection.items.push(segment);

    if (segment.kind === 'code') {
      currentSection.codeCount += 1;
    }
  }

  return sections;
}

function buildOutlineEntries(
  rawSource: string | null,
  pageSections: PageSection[],
): InPageNavItem[] {
  const outlineLabels = getOutlineLabels(rawSource);
  const sectionByToken = new Map(
    pageSections.map((section) => [normalizeDocToken(section.title), section] as const),
  );
  const entries: InPageNavItem[] = [];

  if (outlineLabels.length > 0) {
    for (const line of outlineLabels) {
      const token = normalizeDocToken(line);
      const matchedSection =
        token === 'quickstart' ? (pageSections[0] ?? null) : (sectionByToken.get(token) ?? null);

      entries.push({
        id: `outline-${entries.length + 1}`,
        label: line,
        targetId: matchedSection?.id ?? null,
        badge: matchedSection?.codeCount ? `${matchedSection.codeCount} code` : null,
      });
    }
  }

  if (entries.length > 0) {
    return entries;
  }

  return pageSections.map((section, index) => ({
    id: `outline-fallback-${index + 1}`,
    label: section.title,
    targetId: section.id,
    badge: section.codeCount ? `${section.codeCount} code` : null,
  }));
}

function buildCodeChromeMap(rawSource: string | null, structure: PageStructure | null) {
  const chromeBySegment = new Map<string, string[]>();

  if (!rawSource || !structure) {
    return chromeBySegment;
  }

  const rawLines = getRawLines(rawSource);

  for (const descriptor of structure.segments) {
    if (descriptor.kind !== 'code') {
      continue;
    }

    const tokens: string[] = [];
    let cursor = descriptor.source.startLine - 2;

    while (cursor >= 0) {
      const line = rawLines[cursor]?.trim() ?? '';

      if (!line) {
        break;
      }

      if (codeChromeTokens.has(line)) {
        tokens.unshift(line);
        cursor -= 1;
        continue;
      }

      break;
    }

    const uniqueTokens = [...new Set(tokens)];
    chromeBySegment.set(descriptor.id, uniqueTokens);
  }

  return chromeBySegment;
}

function collectPageGlosses(
  segments: SegmentCard[],
  glossaryTerms: { term: string; korean: string }[],
) {
  const glossary = new Map<string, OverlayGloss>();

  for (const segment of segments) {
    for (const gloss of segment.selectiveVocabGlosses) {
      glossary.set(`${gloss.term}-${gloss.korean}`, gloss);
    }
  }

  if (glossary.size === 0) {
    for (const term of glossaryTerms) {
      glossary.set(`${term.term}-${term.korean}`, {
        term: term.term,
        korean: term.korean,
        explanation: '',
      });
    }
  }

  return [...glossary.values()];
}

function buildGlossaryRailEntries({
  glossaryTerms,
  pageSlug,
  sections,
  segments,
}: {
  glossaryTerms: Array<{
    id: string;
    term: string;
    korean: string;
    explanation: string;
    pageRefs: { pageSlug: string; segmentIds: string[] }[];
  }>;
  pageSlug: string;
  sections: PageSection[];
  segments: SegmentCard[];
}): PageGlossaryRailEntry[] {
  const segmentToSectionId = new Map<string, string>();

  for (const section of sections) {
    if (section.heading) {
      segmentToSectionId.set(section.heading.id, section.id);
    }

    for (const item of section.items) {
      segmentToSectionId.set(item.id, section.id);
    }
  }

  const entryMap = new Map<
    string,
    {
      id: string;
      term: string;
      korean: string;
      explanation: string;
      segmentIds: Set<string>;
    }
  >();

  for (const term of glossaryTerms) {
    const key = `${term.term}-${term.korean}`;
    const current = entryMap.get(key) ?? {
      id: term.id,
      term: term.term,
      korean: term.korean,
      explanation: term.explanation,
      segmentIds: new Set<string>(),
    };

    for (const ref of term.pageRefs) {
      if (ref.pageSlug !== pageSlug) {
        continue;
      }

      for (const segmentId of ref.segmentIds) {
        current.segmentIds.add(segmentId);
      }
    }

    entryMap.set(key, current);
  }

  for (const segment of segments) {
    for (const gloss of segment.selectiveVocabGlosses) {
      const key = `${gloss.term}-${gloss.korean}`;
      const current = entryMap.get(key) ?? {
        id: key,
        term: gloss.term,
        korean: gloss.korean,
        explanation: gloss.explanation,
        segmentIds: new Set<string>(),
      };

      if (!current.explanation && gloss.explanation) {
        current.explanation = gloss.explanation;
      }

      current.segmentIds.add(segment.id);
      entryMap.set(key, current);
    }
  }

  return [...entryMap.values()]
    .map((entry) => {
      const segmentIds = [...entry.segmentIds];
      const sectionIds = [
        ...new Set(
          segmentIds
            .map((segmentId) => segmentToSectionId.get(segmentId))
            .filter((value): value is string => Boolean(value)),
        ),
      ];
      const targetId = segmentIds[0] ?? sectionIds[0] ?? null;

      return {
        id: entry.id,
        term: entry.term,
        korean: entry.korean,
        explanation: entry.explanation,
        targetId,
        sectionIds,
      };
    })
    .sort((left, right) => left.term.localeCompare(right.term));
}

function renderSourceParagraphs(text: string | null, language: 'ko' | 'en' = 'en') {
  const blocks = getBlocks(text);

  if (blocks.length === 0) {
    return <p className="text-base leading-8 text-slate-500">아직 원문이 연결되지 않았다.</p>;
  }

  return (
    <div className="mx-auto max-w-[64ch] space-y-4" lang={language}>
      {blocks.map((block, index) => (
        <p
          key={`${index}-${block.slice(0, 24)}`}
          className="font-reading text-[1.08rem] leading-[1.94] text-pretty whitespace-pre-wrap text-slate-950 md:text-[1.15rem]"
        >
          {block}
        </p>
      ))}
    </div>
  );
}

function renderSourceList(text: string | null, language: 'ko' | 'en' = 'en') {
  const blocks = getBlocks(text);

  if (blocks.length === 0) {
    return <p className="text-base leading-8 text-slate-500">아직 원문이 연결되지 않았다.</p>;
  }

  return (
    <div className="mx-auto max-w-[64ch] space-y-4" lang={language}>
      {blocks.map((block, index) => {
        const lines = getLines(block);

        if (lines.length > 1) {
          return (
            <ul
              key={`${index}-${lines[0]?.slice(0, 24) ?? 'list'}`}
              className="space-y-2 pl-5 text-[1.02rem] leading-[1.84] text-slate-950 marker:text-slate-400 md:text-[1.08rem]"
            >
              {lines.map((line, lineIndex) => (
                <li key={`${index}-${lineIndex}-${line}`}>{line}</li>
              ))}
            </ul>
          );
        }

        return (
          <p
            key={`${index}-${block.slice(0, 24)}`}
            className="font-reading text-[1.08rem] leading-[1.94] text-pretty whitespace-pre-wrap text-slate-950 md:text-[1.15rem]"
          >
            {lines[0]}
          </p>
        );
      })}
    </div>
  );
}

function containsHangul(text: string) {
  return /[가-힣]/.test(text);
}

function detectSourceLanguage(text: string | null): 'ko' | 'en' | 'unknown' {
  if (!text) {
    return 'unknown';
  }

  const hangulCount = (text.match(/[가-힣]/g) ?? []).length;
  const latinLetterCount = (text.match(/[A-Za-z]/g) ?? []).length;

  if (hangulCount === 0 && latinLetterCount === 0) {
    return 'unknown';
  }

  return hangulCount >= latinLetterCount ? 'ko' : 'en';
}

function getNarrativeLabels(text: string | null) {
  const language = detectSourceLanguage(text);

  if (language === 'ko') {
    return {
      language,
      sourceLabel: '원문 아카이브',
      supportLabel: '핵심 해설',
    } as const;
  }

  return {
    language: 'en' as const,
    sourceLabel: '영문 원문',
    supportLabel: '직독직해',
  };
}

function isExternalReference(value: string | null | undefined) {
  return /^https?:\/\//.test(value ?? '');
}

function isLikelyEnglishChunk(text: string) {
  if (containsHangul(text)) {
    return false;
  }

  const latinLetterCount = (text.match(/[A-Za-z]/g) ?? []).length;
  return latinLetterCount >= 3;
}

type TranslationRow =
  | {
      kind: 'paired-flow';
      sourceParts: string[];
      translationParts: string[];
    }
  | {
      kind: 'korean-steps';
      steps: string[];
      translation: string;
    }
  | {
      kind: 'translation';
      translation: string;
    };

function splitSlashParts(text: string) {
  const parts = text
    .split(' / ')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.filter((part, index) => index === 0 || part !== parts[index - 1]);
}

function endsSentence(text: string) {
  return /[.!?。:：]$/.test(text.trim());
}

function parseTranslationRows(text: string): TranslationRow[] {
  const rows: TranslationRow[] = [];
  let pendingSourceParts: string[] = [];
  let pendingTranslationParts: string[] = [];

  const flushPendingFlow = () => {
    if (pendingSourceParts.length === 0 && pendingTranslationParts.length === 0) {
      return;
    }

    rows.push({
      kind: 'paired-flow',
      sourceParts: pendingSourceParts,
      translationParts: pendingTranslationParts,
    });

    pendingSourceParts = [];
    pendingTranslationParts = [];
  };

  for (const line of text
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)) {
    const normalizedParts = splitSlashParts(line);

    if (normalizedParts.length <= 1) {
      flushPendingFlow();
      rows.push({
        kind: 'translation',
        translation: normalizedParts[0] ?? line,
      });
      continue;
    }

    const [firstPart, ...restParts] = normalizedParts;
    const lastPart = normalizedParts[normalizedParts.length - 1] ?? line;

    if (firstPart && restParts.length > 0 && isLikelyEnglishChunk(firstPart)) {
      pendingSourceParts.push(firstPart);
      pendingTranslationParts.push(restParts.join(' / '));

      if (endsSentence(firstPart) || endsSentence(lastPart)) {
        flushPendingFlow();
      }

      continue;
    }

    flushPendingFlow();
    rows.push({
      kind: 'korean-steps',
      steps: normalizedParts,
      translation: lastPart,
    });
  }

  flushPendingFlow();
  return rows;
}

function renderSlashFlow(parts: string[], keyPrefix: string, tone: 'english' | 'korean') {
  if (parts.length === 0) {
    return null;
  }

  return parts.map((part, index) => (
    <span key={`${keyPrefix}-${index}-${part}`} className="inline">
      {index > 0 ? (
        <span
          className={cn(
            'px-1.5 align-middle text-[0.86em] font-semibold',
            tone === 'english' ? 'text-slate-400' : 'text-amber-500/90',
          )}
        >
          /
        </span>
      ) : null}
      <span className={tone === 'english' ? 'text-slate-950' : 'text-amber-950'}>{part}</span>
    </span>
  ));
}

function renderChunkTranslation(text: string | null) {
  if (!text) {
    return <p className="text-sm leading-7 text-slate-500">직독직해가 아직 연결되지 않았다.</p>;
  }

  const rows = parseTranslationRows(text);

  return (
    <div className="mx-auto max-w-[64ch] overflow-hidden rounded-[1.2rem] border border-amber-200/85 bg-[#fffdf8]">
      <div className="divide-y divide-amber-200/75">
        {rows.map((row, index) => {
          const rowPreview =
            row.kind === 'paired-flow'
              ? row.translationParts.join(' / ')
              : row.kind === 'korean-steps'
                ? row.translation
                : row.translation;

          return (
            <article key={`${index}-${rowPreview.slice(0, 24)}`} className="px-4 py-4 md:px-5">
              {row.kind === 'paired-flow' ? (
                <div className="space-y-2.5">
                  <p
                    className="font-reading text-[1rem] leading-[1.84] text-pretty whitespace-pre-wrap text-slate-950 md:text-[1.04rem]"
                    lang="en"
                  >
                    {renderSlashFlow(row.sourceParts, `${index}-source`, 'english')}
                  </p>
                  <p
                    className="border-l-2 border-amber-200/85 pl-3 font-sans text-[0.96rem] leading-[1.78] text-pretty whitespace-pre-wrap text-amber-950 md:text-[1rem]"
                    lang="ko"
                  >
                    {renderSlashFlow(row.translationParts, `${index}-translation`, 'korean')}
                  </p>
                </div>
              ) : null}

              {row.kind === 'korean-steps' ? (
                <div className="space-y-2" lang="ko">
                  <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    직독 힌트
                  </p>
                  <p className="font-sans text-[0.95rem] leading-[1.72] whitespace-pre-wrap text-slate-900">
                    {renderSlashFlow(row.steps, `${index}-steps`, 'korean')}
                  </p>
                  <p className="font-sans text-[0.92rem] leading-[1.68] whitespace-pre-wrap text-amber-900/90">
                    {row.translation}
                  </p>
                </div>
              ) : null}

              {row.kind === 'translation' ? (
                <div className="space-y-2" lang="ko">
                  <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                    한줄 해석
                  </p>
                  <p className="font-sans text-[0.95rem] leading-[1.72] whitespace-pre-wrap text-slate-900 md:text-[0.98rem]">
                    {row.translation}
                  </p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function renderNoteParagraphs(text: string | null, tone: 'amber' | 'slate' = 'slate') {
  if (!text) {
    return null;
  }

  const toneClass =
    tone === 'amber'
      ? 'border-amber-200/80 bg-amber-50/80 text-amber-950'
      : 'border-slate-200/80 bg-slate-50/85 text-slate-800';

  return (
    <div className={cn('rounded-2xl border px-4 py-4', toneClass)} lang="ko">
      <p className="text-sm leading-7 whitespace-pre-wrap">{text}</p>
    </div>
  );
}

function SectionAnchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[0.68rem] font-semibold tracking-[0.16em] text-slate-500 uppercase transition-all hover:-translate-y-px hover:border-slate-950/20 hover:bg-slate-950 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
    >
      위치 링크
      <Link2 className="size-3.5" />
    </a>
  );
}

function RailDisclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group/details overflow-hidden rounded-[1.5rem] border border-black/8 bg-white"
    >
      <summary
        data-clickable="true"
        className="flex list-none items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
      >
        <span className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-500 uppercase">
          {title}
        </span>
        <ChevronRight className="size-4 shrink-0 text-slate-400 transition-transform group-open/details:rotate-90" />
      </summary>
      <div className="border-t border-black/6 px-4 py-4">{children}</div>
    </details>
  );
}

function GlossaryCluster({ glosses }: { glosses: OverlayGloss[] }) {
  if (glosses.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
        헷갈릴만한 단어와 용어
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {glosses.map((gloss) => (
          <article
            key={`${gloss.term}-${gloss.korean}`}
            className="rounded-2xl border border-black/8 bg-white px-4 py-4"
          >
            <p className="text-sm font-semibold text-slate-950">
              {gloss.term}{' '}
              <span className="text-xs font-medium text-slate-500">({gloss.korean})</span>
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{gloss.explanation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ThinkingPrompts({ segment }: { segment: SegmentCard }) {
  const prompts = [
    segment.recallQuestion
      ? { label: '핵심', text: segment.recallQuestion, tone: 'slate' as const }
      : null,
    segment.speakingTransferPrompt
      ? { label: '연결', text: segment.speakingTransferPrompt, tone: 'amber' as const }
      : null,
  ].filter((value): value is NonNullable<typeof value> => Boolean(value));

  if (prompts.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[1.2rem] border border-black/8 bg-slate-50/75 px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
          읽으면서 생각하기
        </p>
        <span className="rounded-full border border-black/8 bg-white px-2.5 py-1 text-[0.7rem] text-slate-500">
          핵심 파악 · 연결 · 질문하기
        </span>
      </div>
      <div className="mt-3 space-y-2.5">
        {prompts.map((prompt) => (
          <article
            key={`${prompt.label}-${prompt.text}`}
            className={cn(
              'rounded-2xl border px-3 py-3',
              prompt.tone === 'amber'
                ? 'border-amber-200/80 bg-amber-50/65'
                : 'border-black/8 bg-white/90',
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'mt-0.5 inline-flex shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] uppercase',
                  prompt.tone === 'amber'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-slate-100 text-slate-700',
                )}
              >
                {prompt.label}
              </span>
              <p className="text-sm leading-7 text-slate-800">{prompt.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NarrativeBlock({ segment, label }: { segment: SegmentCard; label: string }) {
  const narrativeLabels = getNarrativeLabels(segment.sourceText);
  const renderSource =
    segment.kind === 'list'
      ? (text: string | null) => renderSourceList(text, narrativeLabels.language)
      : (text: string | null) => renderSourceParagraphs(text, narrativeLabels.language);

  return (
    <section
      id={segment.id}
      className="scroll-mt-32 rounded-[1.7rem] border border-black/8 bg-white px-5 py-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          {label}
        </p>
        <SectionAnchor id={segment.id} />
      </div>

      <div className="mt-4 space-y-4">
        <section className="space-y-3">
          <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
            {narrativeLabels.sourceLabel}
          </p>
          <div className="rounded-[1.45rem] border border-black/8 bg-[#fffdfa] px-4 py-5 md:px-5">
            {renderSource(segment.sourceText)}
          </div>
        </section>

        {segment.directTranslation ? (
          <section className="space-y-3">
            <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-amber-800/70 uppercase">
              {narrativeLabels.supportLabel}
            </p>
            {renderChunkTranslation(segment.directTranslation)}
          </section>
        ) : null}

        <GlossaryCluster glosses={segment.selectiveVocabGlosses} />

        {segment.trickySentenceExplanation ? (
          <section className="space-y-2">
            <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              왜 헷갈리는지
            </p>
            {renderNoteParagraphs(segment.trickySentenceExplanation, 'amber')}
          </section>
        ) : null}

        {segment.devNote ? (
          <section className="space-y-2">
            <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              개발 설명
            </p>
            {renderNoteParagraphs(segment.devNote)}
          </section>
        ) : null}

        <ThinkingPrompts segment={segment} />
      </div>
    </section>
  );
}

function HeadingBlock({ segment }: { segment: SegmentCard }) {
  return (
    <section
      id={segment.id}
      className="scroll-mt-32 rounded-[1.7rem] border border-black/8 bg-[#fffdfa] px-5 py-5 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.28)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          소제목
        </p>
        <SectionAnchor id={segment.id} />
      </div>
      <h3 className="font-heading mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.9rem]">
        {getSectionTitle(segment)}
      </h3>
      {segment.directTranslation ? (
        <p className="mt-3 text-[1rem] leading-7 text-slate-600" lang="ko">
          {segment.directTranslation}
        </p>
      ) : null}
    </section>
  );
}

function collectCodeAnnotationTokens(note: string, code: string) {
  return [...new Set(note.match(/[A-Za-z][A-Za-z0-9_]*/g) ?? [])].filter(
    (token) => !codeAnnotationStopwords.has(token) && token.length >= 2 && code.includes(token),
  );
}

function normalizeAnnotationText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.。]+$/, '');
}

function extractCodeAnnotations(segment: SegmentCard): CodeAnnotation[] {
  const code = segment.sourceText ?? '';

  if (!code) {
    return [];
  }

  const codeLines = code.split('\n');
  const noteCandidates: Array<{ text: string; tokens: string[]; priority: number }> = [];
  const seenNotes = new Set<string>();

  const pushNote = (rawText: string, rawTokens: string[], priority: number) => {
    const text = normalizeAnnotationText(rawText);
    const tokens = [...new Set(rawTokens)].filter((token) => code.includes(token));

    if (!text || tokens.length === 0) {
      return;
    }

    const key = `${priority}-${tokens.join(',')}-${text}`;

    if (seenNotes.has(key)) {
      return;
    }

    seenNotes.add(key);
    noteCandidates.push({ text, tokens, priority });
  };

  if (segment.directTranslation) {
    for (const rawLine of segment.directTranslation.split('\n')) {
      const parts = rawLine
        .split(' / ')
        .map((part) => part.trim())
        .filter(Boolean);

      if (parts.length === 0) {
        continue;
      }

      const note = parts[parts.length - 1] ?? rawLine;
      const tokens = collectCodeAnnotationTokens(rawLine, code);
      pushNote(note, tokens, 1);
    }
  }

  for (const gloss of segment.selectiveVocabGlosses) {
    pushNote(`${gloss.term}: ${gloss.explanation}`, [gloss.term], 0);
  }

  noteCandidates.sort((left, right) => left.priority - right.priority);

  const annotations: CodeAnnotation[] = [];
  const notesPerLine = new Map<number, number>();

  for (const note of noteCandidates) {
    let bestLineIndex = -1;
    let bestScore = 0;

    for (const [lineIndex, line] of codeLines.entries()) {
      const trimmedLine = line.trim();

      if (
        trimmedLine.length === 0 ||
        trimmedLine.startsWith('//') ||
        trimmedLine.startsWith('/*') ||
        trimmedLine.startsWith('*') ||
        trimmedLine.startsWith('*/')
      ) {
        continue;
      }

      let score = 0;

      for (const token of note.tokens) {
        if (line.includes(`${token}(`)) {
          score += 6;
          continue;
        }

        if (
          line.includes(`:${token}`) ||
          line.includes(`<${token}`) ||
          line.includes(` ${token}`)
        ) {
          score += 4;
          continue;
        }

        if (line.includes(token)) {
          score += 2;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestLineIndex = lineIndex;
      }
    }

    if (bestLineIndex < 0) {
      continue;
    }

    const existingCount = notesPerLine.get(bestLineIndex) ?? 0;

    if (existingCount >= 2) {
      continue;
    }

    annotations.push({
      lineIndex: bestLineIndex,
      text: note.text,
    });
    notesPerLine.set(bestLineIndex, existingCount + 1);

    if (annotations.length >= 8) {
      break;
    }
  }

  return annotations;
}

function renderHighlightedCodeLine(line: string) {
  const pattern =
    /(\/\/.*$|\/\*.*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|<\/?[A-Za-z][\w.-]*|\b(?:as|const|default|else|enum|export|extends|false|from|function|if|import|interface|null|return|true|type|undefined)\b|\b\d+(?:\.\d+)?\b|\b[A-Z][A-Za-z0-9_]*\b|\bconsole\b)/g;

  if (line.length === 0) {
    return ' ';
  }

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(pattern)) {
    const token = match[0];
    const start = match.index;

    if (start > lastIndex) {
      parts.push(<span key={`plain-${lastIndex}`}>{line.slice(lastIndex, start)}</span>);
    }

    let className = 'text-slate-100';

    if (token.startsWith('//') || token.startsWith('/*')) {
      className = 'text-emerald-300/85';
    } else if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
      className = 'text-amber-300';
    } else if (token.startsWith('</') || token.startsWith('<')) {
      className = 'text-sky-300';
    } else if (codeKeywords.has(token)) {
      className = 'text-cyan-300';
    } else if (codeBuiltinTokens.has(token)) {
      className = 'text-rose-300';
    } else if (/^\d/.test(token)) {
      className = 'text-orange-300';
    } else if (/^[A-Z]/.test(token)) {
      className = 'text-teal-300';
    }

    parts.push(
      <span key={`token-${start}-${token}`} className={className}>
        {token}
      </span>,
    );
    lastIndex = start + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(<span key={`plain-tail-${lastIndex}`}>{line.slice(lastIndex)}</span>);
  }

  return parts;
}

function CodeBlock({
  anchorId,
  chromeLabels,
  label,
  lineLabel,
  segment,
}: {
  anchorId?: string | null;
  chromeLabels: string[];
  label: string;
  lineLabel?: string | null;
  segment: SegmentCard;
}) {
  const codeLines = (segment.sourceText ?? '아직 코드가 연결되지 않았다.').split('\n');
  const annotations = extractCodeAnnotations(segment);
  const annotationsByLine = new Map<number, string[]>();
  const languageToken =
    chromeLabels.find((token) => ['TS', 'JS', 'Expo'].includes(token)) ?? 'CODE';
  const chromeMetaTokens = chromeLabels.filter((token) => token !== languageToken);

  for (const annotation of annotations) {
    const current = annotationsByLine.get(annotation.lineIndex) ?? [];
    current.push(annotation.text);
    annotationsByLine.set(annotation.lineIndex, current);
  }

  return (
    <section
      id={anchorId ?? undefined}
      className="scroll-mt-32 overflow-hidden rounded-[1.7rem] border border-slate-950 bg-[#06101f] shadow-[0_20px_40px_-32px_rgba(15,23,42,0.6)]"
    >
      <div className="border-b border-white/10 bg-[#081427] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-rose-400/90" />
              <span className="size-2.5 rounded-full bg-amber-300/90" />
              <span className="size-2.5 rounded-full bg-emerald-400/90" />
              <p className="ml-2 text-[0.72rem] font-semibold tracking-[0.18em] text-white/55 uppercase">
                {label}
              </p>
            </div>
            {lineLabel ? (
              <p className="mt-2 text-[0.68rem] font-semibold tracking-[0.16em] text-white/38 uppercase">
                {lineLabel}
              </p>
            ) : null}
            {segment.devNote ? (
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{segment.devNote}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.16em] text-cyan-200 uppercase">
                {languageToken}
              </span>
              {chromeMetaTokens.map((token) => (
                <span
                  key={`${segment.id}-${token}`}
                  className="rounded-full border border-white/12 bg-white/6 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.16em] text-white/70 uppercase"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>

          {anchorId ? <SectionAnchor id={anchorId} /> : null}
        </div>
      </div>

      <div className="overflow-x-auto px-3 py-4 sm:px-5">
        <div className="min-w-[44rem] space-y-1 font-mono text-[0.9rem] leading-7">
          {codeLines.map((line, lineIndex) => {
            const lineAnnotations = annotationsByLine.get(lineIndex) ?? [];

            return (
              <div key={`${segment.id}-line-${lineIndex}`} className="space-y-1">
                <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-3">
                  <span className="pt-0.5 text-right text-[0.72rem] text-slate-500 tabular-nums select-none">
                    {lineIndex + 1}
                  </span>
                  <div className="min-w-0 whitespace-pre text-slate-100">
                    {renderHighlightedCodeLine(line)}
                  </div>
                </div>

                {lineAnnotations.map((annotation, annotationIndex) => (
                  <div
                    key={`${segment.id}-annotation-${lineIndex}-${annotationIndex}`}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-3"
                  >
                    <span className="text-right text-[0.72rem] text-slate-700 select-none">+</span>
                    <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-[0.82rem] leading-6 text-amber-100">
                      <span className="mr-2 font-semibold text-amber-200/85">{'//'}</span>
                      {annotation}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 border-t border-white/10 bg-[#081427] px-5 py-5">
        {segment.trickySentenceExplanation ? (
          <div className="rounded-2xl border border-amber-300/18 bg-white/5 px-4 py-4">
            <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-amber-200/80 uppercase">
              헷갈리기 쉬운 포인트
            </p>
            <p className="mt-2 text-sm leading-7 text-slate-200">
              {segment.trickySentenceExplanation}
            </p>
          </div>
        ) : null}

        {segment.selectiveVocabGlosses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {segment.selectiveVocabGlosses.map((gloss) => (
              <span
                key={`${segment.id}-${gloss.term}`}
                className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[0.78rem] text-slate-200"
              >
                <span className="font-semibold text-white">{gloss.term}</span>
                <span className="mx-1 text-slate-400">·</span>
                <span className="text-slate-300">{gloss.korean}</span>
              </span>
            ))}
          </div>
        ) : null}

        <ThinkingPrompts segment={segment} />
      </div>
    </section>
  );
}

function SectionArticle({
  categorySlug,
  codeChromeMap,
  index,
  learnerEvents,
  section,
  trackSlug,
}: {
  categorySlug: string;
  codeChromeMap: Map<string, string[]>;
  index: number;
  learnerEvents: LearnerEvent[];
  section: PageSection;
  trackSlug: string;
}) {
  const codeSegmentIds = section.items
    .filter((item) => item.kind === 'code')
    .map((item) => item.id);

  return (
    <article
      id={section.id}
      className="scroll-mt-32 rounded-[2rem] border border-black/8 bg-[#fffcf7] px-6 py-7 shadow-[0_20px_48px_-40px_rgba(15,23,42,0.45)]"
    >
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div className="min-w-0">
          <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
            섹션 {String(index + 1).padStart(2, '0')}
          </p>
          <h2 className="font-heading mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {section.title}
          </h2>
          {section.heading?.directTranslation ? (
            <p className="mt-3 max-w-3xl text-[1rem] leading-7 text-slate-600" lang="ko">
              {section.heading.directTranslation}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {section.codeCount > 0 ? (
            <span className="rounded-full border border-emerald-300/80 bg-emerald-50 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] text-emerald-800 uppercase">
              코드 예시 {section.codeCount}
            </span>
          ) : null}
          <SectionAnchor id={section.id} />
        </div>
      </header>

      {learnerEvents.length > 0 ? (
        <div className="mt-5 space-y-3">
          {learnerEvents.map((event) => (
            <InlineLearnerEventNotice
              key={event.id}
              event={event}
              journalHref={getLearnerEventJournalHref(categorySlug, trackSlug, event)}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
        {section.items.map((segment) => {
          if (segment.kind === 'heading') {
            return <HeadingBlock key={segment.id} segment={segment} />;
          }

          if (segment.kind === 'code') {
            const codeIndex = codeSegmentIds.indexOf(segment.id) + 1;

            return (
              <CodeBlock
                anchorId={segment.id}
                key={segment.id}
                chromeLabels={codeChromeMap.get(segment.id) ?? []}
                label={section.codeCount > 1 ? `코드 예시 ${codeIndex}` : '코드 예시'}
                segment={segment}
              />
            );
          }

          return (
            <NarrativeBlock
              key={segment.id}
              label={segment.kind === 'list' ? '핵심 규칙' : '설명'}
              segment={segment}
            />
          );
        })}
      </div>
    </article>
  );
}

export default async function TrackDocPage({ params }: TrackDocPageProps) {
  const { categorySlug, trackSlug, pageSlug } = await params;
  const track = await findTrack(categorySlug, trackSlug);

  if (!track) {
    notFound();
  }

  const page = track.pages.find((entry) => entry.slug === pageSlug) ?? null;

  if (!page) {
    notFound();
  }

  if (page.sourceScope === 'section') {
    const target = resolvePageTarget(track, page);

    if (target.pageSlug !== page.slug) {
      const hashSuffix = target.hash ? `#${target.hash}` : '';
      redirect(
        `/categories/${categorySlug}/tracks/${trackSlug}/pages/${target.pageSlug}${hashSuffix}`,
      );
    }
  }

  const outlineLabels = getOutlineLabels(page.rawSource);
  const pageSections = buildPageSections(page.segmentCards, outlineLabels);
  const isFullPageReader = page.captureMode === 'verbatim' && page.sourceScope === 'full-page';
  const rawLineCount = page.rawSource?.split(/\r?\n/).length ?? 0;
  const codeSections = pageSections.filter((section) => section.codeCount > 0);
  const pageSourceLanguage = detectSourceLanguage(
    page.segmentCards.map((segment) => segment.sourceText ?? '').join('\n'),
  );
  const sourceChipLabel = pageSourceLanguage === 'ko' ? 'OCR 원문' : '공식 원문';
  const supportChipLabel = pageSourceLanguage === 'ko' ? '핵심 해설' : '직독직해';
  const hasReadingSupport = page.segmentCards.some((segment) => Boolean(segment.directTranslation));
  const externalCanonicalUrl = isExternalReference(page.canonicalUrl) ? page.canonicalUrl : null;
  const outlineEntries = buildOutlineEntries(page.rawSource, pageSections);
  const sectionNavItems: InPageNavItem[] = pageSections.map((section) => ({
    id: `section-nav-${section.id}`,
    label: section.title,
    targetId: section.id,
    badge: section.codeCount ? `${section.codeCount} code` : null,
  }));
  const codeChromeMap = buildCodeChromeMap(page.rawSource, page.structure);
  const pageGlossaryTerms = collectPageGlosses(page.segmentCards, page.glossaryTerms);
  const glossaryRailEntries = buildGlossaryRailEntries({
    glossaryTerms: page.glossaryTerms,
    pageSlug: page.slug,
    sections: pageSections,
    segments: page.segmentCards,
  });
  const pageDescription = isFullPageReader
    ? '공식문서 흐름 그대로 읽되, 영문 원문 바로 아래에 직독직해와 헷갈릴 단어 설명을 붙여 두었다. 코드 예시는 문서 메타와 함께 원문 그대로 유지한다.'
    : pageSourceLanguage === 'ko'
      ? 'OCR로 옮긴 원문과 쉬운 해설, 실제로 막혔던 질문, 복습 포인트를 같은 문맥 안에서 다시 보는 읽기 리더다.'
      : '원문과 직독직해, 코드 읽기 포인트를 같은 문맥 안에서 바로 확인하는 읽기 리더다.';
  const sectionLearnerEvents = new Map<string, LearnerEvent[]>();

  for (const section of pageSections) {
    const sectionSegmentIds = new Set<string>([
      section.id,
      ...(section.heading ? [section.heading.id] : []),
      ...section.items.map((segment) => segment.id),
    ]);
    const matchedEvents = page.learnerEvents.filter((event) => {
      const anchorId = getLearnerEventAnchorId(event);

      if (anchorId && sectionSegmentIds.has(anchorId)) {
        return true;
      }

      return event.relatedSegmentIds.some((segmentId) => sectionSegmentIds.has(segmentId));
    });

    if (matchedEvents.length > 0) {
      sectionLearnerEvents.set(section.id, matchedEvents);
    }
  }

  return (
    <main className="min-h-svh bg-[#f6f2ea] text-slate-950">
      <div className="mx-auto max-w-[1640px] px-4 py-6 sm:px-6 lg:px-8">
        <div
          className={cn(
            'gap-8',
            !isFullPageReader &&
              'lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[18.5rem_minmax(0,1fr)] xl:gap-12',
          )}
        >
          {!isFullPageReader ? (
            <TrackSidebar
              categorySlug={categorySlug}
              currentPageSlug={page.slug}
              currentView="page"
              track={track}
              trackSlug={trackSlug}
            />
          ) : null}

          <div className={cn('min-w-0', !isFullPageReader && 'mt-8 lg:mt-0')}>
            <div
              className={cn(
                'gap-8',
                isFullPageReader
                  ? 'xl:grid xl:grid-cols-[15.5rem_minmax(0,1fr)_19rem] xl:items-start'
                  : 'xl:grid xl:grid-cols-[minmax(0,1fr)_19rem]',
              )}
            >
              {isFullPageReader ? (
                <aside className="hidden xl:sticky xl:top-6 xl:block xl:max-h-[calc(100svh-3rem)] xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
                  <section className="rounded-[1.7rem] border border-black/8 bg-[#fbf7f0] px-4 py-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.5)]">
                    <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                      Get Started 목차
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      공식문서의 Menu 흐름을 그대로 따라가며 읽는다.
                    </p>
                    <div className="mt-4">
                      <InPageNav ariaLabel="Get Started 목차" items={outlineEntries} />
                    </div>
                  </section>
                </aside>
              ) : null}

              <article className="min-w-0">
                <header className="rounded-[2.2rem] border border-black/8 bg-[#fffdfa] px-6 py-7 shadow-[0_24px_56px_-44px_rgba(15,23,42,0.45)] sm:px-8">
                  <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold tracking-[0.2em] text-slate-400 uppercase">
                    <Link
                      href={`/categories/${categorySlug}/tracks/${trackSlug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white px-3 py-1.5 transition-all hover:-translate-y-px hover:border-slate-950/20 hover:bg-slate-950 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
                    >
                      {track.manifest.title}
                      <ChevronRight className="size-3.5" />
                    </Link>
                    <span>{String(page.readOrder).padStart(2, '0')}</span>
                  </div>

                  <h1 className="font-heading mt-4 text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                    {page.title}
                  </h1>
                  <p className="mt-4 max-w-3xl text-[1.02rem] leading-8 text-slate-700">
                    {pageDescription}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-slate-600 uppercase">
                      {sourceChipLabel}
                    </span>
                    {hasReadingSupport ? (
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-slate-600 uppercase">
                        {supportChipLabel}
                      </span>
                    ) : null}
                    {codeSections.length > 0 ? (
                      <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-[0.72rem] font-semibold tracking-[0.16em] text-slate-600 uppercase">
                        코드 예시 {codeSections.length}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
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
                    {externalCanonicalUrl ? (
                      <Link
                        href={externalCanonicalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(buttonVariants({ variant: 'default' }), 'rounded-full')}
                      >
                        공식 문서 열기
                        <ArrowUpRight className="size-4" />
                      </Link>
                    ) : null}
                    <Link
                      href={`/categories/${categorySlug}/tracks/${trackSlug}`}
                      className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        'rounded-full border border-black/10 bg-white hover:border-slate-950/18 hover:bg-slate-950 hover:text-white',
                      )}
                    >
                      트랙 개요
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  {isFullPageReader ? (
                    <details className="group/mobile-outline mt-6 rounded-[1.5rem] border border-black/8 bg-white xl:hidden">
                      <summary className="flex list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px">
                        문서 목차 펼치기
                        <ChevronRight className="size-4 shrink-0 text-slate-400 transition-transform group-open/mobile-outline:rotate-90" />
                      </summary>
                      <div className="border-t border-black/6 px-4 py-4">
                        <InPageNav ariaLabel="Get Started 모바일 목차" items={outlineEntries} />
                      </div>
                    </details>
                  ) : null}
                </header>

                <div className="mt-8 space-y-6">
                  {pageSections.length > 0 ? (
                    pageSections.map((section, index) => (
                      <SectionArticle
                        categorySlug={categorySlug}
                        key={section.id}
                        codeChromeMap={codeChromeMap}
                        index={index}
                        learnerEvents={sectionLearnerEvents.get(section.id) ?? []}
                        section={section}
                        trackSlug={trackSlug}
                      />
                    ))
                  ) : (
                    <EmptyState
                      description="source.md는 저장됐지만 structure.json과 overlay.ko.json이 아직 비어 있다."
                      title="학습 세그먼트가 없습니다"
                    />
                  )}
                </div>
              </article>

              <aside className="space-y-5 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto xl:overscroll-contain xl:pr-1">
                {!isFullPageReader ? (
                  <section className="rounded-[1.7rem] border border-black/8 bg-[#fffdfa] px-5 py-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.45)]">
                    <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                      현재 페이지 목차
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      스크롤 위치에 따라 현재 섹션이 선택 상태로 바뀐다.
                    </p>
                    <div className="mt-4">
                      <InPageNav
                        ariaLabel={`${page.title} 페이지 목차`}
                        items={sectionNavItems}
                        variant="compact"
                      />
                    </div>
                  </section>
                ) : null}

                <section className="rounded-[1.7rem] border border-black/8 bg-[#fffdfa] px-5 py-5 shadow-[0_16px_40px_-34px_rgba(15,23,42,0.45)]">
                  <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    읽기 상태
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-black/8 bg-white px-4 py-4">
                      <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        원문 줄 수
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                        {rawLineCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/8 bg-white px-4 py-4">
                      <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        섹션 수
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                        {pageSections.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-black/8 bg-white px-4 py-4">
                      <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        핵심 단어
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                        {pageGlossaryTerms.length}
                      </p>
                    </div>
                  </div>
                </section>

                <RailDisclosure defaultOpen title="이 페이지 핵심 단어">
                  {glossaryRailEntries.length > 0 ? (
                    <PageGlossaryRail
                      entries={glossaryRailEntries}
                      sectionOrder={pageSections.map((section) => section.id)}
                    />
                  ) : (
                    <EmptyState
                      description="이 페이지에 연결된 핵심 단어가 아직 없다."
                      title="단어가 없습니다"
                    />
                  )}
                </RailDisclosure>

                <RailDisclosure title="학습 로그">
                  {page.learnerEvents.length > 0 ? (
                    <div className="space-y-4">
                      {page.learnerEvents.map((event) => (
                        <LearnerEventCard
                          key={event.id}
                          event={event}
                          target={resolveLearnerEventTarget(track, categorySlug, trackSlug, event)}
                        />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      description="이 원문에 대한 질문이 생기면 learner/events.ndjson에 누적된다."
                      title="질문 기록이 없습니다"
                    />
                  )}
                </RailDisclosure>

                <RailDisclosure title="복습 큐">
                  {page.reviewItems.length > 0 ? (
                    <div className="space-y-4">
                      {page.reviewItems.map((item) => (
                        <article
                          key={item.id}
                          className="rounded-2xl border border-black/8 bg-slate-50/80 px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">
                              {item.dueOn}
                            </p>
                            <span className="text-xs tracking-[0.16em] text-slate-500 uppercase">
                              {reviewStatusLabels[item.status] ?? item.status}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-700">{item.prompt}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      description="이 페이지와 연결된 복습 항목이 아직 없다."
                      title="복습 항목이 없습니다"
                    />
                  )}
                </RailDisclosure>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
