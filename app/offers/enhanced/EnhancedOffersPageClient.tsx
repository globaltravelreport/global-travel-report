'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, BadgeCheck, Car, CreditCard, Hotel, Mail, Plane, ShieldCheck, Smartphone, Tag } from 'lucide-react';
import { affiliatePartners } from '@/src/data/affiliatePartners';
import { AffiliateDisclosure } from '@/src/components/legal/AffiliateDisclosure';
import { createTrackedAffiliateLink, getCurrentPageContext } from '@/src/lib/enhancedAffiliateTracking';

interface PromotionalOffer {
  id: string;
  title: string;
  description: string;
  partner: string;
  discount: string;
  validUntil: string;
  featured: boolean;
}

interface EnhancedOffersPageClientProps {
  promotionalOffers: PromotionalOffer[];
  partnersByCategory: Record<string, typeof affiliatePartners>;
}

const CATEGORY_ICONS = {
  Accommodation: Hotel,
  Transportation: Car,
  Connectivity: Smartphone,
  'Travel Essentials': ShieldCheck,
  Finance: CreditCard,
  General: Tag,
};

function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS] || Tag;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function EnhancedOffersPageClient({
  promotionalOffers,
  partnersByCategory
}: EnhancedOffersPageClientProps) {
  const context = getCurrentPageContext();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => Object.keys(partnersByCategory), [partnersByCategory]);
  const totalPartners = useMemo(
    () => Object.values(partnersByCategory).reduce((total, partners) => total + partners.length, 0),
    [partnersByCategory]
  );
  const featuredOffers = promotionalOffers.filter(offer => offer.featured);
  const visibleCategories = selectedCategory === 'All'
    ? Object.entries(partnersByCategory)
    : Object.entries(partnersByCategory).filter(([category]) => category === selectedCategory);

  const handleDealClick = (partnerName: string, partnerUrl: string) => {
    const trackedLink = createTrackedAffiliateLink(
      partnerName.toLowerCase().replace(/\s+/g, '-'),
      partnerUrl,
      { ...context, section: 'offers' }
    );

    if (trackedLink.onClick) {
      trackedLink.onClick(new MouseEvent('click'));
    }

    window.open(trackedLink.url, '_blank', 'noopener,noreferrer');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setSubmitMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitMessage('Thank you for subscribing. Check your email for confirmation.');
        setEmail('');
      } else {
        setSubmitMessage('Something went wrong. Please try again later.');
      }
    } catch (_error) {
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f8] text-slate-950">
      <section className="relative overflow-hidden bg-slate-950">
        <Image
          src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&q=80&w=2400"
          alt="Travel essentials laid out on a table"
          fill
          className="object-cover opacity-35"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/86 to-slate-950/36" />
        <div className="relative mx-auto flex min-h-[430px] max-w-7xl flex-col justify-end px-4 pb-12 pt-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              <BadgeCheck className="h-4 w-4 text-[#C9A14A]" />
              Partner offers reviewed for travellers
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Travel Deals & Offers
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              A practical directory of booking, transfer, eSIM, insurance, privacy and finance partners for planning trips with less friction.
            </p>
          </div>
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Partners', value: totalPartners },
              { label: 'Categories', value: categories.length },
              { label: 'Featured', value: featuredOffers.length },
              { label: 'Updated', value: 'Daily' },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="text-2xl font-black text-white">{item.value}</div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-300">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <AffiliateDisclosure variant="banner" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Featured Offers</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Current partner promotions with clear expiry dates and direct tracking.
            </p>
          </div>
          <a href="#partner-directory" className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-[#9f7b30]">
            Browse all partners
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {featuredOffers.map((offer) => {
            const partner = affiliatePartners.find(p => p.name === offer.partner);
            if (!partner) return null;

            return (
              <article key={offer.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex h-full flex-col p-6">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-[#C9A14A]/15 px-3 py-1 text-xs font-black uppercase tracking-wide text-[#7a5f22]">
                        {offer.discount}
                      </span>
                      <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{offer.title}</h3>
                    </div>
                    <div className="relative h-12 w-28 shrink-0">
                      <Image src={partner.logo} alt={`${partner.name} logo`} fill className="object-contain" sizes="112px" />
                    </div>
                  </div>

                  <p className="min-h-12 text-slate-600">{offer.description}</p>

                  <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-bold text-slate-950">{partner.name}</div>
                      <div className="text-sm text-slate-500">Valid until {formatDate(offer.validUntil)}</div>
                    </div>
                    <button
                      onClick={() => handleDealClick(partner.name, partner.url)}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-[#9f7b30] focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
                      type="button"
                    >
                      Claim Deal
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="partner-directory" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">Partner Directory</h2>
            <p className="mt-2 max-w-2xl text-slate-600">
              Filter by the service you need, then compare providers before you leave the site.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', ...categories].map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                  type="button"
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-10">
          {visibleCategories.map(([category, partners]) => {
            const Icon = getCategoryIcon(category);
            return (
              <section key={category}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm ring-1 ring-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{category}</h3>
                    <p className="text-sm text-slate-500">{partners.length} partner{partners.length === 1 ? '' : 's'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {partners.map((partner) => (
                    <article key={partner.name} className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <div className="relative h-11 w-28">
                          <Image src={partner.logo} alt={`${partner.name} logo`} fill className="object-contain object-left" sizes="112px" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{category}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-950">{partner.name}</h4>
                      <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{partner.description}</p>
                      <button
                        onClick={() => handleDealClick(partner.name, partner.url)}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                        type="button"
                      >
                        Visit Partner
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-[#f1d07a]">
              <Plane className="h-4 w-4" />
              Deal alerts
            </div>
            <h2 className="text-3xl font-black tracking-tight">Never Miss a Useful Travel Offer</h2>
            <p className="mt-3 max-w-2xl text-slate-300">
              Get selected travel deals, partner updates and practical planning links in your inbox.
            </p>
          </div>
          <form onSubmit={handleNewsletterSubmit} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
            <label htmlFor="offers-email" className="mb-2 block text-sm font-bold text-slate-200">
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="offers-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 flex-1 rounded-md border border-white/20 bg-white px-4 text-slate-950 outline-none focus:ring-2 focus:ring-[#C9A14A]"
                disabled={isSubmitting}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-[#C9A14A] px-5 font-black text-slate-950 transition hover:bg-[#d8b866] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Mail className="h-4 w-4" />
                {isSubmitting ? 'Subscribing' : 'Subscribe'}
              </button>
            </div>
            {submitMessage && (
              <p className={`mt-3 text-sm ${submitMessage.includes('Thank you') ? 'text-emerald-300' : 'text-red-300'}`}>
                {submitMessage}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
