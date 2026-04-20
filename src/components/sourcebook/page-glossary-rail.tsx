'use client';

import { ChevronRight, Pin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { resolveActiveTarget, scrollToTarget } from '@/components/sourcebook/in-page-scroll';
import { cn } from '@/lib/utils';

export type PageGlossaryRailEntry = {
  id: string;
  term: string;
  korean: string;
  explanation: string;
  targetId: string | null;
  sectionIds: string[];
};

type PageGlossaryRailProps = {
  entries: PageGlossaryRailEntry[];
  sectionOrder: string[];
};

export function PageGlossaryRail({ entries, sectionOrder }: PageGlossaryRailProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(sectionOrder[0] ?? null);

  useEffect(() => {
    if (sectionOrder.length === 0) {
      return;
    }

    const resolveActiveSection = () => {
      setActiveSectionId(resolveActiveTarget(sectionOrder));
    };

    const frameId = window.requestAnimationFrame(resolveActiveSection);

    window.addEventListener('scroll', resolveActiveSection, { passive: true });
    window.addEventListener('resize', resolveActiveSection);
    window.addEventListener('hashchange', resolveActiveSection);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', resolveActiveSection);
      window.removeEventListener('resize', resolveActiveSection);
      window.removeEventListener('hashchange', resolveActiveSection);
    };
  }, [sectionOrder]);

  const { currentEntries, otherEntries } = useMemo(() => {
    const current = entries.filter(
      (entry) => activeSectionId && entry.sectionIds.includes(activeSectionId),
    );
    const other = entries.filter(
      (entry) => !(activeSectionId && entry.sectionIds.includes(activeSectionId)),
    );

    return {
      currentEntries: current,
      otherEntries: other,
    };
  }, [activeSectionId, entries]);

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-500">
        이 페이지에 연결된 핵심 단어가 아직 없다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {currentEntries.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
            <Pin className="size-3.5" />
            현재 읽는 섹션과 겹치는 단어
          </div>
          <div className="space-y-3">
            {currentEntries.map((entry) => (
              <GlossaryCard key={entry.id} active entry={entry} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
          페이지 전체 단어
        </p>
        <div className="max-h-[min(32rem,calc(100vh-18rem))] space-y-3 overflow-y-auto overscroll-contain pr-1">
          {(currentEntries.length > 0 ? otherEntries : entries).map((entry) => (
            <GlossaryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}

function GlossaryCard({
  active = false,
  entry,
}: {
  active?: boolean;
  entry: PageGlossaryRailEntry;
}) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className={cn('text-sm font-semibold', active ? 'text-slate-950' : 'text-slate-900')}>
          {entry.term} <span className="text-xs font-medium text-slate-500">({entry.korean})</span>
        </p>
        {entry.targetId ? (
          <ChevronRight
            className={cn(
              'mt-0.5 size-4 shrink-0 transition-transform',
              active
                ? 'text-slate-700'
                : 'text-slate-400 group-hover/glossary:translate-x-0.5 group-hover/glossary:text-slate-700',
            )}
          />
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-7 text-slate-700">{entry.explanation}</p>
    </>
  );

  if (!entry.targetId) {
    return (
      <article
        className={cn(
          'rounded-2xl border px-4 py-4',
          active ? 'border-amber-300 bg-amber-50/70' : 'border-black/8 bg-white',
        )}
      >
        {content}
      </article>
    );
  }

  return (
    <a
      href={`#${entry.targetId}`}
      data-clickable="true"
      aria-current={active ? 'location' : undefined}
      onClick={(event) => {
        const targetId = entry.targetId;

        if (!targetId) {
          return;
        }

        event.preventDefault();
        scrollToTarget(targetId);
      }}
      className={cn(
        'group/glossary block rounded-2xl border px-4 py-4 transition-all focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px',
        active
          ? 'border-amber-300 bg-amber-50/70 shadow-[0_16px_28px_-24px_rgba(217,119,6,0.45)]'
          : 'border-black/8 bg-white hover:-translate-y-px hover:border-slate-950/15 hover:bg-slate-50 hover:shadow-[0_14px_26px_-22px_rgba(15,23,42,0.28)]',
      )}
    >
      {content}
    </a>
  );
}
