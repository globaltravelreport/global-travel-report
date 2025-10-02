// Analytics utility for Google Analytics 4
// Provides functions to track events, page views, and custom interactions

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-K8BJQ43XFT';

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  parameters: Record<string, any> = {}
): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      custom_parameter_1: 'global_travel_report'
    });
  }
}

/**
 * Track page view
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }
}

/**
 * Track affiliate click
 */
export function trackAffiliateClick(
  partnerName: string,
  url: string,
  category: string = 'affiliate'
): void {
  trackEvent('affiliate_click', {
    event_category: category,
    event_label: partnerName,
    affiliate_url: url,
    value: 1
  });
}

/**
 * Track story engagement
 */
export function trackStoryEngagement(
  storySlug: string,
  action: 'view' | 'comment' | 'reaction' | 'share',
  metadata?: Record<string, any>
): void {
  trackEvent('story_engagement', {
    event_category: 'content',
    event_label: storySlug,
    engagement_action: action,
    ...metadata
  });
}

/**
 * Track newsletter signup
 */
export function trackNewsletterSignup(source: string = 'website'): void {
  trackEvent('newsletter_signup', {
    event_category: 'engagement',
    event_label: source,
  });
}

/**
 * Track search
 */
export function trackSearch(query: string, resultsCount?: number): void {
  trackEvent('search', {
    event_category: 'navigation',
    search_term: query,
    results_count: resultsCount
  });
}

/**
 * Track user interaction
 */
export function trackInteraction(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  trackEvent('user_interaction', {
    event_category: category,
    event_action: action,
    event_label: label,
    value: value
  });
}

/**
 * Initialize Google Analytics
 * Call this after user consent
 */
export function initializeGA(): void {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args) {
    window.dataLayer.push(args);
  };

  // Configure GA
  window.gtag('js', new Date());
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true,
    anonymize_ip: true,
    allow_ad_features: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}
