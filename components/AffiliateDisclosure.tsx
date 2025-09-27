'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Subtle, site-wide affiliate disclosure.
 * Renders a compact bar below the header.
 */
export default function AffiliateDisclosure() {
  return (
    <div className="w-full bg-[#fff8e1] text-[#5a4b00] border-b border-[#f0e0a0]">
      <div className="max-w-7xl mx-auto px-4 py-2 text-xs sm:text-sm leading-snug">
        <span className="font-semibold">Disclosure:</span>{' '}
        Some links on this site are affiliate links. If you click and make a purchase, we may earn a commission at no extra cost to you.{' '}
        <Link href="/resources" className="underline hover:no-underline font-medium">
          Learn more
        </Link>
        .
      </div>
    </div>
  );
}