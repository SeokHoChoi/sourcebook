import Link from 'next/link';

import type { LearnerEvent } from '@/lib/sourcebook';

const learnerStatusLabels: Record<string, string> = {
  open: '미해결',
  scheduled: '예정',
  resolved: '해결',
};

export function InlineLearnerEventNotice({
  event,
  journalHref,
}: {
  event: LearnerEvent;
  journalHref: string;
}) {
  return (
    <aside className="rounded-[1.35rem] border border-amber-300/45 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.94))] px-4 py-4 shadow-[0_16px_36px_-30px_rgba(180,83,9,0.4)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-amber-300/55 bg-amber-100 px-2.5 py-1 text-[0.68rem] font-semibold tracking-[0.14em] text-amber-900 uppercase">
            여기서 실제로 막혔음
          </span>
          <span className="rounded-full border border-black/8 bg-white px-2.5 py-1 text-[0.68rem] tracking-[0.14em] text-slate-500 uppercase">
            {learnerStatusLabels[event.status] ?? event.status}
          </span>
        </div>
        <span className="text-[0.72rem] text-slate-500">{event.createdAt}</span>
      </div>

      <p className="mt-3 text-sm leading-7 font-semibold text-slate-950">{event.question}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">
        <strong className="font-semibold text-slate-900">막힌 이유:</strong> {event.confusionReason}
      </p>
      <p className="mt-2 text-sm leading-7 text-slate-700">
        <strong className="font-semibold text-slate-900">짧은 정리:</strong> {event.answerSummary}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={journalHref}
          className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-px hover:border-black/15 hover:bg-slate-950 hover:text-white focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
        >
          학습 기록에서 크게 보기
        </Link>
      </div>
    </aside>
  );
}
