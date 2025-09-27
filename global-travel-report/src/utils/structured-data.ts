/**
 * Utilities for generating structured data (JSON-LD)
 */

import { Story } from '@/types/Story';

/**
 * Generate Article structured data for a story
 * @param story - The story to generate structured data for
 * @param url - The URL of the story
 * @returns JSON-LD structured data for the story
 */
export function generateArticleStructuredData(story: Story, url: string): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: story.title,
    description: story.excerpt,
    image: story.image,
    datePublished: new Date(story.publishedAt).toISOString(),
    dateModified: story.updatedAt ? new Date(story.updatedAt).toISOString() : new Date(story.publishedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: story.author,
      url: `/authors/${encodeURIComponent(story.author.toLowerCase())}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Global Travel Report',
      logo: {
        '@type': 'ImageObject',
        url: 'https://globaltravelreport.com/logo-gtr.png',
        width: 600,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: story.tags.join(', '),
    articleSection: story.category,
    inLanguage: 'en-US',
  };
}

/**
 * Generate TravelDestination structured data
 * @param story - The story to generate structured data for
 * @param url - The URL of the story
 * @returns JSON-LD structured data for the travel destination
 */
export function generateTravelDestinationStructuredData(story: Story, url: string): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: story.country,
    description: story.excerpt,
    url: url,
    touristType: story.tags,
    geo: {
      '@type': 'GeoCoordinates',
      // Note: In a real application, you would have actual coordinates
      latitude: 0,
      longitude: 0,
    },
    includesAttraction: story.attractions?.map(attraction => ({
      '@type': 'TouristAttraction',
      name: attraction.name,
      description: attraction.description,
    })) || [],
    photo: story.image,
    address: {
      '@type': 'PostalAddress',
      addressCountry: story.country,
    },
  };
}

/**
 * Generate FAQPage structured data
 * @param faqs - Array of FAQs
 * @returns JSON-LD structured data for FAQs
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): Record<string, any> {
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
 * Generate Event structured data
 * @param event - Event data
 * @returns JSON-LD structured data for an event
 */
export interface EventData {
  name: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date;
  location: string;
  image?: string;
  url?: string;
  organizer?: string;
  price?: string;
  currency?: string;
}

export function generateEventStructuredData(event: EventData): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name,
    description: event.description,
    startDate: new Date(event.startDate).toISOString(),
    endDate: new Date(event.endDate).toISOString(),
    location: {
      '@type': 'Place',
      name: event.location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.location,
      },
    },
    image: event.image,
    url: event.url,
    organizer: event.organizer ? {
      '@type': 'Organization',
      name: event.organizer,
    } : undefined,
    offers: event.price ? {
      '@type': 'Offer',
      price: event.price,
      priceCurrency: event.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: event.url,
    } : undefined,
  };
}

/**
 * Generate Review structured data
 * @param review - Review data
 * @returns JSON-LD structured data for a review
 */
export interface ReviewData {
  name: string;
  reviewBody: string;
  author: string;
  datePublished: string | Date;
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  itemReviewed: {
    name: string;
    description?: string;
    image?: string;
    url?: string;
    type: 'Hotel' | 'Restaurant' | 'Attraction' | 'Product' | 'LocalBusiness';
  };
}

export function generateReviewStructuredData(review: ReviewData): Record<string, any> {
  const itemType = review.itemReviewed.type;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: review.name,
    reviewBody: review.reviewBody,
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: new Date(review.datePublished).toISOString(),
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue,
      bestRating: review.bestRating || 5,
      worstRating: review.worstRating || 1,
    },
    itemReviewed: {
      '@type': itemType,
      name: review.itemReviewed.name,
      description: review.itemReviewed.description,
      image: review.itemReviewed.image,
      url: review.itemReviewed.url,
    },
  };
}

/**
 * Generate BreadcrumbList structured data
 * @param items - Array of breadcrumb items
 * @returns JSON-LD structured data for breadcrumbs
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbStructuredData(items: BreadcrumbItem[]): Record<string, any> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate combined structured data for a story page
 * @param story - The story
 * @param url - The URL of the story
 * @param breadcrumbs - Breadcrumb items
 * @returns Combined JSON-LD structured data
 */
export function generateStoryPageStructuredData(
  story: Story,
  url: string,
  breadcrumbs: BreadcrumbItem[]
): Record<string, any>[] {
  const structuredData = [
    generateArticleStructuredData(story, url),
    generateBreadcrumbStructuredData(breadcrumbs),
  ];
  
  // Add TravelDestination structured data if the story is about a destination
  if (story.category.toLowerCase() === 'destination' || story.category.toLowerCase() === 'guide') {
    structuredData.push(generateTravelDestinationStructuredData(story, url));
  }
  
  // Add FAQ structured data if the story has FAQs
  if (story.faqs && story.faqs.length > 0) {
    structuredData.push(generateFAQStructuredData(story.faqs));
  }
  
  // Add Event structured data if the story is about an event
  if (story.event) {
    structuredData.push(generateEventStructuredData(story.event));
  }
  
  // Add Review structured data if the story has reviews
  if (story.reviews && story.reviews.length > 0) {
    story.reviews.forEach(review => {
      structuredData.push(generateReviewStructuredData(review));
    });
  }
  
  return structuredData;
}
