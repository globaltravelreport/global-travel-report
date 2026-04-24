'use client';

import { useEffect, useRef, useState } from 'react';

type AdSlotVariant = 'top-banner' | 'in-article' | 'sidebar' | 'footer';

interface AdSlotProps {
  slot: string;
  className?: string;
  variant?: AdSlotVariant;
  label?: string;
}

const AD_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;

const variantClasses: Record<AdSlotVariant, string> = {
  'top-banner': 'min-h-[90px] w-full max-w-5xl mx-auto my-4',
  'in-article': 'min-h-[250px] w-full my-8',
  sidebar: 'hidden lg:block min-h-[280px] w-full my-4',
  footer: 'min-h-[90px] w-full max-w-5xl mx-auto my-8',
};

export function AdSlot({
  slot,
  className = '',
  variant = 'in-article',
  label = 'Advertisement',
}: AdSlotProps) {
  const adRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!adRef.current || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(adRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !AD_CLIENT || !slot) return;

    try {
      ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle || []).push({});
    } catch {
      // Google Ads can fail silently when blocked by browsers or extensions.
    }
  }, [isVisible, slot]);

  return (
    <div ref={adRef} className={`${variantClasses[variant]} ${className}`} aria-label={label}>
      <div className="text-center text-xs uppercase tracking-wide text-gray-400 mb-2">{label}</div>
      {isVisible && AD_CLIENT ? (
        <ins
          className="adsbygoogle block"
          style={{ display: 'block' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex min-h-[90px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
          Sponsored space
        </div>
      )}
    </div>
  );
}

export default AdSlot;
