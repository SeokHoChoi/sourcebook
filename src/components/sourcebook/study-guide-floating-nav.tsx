'use client';

import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { InPageNav, type InPageNavItem } from '@/components/sourcebook/in-page-nav';
import { cn } from '@/lib/utils';

export function StudyGuideFloatingNav({
  items,
  title,
  subtitle,
  showOrdinal = true,
}: {
  items: InPageNavItem[];
  title: string;
  subtitle?: string;
  showOrdinal?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-clickable="true"
        className="fixed right-4 bottom-5 z-40 inline-flex items-center gap-2 rounded-full border border-black/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.72)] transition-all hover:-translate-y-px hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none active:translate-y-px"
      >
        <Menu className="size-4" />
        문서 목차
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="문서 목차 닫기"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/38 backdrop-blur-[1px]"
          />

          <section
            className={cn(
              'absolute right-0 bottom-0 left-0 max-h-[78vh] overflow-hidden rounded-t-[2rem] border-t border-black/10 bg-[#fbf8f1] shadow-[0_-18px_44px_-30px_rgba(15,23,42,0.55)]',
            )}
          >
            <div className="border-b border-black/8 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[0.72rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
                    ebook nav
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {title}
                  </h2>
                  {subtitle ? (
                    <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  aria-label="문서 목차 닫기"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-black/8 bg-white text-slate-700 transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:outline-none"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="overflow-auto px-4 py-4">
              <InPageNav
                ariaLabel={`${title} 모바일 목차`}
                items={items}
                variant="compact"
                showOrdinal={showOrdinal}
                onNavigate={() => setOpen(false)}
              />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
