import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Global Travel Report',
  description: 'Learn how Global Travel Report covers travel news for Australian readers, including editorial standards, source transparency and sponsorship disclosure.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/about`,
  },
  openGraph: {
    title: 'About Global Travel Report',
    description: 'Independent travel news, source-aware story curation and practical context for Australian travellers.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/about`,
    siteName: 'Global Travel Report',
    type: 'website',
    locale: 'en_AU',
  },
};

const standards = [
  'We write for Australian travellers and use Australian English.',
  'We separate editorial coverage from sponsored placements and affiliate links.',
  'We avoid invented prices, dates, routes, warnings, entry rules or official advice.',
  'We add practical context where it helps readers understand who is affected and what to check next.',
];

export default function AboutPage() {
  return (
    <main className="bg-[#F7F4ED]">
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6A20]">
            About the newsroom
          </p>
          <h1 className="text-4xl font-black tracking-tight text-[#19273A] sm:text-5xl">
            Global Travel Report covers travel news with practical context.
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-700">
            Global Travel Report is a Sydney-based travel publication focused on air travel, cruise,
            accommodation, destinations, travel deals, safety and travel technology for Australian readers.
          </p>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-[#19273A]">How we work</h2>
            <div className="mt-6 space-y-5 text-base leading-7 text-gray-700">
              <p>
                Our editorial desk reviews travel industry updates, public travel information, operator
                announcements and destination news, then rewrites coverage in clear language for travellers.
              </p>
              <p>
                When a story is based on external source material, we preserve the factual claims and avoid
                overstating details that are not explicit in the source. Readers should always confirm booking
                terms, official travel advice and entry requirements with the relevant provider or authority.
              </p>
              <p>
                Sponsorship and affiliate placements help fund the site, but paid placements do not determine
                editorial conclusions. Sponsored modules are labelled and external commercial links use
                appropriate disclosure language.
              </p>
            </div>
          </div>

          <aside className="rounded-lg border border-[#C9A14A]/40 bg-[#F8F5EC] p-6">
            <h2 className="text-lg font-bold text-[#19273A]">Editorial standards</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
              {standards.map((standard) => (
                <li key={standard} className="flex gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#C9A14A]" aria-hidden="true" />
                  <span>{standard}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Link href="/why-trust-us" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:bg-[#F8F5EC]">
            <h2 className="text-lg font-bold text-[#19273A]">Why trust us</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Read more about our sourcing, transparency and correction principles.
            </p>
          </Link>
          <Link href="/contact" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:bg-[#F8F5EC]">
            <h2 className="text-lg font-bold text-[#19273A]">Contact editorial</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Send story tips, corrections, commercial enquiries or source feedback.
            </p>
          </Link>
          <Link href="/privacy-policy" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:bg-[#F8F5EC]">
            <h2 className="text-lg font-bold text-[#19273A]">Privacy</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Review how newsletter and website data is handled.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
