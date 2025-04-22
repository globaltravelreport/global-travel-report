export const siteConfig = {
  // Feature toggles
  showNewsletter: true,
  enableTags: true,
  enableSubmit: true,
  enableFuzzySearch: true,
  
  // Default settings
  defaultSort: 'newest' as 'newest' | 'oldest' | 'trending',
  storiesPerPage: 12,
  trendingStoriesCount: 6,
  
  // SEO settings
  siteName: 'Global Travel Report',
  siteDescription: 'Discover the world through captivating travel stories',
  siteUrl: 'https://www.globaltravelreport.com',
  twitterHandle: '@globaltravelreport',
  
  // Newsletter settings
  newsletterTitle: 'Get Travel Stories in Your Inbox',
  newsletterDescription: 'Join our community of travel enthusiasts and receive the latest stories directly in your inbox.',
  
  // Social links
  socialLinks: {
    twitter: 'https://twitter.com/globaltravelreport',
    instagram: 'https://instagram.com/globaltravelreport',
    facebook: 'https://facebook.com/globaltravelreport',
  },
  
  // Contact information
  contactEmail: 'hello@globaltravelreport.com',
  
  // Analytics
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  
  // reCAPTCHA
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  
  // Image settings
  imageSizes: {
    thumbnail: {
      width: 400,
      height: 300,
    },
    hero: {
      width: 1200,
      height: 800,
    },
  },
  
  // Cache settings
  cacheDuration: {
    stories: 60 * 60, // 1 hour
    metrics: 60 * 5, // 5 minutes
  },
} 