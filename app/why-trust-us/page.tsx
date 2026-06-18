import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Why Trust Global Travel Report',
  description: 'Global Travel Report explains its editorial standards, source transparency, sponsorship disclosure and correction principles.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.globaltravelreport.com'}/why-trust-us`,
  },
};

const principles = [
  {
    title: 'Source-aware reporting',
    body: 'Stories are based on travel industry updates, public information, operator announcements, destination material and other relevant source references. We aim to preserve factual claims rather than embellish them.',
  },
  {
    title: 'Australian reader context',
    body: 'Coverage is written for Australian travellers, with practical notes about timing, planning, official advice and booking considerations where relevant.',
  },
  {
    title: 'Clear sponsorship disclosure',
    body: 'Commercial placements, affiliate offers and sponsor modules are labelled. Sponsors do not control editorial wording or story conclusions.',
  },
  {
    title: 'Corrections and caution',
    body: 'Travel rules, prices, routes and safety advice can change quickly. Where details are unclear, we use cautious language and encourage readers to confirm with official sources.',
  },
];

export default function WhyTrustUsPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-[#C9A14A]/30 bg-[#F8F5EC]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8A6A20]">
            Editorial trust
          </p>
          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-[#19273A] sm:text-5xl">
            Why trust Global Travel Report
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-700">
            We publish travel news and practical context for readers who need clear, cautious information
            before they plan, book or travel.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {principles.map((principle) => (
            <article key={principle.title} className="rounded-lg border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#19273A]">{principle.title}</h2>
              <p className="mt-3 text-sm leading-7 text-gray-700">{principle.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-[#C9A14A]/40 bg-[#F8F5EC] p-6">
          <h2 className="text-xl font-bold text-[#19273A]">Corrections and source feedback</h2>
          <p className="mt-3 text-sm leading-7 text-gray-700">
            If you spot an error, outdated information or missing source context, contact the editorial desk.
            We review correction requests and update stories where the change can be verified.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-md bg-[#19273A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2A3F5F]"
          >
            Contact Editorial
          </Link>
        </div>
      </section>
    </main>
  );
}
