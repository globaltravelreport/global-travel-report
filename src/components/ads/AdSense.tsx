'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

type AdFormat = 'auto' | 'horizontal' | 'vertical' | 'rectangle';

interface AdSenseProps {
  className?: string;
  slot: string;
  format?: AdFormat;
  responsive?: boolean;
  style?: React.CSSProperties;
  layout?: 'in-article' | 'in-feed' | 'default';
  fullWidth?: boolean;
}

/**
 * AdSense unit. Reserves height without dashed "empty ad" chrome that looks broken
 * when inventory hasn't filled yet.
 */
export function AdSense({
  className,
  slot,
  format = 'auto',
  responsive = true,
  style,
  layout = 'default',
  fullWidth = false,
}: AdSenseProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current) return;
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';
      if ((isProduction || adsEnabled) && typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (_error) {
      console.error(_error);
    }
  }, []);

  const formatClasses = {
    auto: 'min-h-[90px] md:min-h-[250px]',
    horizontal: 'min-h-[90px]',
    vertical: 'min-h-[600px] min-w-[120px]',
    rectangle: 'min-h-[250px] min-w-[300px]',
  };

  const sharedClass = cn(
    'adsbygoogle block overflow-hidden bg-transparent',
    formatClasses[format],
    fullWidth ? 'w-full' : '',
    className
  );

  const sharedStyle: React.CSSProperties = {
    display: 'block',
    ...style,
  };

  if (layout === 'in-article') {
    return (
      <ins
        className={sharedClass}
        style={sharedStyle}
        data-ad-client="ca-pub-4005772594728149"
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout="in-article"
      />
    );
  }

  if (layout === 'in-feed') {
    return (
      <ins
        className={sharedClass}
        style={sharedStyle}
        data-ad-client="ca-pub-4005772594728149"
        data-ad-slot={slot}
        data-ad-format="fluid"
        data-ad-layout-key="-fb+5w+4e-db+86"
      />
    );
  }

  return (
    <ins
      className={sharedClass}
      style={sharedStyle}
      data-ad-client="ca-pub-4005772594728149"
      data-ad-slot={slot}
      data-ad-format={responsive ? 'auto' : format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}

export function AdSenseInArticle({
  className,
  slot = '3940256099',
}: Partial<Omit<AdSenseProps, 'layout' | 'format'>>) {
  return (
    <div className={cn('my-8 relative', className)} aria-label="Advertisement">
      <div className="text-xs text-gray-400 absolute -top-4 left-0 pointer-events-none">
        Advertisement
      </div>
      <AdSense slot={slot} layout="in-article" fullWidth />
    </div>
  );
}

export function AdSenseInFeed({
  className,
  slot = '1154567389',
}: Partial<Omit<AdSenseProps, 'layout' | 'format'>>) {
  return (
    <div className={cn('my-6', className)} aria-label="Advertisement">
      <AdSense slot={slot} layout="in-feed" fullWidth />
    </div>
  );
}

export function AdSenseSidebar({
  className,
  slot = '7259870876',
}: Partial<Omit<AdSenseProps, 'format'>>) {
  return (
    <div className={cn('my-6', className)} aria-label="Advertisement">
      <AdSense
        slot={slot}
        format="vertical"
        responsive={false}
        style={{ minHeight: '600px', minWidth: '160px' }}
      />
    </div>
  );
}

export function AdSenseLeaderboard({
  className,
  slot = '6487384954',
}: Partial<Omit<AdSenseProps, 'format'>>) {
  return (
    <div className={cn('my-6 mx-auto max-w-[728px] relative', className)} aria-label="Advertisement">
      <div className="text-xs text-gray-400 absolute -top-4 left-0 pointer-events-none">
        Advertisement
      </div>
      <AdSense
        slot={slot}
        format="horizontal"
        responsive={true}
        style={{ minHeight: '90px', width: '100%' }}
      />
    </div>
  );
}
