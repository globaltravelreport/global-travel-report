'use client';

import React from 'react';
import { AFFILIATES, getAffiliate, AffiliateMeta } from '@/lib/affiliateLinks';

type Size = 'sm' | 'md' | 'lg';

export default function AffiliateCta({
  id,
  size = 'md',
  className = '',
}: {
  id: string;
  size?: Size;
  className?: string;
}) {
  const meta = getAffiliate(id) as AffiliateMeta | undefined;
  if (!meta) return null;

  const paddings =
    size === 'lg' ? 'px-6 py-5' : size === 'sm' ? 'px-3 py-2' : 'px-4 py-3';
  const titleSize =
    size === 'lg' ? 'text-lg' : size === 'sm' ? 'text-sm' : 'text-base';
  const descSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <a
      href={meta.href}
      target="_blank"
      rel="sponsored noopener nofollow"
      className={`group rounded-xl border shadow-sm hover:shadow-md transition-all ${paddings} ${className}`}
      style={{
        background: meta.brandColor ? `${meta.brandColor}15` : undefined,
        borderColor: meta.brandColor ? `${meta.brandColor}40` : 'rgba(0,0,0,.06)',
      }}
      aria-label={`${meta.name} – ${meta.short}`}
    >
      <div className="flex items-center gap-3">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-base"
          style={{
            background: meta.brandColor || '#C9A14A',
            color: meta.brandTextColor || '#fff',
          }}
        >
          {meta.iconEmoji || '🧭'}
        </span>
        <div className="min-w-0">
          <div className={`font-semibold leading-tight ${titleSize}`}>
            {meta.name}
          </div>
          <div className={`text-gray-600 leading-snug ${descSize}`}>
            {meta.short}
          </div>
        </div>
      </div>
    </a>
  );
}

/**
 * Compact grid of affiliates, useful for home mid-section or footers.
 */
export function AffiliateCtaGrid({
  ids = AFFILIATES.map((a) => a.id),
  limit,
  columns = 3,
  size = 'md',
  className = '',
}: {
  ids?: string[];
  limit?: number;
  columns?: 2 | 3 | 4;
  size?: Size;
  className?: string;
}) {
  const list = (ids || []).map(getAffiliate).filter(Boolean) as AffiliateMeta[];
  const sliced = typeof limit === 'number' ? list.slice(0, limit) : list;

  const gridCols =
    columns === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={`grid gap-3 ${gridCols} ${className}`}>
      {sliced.map((a) => (
        <AffiliateCta key={a.id} id={a.id} size={size} />
      ))}
    </div>
  );
}