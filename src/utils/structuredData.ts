/**
 * Structured Data Utilities
 *
 * Generate JSON-LD structured data for better SEO and rich snippets
 */

import { Story } from '@/types/Story';

export interface OrganizationData {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
}

export interface WebSiteData {
  '@context': string;
  '@type': string;
  name: string;
  url: string;
  description: string;
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  potentialAction: {
    '@type': string;
    target: string;
    'query-input': string;
  };
}

export interface StoryStructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': string;
    name: string;
  };
  publisher: {
    '@type': string;
    name: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': string;
    '@id': string;
  };
  articleSection?: string;
  keywords?: string;
}

export interface FAQStructuredData {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

/**
 * Generate organization structured data
 */
export function generateOrganizationData(): OrganizationData {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Global Travel Report',
    url: baseUrl,
    logo: `${baseUrl}/images/logo.png`,
    description: 'Your ultimate source for travel stories, destination guides, and adventure inspiration from around the world.',
    sameAs: [
      'https://facebook.com/globaltravelreport',
      'https://twitter.com/globaltravelreport',
      'https://instagram.com/globaltravelreport',
    ],
  };
}

/**
 * Generate website structured data
 */
export function generateWebSiteData(): WebSiteData {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Global Travel Report',
    url: baseUrl,
    description: 'Discover amazing travel stories, destination guides, and adventure inspiration from around the world.',
    publisher: {
      '@type': 'Organization',
      name: 'Global Travel Report',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate story/article structured data
 */
export function generateStoryStructuredData(story: Story): StoryStructuredData {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  const storyUrl = `${baseUrl}/stories/${story.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.excerpt,
    image: story.imageUrl || `${baseUrl}/images/default-story.jpg`,
    datePublished: new Date(story.publishedAt).toISOString(),
    dateModified: story.updatedAt ? new Date(story.updatedAt).toISOString() : new Date(story.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: story.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Global Travel Report',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': storyUrl,
    },
    articleSection: story.category,
    keywords: story.tags?.join(', '),
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): FAQStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Generate travel-specific structured data (Place, Hotel, etc.)
 */
export function generateTravelStructuredData(type: 'Place' | 'Hotel' | 'Restaurant' | 'Attraction', data: {
  name: string;
  description: string;
  image?: string;
  url?: string;
  address?: {
    streetAddress?: string;
    addressLocality: string;
    addressRegion?: string;
    addressCountry: string;
    postalCode?: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
}) {
  const baseData: any = {
    '@context': 'https://schema.org',
    '@type': type,
    name: data.name,
    description: data.description,
  };

  if (data.image) baseData.image = data.image;
  if (data.url) baseData.url = data.url;
  if (data.address) baseData.address = data.address;
  if (data.geo) baseData.geo = data.geo;
  if (data.priceRange) baseData.priceRange = data.priceRange;

  if (data.rating) {
    baseData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      reviewCount: data.reviewCount || 1,
    };
  }

  return baseData;
}

/**
 * Validate structured data format
 */
export function validateStructuredData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data['@context']) {
    errors.push('Missing @context property');
  }

  if (!data['@type']) {
    errors.push('Missing @type property');
  }

  if (!data.name && !data.headline) {
    errors.push('Missing name or headline property');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}