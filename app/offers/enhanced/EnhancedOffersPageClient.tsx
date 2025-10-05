'use client';

import React, { useState } from 'react';
import { affiliatePartners } from '@/src/data/affiliatePartners';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AffiliateDisclosure } from '@/src/components/legal/AffiliateDisclosure';
import { createTrackedAffiliateLink, getCurrentPageContext } from '@/src/lib/enhancedAffiliateTracking';
import Image from 'next/image';

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

export default function EnhancedOffersPageClient({
  promotionalOffers,
  partnersByCategory
}: EnhancedOffersPageClientProps) {
  const context = getCurrentPageContext();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleDealClick = (partnerName: string, partnerUrl: string) => {
    const trackedLink = createTrackedAffiliateLink(
      partnerName.toLowerCase().replace(/\s+/g, '-'),
      partnerUrl,
      { ...context, section: 'featured_deals' }
    );

    // Track the click
    if (trackedLink.onClick) {
      trackedLink.onClick({} as any);
    }

    // Redirect to the affiliate link
    window.open(trackedLink.url, '_blank');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setSubmitMessage('Please enter a valid email address');
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
        setSubmitMessage('Thank you for subscribing! Check your email for confirmation.');
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Exclusive Travel Deals & Offers
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Save on your next adventure with our handpicked selection of travel deals from trusted partners
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm">Travel Deals</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm">Trusted Partners</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Disclosure */}
      <section className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AffiliateDisclosure variant="banner" />
        </div>
      </section>

      {/* Featured Deals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Deals</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't miss these limited-time offers from our top travel partners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {promotionalOffers.filter(offer => offer.featured).map((offer) => {
              const partner = affiliatePartners.find(p => p.name === offer.partner);
              if (!partner) return null;

              return (
                <Card key={offer.id} className="relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-100 text-red-800">🔥 HOT DEAL</Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{offer.title}</CardTitle>
                      <Badge variant="outline" className="text-lg font-bold text-green-600">
                        {offer.discount}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                          <Image
                            src={partner.logo}
                            alt={`${partner.name} logo`}
                            fill
                            className="object-contain"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="font-medium">{partner.name}</p>
                          <p className="text-sm text-gray-500">Valid until {offer.validUntil}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDealClick(partner.name, partner.url)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        Claim Deal
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find the perfect travel services and deals for your needs
            </p>
          </div>

          {Object.entries(partnersByCategory).map(([category, partners]) => (
            <div key={category} className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                  <Card key={partner.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                          <Image
                            src={partner.logo}
                            alt={`${partner.name} logo`}
                            fill
                            className="object-contain"
                            sizes="64px"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{partner.name}</CardTitle>
                          <Badge variant="outline">{category}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4">{partner.description}</p>
                      <button
                        onClick={() => handleDealClick(partner.name, partner.url)}
                        className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm rounded-lg transition-colors"
                      >
                        Visit {partner.name}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Never Miss a Deal
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Subscribe to our newsletter and be the first to know about exclusive travel deals and offers.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              disabled={isSubmitting}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {submitMessage && (
            <p className={`mt-4 text-sm ${submitMessage.includes('Thank you') ? 'text-green-600' : 'text-red-600'}`}>
              {submitMessage}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}