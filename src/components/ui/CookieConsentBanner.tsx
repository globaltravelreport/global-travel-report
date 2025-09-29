'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';

interface CookieConsentBannerProps {
  className?: string;
}

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  social: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always required
  analytics: false,
  marketing: false,
  social: false,
};

export function CookieConsentBanner({ className = '' }: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      social: true,
    };
    setPreferences(allAccepted);
    setIsVisible(false);
    localStorage.setItem('cookie_consent', JSON.stringify({
      preferences: allAccepted,
      timestamp: Date.now(),
    }));

    // Dispatch custom event for parent components to listen to
    window.dispatchEvent(new CustomEvent<{ preferences: CookiePreferences; action: string }>('cookieConsent', {
      detail: { preferences: allAccepted, action: 'accept' }
    }));
  };

  const handleAcceptSelected = () => {
    setIsVisible(false);
    localStorage.setItem('cookie_consent', JSON.stringify({
      preferences,
      timestamp: Date.now(),
    }));

    // Dispatch custom event for parent components to listen to
    window.dispatchEvent(new CustomEvent<{ preferences: CookiePreferences; action: string }>('cookieConsent', {
      detail: { preferences, action: 'accept' }
    }));
  };

  const handleReject = () => {
    setIsVisible(false);
    localStorage.setItem('cookie_consent', JSON.stringify({
      preferences: { necessary: true, analytics: false, marketing: false, social: false },
      timestamp: Date.now(),
    }));

    // Dispatch custom event for parent components to listen to
    window.dispatchEvent(new CustomEvent<{ preferences: CookiePreferences; action: string }>('cookieConsent', {
      detail: { preferences: { necessary: true, analytics: false, marketing: false, social: false }, action: 'reject' }
    }));
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {!showDetails ? (
          // Simple consent banner
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-sm text-gray-700">
              <p>
                We use cookies to enhance your experience and analyze our traffic.
                By continuing to use our site, you consent to our use of cookies.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
              >
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
              >
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          // Detailed consent preferences
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Necessary Cookies */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="necessary"
                  checked={preferences.necessary}
                  disabled
                  className="mt-1 rounded border-gray-300"
                />
                <div className="flex-1">
                  <label htmlFor="necessary" className="text-sm font-medium text-gray-900">
                    Necessary Cookies
                  </label>
                  <p className="text-sm text-gray-600">
                    Required for basic site functionality. Cannot be disabled.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="analytics" className="text-sm font-medium text-gray-900">
                    Analytics Cookies
                  </label>
                  <p className="text-sm text-gray-600">
                    Help us understand how visitors interact with our site by collecting anonymous information.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="marketing" className="text-sm font-medium text-gray-900">
                    Marketing Cookies
                  </label>
                  <p className="text-sm text-gray-600">
                    Used to deliver relevant advertisements and track their effectiveness.
                  </p>
                </div>
              </div>

              {/* Social Media Cookies */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="social"
                  checked={preferences.social}
                  onChange={(e) => setPreferences(prev => ({ ...prev, social: e.target.checked }))}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <label htmlFor="social" className="text-sm font-medium text-gray-900">
                    Social Media Cookies
                  </label>
                  <p className="text-sm text-gray-600">
                    Enable social media features and allow sharing of content.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </a>
                {' • '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </a>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptSelected}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to check cookie consent status
 */
export function useCookieConsent(): {
  preferences: CookiePreferences | null;
  hasConsented: boolean;
  canUseAnalytics: boolean;
} {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent) {
      try {
        const parsed = JSON.parse(consent);
        setPreferences(parsed.preferences);
      } catch (error) {
        console.error('Error parsing cookie consent:', error);
      }
    }
  }, []);

  return {
    preferences,
    hasConsented: preferences !== null,
    canUseAnalytics: preferences?.analytics ?? false,
  };
}