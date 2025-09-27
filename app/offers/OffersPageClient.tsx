'use client';

import Link from 'next/link';
import Image from 'next/image';

// Interface for offer data
interface Offer {
  title: string;
  description: string;
  affiliate_url: string;
  price: string;
  currency: string;
  category: string;
  partner: string;
  partner_logo: string;
  validFrom: string;
  validUntil: string;
  lastUpdated: string;
  source: string;
}

interface PartnerOffers {
  partner: string;
  partnerKey: string;
  logo: string;
  baseUrl: string;
  offers: Offer[];
  lastUpdated: string;
  totalOffers: number;
}

interface OffersPageClientProps {
  partnerOffers: PartnerOffers[];
}

export default function OffersPageClient({ partnerOffers }: OffersPageClientProps) {
  const allOffers = partnerOffers.flatMap(partner => partner.offers);

  // Category configuration for better organization
  const CATEGORY_CONFIG = {
    accommodation: {
      name: 'Accommodation',
      icon: '🏨',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-900'
    },
    transportation: {
      name: 'Transportation',
      icon: '✈️',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-900'
    },
    connectivity: {
      name: 'Connectivity',
      icon: '📱',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-900'
    },
    security: {
      name: 'Security & Privacy',
      icon: '🔒',
      color: 'bg-orange-50 border-orange-200',
      textColor: 'text-orange-900'
    },
    finance: {
      name: 'Financial Services',
      icon: '💳',
      color: 'bg-indigo-50 border-indigo-200',
      textColor: 'text-indigo-900'
    },
    packages: {
      name: 'Travel Packages',
      icon: '🎒',
      color: 'bg-pink-50 border-pink-200',
      textColor: 'text-pink-900'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/destinations-hero.jpg"
          alt="Exclusive travel deals and offers from trusted partners"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Exclusive Travel Deals
          </h1>
          <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            Save on your next adventure with exclusive offers from our trusted travel partners
          </p>
        </div>
      </section>

      {/* Offers Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why Choose Our Partner Deals?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We've carefully selected these partners for their reliability, quality service, and competitive pricing.
            Each offer is verified and updated regularly to ensure you get the best value.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-[#C9A14A] mb-2">{partnerOffers.length}</div>
            <div className="text-sm text-gray-600">Trusted Partners</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-[#C9A14A] mb-2">{allOffers.length}</div>
            <div className="text-sm text-gray-600">Active Offers</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-[#C9A14A] mb-2">24/7</div>
            <div className="text-sm text-gray-600">Offer Updates</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-[#C9A14A] mb-2">100%</div>
            <div className="text-sm text-gray-600">Verified Deals</div>
          </div>
        </div>

        {/* All Offers */}
        {allOffers.length > 0 ? (
          <div className="space-y-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
              Current Offers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOffers.map((offer, index) => {
                const categoryConfig = CATEGORY_CONFIG[offer.category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.accommodation;

                return (
                  <div key={`${offer.partner}-${index}`} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                    {/* Partner Header */}
                    <div className="relative h-20 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-center">
                      <div className="relative w-16 h-16">
                        <Image
                          src={offer.partner_logo}
                          alt={`${offer.partner} logo`}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                    </div>

                    {/* Offer Content */}
                    <div className="p-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-3 ${categoryConfig.color} ${categoryConfig.textColor}`}>
                        <span className="mr-2">{categoryConfig.icon}</span>
                        {categoryConfig.name}
                      </div>

                      <h4 className="text-xl font-bold text-gray-900 mb-2">{offer.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {offer.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-[#C9A14A]">
                          {offer.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          Valid until {new Date(offer.validUntil).toLocaleDateString()}
                        </div>
                      </div>

                      <a
                        href={offer.affiliate_url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
                        onClick={() => {
                          // Track offer clicks
                          if (typeof window !== 'undefined' && (window as any).gtag) {
                            (window as any).gtag('event', 'offer_click', {
                              event_category: 'affiliate',
                              event_label: `${offer.partner} - ${offer.title}`,
                              value: 1
                            });
                          }
                        }}
                      >
                        Get This Deal
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <svg className="w-12 h-12 text-yellow-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Offers Loading</h3>
              <p className="text-yellow-700 text-sm">
                Our latest travel deals are being updated. Please check back soon for exclusive offers from our trusted partners.
              </p>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#C9A14A]/10 to-[#B89038]/10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need Help Planning Your Trip?
            </h3>
            <p className="text-gray-600 mb-6">
              Explore our comprehensive travel guides and discover more amazing destinations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/destinations"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#C9A14A] hover:bg-[#B89038] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
              >
                Explore Destinations
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
              >
                Meet Our Partners
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}