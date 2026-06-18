'use client';

import Link from 'next/link';

type InterlineSponsorPlacementProps = {
  variant?: 'inline' | 'compact' | 'newsletter';
  className?: string;
};

const sponsorUrl = 'https://www.interlinetravelasia.com/';

export default function InterlineSponsorPlacement({
  variant = 'inline',
  className = '',
}: InterlineSponsorPlacementProps) {
  const compact = variant === 'compact';

  return (
    <aside
      aria-label="Sponsored travel industry offer"
      className={`rounded-lg border border-[#C9A14A]/50 bg-[#F8F5EC] text-[#19273A] ${compact ? 'p-4' : 'p-5 sm:p-6'} ${className}`}
    >
      <div className={compact ? 'space-y-3' : 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8A6A20]">
            Sponsored industry offer
          </p>
          <h2 className={`${compact ? 'text-base' : 'text-lg'} font-bold`}>
            Interline Travel Asia industry rates
          </h2>
          <p className={`${compact ? 'mt-1 text-sm' : 'mt-2 text-sm leading-6'} text-[#5D6470]`}>
            Exclusive travel industry rates for airline, cruise, hospitality, and travel professionals.
          </p>
          {variant === 'newsletter' && (
            <p className="mt-2 text-xs leading-5 text-[#6B5D35]">
              Newsletter sponsorship helps keep Global Travel Report free to read.
            </p>
          )}
        </div>
        <Link
          href={sponsorUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex shrink-0 items-center justify-center rounded-md border border-[#C9A14A] bg-[#19273A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2A3F5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A14A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F5EC]"
        >
          View Industry Rates
        </Link>
      </div>
    </aside>
  );
}
