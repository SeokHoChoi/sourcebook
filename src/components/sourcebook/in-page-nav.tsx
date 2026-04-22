'use client';

import { ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { resolveActiveTarget, scrollToTarget } from '@/components/sourcebook/in-page-scroll';
import { cn } from '@/lib/utils';

export type InPageNavItem = {
  id: string;
  label: string;
  targetId: string | null;
  badge?: string | null;
  depth?: number;
};

type InPageNavProps = {
  ariaLabel: string;
  items: InPageNavItem[];
  variant?: 'default' | 'compact';
  onNavigate?: ((targetId: string) => void) | null;
};

export function InPageNav({
  ariaLabel,
  items,
  variant = 'default',
  onNavigate = null,
}: InPageNavProps) {
  const activeCandidates = useMemo(
    () =>
      items
        .map((item) => item.targetId)
        .filter((targetId): targetId is string => Boolean(targetId)),
    [items],
  );
  const [activeId, setActiveId] = useState<string | null>(activeCandidates[0] ?? null);

  useEffect(() => {
    if (activeCandidates.length === 0) {
      return;
    }

    const resolveActiveId = () => {
      setActiveId(resolveActiveTarget(activeCandidates));
    };

    const frameId = window.requestAnimationFrame(resolveActiveId);

    window.addEventListener('scroll', resolveActiveId, { passive: true });
    window.addEventListener('resize', resolveActiveId);
    window.addEventListener('hashchange', resolveActiveId);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', resolveActiveId);
      window.removeEventListener('resize', resolveActiveId);
      window.removeEventListener('hashchange', resolveActiveId);
    };
  }, [activeCandidates]);

  return (
    <nav className="space-y-2" aria-label={ariaLabel}>
      {items.map((item, index) => {
        const isSelected = Boolean(item.targetId) && item.targetId === activeId;
        const depth = Math.max(0, item.depth ?? 0);

        if (!item.targetId) {
          return (
            <div
              key={item.id}
              aria-disabled="true"
              className={cn(
                'flex cursor-not-allowed items-center justify-between gap-3 rounded-2xl border border-dashed border-black/10 bg-slate-50 px-3 py-3 text-sm text-slate-400',
                variant === 'compact' && 'rounded-xl py-2.5 text-[0.94rem]',
              )}
            >
              <span>{item.label}</span>
              <span className="text-[0.62rem] font-semibold tracking-[0.14em] uppercase">
                준비중
              </span>
            </div>
          );
        }

        return (
          <a
            key={item.id}
            href={`#${item.targetId}`}
            aria-current={isSelected ? 'location' : undefined}
            data-clickable="true"
            onClick={(event) => {
              const targetId = item.targetId;

              if (!targetId) {
                return;
              }

              event.preventDefault();
              scrollToTarget(targetId);
              setActiveId(targetId);
              onNavigate?.(targetId);
            }}
            className={cn(
              'group/nav flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px',
              isSelected
                ? 'border-slate-950 bg-slate-950 text-white shadow-[0_16px_32px_-22px_rgba(15,23,42,0.65)]'
                : 'border-black/8 bg-white text-slate-800 hover:-translate-y-px hover:border-slate-950/18 hover:bg-slate-50 hover:text-slate-950 active:bg-slate-100',
              variant === 'compact' && 'rounded-xl py-2.5 text-[0.94rem]',
            )}
          >
            <span className="min-w-0">
              <span
                className="flex min-w-0 items-center gap-2"
                style={{ paddingLeft: depth > 0 ? `${depth * 0.8}rem` : undefined }}
              >
                <span
                  className={cn(
                    'shrink-0 text-[0.65rem] font-semibold tracking-[0.16em] uppercase transition-colors',
                    isSelected ? 'text-white/55' : 'text-slate-400 group-hover/nav:text-slate-600',
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="truncate">{item.label}</span>
              </span>
            </span>

            {item.badge ? (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.14em] uppercase',
                  isSelected
                    ? 'bg-white/12 text-white'
                    : 'bg-emerald-50 text-emerald-700 group-hover/nav:bg-emerald-100',
                )}
              >
                {item.badge}
              </span>
            ) : (
              <ChevronRight
                className={cn(
                  'size-4 shrink-0 transition-transform',
                  isSelected
                    ? 'text-white/65'
                    : 'text-slate-400 group-hover/nav:translate-x-0.5 group-hover/nav:text-slate-700',
                )}
              />
            )}
          </a>
        );
      })}
    </nav>
  );
}
