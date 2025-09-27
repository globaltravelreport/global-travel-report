import { useEffect, useRef, useState } from 'react';

export function useIntersectionObserver({ root = null, rootMargin = '0px', threshold = 0, freezeOnceVisible = true } = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useRef<HTMLElement | null>(null);
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    if (frozen || !ref.current) return;
    const observer = new window.IntersectionObserver(([e]) => setEntry(e), { root, rootMargin, threshold });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, frozen]);

  return [ref, entry] as const;
}
