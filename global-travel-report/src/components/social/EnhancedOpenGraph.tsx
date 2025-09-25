'use client';

import { useEffect } from 'react';

interface OpenGraphImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
}

interface OpenGraphVideo {
  url: string;
  width?: number;
  height?: number;
  type?: string;
}

interface OpenGraphAudio {
  url: string;
  type?: string;
}

interface EnhancedOpenGraphProps {
  /**
   * The title of the page
   */
  title?: string;
  
  /**
   * The description of the page
   */
  description?: string;
  
  /**
   * The canonical URL of the page
   */
  url?: string;
  
  /**
   * The type of the page (website, article, etc.)
   */
  type?: 'website' | 'article' | 'book' | 'profile' | 'music.song' | 'music.album' | 'music.playlist' | 'music.radio_station' | 'video.movie' | 'video.episode' | 'video.tv_show' | 'video.other';
  
  /**
   * The locale of the page
   */
  locale?: string;
  
  /**
   * The site name
   */
  siteName?: string;
  
  /**
   * The images for the page
   */
  images?: OpenGraphImage[];
  
  /**
   * The videos for the page
   */
  videos?: OpenGraphVideo[];
  
  /**
   * The audio for the page
   */
  audio?: OpenGraphAudio[];
  
  /**
   * The Facebook app ID
   */
  facebookAppId?: string;
  
  /**
   * The Twitter card type
   */
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  
  /**
   * The Twitter site handle
   */
  twitterSite?: string;
  
  /**
   * The Twitter creator handle
   */
  twitterCreator?: string;
  
  /**
   * Additional meta tags
   */
  additionalMetaTags?: Record<string, string>[];
  
  /**
   * Article-specific properties
   */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    expirationTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
}

/**
 * Enhanced Open Graph component for better social sharing
 * 
 * This component adds Open Graph, Twitter Card, and other social media meta tags
 * to the document head for better social sharing.
 * 
 * @example
 * ```tsx
 * <EnhancedOpenGraph
 *   title="My Article Title"
 *   description="A brief description of my article"
 *   url="https://example.com/my-article"
 *   type="article"
 *   images={[
 *     {
 *       url: "https://example.com/image.jpg",
 *       width: 1200,
 *       height: 630,
 *       alt: "My Article Image"
 *     }
 *   ]}
 *   article={{
 *     publishedTime: "2023-01-01T00:00:00Z",
 *     authors: ["John Doe"],
 *     tags: ["travel", "adventure"]
 *   }}
 * />
 * ```
 */
