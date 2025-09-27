'use client';

import { useEffect, useRef, useState, RefObject } from 'react';

export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>({ root = null, rootMargin = '0px', threshold = 0, freezeOnceVisible = true } = {}): readonly [RefObject<T>, IntersectionObserverEntry | null] {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const ref = useRef<T>(null);
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    if (frozen || !ref.current) return;
    const observer = new window.IntersectionObserver(([e]) => setEntry(e), { root, rootMargin, threshold });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold, frozen]);

  // TypeScript workaround: cast to RefObject<T>
  return [ref as RefObject<T>, entry] as const;
}
