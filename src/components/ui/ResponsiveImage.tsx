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
      // Return a default image based on the alt text
      if (alt.toLowerCase().includes('cruise')) {
        return 'https://images.unsplash.com/photo-1548574505-5e239809ee19';
      } else if (alt.toLowerCase().includes('food') || alt.toLowerCase().includes('wine')) {
        return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836';
      } else {
        return 'https://images.unsplash.com/photo-1488085061387-422e29b40080';
      }
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
      // Try a different fallback image based on the alt text
      let fallbackSrc = 'https://images.unsplash.com/photo-1488085061387-422e29b40080';

      if (alt.toLowerCase().includes('cruise')) {
        fallbackSrc = 'https://images.unsplash.com/photo-1548574505-5e239809ee19';
      } else if (alt.toLowerCase().includes('food') || alt.toLowerCase().includes('wine')) {
        fallbackSrc = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836';
      }

      setImageSrc(fallbackSrc);
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