export function EnhancedOpenGraph({
  title,
  description,
  url,
  type = 'website',
  locale = 'en_US',
  siteName = 'Global Travel Report',
  images = [],
  videos = [],
  audio = [],
  facebookAppId,
  twitterCard = 'summary_large_image',
  twitterSite = '@GTravelReport',
  twitterCreator = '@GTravelReport',
  additionalMetaTags = [],
  article,
}: EnhancedOpenGraphProps) {
  useEffect(() => {
    // Store existing tags to restore them later
    const existingTags: { [key: string]: HTMLMetaElement } = {};
    
    // Helper function to create or update a meta tag
    const setMetaTag = (property: string, content: string) => {
      // Check if the tag already exists
      let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      
      // If it exists, store it for later restoration
      if (tag) {
        existingTags[property] = tag;
      } else {
        // If it doesn't exist, create it
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      
      // Set the content
      tag.setAttribute('content', content);
    };
    
    // Helper function to create or update a name meta tag
    const setNameMetaTag = (name: string, content: string) => {
      // Check if the tag already exists
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
      
      // If it exists, store it for later restoration
      if (tag) {
        existingTags[`name:${name}`] = tag;
      } else {
        // If it doesn't exist, create it
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      
      // Set the content
      tag.setAttribute('content', content);
    };
    
    // Set basic Open Graph tags
    if (title) setMetaTag('og:title', title);
    if (description) setMetaTag('og:description', description);
    if (url) setMetaTag('og:url', url);
    if (type) setMetaTag('og:type', type);
    if (locale) setMetaTag('og:locale', locale);
    if (siteName) setMetaTag('og:site_name', siteName);
    
    // Set Facebook app ID
    if (facebookAppId) setMetaTag('fb:app_id', facebookAppId);
    
    // Set Twitter Card tags
    if (twitterCard) setNameMetaTag('twitter:card', twitterCard);
    if (title) setNameMetaTag('twitter:title', title);
    if (description) setNameMetaTag('twitter:description', description);
    if (twitterSite) setNameMetaTag('twitter:site', twitterSite);
    if (twitterCreator) setNameMetaTag('twitter:creator', twitterCreator);
    
    // Set image tags
    images.forEach((image, index) => {
      if (image.url) {
        setMetaTag(`og:image${index > 0 ? `:0${index}` : ''}`, image.url);
        if (image.width) setMetaTag(`og:image:width${index > 0 ? `:0${index}` : ''}`, image.width.toString());
        if (image.height) setMetaTag(`og:image:height${index > 0 ? `:0${index}` : ''}`, image.height.toString());
        if (image.alt) setMetaTag(`og:image:alt${index > 0 ? `:0${index}` : ''}`, image.alt);
        if (image.type) setMetaTag(`og:image:type${index > 0 ? `:0${index}` : ''}`, image.type);
        
        // Set Twitter image (only the first one)
        if (index === 0) {
          setNameMetaTag('twitter:image', image.url);
          if (image.alt) setNameMetaTag('twitter:image:alt', image.alt);
        }
      }
    });
    
    // Set video tags
    videos.forEach((video, index) => {
      if (video.url) {
        setMetaTag(`og:video${index > 0 ? `:0${index}` : ''}`, video.url);
        if (video.width) setMetaTag(`og:video:width${index > 0 ? `:0${index}` : ''}`, video.width.toString());
        if (video.height) setMetaTag(`og:video:height${index > 0 ? `:0${index}` : ''}`, video.height.toString());
        if (video.type) setMetaTag(`og:video:type${index > 0 ? `:0${index}` : ''}`, video.type);
      }
    });
    
    // Set audio tags
    audio.forEach((audioItem, index) => {
      if (audioItem.url) {
        setMetaTag(`og:audio${index > 0 ? `:0${index}` : ''}`, audioItem.url);
        if (audioItem.type) setMetaTag(`og:audio:type${index > 0 ? `:0${index}` : ''}`, audioItem.type);
      }
    });
    
    // Set article-specific tags
    if (type === 'article' && article) {
      if (article.publishedTime) setMetaTag('article:published_time', article.publishedTime);
      if (article.modifiedTime) setMetaTag('article:modified_time', article.modifiedTime);
      if (article.expirationTime) setMetaTag('article:expiration_time', article.expirationTime);
      if (article.section) setMetaTag('article:section', article.section);
      
      // Set article authors
      article.authors?.forEach((author, index) => {
        setMetaTag(`article:author${index > 0 ? `:0${index}` : ''}`, author);
      });
      
      // Set article tags
      article.tags?.forEach((tag, index) => {
        setMetaTag(`article:tag${index > 0 ? `:0${index}` : ''}`, tag);
      });
    }
    
    // Set additional meta tags
    additionalMetaTags.forEach((tag) => {
      Object.entries(tag).forEach(([property, content]) => {
        setMetaTag(property, content);
      });
    });
    
    // Cleanup function to restore original tags
    return () => {
      // Remove all tags we added
      Object.entries(existingTags).forEach(([property, originalTag]) => {
        const isNameTag = property.startsWith('name:');
        const actualProperty = isNameTag ? property.substring(5) : property;
        const selector = isNameTag ? `meta[name="${actualProperty}"]` : `meta[property="${actualProperty}"]`;
        
        const currentTag = document.querySelector(selector);
        if (currentTag) {
          // Restore the original content
          currentTag.setAttribute('content', originalTag.getAttribute('content') || '');
        }
      });
    };
  }, [
    title,
    description,
    url,
    type,
    locale,
    siteName,
    images,
    videos,
    audio,
    facebookAppId,
    twitterCard,
    twitterSite,
    twitterCreator,
    additionalMetaTags,
    article,
  ]);
  
  // This component doesn't render anything
  return null;
}
