'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { affiliatePartners } from '@/src/data/affiliatePartners';
import { createTrackedAffiliateLink, getCurrentPageContext } from '@/src/lib/enhancedAffiliateTracking';

interface PromotionalOffer { id: string; title: string; description: string; partner: string; discount: string; validUntil: string; featured: boolean; }
interface Props { promotionalOffers: PromotionalOffer[]; partnersByCategory: Record<string, typeof affiliatePartners>; }

const CATEGORIES = ['Accommodation', 'Transfers', 'eSIMs/Connectivity', 'Travel Insurance', 'Privacy', 'Finance'];

const OFFICIAL_LOGOS: Record<string, { src: string; source: string; dark?: boolean }> = {
  Airalo: { src: 'https://cdn-revamp.airalo.com/img/logo-homepage-header.png', source: 'Airalo media centre' },
  Wise: { src: 'https://d21buns5ku92am.cloudfront.net/69645/images/470347-01-Wise-logo-bright-green%20(1)-210bf3-large-1677594902.png', source: 'Wise newsroom' },
  'Surfshark VPN': { src: 'https://surfshark.com/wp-content/themes/surfshark/assets/img/logos/logo.svg', source: 'Surfshark press site' },
  'Surfshark One': { src: 'https://surfshark.com/wp-content/themes/surfshark/assets/img/logos/logo.svg', source: 'Surfshark press site' },
  Kiwitaxi: { src: 'https://ftcdn.kiwitaxi.com/app2/assets/icons/logo.svg', source: 'Kiwitaxi website' },
  EKTA: { src: 'https://ektatraveling.com/img/logo/company-new-white.svg', source: 'EKTA website', dark: true },
  'AMEX Platinum': { src: 'https://www.aexp-static.com/cdaas/one/statics/axp-dls/5.10.0/package/dist/img/dls_logos/dls-logo-bluebox-solid.svg', source: 'American Express design system' },
};

export default function EnhancedOffersPageClient({ partnersByCategory }: Props) {
  const context = getCurrentPageContext();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const partners = useMemo(() => partnersByCategory[selectedCategory] || [], [partnersByCategory, selectedCategory]);

  const visitPartner = (name: string, url: string) => {
    const tracked = createTrackedAffiliateLink(name.toLowerCase().replace(/\s+/g, '-'), url, { ...context, section: 'offers' });
    tracked.onClick?.(new MouseEvent('click'));
    window.open(tracked.url, '_blank', 'noopener,noreferrer');
  };

  const subscribe = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      setMessage(response.ok ? 'Thank you. You’re on the list.' : 'Please try again later.');
      if (response.ok) setEmail('');
    } catch { setMessage('Please check your connection and try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <main className="min-h-screen bg-[#f5f0e8] text-[#172536]">
      <section className="border-b border-[#d8d0c3]">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#7a5d1d]">Global Travel Report recommends</p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.025em] sm:text-5xl">Trusted Travel Partners</h1>
          <p className="mt-5 max-w-[65ch] text-lg leading-8 text-[#3f4d5b]">A concise directory of travel services independently selected by our editorial team for their practical relevance to travellers.</p>
          <p className="mt-7 max-w-[68ch] border-t border-[#d8d0c3] pt-5 text-base leading-7 text-[#4b5563]"><strong className="text-[#172536]">Affiliate disclosure:</strong> Some links are commercial partner links. We may receive a commission if you make a purchase, at no additional cost to you.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <h2 className="text-2xl font-bold">Partner directory</h2>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Partner categories">
          {CATEGORIES.map(category => <button key={category} type="button" role="tab" aria-selected={selectedCategory === category} onClick={() => setSelectedCategory(category)} className={`min-h-11 border px-4 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#172536] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f0e8] ${selectedCategory === category ? 'border-[#172536] bg-[#172536] text-white' : 'border-[#9f978a] bg-transparent text-[#172536] hover:bg-white'}`}>{category}</button>)}
        </div>

        <div className="mt-10 grid gap-x-10 gap-y-0 md:grid-cols-2" role="tabpanel">
          {partners.length === 0 && <p className="border-t border-[#d8d0c3] py-8 text-base text-[#3f4d5b] md:col-span-2">No current partners in this category.</p>}
          {partners.map(partner => {
            const logo = OFFICIAL_LOGOS[partner.name];
            return <article key={partner.name} className="border-t border-[#bfb7aa] py-8">
              <div className={`flex h-16 max-w-[220px] items-center ${logo?.dark ? 'bg-[#172536] px-4' : ''}`}>
                {logo ? <Image src={logo.src} alt={`${partner.name} logo`} width={220} height={64} className="max-h-14 w-auto max-w-full object-contain object-left" title={`Official asset source: ${logo.source}`} /> : <span className="text-sm font-semibold uppercase tracking-[0.14em] text-[#625d54]">Logo pending</span>}
              </div>
              <h3 className="mt-5 text-2xl font-bold tracking-[-0.015em]">{partner.name}</h3>
              <p className="mt-3 max-w-[60ch] text-base leading-7 text-[#3f4d5b]">{partner.description}.</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#6c531b]">{selectedCategory}</p>
              <button type="button" onClick={() => visitPartner(partner.name, partner.url)} className="mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-[#a9812d] text-base font-bold text-[#172536] outline-none transition hover:border-[#172536] focus-visible:ring-2 focus-visible:ring-[#172536] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f0e8]">Visit partner <ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="text-xs font-medium text-[#5f5a51]">Partner link</span></button>
            </article>;
          })}
        </div>
      </section>

      <section className="border-t border-[#d8d0c3] bg-[#172536] text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-2 md:items-center">
          <div><h2 className="text-2xl font-bold">The travel briefing</h2><p className="mt-3 max-w-[58ch] text-base leading-7 text-[#d9dee4]">Occasional reporting, useful resources and verified travel offers. No daily promotions.</p></div>
          <form onSubmit={subscribe}><label htmlFor="offers-email" className="text-sm font-semibold">Email address</label><div className="mt-2 flex flex-col gap-3 sm:flex-row"><input id="offers-email" type="email" value={email} onChange={event => setEmail(event.target.value)} required placeholder="you@example.com" className="min-h-11 flex-1 border border-white/50 bg-white px-4 text-[#172536] outline-none focus-visible:ring-2 focus-visible:ring-[#d4b35f]" /><button type="submit" disabled={submitting} className="min-h-11 bg-[#c9a14a] px-5 font-bold text-[#172536] outline-none hover:bg-[#d6b65f] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60">{submitting ? 'Joining…' : 'Subscribe'}</button></div>{message && <p className="mt-3 text-sm text-[#e5e7eb]">{message}</p>}</form>
        </div>
      </section>
    </main>
  );
}
