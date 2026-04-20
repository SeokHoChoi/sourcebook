export const IN_PAGE_SCROLL_OFFSET = 112;
export const IN_PAGE_ACTIVE_THRESHOLD = IN_PAGE_SCROLL_OFFSET + 32;

export function getHashTarget() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawHash = window.location.hash.replace(/^#/, '').trim();
  return rawHash.length > 0 ? decodeURIComponent(rawHash) : null;
}

export function resolveActiveTarget(targetIds: string[], threshold = IN_PAGE_ACTIVE_THRESHOLD) {
  let current = targetIds[0] ?? null;

  for (const targetId of targetIds) {
    const element = document.getElementById(targetId);

    if (!element) {
      continue;
    }

    if (element.getBoundingClientRect().top - threshold <= 0) {
      current = targetId;
    } else {
      break;
    }
  }

  return current;
}

export function scrollToTarget(targetId: string, offset = IN_PAGE_SCROLL_OFFSET) {
  const element = document.getElementById(targetId);

  if (!element) {
    return false;
  }

  const top = Math.max(0, window.scrollY + element.getBoundingClientRect().top - offset);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.history.pushState(null, '', `#${encodeURIComponent(targetId)}`);
  window.scrollTo({
    top,
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });

  return true;
}
