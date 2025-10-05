'use client';

import React, { useState, useEffect, useRef } from 'react';
// import { useCallback } from 'react';
import Image from 'next/image';
import { affiliatePartners, getAffiliateLogoFallback, AffiliatePartner } from '@/src/data/affiliatePartners';

interface AffiliatePartnersProps {
  className?: string;
  maxPartners?: number;
  showHeader?: boolean;
}

const AffiliatePartners: React.FC<AffiliatePartnersProps> = ({
  className = '',
  maxPartners,
  showHeader = true
}) => {
  const [_isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Filter and limit partners
  const displayPartners = maxPartners
    ? affiliatePartners.slice(0, maxPartners)
    : affiliatePartners;

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // All partners are displayed by default for performance
  // Verification can be implemented server-side in the future

  // Track affiliate link clicks for analytics
  const handleAffiliateClick = (partnerName: string, url: string) => {
    // Track the click event using our analytics utility
    if (typeof window !== 'undefined') {
      // Log for debugging (remove in production)
      console.log(`Affiliate click tracked: ${partnerName} -> ${url}`);

      // Track with Google Analytics if available
      if (window.gtag) {
        window.gtag('event', 'affiliate_click', {
          event_category: 'affiliate',
          event_label: partnerName,
          affiliate_url: url,
          value: 1
        });
      }
    }

    // Open link in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      ref={sectionRef}
      className={`bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 ${className}`}
      aria-labelledby="affiliate-partners-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showHeader && (
          <div className="text-center mb-10">
            <h2
              id="affiliate-partners-heading"
              className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative inline-block after:content-[''] after:absolute after:w-16 after:h-0.5 after:bg-[#C9A14A] after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:-mb-2 pb-2"
            >
              Our Trusted Partners
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We partner with world-class travel services to bring you exclusive deals and premium experiences.
            </p>
          </div>
        )}


        {/* Partners Grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8"
          role="list"
          aria-label="Affiliate partners"
        >
          {displayPartners.map((partner, index) => {

            return (
              <div key={partner.name} role="listitem" className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="group block relative bg-white rounded-xl border border-gray-200 hover:border-[#C9A14A]/30 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#C9A14A] focus-visible:ring-offset-2 p-6 h-full flex flex-col items-center justify-center text-center"
                  aria-label={`Visit ${partner.name} - ${partner.description}. Opens in new tab.`}
                  onError={(e) => {
                    // Fallback to placeholder if logo fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== getAffiliateLogoFallback(partner.name)) {
                      target.src = getAffiliateLogoFallback(partner.name);
                    }
                  }}
                  onKeyDown={(e) => {
                    // Enhanced keyboard navigation
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleAffiliateClick(partner.name, partner.url);
                    }
                  }}
                  onClick={() => handleAffiliateClick(partner.name, partner.url)}
                >
                  {/* Partner Logo */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      fill
                      className="object-contain transition-all duration-300"
                      sizes="(max-width: 640px) 96px, 112px"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getAffiliateLogoFallback(partner.name);
                        target.className = target.className.replace(/transition-all[^0]*duration-300/g, 'opacity-50 transition-opacity duration-300');
                      }}
                    />
                  </div>

                  {/* Partner Name */}
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-[#C9A14A] transition-colors duration-300 mb-2">
                    {partner.name}
                  </h3>

                  {/* Partner Description */}
                  <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                    {partner.description}
                  </p>


                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#C9A14A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />

                  {/* External Link Indicator */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-4 h-4 text-[#C9A14A]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Partnerships help support our content creation. We only recommend services we trust.
          </p>
        </div>
      </div>

    </section>
  );
};

export default AffiliatePartners;