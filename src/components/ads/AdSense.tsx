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
 * AdSense component for displaying Google AdSense ads
 *
 * @param props Component props
 * @returns AdSense component
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
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      // Only run in production or when explicitly enabled
      const isProduction = process.env.NODE_ENV === 'production';
      const adsEnabled = process.env.NEXT_PUBLIC_ENABLE_ADS === 'true';

      if ((isProduction || adsEnabled) && typeof window !== 'undefined') {
        // Check if adsbygoogle is defined
        if (window.adsbygoogle && adRef.current) {
          // Push the ad to adsbygoogle for rendering
          window.adsbygoogle.push({});
        }
      }
    } catch (_error) {
      console.error(_error);
    }
  }, []);

  // Set format classes based on the format prop
  const formatClasses = {
    auto: 'min-h-[90px] md:min-h-[250px]',
    horizontal: 'min-h-[90px]',
    vertical: 'min-h-[600px] min-w-[120px]',
    rectangle: 'min-h-[250px] min-w-[300px]',
  };

  // Set layout-specific attributes
  const getAdAttributes = () => {
    const baseAttributes = {
      className: cn(
        'block text-center overflow-hidden bg-gray-100 border border-dashed border-gray-300',
        formatClasses[format],
        fullWidth ? 'w-full' : '',
        className
      ),
      style: {
        ...style,
        position: 'relative' as const,
      },
      'data-ad-client': 'ca-pub-4005772594728149',
      'data-ad-slot': slot,
    };

    if (layout === 'in-article') {
      return {
        ...baseAttributes,
        className: cn(baseAttributes.className, 'adsbygoogle'),
        'data-ad-format': 'fluid',
        'data-ad-layout': 'in-article',
      };
    }

    if (layout === 'in-feed') {
      return {
        ...baseAttributes,
        className: cn(baseAttributes.className, 'adsbygoogle'),
        'data-ad-format': 'fluid',
        'data-ad-layout-key': '-fb+5w+4e-db+86',
      };
    }

    // Default layout
    return {
      ...baseAttributes,
      className: cn(baseAttributes.className, 'adsbygoogle'),
      'data-ad-format': responsive ? 'auto' : format,
      'data-full-width-responsive': responsive ? 'true' : 'false',
    };
  };

  return (
    <div ref={adRef} {...getAdAttributes()}>
      {/* Add a label to make ad placements more visible during development */}
      <div className="text-xs text-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        Advertisement Space
      </div>
    </div>
  );
}

/**
 * AdSenseInArticle component for displaying in-article ads
 *
 * @param props Component props
 * @returns AdSense component with in-article layout
 */
export function AdSenseInArticle({
  className,
  slot = '3940256099',
}: Partial<Omit<AdSenseProps, 'layout' | 'format'>>) {
  return (
    <div className={cn('my-8 relative', className)}>
      <div className="text-xs text-gray-500 absolute -top-4 left-0 pointer-events-none">
        Advertisement
      </div>
      <AdSense
        slot={slot}
        layout="in-article"
        fullWidth
      />
    </div>
  );
}

/**
 * AdSenseInFeed component for displaying in-feed ads
 *
 * @param props Component props
 * @returns AdSense component with in-feed layout
 */
export function AdSenseInFeed({
  className,
  slot = '1154567389',
}: Partial<Omit<AdSenseProps, 'layout' | 'format'>>) {
  return (
    <div className={cn('my-6', className)}>
      <AdSense
        slot={slot}
        layout="in-feed"
        fullWidth
      />
    </div>
  );
}

/**
 * AdSenseSidebar component for displaying sidebar ads
 *
 * @param props Component props
 * @returns AdSense component for sidebar
 */
export function AdSenseSidebar({
  className,
  slot = '7259870876',
}: Partial<Omit<AdSenseProps, 'format'>>) {
  return (
    <div className={cn('my-6', className)}>
      <AdSense
        slot={slot}
        format="vertical"
        responsive={false}
        style={{ minHeight: '600px', minWidth: '160px' }}
      />
    </div>
  );
}

/**
 * AdSenseLeaderboard component for displaying leaderboard ads
 *
 * @param props Component props
 * @returns AdSense component for leaderboard
 */
export function AdSenseLeaderboard({
  className,
  slot = '6487384954',
}: Partial<Omit<AdSenseProps, 'format'>>) {
  return (
    <div className={cn('my-6 mx-auto max-w-[728px] relative', className)}>
      <div className="text-xs text-gray-500 absolute -top-4 left-0 pointer-events-none">
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
