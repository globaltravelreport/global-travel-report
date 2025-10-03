// Google Analytics Integration Script
// This script properly handles GA4 integration with Next.js

export function GoogleAnalytics({ gaId }) {
  if (!gaId) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true
            });
          `
        }}
      />
    </>
  );
}

// Utility function to track custom events
export function trackEvent(eventName, parameters = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
}

// Utility function to track affiliate clicks
export function trackAffiliateClick(partnerName, url) {
  trackEvent('affiliate_click', {
    event_category: 'affiliate',
    event_label: partnerName,
    affiliate_url: url,
    value: 1
  });
}

// Utility function to track story engagement
export function trackStoryEngagement(storySlug, action) {
  trackEvent('story_engagement', {
    event_category: 'content',
    event_label: storySlug,
    engagement_action: action,
    value: 1
  });
}