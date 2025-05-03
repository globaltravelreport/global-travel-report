'use client';

import React, { useState } from 'react';
import { OptimizedImage } from './OptimizedImage';
import { LazyLoad } from './LazyLoad';
import { cn } from '@/src/utils/cn';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  aspectRatio?: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  quality?: number;
  lazyLoad?: boolean;
  lazyLoadThreshold?: number;
  lazyLoadRootMargin?: string;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
}

/**
 * ResponsiveImage component with WebP support, lazy loading, and responsive sizing
 */
export function ResponsiveImage({
  src,
  alt,
  sizes = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
  },
  aspectRatio = '16/9',
  className = '',
  containerClassName = '',
  priority = false,
  quality = 80,
  lazyLoad = true,
  lazyLoadThreshold = 0.1,
  lazyLoadRootMargin = '200px 0px',
  onLoad,
  onError,
  objectFit = 'cover',
  objectPosition = 'center',
}: ResponsiveImageProps) {
  // Ensure we have a valid image URL or use a fallback
  const [imageSrc, setImageSrc] = useState(() => {
    // Check if src is a valid URL
    if (!src || (typeof src === 'string' && !src.startsWith('http'))) {
      // Generate a more unique fallback based on the alt text
      const altText = alt.toLowerCase();

      // Category-specific default images with multiple options
      const defaultImages = {
        'cruise': [
          'https://images.unsplash.com/photo-1548574505-5e239809ee19',
          'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
          'https://images.unsplash.com/photo-1548690312-e3b507d8c110'
        ],
        'food': [
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
          'https://images.unsplash.com/photo-1543352634-99a5d50ae78e',
          'https://images.unsplash.com/photo-1533777324565-a040eb52facd'
        ],
        'wine': [
          'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
          'https://images.unsplash.com/photo-1566452348683-79a64b069598',
          'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb'
        ],
        'travel': [
          'https://images.unsplash.com/photo-1488085061387-422e29b40080',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b'
        ],
        'adventure': [
          'https://images.unsplash.com/photo-1551632811-561732d1e306',
          'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
          'https://images.unsplash.com/photo-1516939884455-1445c8652f83'
        ]
      };

      // Find matching category
      let category = 'travel'; // Default
      for (const key of Object.keys(defaultImages)) {
        if (altText.includes(key)) {
          category = key;
          break;
        }
      }

      // Use the alt text to deterministically select an image from the array
      const altHash = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const imageArray = defaultImages[category];
      const index = altHash % imageArray.length;

      return imageArray[index];
    }
    return src;
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Convert sizes object to sizes string for next/image
  const sizesString = Object.entries(sizes)
    .map(([breakpoint, size]) => {
      switch (breakpoint) {
        case 'sm': return `(max-width: 640px) ${size}`;
        case 'md': return `(max-width: 768px) ${size}`;
        case 'lg': return `(max-width: 1024px) ${size}`;
        case 'xl': return `(max-width: 1280px) ${size}`;
        default: return size;
      }
    })
    .join(', ');

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);

    // If the image fails to load, try a fallback
    if (src !== imageSrc) {
      // We're already using a fallback, so just report the error
      if (onError) onError();
    } else {
      // Generate a unique fallback based on the alt text
      const altText = alt.toLowerCase();

      // Category-specific default images with multiple options
      const defaultImages = {
        'cruise': [
          'https://images.unsplash.com/photo-1548574505-5e239809ee19',
          'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
          'https://images.unsplash.com/photo-1548690312-e3b507d8c110'
        ],
        'food': [
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
          'https://images.unsplash.com/photo-1543352634-99a5d50ae78e',
          'https://images.unsplash.com/photo-1533777324565-a040eb52facd'
        ],
        'wine': [
          'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
          'https://images.unsplash.com/photo-1566452348683-79a64b069598',
          'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb'
        ],
        'travel': [
          'https://images.unsplash.com/photo-1488085061387-422e29b40080',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b'
        ],
        'adventure': [
          'https://images.unsplash.com/photo-1551632811-561732d1e306',
          'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
          'https://images.unsplash.com/photo-1516939884455-1445c8652f83'
        ]
      };

      // Find matching category
      let category = 'travel'; // Default
      for (const key of Object.keys(defaultImages)) {
        if (altText.includes(key)) {
          category = key;
          break;
        }
      }

      // Use the alt text to deterministically select an image from the array
      // But use a different hash function than the initial one to get a different image
      const altHash = alt.split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
      const imageArray = defaultImages[category];
      const index = altHash % imageArray.length;

      setImageSrc(imageArray[index]);
    }
  };

  const imageComponent = (
    <div
      className={cn(
        "relative overflow-hidden w-full",
        containerClassName
      )}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        quality={quality}
        className={cn(
          "transition-opacity duration-500",
          !isLoaded && "opacity-0",
          isLoaded && "opacity-100",
          className
        )}
        sizes={sizesString}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? 'eager' : 'lazy'}
        objectFit={objectFit}
        objectPosition={objectPosition}
      />
    </div>
  );

  // If priority is true or lazyLoad is false, don't use LazyLoad component
  if (priority || !lazyLoad) {
    return imageComponent;
  }

  return (
    <LazyLoad
      threshold={lazyLoadThreshold}
      rootMargin={lazyLoadRootMargin}
      placeholder={
        <div
          className="animate-pulse bg-gray-200 w-full rounded"
          style={{ aspectRatio }}
        />
      }
    >
      {imageComponent}
    </LazyLoad>
  );
}

export default ResponsiveImage;
