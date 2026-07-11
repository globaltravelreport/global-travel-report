'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Car, Check, CreditCard, Hotel, Mail, Plane, ShieldCheck, Smartphone, Tag } from 'lucide-react';
import { affiliatePartners } from '@/src/data/affiliatePartners';
import { AffiliateDisclosure } from '@/src/components/legal/AffiliateDisclosure';
import { createTrackedAffiliateLink, getCurrentPageContext } from '@/src/lib/enhancedAffiliateTracking';

interface PromotionalOffer { id: string; title: string; description: string; partner: string; discount: string; validUntil: string; featured: boolean; }
interface EnhancedOffersPageClientProps { promotionalOffers: PromotionalOffer[]; partnersByCategory: Record<string, typeof affiliatePartners>; }

const CATEGORY_ICONS = { Accommodation: Hotel, Transportation: Car, Connectivity: Smartphone, 'Travel Essentials': ShieldCheck, Finance: CreditCard, General: Tag };
const CATEGORY_LABELS: Record<string, string> = { Accommodation: 'Stay', Transportation: 'Move', Connectivity: 'Connect', 'Travel Essentials': 'Prepare', Finance: 'Pay' };

function getCategoryIcon(category: string) { return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Tag; }

export default function EnhancedOffersPageClient({ promotionalOffers, partnersByCategory }: EnhancedOffersPageClientProps) {
  const context = getCurrentPageContext();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = useMemo(() => Object.keys(partnersByCategory), [partnersByCategory]);
  const totalPartners = useMemo(() => Object.values(partnersByCategory).reduce((total, partners) => total + partners.length, 0), [partnersByCategory]);
  const featuredOffers = promotionalOffers.filter(offer => offer.featured);
  const visibleCategories = selectedCategory === 'All' ? Object.entries(partnersByCategory) : Object.entries(partnersByCategory).filter(([category]) => category === selectedCategory);

  const handleDealClick = (partnerName: string, partnerUrl: string) => {
    const trackedLink = createTrackedAffiliateLink(partnerName.toLowerCase().replace(/\s+/g, '-'), partnerUrl, { ...context, section: 'offers' });
    trackedLink.onClick?.(new MouseEvent('click'));
    window.open(trackedLink.url, '_blank', 'noopener,noreferrer');
  };

  const handleNewsletterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !email.includes('@')) { setSubmitMessage('Please enter a valid email address.'); return; }
    setIsSubmitting(true); setSubmitMessage('');
    try {
      const response = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      if (response.ok) { setSubmitMessage('You’re on the list. Watch your inbox for the next dispatch.'); setEmail(''); }
      else setSubmitMessage('Something went wrong. Please try again later.');
    } catch { setSubmitMessage('Network error. Please check your connection and try again.'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#172536]">
      <section className="border-b border-[#ded8cb] bg-[#f7f5ef]">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <p className="mb-5 text-xs font-black uppercase tracking-[0.28em] text-[#8a6a20]">The GTR travel desk · 2026</p>
              <h1 className="max-w-4xl text-5xl font-black leading-[.98] tracking-[-0.04em] sm:text-7xl">Travel smarter.<br /><span className="text-[#a57d28]">Spend better.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#536170]">A considered shortlist of services we’d actually use on the road—places to stay, ways to move, and tools that make a trip run more smoothly.</p>
              <div className="mt-9 flex flex-wrap gap-3"><a href="#partner-directory" className="inline-flex items-center gap-2 rounded-full bg-[#172536] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#30455d]">Browse the desk <ArrowUpRight className="h-4 w-4" /></a><span className="inline-flex items-center gap-2 rounded-full border border-[#cfc7b8] px-5 py-3 text-sm font-bold text-[#536170]"><Check className="h-4 w-4 text-[#a57d28]" /> {totalPartners} reviewed partners</span></div>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] bg-[#172536] p-7 text-white shadow-xl sm:p-9">
              <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border border-[#c9a14a]/40" /><div className="absolute -right-2 -top-2 h-24 w-24 rounded-full border border-[#c9a14a]/30" />
              <Plane className="mb-12 h-8 w-8 text-[#d4b35f]" />
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d4b35f]">Our standard</p>
              <p className="mt-4 max-w-sm text-2xl font-black leading-tight">Useful first. Transparent always. No made-up savings.</p>
              <div className="mt-10 grid grid-cols-2 gap-5 border-t border-white/15 pt-5 text-sm"><div><p className="text-3xl font-black">{categories.length}</p><p className="mt-1 text-slate-300">ways to plan</p></div><div><p className="text-3xl font-black">100%</p><p className="mt-1 text-slate-300">clear disclosure</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-[#ded8cb] bg-white"><div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8"><AffiliateDisclosure variant="banner" /></div></div>

      <section id="partner-directory" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 flex flex-col gap-5 border-b border-[#ded8cb] pb-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-[#8a6a20]">Browse the desk</p><h2 className="text-4xl font-black tracking-[-0.03em]">Good travel tools, sorted.</h2><p className="mt-3 max-w-xl text-[#536170]">Start with what you need most. Each partner opens in a new tab so you can compare before committing.</p></div><div className="flex flex-wrap gap-2">{['All', ...categories].map(category => <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${selectedCategory === category ? 'bg-[#172536] text-white' : 'border border-[#d5cfc3] bg-transparent text-[#536170] hover:border-[#172536] hover:text-[#172536]'}`}>{category === 'All' ? 'All services' : CATEGORY_LABELS[category] || category}</button>)}</div></div>

        {featuredOffers.length > 0 && <div className="mb-14 rounded-3xl bg-[#eee8d8] p-7 sm:p-10"><p className="text-xs font-black uppercase tracking-[0.25em] text-[#8a6a20]">Limited-time notes</p><div className="mt-6 grid gap-5 md:grid-cols-2">{featuredOffers.map(offer => { const partner = affiliatePartners.find(item => item.name === offer.partner); if (!partner) return null; return <article key={offer.id} className="rounded-2xl bg-white p-6"><span className="text-xs font-black uppercase tracking-wider text-[#8a6a20]">{offer.discount}</span><h3 className="mt-3 text-2xl font-black">{offer.title}</h3><p className="mt-2 text-sm leading-6 text-[#536170]">{offer.description}</p><button type="button" onClick={() => handleDealClick(partner.name, partner.url)} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#172536]">See offer <ArrowUpRight className="h-4 w-4" /></button></article>; })}</div></div>}

        <div className="space-y-16">{visibleCategories.map(([category, partners]) => { const Icon = getCategoryIcon(category); return <section key={category}><div className="mb-6 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eee8d8]"><Icon className="h-5 w-5 text-[#8a6a20]" /></div><div><h3 className="text-2xl font-black">{CATEGORY_LABELS[category] || category}</h3><p className="text-sm text-[#536170]">{partners.length} trusted option{partners.length === 1 ? '' : 's'}</p></div></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{partners.map(partner => <article key={partner.name} className="group flex h-full flex-col rounded-2xl border border-[#d8d1c4] bg-white p-6 shadow-[0_2px_10px_rgba(23,37,54,0.04)] transition hover:-translate-y-1 hover:border-[#c9a14a] hover:shadow-lg"><div className="flex min-h-[76px] items-center justify-between gap-4 rounded-xl border border-[#e5e0d7] bg-[#f7f8fa] px-4 py-3"><div className="relative h-14 w-44"><Image src={partner.logo} alt={partner.alt || `${partner.name} logo`} fill className="object-contain object-left" sizes="176px" /></div><span className="shrink-0 text-[10px] font-black uppercase tracking-[0.16em] text-[#6b7280]">Partner</span></div><h4 className="mt-6 text-xl font-black tracking-tight text-[#172536]">{partner.name}</h4><p className="mt-2 flex-1 text-[15px] leading-7 text-[#334155]">{partner.description}</p><button type="button" onClick={() => handleDealClick(partner.name, partner.url)} className="mt-6 inline-flex items-center gap-2 self-start border-b-2 border-[#c9a14a] pb-1 text-sm font-black text-[#172536] transition group-hover:text-[#8a6a20]">Visit {partner.name} <ArrowUpRight className="h-4 w-4" /></button></article>)}</div></section>; })}</div>
      </section>

      <section className="bg-[#172536] text-white"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_440px] lg:items-center lg:px-8 lg:py-20"><div><p className="text-xs font-black uppercase tracking-[0.25em] text-[#d4b35f]">The monthly dispatch</p><h2 className="mt-4 max-w-xl text-4xl font-black tracking-[-0.03em]">A few good finds, once in a while.</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">No daily noise. Just useful travel tools, thoughtful stories and the occasional verified offer.</p></div><form onSubmit={handleNewsletterSubmit} className="rounded-2xl bg-white p-5 text-[#172536] sm:p-6"><label htmlFor="offers-email" className="text-sm font-black">Your email address</label><div className="mt-3 flex flex-col gap-3 sm:flex-row"><input id="offers-email" type="email" placeholder="you@example.com" value={email} onChange={event => setEmail(event.target.value)} disabled={isSubmitting} required className="min-h-12 flex-1 rounded-lg border border-[#d5cfc3] px-4 outline-none focus:border-[#a57d28] focus:ring-2 focus:ring-[#ead9a8]" /><button type="submit" disabled={isSubmitting} className="min-h-12 rounded-lg bg-[#c9a14a] px-5 font-black text-[#172536] transition hover:bg-[#d7b963] disabled:opacity-60">{isSubmitting ? 'Joining…' : 'Join the list'}</button></div>{submitMessage && <p className="mt-3 text-sm text-[#536170]">{submitMessage}</p>}</form></div></section>
    </main>
  );
}
