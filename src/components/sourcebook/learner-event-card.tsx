import Link from 'next/link';

import type { LearnerEvent, LearnerEventTarget } from '@/lib/sourcebook';
import { cn } from '@/lib/utils';

const learnerStatusLabels: Record<string, string> = {
  open: '미해결',
  scheduled: '예정',
  resolved: '해결',
};

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

      <p className="mt-3 text-base leading-8 font-semibold text-slate-950">{event.question}</p>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        <strong className="font-semibold text-slate-900">왜 막혔나:</strong> {event.confusionReason}
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-700">
        <strong className="font-semibold text-slate-900">정리:</strong> {event.answerSummary}
      </p>

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
