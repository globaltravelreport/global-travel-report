'use client';

import React, { useState, useEffect, useRef } from 'react';
import { OptimizedImageV2, Photographer } from './OptimizedImageV2';
import { cn } from '@/utils/cn';

interface ResponsiveImageV2Props {
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
  caption?: string;
  photographer?: Photographer;
  enhanceOnHover?: boolean;
  showSkeleton?: boolean;
}

/**
 * ResponsiveImageV2 component with lazy loading and responsive sizing
 */
export function ResponsiveImageV2({
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
  caption,
  photographer,
  enhanceOnHover = false,
  showSkeleton = true,
}: ResponsiveImageV2Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert sizes object to sizes string
  const sizesString = React.useMemo(() => {
    const sizeEntries = Object.entries(sizes).filter(([_, value]) => !!value);
    
    if (sizeEntries.length === 0) {
      return '100vw';
    }
    
    return sizeEntries
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
  }, [sizes]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    // Try to use a fallback image based on alt text
    if (imageSrc !== src) {
      // We've already tried a fallback, so just report the error
      onError?.();
      return;
    }

    // Set a fallback image based on the alt text
    const fallbackSrc = getFallbackImage(alt);
    setImageSrc(fallbackSrc);
    onError?.();
  };

  // Get a fallback image based on alt text
  const getFallbackImage = (altText: string) => {
    const lowerAlt = altText.toLowerCase();
    
    if (lowerAlt.includes('cruise') || lowerAlt.includes('ship')) {
      return 'https://images.unsplash.com/photo-1548574505-5e239809ee19?fm=webp&q=80&auto=compress';
    } else if (lowerAlt.includes('food') || lowerAlt.includes('dining') || lowerAlt.includes('restaurant')) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?fm=webp&q=80&auto=compress';
    } else if (lowerAlt.includes('hotel') || lowerAlt.includes('resort')) {
      return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?fm=webp&q=80&auto=compress';
    } else if (lowerAlt.includes('beach') || lowerAlt.includes('ocean')) {
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?fm=webp&q=80&auto=compress';
    } else if (lowerAlt.includes('mountain') || lowerAlt.includes('hiking')) {
      return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?fm=webp&q=80&auto=compress';
    } else {
      return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?fm=webp&q=80&auto=compress';
    }
  };

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || priority || !containerRef.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        root: null,
        rootMargin: lazyLoadRootMargin,
        threshold: lazyLoadThreshold,
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [lazyLoad, priority, lazyLoadRootMargin, lazyLoadThreshold]);

  // Create the image component
  const imageComponent = (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden w-full",
        containerClassName
      )}
      style={{ aspectRatio }}
    >
      {(isVisible || priority) && (
        <OptimizedImageV2
          src={imageSrc}
          alt={alt}
          fill
          priority={priority}
          quality={quality}
          className={cn(
            "transition-opacity duration-500",
            !isLoaded && !priority && "opacity-0",
            isLoaded && "opacity-100",
            className
          )}
          sizes={sizesString}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          objectFit={objectFit}
          objectPosition={objectPosition}
          caption={caption}
          photographer={photographer}
          enhanceOnHover={enhanceOnHover}
          showSkeleton={showSkeleton}
          aspectRatio={aspectRatio}
        />
      )}
    </div>
  );

  return imageComponent;
}
