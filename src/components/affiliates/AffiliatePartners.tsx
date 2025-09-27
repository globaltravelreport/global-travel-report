'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { affiliatePartners, getAffiliateLogoFallback, AffiliatePartner } from '@/src/data/affiliatePartners';

interface VerificationStatus {
  [key: string]: {
    isValid: boolean;
    responseTime: number;
    error?: string;
  };
}

interface AffiliatePartnersProps {
  className?: string;
  maxPartners?: number;
  showHeader?: boolean;
  enableVerification?: boolean;
}

const AffiliatePartners: React.FC<AffiliatePartnersProps> = ({
  className = '',
  maxPartners,
  showHeader = true,
  enableVerification = true
}) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({});
  const [isLoading, setIsLoading] = useState(enableVerification);
  const [hasError, setHasError] = useState(false);

  // Filter and limit partners
  const displayPartners = maxPartners
    ? affiliatePartners.slice(0, maxPartners)
    : affiliatePartners;

  // Verify affiliate links
  const verifyLinks = useCallback(async () => {
    if (!enableVerification) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);

      const urls = displayPartners.map(partner => partner.url);
      const response = await fetch(`/api/affiliates/verify?urls=${encodeURIComponent(urls.join(','))}`);

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setVerificationStatus(data.results);
      } else {
        throw new Error(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Affiliate verification error:', error);
      setHasError(true);
      // Set all as valid on error to avoid hiding partners
      const fallbackStatus: VerificationStatus = {};
      displayPartners.forEach(partner => {
        fallbackStatus[partner.url] = { isValid: true, responseTime: 0 };
      });
      setVerificationStatus(fallbackStatus);
    } finally {
      setIsLoading(false);
    }
  }, [displayPartners, enableVerification]);

  // Initial verification
  useEffect(() => {
    verifyLinks();
  }, [verifyLinks]);

  // Helper function to get verification status for a partner
  const getPartnerStatus = (partner: AffiliatePartner) => {
    return verificationStatus[partner.url];
  };

  // Helper function to determine if partner should be displayed
  const shouldDisplayPartner = (partner: AffiliatePartner) => {
    if (!enableVerification) return true;
    const status = getPartnerStatus(partner);
    return status ? status.isValid : true; // Show by default if not verified yet
  };

  return (
    <section
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A]"></div>
            <span className="ml-3 text-gray-600">Verifying partner links...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-yellow-800 text-sm">
                ⚠️ Some partner links may be temporarily unavailable. Partners will appear as they become available.
              </p>
            </div>
          </div>
        )}

        {/* Partners Grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 lg:gap-8"
          role="list"
          aria-label="Affiliate partners"
        >
          {displayPartners.map((partner, index) => {
            const status = getPartnerStatus(partner);
            const isValid = shouldDisplayPartner(partner);

            if (!isValid) return null;

            return (
              <div key={partner.name} role="listitem" className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="group block relative bg-white rounded-xl border border-gray-200 hover:border-[#C9A14A]/30 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 p-6 h-full flex flex-col items-center justify-center text-center"
                  aria-label={`Visit ${partner.name} - ${partner.description}`}
                  onError={(e) => {
                    // Fallback to placeholder if logo fails to load
                    const target = e.target as HTMLImageElement;
                    if (target.src !== getAffiliateLogoFallback(partner.name)) {
                      target.src = getAffiliateLogoFallback(partner.name);
                    }
                  }}
                >
                  {/* Partner Logo */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 flex-shrink-0">
                    <Image
                      src={partner.logo}
                      alt={`${partner.name} logo`}
                      fill
                      className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      sizes="(max-width: 640px) 64px, 80px"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getAffiliateLogoFallback(partner.name);
                        target.className = target.className.replace(/filter\s+grayscale[^0]*group-hover:grayscale-0/g, 'opacity-50');
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

                  {/* Status Indicator */}
                  {status && (
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          status.isValid
                            ? 'bg-green-400 shadow-sm shadow-green-400/30'
                            : 'bg-red-400 shadow-sm shadow-red-400/30'
                        }`}
                        title={status.isValid ? 'Link verified' : 'Link unavailable'}
                        aria-label={status.isValid ? 'Verified partner link' : 'Partner link currently unavailable'}
                      />
                    </div>
                  )}

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

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        /* Ensure smooth animations */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none;
            opacity: 1;
          }

          .group:hover {
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default AffiliatePartners;