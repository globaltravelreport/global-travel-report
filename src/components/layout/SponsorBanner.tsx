import Link from 'next/link';
import { BadgePercent } from 'lucide-react';

const sponsorUrl = 'https://www.interlinetravelasia.com/';

export default function SponsorBanner() {
  return (
    <section
      aria-label="Website sponsor"
      className="w-full border-y border-[#C9A14A]/55 bg-[#F8F5EC] text-[#19273A] shadow-[0_1px_0_rgba(25,39,58,0.08)]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:gap-5 lg:py-2.5">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex shrink-0 items-center gap-2 rounded-md border border-[#C9A14A]/70 bg-white/70 px-2 py-2 text-[#19273A] shadow-sm sm:px-3"
              aria-hidden="true"
            >
              <BadgePercent className="h-4 w-4 text-[#C9A14A]" strokeWidth={2.4} />
              <span className="hidden whitespace-nowrap text-xs font-bold uppercase tracking-[0.08em] sm:inline">
                Industry Rates
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-[#19273A]">
                  Sponsored by Interline Travel Asia
                </p>
                <span className="hidden h-4 w-px bg-[#C9A14A]/50 sm:inline-block" aria-hidden="true" />
                <p className="text-xs font-medium text-[#5D6470] sm:text-sm">
                  Exclusive travel industry rates for airline, cruise, hospitality, and travel professionals.
                </p>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#6B5D35]">
                Profits from bookings generated through this website support The Salvation Army.
              </p>
            </div>
          </div>

          <Link
            href={sponsorUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex shrink-0 items-center justify-center rounded-md border border-[#C9A14A] bg-[#19273A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2A3F5F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A14A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F5EC]"
          >
            View Industry Rates
          </Link>
        </div>
      </div>
    </section>
  );
}
