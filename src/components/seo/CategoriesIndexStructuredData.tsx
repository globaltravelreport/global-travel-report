import React from 'react';
import { StructuredData } from '@/components/seo/StructuredData';
import { Category } from '@/src/config/categories';

interface CategoriesIndexStructuredDataProps {
  /**
   * List of featured categories
   */
  featuredCategories: Category[];

  /**
   * List of other categories
   */
  otherCategories?: Category[];

  /**
   * The base URL of the site
   */
  siteUrl?: string;
}

/**
 * Component for adding structured data for the categories index page
 * 
 * This component generates:
 * 1. CollectionPage schema for the categories index
 * 2. BreadcrumbList schema for navigation
 * 3. ItemList schema for all categories
 */
export function CategoriesIndexStructuredData({
  featuredCategories,
  otherCategories = [],
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.globaltravelreport.com'
}: CategoriesIndexStructuredDataProps) {
  // Combine all categories
  const allCategories = [...featuredCategories, ...otherCategories];

  // Generate CollectionPage schema
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Categories - Global Travel Report',
    'description': 'Explore travel stories by category. Find articles about cruises, airlines, hotels, destinations, food & dining, adventure, culture, and more.',
    'url': `${siteUrl}/categories`,
    'mainEntity': {
      '@type': 'ItemList',
      'itemListElement': allCategories.map((category, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'url': `${siteUrl}/categories/${category.slug}`,
        'name': category.name,
        'description': category.description
      })),
      'numberOfItems': allCategories.length
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Global Travel Report',
      'logo': {
        '@type': 'ImageObject',
        'url': `${siteUrl}/logo-gtr.png`,
        'width': 600,
        'height': 60
      }
    }
  };

  // Generate BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': siteUrl
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Categories',
        'item': `${siteUrl}/categories`
      }
    ]
  };

  // Generate ItemList schema for featured categories
  const featuredCategoriesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Featured Travel Categories',
    'description': 'Explore our featured travel categories',
    'itemListElement': featuredCategories.map((category, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Thing',
        'name': category.name,
        'description': category.description,
        'url': `${siteUrl}/categories/${category.slug}`,
        'image': `${siteUrl}/images/categories/${category.slug}.jpg`
      }
    })),
    'numberOfItems': featuredCategories.length
  };

  // Combine all schemas
  const schemas = [
    collectionPageSchema,
    breadcrumbSchema,
    featuredCategoriesSchema
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <StructuredData 
          key={`categories-index-schema-${index}`}
          data={schema} 
          id={`categories-index-schema-${index}`} 
        />
      ))}
    </>
  );
}

export default CategoriesIndexStructuredData;
