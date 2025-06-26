/**
 * StructuredData Component
 * 
 * This component loads structured data for a page and injects it into the head.
 * It supports loading from a static JSON file or generating dynamically.
 */

import React from 'react';
import Script from 'next/script';
import DOMPurify from 'isomorphic-dompurify';

interface StructuredDataProps {
  slug?: string;
  data?: any;
  type?: 'article' | 'product' | 'faq' | 'breadcrumb' | 'organization';
}

/**
 * StructuredData component
 * @param slug - The slug of the page to load structured data for
 * @param data - Optional structured data to use instead of loading from a file
 * @param type - The type of structured data to generate if data is not provided
 */
export function StructuredData({ slug, data, type }: StructuredDataProps) {
  // If data is provided, use it directly
  if (data) {
    return (
      <Script
        id={`structured-data-${type || 'custom'}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(JSON.stringify(data)),
        }}
      />
    );
  }

  // If slug is provided, load from a file
  if (slug) {
    // In production, load from the static file
    if (process.env.NODE_ENV === 'production') {
      return (
        <Script
          id={`structured-data-${slug}`}
          type="application/ld+json"
          src={`/structured-data/${slug}.json`}
          strategy="afterInteractive"
        />
      );
    }

    // In development, load dynamically
    return (
      <Script
        id={`structured-data-${slug}`}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined' && typeof document !== 'undefined') {
              fetch('/structured-data/${slug}.json')
                .then(response => response.json())
                .then(data => {
                  const script = document.createElement('script');
                  script.type = 'application/ld+json';
                  script.textContent = JSON.stringify(data);
                  document.head.appendChild(script);
                })
                .catch(error => console.error('Error loading structured data:', error));
            }
          `,
        }}
      />
    );
  }

  // If neither data nor slug is provided, return null
  return null;
}

/**
 * Generate Article structured data
 * @param article - The article data
 * @returns Structured data for an article
 */
export function generateArticleStructuredData(article: any) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  const url = `${baseUrl}/${article.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': article.title,
    'description': article.summary || article.metaDescription || '',
    'image': article.imageUrl ? [article.imageUrl] : [],
    'author': {
      '@type': 'Organization',
      'name': 'Global Travel Report Editorial Team',
      'url': `${baseUrl}/about`
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'logo': {
        '@type': 'ImageObject',
        'url': `${baseUrl}/logo-gtr.png`,
        'width': 600,
        'height': 60
      }
    },
    'datePublished': article.date || new Date().toISOString(),
    'dateModified': article.updatedAt || article.date || new Date().toISOString(),
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    }
  };
}

/**
 * Generate FAQ structured data
 * @param faqs - Array of FAQ items with question and answer
 * @returns Structured data for an FAQ page
 */
export function generateFAQStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * Generate BreadcrumbList structured data
 * @param items - Array of breadcrumb items
 * @returns Structured data for breadcrumbs
 */
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`
    }))
  };
}

/**
 * Generate Organization structured data
 * @returns Structured data for the organization
 */
export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Global Travel Report',
    'url': baseUrl,
    'logo': {
      '@type': 'ImageObject',
      'url': `${baseUrl}/logo-gtr.png`,
      'width': 600,
      'height': 60
    },
    'contactPoint': {
      '@type': 'ContactPoint',
      'contactType': 'customer support',
      'email': 'editorial@globaltravelreport.com',
      'url': `${baseUrl}/contact`
    },
    'sameAs': [
      'https://x.com/GTravelReport',
      'https://www.facebook.com/globaltravelreport',
      'https://medium.com/@editorial_31000',
      'https://www.linkedin.com/company/globaltravelreport/',
      'https://www.youtube.com/@GlobalTravelReport',
      'https://www.tiktok.com/@globaltravelreport',
      'https://www.tumblr.com/blog/globaltravelreport'
    ]
  };
}

export default StructuredData;
