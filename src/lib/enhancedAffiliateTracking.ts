/**
 * Enhanced Affiliate Link Tracking System
 *
 * Provides comprehensive UTM parameter management, click tracking, and analytics integration
 * for all affiliate links across the Global Travel Report platform.
 */

export interface UTMParameters {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
}

export interface TrackingContext {
  page: string;
  section: string;
  storyId?: string;
  storyCategory?: string;
  userId?: string;
  sessionId?: string;
}

export interface ClickTrackingData {
  affiliateId: string;
  affiliateName: string;
  originalUrl: string;
  trackedUrl: string;
  context: TrackingContext;
  timestamp: string;
  userAgent: string;
  referrer: string;
}

/**
 * Generate comprehensive UTM parameters for affiliate links
 */
export function generateUTMParameters(
  affiliateId: string,
  context: TrackingContext,
  customParams?: Partial<UTMParameters>
): UTMParameters {
  const baseParams: UTMParameters = {
    utm_source: 'globaltravelreport',
    utm_medium: 'affiliate',
    utm_campaign: `affiliate_${affiliateId}`,
    utm_content: `${context.section}_${context.page}`,
    utm_term: context.storyCategory || 'general'
  };

  // Add story-specific tracking if available
  if (context.storyId) {
    baseParams.utm_content = `${context.section}_${context.storyId}`;
    baseParams.utm_campaign = `story_${context.storyId}_${affiliateId}`;
  }

  // Add custom parameters if provided
  return { ...baseParams, ...customParams };
}

/**
 * Add UTM parameters to affiliate URL
 */
export function addTrackingToAffiliateUrl(
  originalUrl: string,
  utmParams: UTMParameters
): string {
  try {
    const url = new URL(originalUrl);

    // Add UTM parameters
    Object.entries(utmParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  } catch (_error) {
    console.error('Error adding tracking to affiliate URL:', error);
    return originalUrl;
  }
}

/**
 * Track affiliate link click
 */
export function trackAffiliateClick(
  trackingData: ClickTrackingData
): Promise<void> {
  return new Promise((resolve) => {
    try {
      // Send to analytics endpoint
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // Google Analytics tracking
        (window as any).gtag('event', 'affiliate_click', {
          affiliate_id: trackingData.affiliateId,
          affiliate_name: trackingData.affiliateName,
          page: trackingData.context.page,
          section: trackingData.context.section,
          story_id: trackingData.context.storyId,
          value: 1
        });
      }

      // Send to custom tracking endpoint
      fetch('/api/analytics/affiliate-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackingData)
      }).catch(error => {
        console.error('Error sending affiliate click tracking:', error);
      });

      resolve();
    } catch (_error) {
      console.error('Error tracking affiliate click:', error);
      resolve();
    }
  });
}

/**
 * Create a tracked affiliate link with click handler
 */
export function createTrackedAffiliateLink(
  affiliateId: string,
  originalUrl: string,
  context: TrackingContext,
  customUTM?: Partial<UTMParameters>
) {
  const utmParams = generateUTMParameters(affiliateId, context, customUTM);
  const trackedUrl = addTrackingToAffiliateUrl(originalUrl, utmParams);

  const clickHandler = async (event: MouseEvent) => {
    // Track the click
    const trackingData: ClickTrackingData = {
      affiliateId,
      affiliateName: affiliateId, // This should be resolved from affiliate data
      originalUrl,
      trackedUrl,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : ''
    };

    await trackAffiliateClick(trackingData);

    // Continue with normal link behavior
    // The link will still work normally
  };

  return {
    url: trackedUrl,
    onClick: clickHandler
  };
}

/**
 * Get affiliate tracking context from current page
 */
export function getCurrentPageContext(): TrackingContext {
  if (typeof window === 'undefined') {
    return {
      page: 'server',
      section: 'unknown'
    };
  }

  const pathname = window.location.pathname;
  const section = getSectionFromPath(pathname);

  return {
    page: pathname,
    section,
    sessionId: getSessionId()
  };
}

/**
 * Determine section from URL path
 */
function getSectionFromPath(pathname: string): string {
  if (pathname.startsWith('/stories/')) return 'story_detail';
  if (pathname.startsWith('/stories')) return 'stories_listing';
  if (pathname.startsWith('/destinations')) return 'destinations';
  if (pathname.startsWith('/categories')) return 'categories';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/offers')) return 'offers';
  if (pathname.startsWith('/partners')) return 'partners';
  if (pathname === '/') return 'homepage';
  return 'other';
}

/**
 * Get or create session ID for tracking
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('tracking_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('tracking_session_id', sessionId);
  }

  return sessionId;
}

/**
 * Batch track multiple affiliate impressions
 */
export function trackAffiliateImpressions(affiliateIds: string[]): void {
  if (typeof window === 'undefined' || !('gtag' in window)) return;

  affiliateIds.forEach(affiliateId => {
    (window as any).gtag('event', 'affiliate_impression', {
      affiliate_id: affiliateId,
      page: window.location.pathname,
      value: 1
    });
  });
}

/**
 * Generate affiliate performance report data
 */
export function generateAffiliateReportData(
  affiliateId: string,
  clicks: number,
  conversions: number,
  revenue: number
) {
  return {
    affiliateId,
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      end: new Date().toISOString()
    },
    metrics: {
      clicks,
      conversions,
      conversionRate: clicks > 0 ? (conversions / clicks) * 100 : 0,
      revenue,
      averageOrderValue: conversions > 0 ? revenue / conversions : 0
    },
    context: getCurrentPageContext()
  };
}