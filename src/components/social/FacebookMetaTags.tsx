'use client';

import { useEffect } from 'react';

interface FacebookMetaTagsProps {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: 'website' | 'article';
  appId?: string;
}

/**
 * Enhanced Facebook Open Graph component that prevents duplication
 * and ensures clean, optimized meta tags for Facebook sharing
 */
export function FacebookMetaTags({
  title,
  description,
  image,
  url,
  type = 'article',
  appId
}: FacebookMetaTagsProps) {
  useEffect(() => {
    // Helper function to safely set or update meta tags
    const setMetaTag = (property: string, content: string, attribute: string = 'property') => {
      // Try to find existing tag
      let tag = document.querySelector(`meta[${attribute}="${property}"]`);

      if (tag) {
        // Update existing tag
        tag.setAttribute('content', content);
      } else {
        // Create new tag
        tag = document.createElement('meta');
        tag.setAttribute(attribute, property);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    };

    // Helper function to remove meta tag if it exists
    const removeMetaTag = (property: string, attribute: string = 'property') => {
      const tag = document.querySelector(`meta[${attribute}="${property}"]`);
      if (tag) {
        document.head.removeChild(tag);
      }
    };

    // Set core Open Graph tags (these should override any existing ones for consistency)
    setMetaTag('og:title', title);
    setMetaTag('og:description', description);
    setMetaTag('og:image', image);
    setMetaTag('og:url', url);
    setMetaTag('og:type', type);
    setMetaTag('og:site_name', 'Global Travel Report');

    // Set optional Facebook-specific tags
    if (appId) {
      setMetaTag('fb:app_id', appId);
    }

    // Set image dimensions for better Facebook preview
    if (image.includes('1200') && image.includes('630')) {
      setMetaTag('og:image:width', '1200');
      setMetaTag('og:image:height', '630');
    }

    // Set image alt text if title is available
    setMetaTag('og:image:alt', title);

    // Cleanup function
    return () => {
      // Note: We don't remove tags on cleanup to avoid conflicts with server-side rendered tags
      // The server-side tags should take precedence and remain
    };
  }, [title, description, image, url, type, appId]);

  // This component doesn't render anything
  return null;
}
