/**
 * Affiliate Disclosure Component
 *
 * Displays affiliate disclosure notices throughout the site
 * to comply with FTC guidelines and maintain transparency.
 */

import React from 'react';

interface AffiliateDisclosureProps {
  variant?: 'banner' | 'inline' | 'footer' | 'minimal';
  showIcon?: boolean;
  className?: string;
}

export function AffiliateDisclosure({
  variant = 'inline',
  showIcon = true,
  className = ''
}: AffiliateDisclosureProps) {
  const baseClasses = 'affiliate-disclosure';

  const variantClasses = {
    banner: 'bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800',
    inline: 'text-xs text-gray-600 italic mb-4',
    footer: 'text-xs text-gray-500 text-center py-2 border-t border-gray-200',
    minimal: 'text-xs text-gray-500'
  };

  const containerClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const icon = showIcon ? (
    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ) : null;

  const disclosureText = (
    <>
      {icon}
      <strong>Affiliate Disclosure:</strong> This site contains affiliate links. When you click on these links and make a purchase,
      we may earn a commission at no additional cost to you. This helps support our site and allows us to continue providing
      valuable travel content.
    </>
  );

  if (variant === 'banner') {
    return (
      <div className={containerClasses} role="alert" aria-live="polite">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {icon}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-amber-800 mb-1">
              Affiliate Links Disclosure
            </h3>
            <div className="text-sm text-amber-700">
              <p className="mb-2">
                This site contains affiliate links. When you click on these links and make a purchase,
                we may earn a commission at no additional cost to you.
              </p>
              <p className="text-xs">
                This helps support our site and allows us to continue providing valuable travel content.
                Thank you for your support!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      {disclosureText}
    </div>
  );
}

/**
 * Hook for managing affiliate disclosure visibility
 */
export function useAffiliateDisclosure() {
  const [hasConsented, setHasConsented] = React.useState(false);
  const [showDisclosure, setShowDisclosure] = React.useState(true);

  React.useEffect(() => {
    // Check if user has already seen the disclosure
    const consentGiven = localStorage.getItem('affiliate-disclosure-consent');
    if (consentGiven) {
      setHasConsented(true);
      setShowDisclosure(false);
    }
  }, []);

  const acceptDisclosure = React.useCallback(() => {
    localStorage.setItem('affiliate-disclosure-consent', 'true');
    setHasConsented(true);
    setShowDisclosure(false);
  }, []);

  const resetDisclosure = React.useCallback(() => {
    localStorage.removeItem('affiliate-disclosure-consent');
    setHasConsented(false);
    setShowDisclosure(true);
  }, []);

  return {
    hasConsented,
    showDisclosure,
    acceptDisclosure,
    resetDisclosure
  };
}

export default AffiliateDisclosure;