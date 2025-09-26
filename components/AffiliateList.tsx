import React from 'react';
import { AFFILIATES } from '@/lib/affiliateLinks';

/**
 * Server-friendly affiliate list for the Resources page.
 */
export default function AffiliateList() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {AFFILIATES.map((a) => (
        <div
          key={a.id}
          className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all p-5"
          style={{
            borderColor: a.brandColor ? `${a.brandColor}40` : 'rgba(0,0,0,.06)',
            background: a.brandColor ? `${a.brandColor}08` : undefined
          }}
        >
          <div className="flex items-start gap-3">
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-lg"
              style={{
                background: a.brandColor || '#C9A14A',
                color: a.brandTextColor || '#fff'
              }}
              aria-hidden
            >
              {a.iconEmoji || '🧭'}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-lg">{a.name}</h3>
              <p className="text-gray-600 text-sm">{a.short}</p>
              <div className="mt-3">
                <a
                  href={a.href}
                  target="_blank"
                  rel="sponsored noopener nofollow"
                  className="inline-flex items-center px-3 py-2 rounded-md bg-[#19273A] text-white hover:bg-[#223650] text-sm"
                  aria-label={`${a.name} – ${a.short}`}
                >
                  Visit {a.name}
                </a>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            Category: {a.category}
          </div>
        </div>
      ))}
    </div>
  );
}