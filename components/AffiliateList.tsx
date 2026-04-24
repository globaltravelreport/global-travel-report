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
        >
          <div className="flex items-start gap-3">

            {/* Standardised Logo Container */}
            <div className="h-[60px] flex items-center justify-center bg-white rounded-md p-2">
              {a.logoUrl ? (
                <img
                  src={a.logoUrl}
                  alt={a.name}
                  className="max-h-[40px] max-w-[120px] object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-sm font-semibold text-gray-900 text-center">
                  {a.name}
                </span>
              )}
            </div>

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
