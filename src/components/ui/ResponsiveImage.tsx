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
  // Always use the provided src or a fallback if it's not valid
  const [imageSrc, setImageSrc] = useState(() => {
    // If we have a valid src, use it
    if (src && typeof src === 'string') {
      return src;
    }

    // If no valid src is provided, use a default image
    return 'https://images.unsplash.com/photo-1488085061387-422e29b40080'; // Default image
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

    // If the image fails to load, use a simple fallback
    if (src !== imageSrc) {
      // We're already using a fallback, so just report the error
      if (onError) onError();
    } else {
      // Use a reliable fallback image
      setImageSrc('https://images.unsplash.com/photo-1488085061387-422e29b40080');
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
