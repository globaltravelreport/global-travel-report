'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  enableVerification = false
}) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({});
  const [isLoading, setIsLoading] = useState(enableVerification);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const maxRetries = 2;

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

  // Verify affiliate links with retry logic
  const verifyLinks = useCallback(async (attemptNumber = 1) => {
    if (!enableVerification || !isVisible) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);

      const urls = displayPartners.map(partner => partner.url);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const response = await fetch(`/api/affiliates/verify?urls=${encodeURIComponent(urls.join(','))}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setVerificationStatus(data.results);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(data.error || 'Verification API returned error');
      }
    } catch (error) {
      console.error(`Affiliate verification attempt ${attemptNumber} failed:`, error);

      if (attemptNumber < maxRetries) {
        // Exponential backoff retry
        const delay = Math.min(1000 * Math.pow(2, attemptNumber - 1), 5000);
        setTimeout(() => {
          setRetryCount(attemptNumber);
          verifyLinks(attemptNumber + 1);
        }, delay);
        return;
      }

      // Max retries reached
      setHasError(true);
      setRetryCount(0);

      // Set all as valid on error to avoid hiding partners
      const fallbackStatus: VerificationStatus = {};
      displayPartners.forEach(partner => {
        fallbackStatus[partner.url] = {
          isValid: true,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Verification failed'
        };
      });
      setVerificationStatus(fallbackStatus);
    } finally {
      setIsLoading(false);
    }
  }, [displayPartners, enableVerification, isVisible, maxRetries]);

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

        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A14A] mb-3"></div>
            <span className="text-gray-600">
              {retryCount > 0
                ? `Verifying partner links (attempt ${retryCount + 1}/${maxRetries})...`
                : 'Verifying partner links...'
              }
            </span>
            {retryCount > 0 && (
              <button
                onClick={() => verifyLinks(1)}
                className="mt-3 text-sm text-[#C9A14A] hover:text-[#B89038] underline focus:outline-none focus:ring-2 focus:ring-[#C9A14A] focus:ring-offset-2 rounded"
                aria-label="Retry link verification"
              >
                Retry verification
              </button>
            )}
          </div>
        )}

        {/* Enhanced Error State */}
        {hasError && (
          <div className="text-center py-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-lg mx-auto">
              <div className="flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-yellow-800">Verification Temporarily Unavailable</h3>
              </div>
              <p className="text-yellow-700 text-sm mb-4">
                Partner links are being displayed with limited verification. All services remain fully functional.
              </p>
              <button
                onClick={() => verifyLinks(1)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                aria-label="Retry link verification"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Verification
              </button>
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