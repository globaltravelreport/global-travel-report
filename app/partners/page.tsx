'use client';

import Link from 'next/link';
import Image from 'next/image';
import { affiliatePartners, getAffiliateLogoFallback } from '@/src/data/affiliatePartners';


// Partner categories for better organization
const PARTNER_CATEGORIES = {
  'Accommodation': ['Trip.com'],
  'Transportation': ['Welcome Pickups', 'Kiwitaxi', 'GetRentacar.com'],
  'Connectivity': ['Yesim', 'Airalo'],
  'Travel Essentials': ['EKTA', 'Surfshark VPN', 'Surfshark One', 'Wise']
};

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/destinations-hero.jpg"
          alt="Global Travel Report trusted partners and collaborations"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Travel Partners
          </h1>
          <p className="text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
            We collaborate with world-class travel services to bring you exclusive deals and premium experiences
          </p>
        </div>
      </section>

      {/* Partners Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why We Partner With These Brands
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Each partner has been carefully selected for their commitment to quality, innovation, and exceptional customer service.
            We only recommend services we've personally tested and trust.
          </p>
        </div>

        {/* Partner Categories */}
        {Object.entries(PARTNER_CATEGORIES).map(([category, partnerNames]) => {
          const categoryPartners = affiliatePartners.filter(partner => partnerNames.includes(partner.name));

          return (
            <div key={category} className="mb-16">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
                {category}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryPartners.map((partner) => (
                  <div key={partner.name} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                    {/* Partner Header */}
                    <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <div className="relative w-24 h-24">
                        <Image
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          fill
                          className="object-contain"
                          sizes="96px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = getAffiliateLogoFallback(partner.name);
                          }}
                        />
                      </div>
                    </div>

                    {/* Partner Content */}
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">{partner.name}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {partner.description}
                      </p>

                      {/* Partner Benefits */}
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold text-gray-900 mb-2">Why We Recommend Them:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Trusted by millions of travelers worldwide</li>
                          <li>• Exceptional customer service and support</li>
                          <li>• Competitive pricing and exclusive deals</li>
                          <li>• Innovative solutions for modern travelers</li>
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        className="inline-flex items-center justify-center w-full px-4 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
                        onClick={() => {
                          // Track partner page clicks
                          if (typeof window !== 'undefined' && (window as any).gtag) {
                            (window as any).gtag('event', 'partner_page_click', {
                              event_category: 'affiliate',
                              event_label: partner.name,
                              value: 1
                            });
                          }
                        }}
                      >
                        Visit {partner.name}
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Partnership Benefits */}
        <div className="bg-gradient-to-r from-[#C9A14A]/10 to-[#B89038]/10 rounded-2xl p-8 md:p-12 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Benefits of Our Partnerships
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our partnerships allow us to bring you exclusive deals and premium experiences while maintaining our editorial independence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#C9A14A] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Exclusive Deals</h4>
              <p className="text-gray-600">Access special discounts and offers available only through our partnerships</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#C9A14A] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Quality Assurance</h4>
              <p className="text-gray-600">All partners are thoroughly tested and verified for reliability and service quality</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#C9A14A] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Enhanced Experience</h4>
              <p className="text-gray-600">Premium services and innovative solutions to enhance your travel experience</p>
            </div>
          </div>
        </div>

        {/* Partnership CTA */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Interested in Partnering With Us?
            </h3>
            <p className="text-gray-600 mb-6">
              We're always looking to collaborate with innovative travel brands that share our commitment to quality and customer satisfaction.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-[#C9A14A] hover:bg-[#B89038] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2"
            >
              Get in Touch
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}