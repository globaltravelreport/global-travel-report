/**
 * Custom hook for SEO optimization
 * 
 * This hook provides a way to optimize content for SEO across the site.
 * It combines our various SEO utilities into a single, easy-to-use interface.
 */

'use client';

import { useState, useEffect } from 'react';
import { Story } from '@/types/Story';
import { enhanceStoryForSEO } from '@/utils/seoEnhancer';
import { optimizeStoryImageForSeo } from '@/utils/imageSeoOptimizer';
import { generateAllEnhancedSchemas } from '@/utils/enhancedSchemaGenerator';

interface SeoOptimizationResult {
  enhancedStory: Story;
  imageData: {
    imageUrl: string;
    altText: string;
    caption: string;
  };
  schemas: any[];
  metaTags: {
    title: string;
    description: string;
    keywords: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    twitterTitle: string;
    twitterDescription: string;
    twitterImage: string;
    canonicalUrl: string;
  };
}

/**
 * Custom hook for optimizing content for SEO
 * @param story The story to optimize
 * @param siteUrl The base URL of the site
 * @returns Optimized SEO data
 */
export function useSeoOptimizer(
  story: Story,
  siteUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://www.globaltravelreport.com'
): SeoOptimizationResult {
  const [optimizedData, setOptimizedData] = useState<SeoOptimizationResult>({
    enhancedStory: story,
    imageData: {
      imageUrl: story.imageUrl || '',
      altText: story.title,
      caption: story.title
    },
    schemas: [],
    metaTags: {
      title: story.title,
      description: story.excerpt || '',
      keywords: story.tags?.join(', ') || '',
      ogTitle: story.title,
      ogDescription: story.excerpt || '',
      ogImage: story.imageUrl || '',
      twitterTitle: story.title,
      twitterDescription: story.excerpt || '',
      twitterImage: story.imageUrl || '',
      canonicalUrl: `${siteUrl}/stories/${story.slug}`
    }
  });

  useEffect(() => {
    // Enhance the story with optimized SEO metadata
    const enhancedStory = enhanceStoryForSEO(story);
    
    // Optimize the story image for SEO
    const { imageUrl, altText, caption } = optimizeStoryImageForSeo(enhancedStory);
    
    // Generate enhanced schemas
    const schemas = generateAllEnhancedSchemas(enhancedStory, siteUrl);
    
    // Generate meta tags
    const canonicalUrl = `${siteUrl}/stories/${enhancedStory.slug}`;
    const ogImage = imageUrl?.startsWith('http')
      ? imageUrl
      : `${siteUrl}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
    
    setOptimizedData({
      enhancedStory,
      imageData: {
        imageUrl,
        altText,
        caption
      },
      schemas,
      metaTags: {
        title: enhancedStory.title,
        description: enhancedStory.excerpt || '',
        keywords: enhancedStory.tags?.join(', ') || '',
        ogTitle: enhancedStory.title,
        ogDescription: enhancedStory.excerpt || '',
        ogImage,
        twitterTitle: enhancedStory.title,
        twitterDescription: enhancedStory.excerpt || '',
        twitterImage: ogImage,
        canonicalUrl
      }
    });
  }, [story, siteUrl]);

  return optimizedData;
}

/**
 * Generate a dynamic page title based on the current route
 * @param baseTitle The base title to use
 * @param route The current route
 * @param siteName The name of the site
 * @returns Optimized page title
 */
export function generateSeoPageTitle(
  baseTitle: string,
  route: string,
  siteName: string = 'Global Travel Report'
): string {
  // Extract the main section from the route
  const mainSection = route.split('/')[1] || '';
  
  // Generate a title based on the route
  let title = baseTitle;
  
  if (mainSection) {
    // Capitalize the first letter of each word
    const formattedSection = mainSection
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Add the section to the title if it's not already included
    if (!baseTitle.includes(formattedSection)) {
      title = `${baseTitle} - ${formattedSection}`;
    }
  }
  
  // Add the site name if it's not already included
  if (!title.includes(siteName)) {
    title = `${title} | ${siteName}`;
  }
  
  return title;
}

/**
 * Generate SEO-friendly breadcrumbs based on the current route
 * @param route The current route
 * @param siteUrl The base URL of the site
 * @returns Breadcrumb items
 */
export function generateSeoBreadcrumbs(
  route: string,
  siteUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://www.globaltravelreport.com'
): { name: string; url: string }[] {
  // Split the route into segments
  const segments = route.split('/').filter(Boolean);
  
  // Always start with Home
  const breadcrumbs = [
    { name: 'Home', url: siteUrl }
  ];
  
  // Add each segment as a breadcrumb
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Format the segment name (capitalize, replace hyphens with spaces)
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    breadcrumbs.push({
      name,
      url: `${siteUrl}${currentPath}`
    });
  });
  
  return breadcrumbs;
}

export default useSeoOptimizer;
