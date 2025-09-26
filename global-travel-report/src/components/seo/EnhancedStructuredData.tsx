'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';

interface StructuredDataProps {
  data: Record<string, any>;
  id?: string;
}

/**
 * Enhanced StructuredData component for SEO
 * Renders JSON-LD structured data in the page
 */
export function EnhancedStructuredData({ data, id = 'structured-data' }: StructuredDataProps) {
  // Sanitize the data to prevent XSS attacks
  const sanitizedData = DOMPurify.sanitize(JSON.stringify(data));
  
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedData }}
    />
  );
}

/**
 * Generate WebSite structured data
 */
export function WebsiteStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    'url': baseUrl,
    'name': 'Global Travel Report',
    'description': 'Your trusted source for travel news, guides, and insights',
    'publisher': {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      'name': 'Global Travel Report',
      'logo': {
        '@type': 'ImageObject',
        '@id': `${baseUrl}/#logo`,
        'url': `${baseUrl}/logo.png`,
        'width': 600,
        'height': 60
      }
    },
    'potentialAction': [
      {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': `${baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    ],
    'inLanguage': 'en-US'
  };
  
  return <EnhancedStructuredData data={websiteData} id="website-schema" />;
}

/**
 * Generate Organization structured data
 */
export function OrganizationStructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    'name': 'Global Travel Report',
    'url': baseUrl,
    'logo': {
      '@type': 'ImageObject',
      '@id': `${baseUrl}/#logo`,
      'url': `${baseUrl}/logo.png`,
      'width': 600,
      'height': 60
    },
    'sameAs': [
      'https://twitter.com/globaltravelreport',
      'https://www.facebook.com/globaltravelreport',
      'https://www.instagram.com/globaltravelreport',
      'https://www.linkedin.com/company/globaltravelreport'
    ],
    'contactPoint': [
      {
        '@type': 'ContactPoint',
        'telephone': '+1-555-555-5555',
        'contactType': 'customer service',
        'email': 'contact@globaltravelreport.com',
        'availableLanguage': ['English']
      }
    ]
  };
  
  return <EnhancedStructuredData data={organizationData} id="organization-schema" />;
}

/**
 * Generate BreadcrumbList structured data
 */
export function BreadcrumbStructuredData() {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  
  // Skip for homepage
  if (pathname === '/') {
    return null;
  }
  
  // Generate breadcrumb items
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': baseUrl
    }
  ];
  
  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Format the segment name (capitalize, replace hyphens with spaces)
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbItems.push({
      '@type': 'ListItem',
      'position': index + 2,
      'name': name,
      'item': `${baseUrl}${currentPath}`
    });
  });
  
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbItems
  };
  
  return <EnhancedStructuredData data={breadcrumbData} id="breadcrumb-schema" />;
}

/**
 * Generate Article structured data
 */
export function ArticleStructuredData({
  title,
  description,
  publishedDate,
  modifiedDate,
  imageUrl,
  authorName,
  authorUrl,
  category,
  tags
}: {
  title: string;
  description: string;
  publishedDate: string;
  modifiedDate?: string;
  imageUrl: string;
  authorName: string;
  authorUrl?: string;
  category: string;
  tags?: string[];
}) {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://globaltravelreport.com';
  const articleUrl = `${baseUrl}${pathname}`;
  
  const articleData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'image': imageUrl,
    'datePublished': publishedDate,
    'dateModified': modifiedDate || publishedDate,
    'author': {
      '@type': 'Person',
      'name': authorName,
      'url': authorUrl
    },
    'publisher': {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      'name': 'Global Travel Report',
      'logo': {
        '@type': 'ImageObject',
        '@id': `${baseUrl}/#logo`,
        'url': `${baseUrl}/logo.png`,
        'width': 600,
        'height': 60
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    'articleSection': category,
    'keywords': tags?.join(', ') || category
  };
  
  return <EnhancedStructuredData data={articleData} id="article-schema" />;
}
