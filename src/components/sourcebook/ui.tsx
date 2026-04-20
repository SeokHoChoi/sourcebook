import type { ReactNode } from 'react';

import type { CaptureMode, PageStatus, TrackStatus } from '@/lib/sourcebook';
import { cn } from '@/lib/utils';

const statusLabels: Record<PageStatus, string> = {
  sample: '샘플',
  queued: '대기',
  'intake-ready': '수집 준비',
  full: '전체 수집',
};

const statusClasses: Record<PageStatus, string> = {
  sample: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800',
  queued: 'border-amber-500/20 bg-amber-500/10 text-amber-800',
  'intake-ready': 'border-sky-500/20 bg-sky-500/10 text-sky-800',
  full: 'border-slate-900/20 bg-slate-900 text-white',
};

const captureLabels: Record<CaptureMode, string> = {
  excerpt: '발췌',
  verbatim: '원문 전체',
  pending: '미수집',
};

const trackStatusLabels: Record<TrackStatus, string> = {
  active: '진행중',
  planned: '예정',
};

const trackStatusClasses: Record<TrackStatus, string> = {
  active: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-800',
  planned: 'border-slate-500/20 bg-slate-500/10 text-slate-700',
};

export function StatusBadge({
  status,
  captureMode,
}: {
  status: PageStatus;
  captureMode: CaptureMode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-1',
          statusClasses[status],
        )}
      >
        {statusLabels[status]}
      </span>
      <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-2.5 py-1 text-slate-600">
        {captureLabels[captureMode]}
      </span>
    </div>
  );
}

export function TrackStatusBadge({ status }: { status: TrackStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.18em] uppercase',
        trackStatusClasses[status],
      )}
    >
      {trackStatusLabels[status]}
    </span>
  );
}

export function Panel({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-[1.85rem] border border-black/6 bg-white/92 p-6 shadow-[0_18px_56px_-42px_rgba(15,23,42,0.24)] backdrop-blur',
        className,
      )}
    >
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-slate-500 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function MetricTile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1.6rem] border border-black/6 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,248,244,0.96))] px-5 py-4 text-slate-950 shadow-[0_16px_48px_-40px_rgba(15,23,42,0.2)]">
      <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-black/10 bg-slate-100/70 px-5 py-4">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
