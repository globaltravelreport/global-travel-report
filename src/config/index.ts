/**
 * Centralized configuration for the Global Travel Report application
 */

import { storyRewriteConfig } from './storyRewrite';

/**
 * Site configuration
 */
export const siteConfig = {
  name: 'Global Travel Report',
  description: 'Your source for global travel insights and stories.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com',
  ogImage: 'https://globaltravelreport.com/logo-gtr.png',
  links: {
    facebook: 'https://www.facebook.com/globaltravelreport',
    twitter: 'https://x.com/GTravelReport',
    medium: 'https://medium.com/@editorial_31000',
    linkedin: 'https://www.linkedin.com/company/globaltravelreport/',
    youtube: 'https://www.youtube.com/@GlobalTravelReport',
    tiktok: 'https://www.tiktok.com/@globaltravelreport',
  },
  authors: ['Rodney & Nuch'],
  keywords: ['travel', 'stories', 'destinations', 'hotels', 'airlines', 'cruises'],
};

/**
 * API configuration
 */
export const apiConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    defaultModel: 'gpt-4',
    fallbackModel: 'gpt-3.5-turbo',
    maxRetries: 3,
    retryDelay: 1000,
  },
  unsplash: {
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    secretKey: process.env.UNSPLASH_SECRET_KEY,
  },
  recaptcha: {
    siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
  },
};

/**
 * Content configuration
 */
export const contentConfig = {
  pagination: {
    storiesPerPage: 12,
  },
  homepage: {
    featuredStories: 1,
    recentStories: 8,
  },
  archiveDays: 7,
  categories: [
    'Airlines',
    'Hotels',
    'Cruises',
    'Destinations',
    'Travel News',
    'Experiences',
  ],
  countries: [
    'Australia',
    'Japan',
    'France',
    'Italy',
    'United States',
    'Thailand',
    'Brazil',
    'South Africa',
    'Global',
  ],
};

/**
 * Email configuration
 */
export const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@globaltravelreport.com',
  contact: process.env.EMAIL_CONTACT || 'editorial@globaltravelreport.com',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.your-email-provider.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: process.env.SMTP_SECURE === 'true',
  },
};

/**
 * Analytics configuration
 */
export const analyticsConfig = {
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  },
};

/**
 * Export all configurations
 */
export const config = {
  site: siteConfig,
  api: apiConfig,
  content: contentConfig,
  email: emailConfig,
  analytics: analyticsConfig,
  storyRewrite: storyRewriteConfig,
};

export default config;
