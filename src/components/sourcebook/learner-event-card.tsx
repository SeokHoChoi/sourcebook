import Link from 'next/link';

import type { LearnerEvent, LearnerEventTarget } from '@/lib/sourcebook';
import { cn } from '@/lib/utils';

const learnerStatusLabels: Record<string, string> = {
  open: '미해결',
  scheduled: '예정',
  resolved: '해결',
};

function EventTextBlock({
  children,
  label,
  tone = 'default',
}: {
  children: string;
  label: string;
  tone?: 'default' | 'question' | 'revision';
}) {
  const toneClassName =
    tone === 'question'
      ? 'border-amber-500/18 bg-amber-50/70 text-slate-950'
      : tone === 'revision'
        ? 'border-emerald-600/16 bg-emerald-50/70 text-slate-800'
        : 'border-black/7 bg-white/72 text-slate-700';

  return (
    <section className={cn('mt-3 rounded-2xl border px-4 py-3', toneClassName)}>
      <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-slate-400 uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm leading-7 whitespace-pre-line">{children}</p>
    </section>
  );
}

export function LearnerEventCard({
  articleId,
  className,
  event,
  target,
}: {
  articleId?: string;
  className?: string;
  event: LearnerEvent;
  target: LearnerEventTarget;
}) {
  return (
    <article
      id={articleId}
      className={cn(
        'scroll-mt-28 rounded-2xl border border-black/8 bg-slate-50/80 px-4 py-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs tracking-[0.16em] text-slate-400 uppercase">{event.createdAt}</p>
        <div className="flex flex-wrap items-center gap-2 text-[0.68rem] tracking-[0.16em] uppercase">
          <span className="rounded-full border border-black/8 bg-white px-2.5 py-1 text-slate-500">
            {target.scopeLabel}
          </span>
          <span className="rounded-full border border-black/8 bg-white px-2.5 py-1 text-slate-500">
            {learnerStatusLabels[event.status] ?? event.status}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-amber-500/18 bg-amber-500/8 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-amber-800 uppercase">
          {event.patternLabel}
        </span>
        <span className="text-[0.72rem] text-slate-500">{target.targetLabel}</span>
      </div>

      <EventTextBlock label="질문 원문" tone="question">
        {event.question}
      </EventTextBlock>
      {event.questionRevision ? (
        <EventTextBlock label="질문 다듬기" tone="revision">
          {event.questionRevision}
        </EventTextBlock>
      ) : null}
      <EventTextBlock label="왜 막혔나">{event.confusionReason}</EventTextBlock>
      <EventTextBlock label="정리">{event.answerSummary}</EventTextBlock>

      <div className="mt-4 flex flex-wrap gap-3">
        {target.href ? (
          <Link
            href={target.href}
            className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-slate-950 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
          >
            정확한 위치로 이동
          </Link>
        ) : null}
        <span className="inline-flex items-center rounded-full border border-black/6 bg-white/70 px-3 py-1.5 text-xs tracking-[0.14em] text-slate-500 uppercase">
          다음 복습 {event.nextReviewOn}
        </span>
      </div>
    </article>
  );
}
