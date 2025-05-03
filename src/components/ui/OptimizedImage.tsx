"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/src/utils/cn';

export interface Photographer {
  name: string;
  url?: string;
  platform?: 'Unsplash' | 'Pexels' | 'Other';
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  loading?: 'eager' | 'lazy';
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * OptimizedImage component with WebP support and performance optimizations
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 80,
  className = '',
  style,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate a placeholder color based on the alt text for consistent placeholders
  const generatePlaceholderColor = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  const placeholderColor = generatePlaceholderColor(alt);

  // Handle image loading
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleError = () => {
    setError(true);
    if (onError) onError();
  };

  // Determine if the image is from Unsplash or another source
  const isUnsplashImage = typeof src === 'string' && src.includes('unsplash.com');

  // Validate and optimize image URLs
  const optimizedSrc = React.useMemo(() => {
    // If src is not a string or empty, return a default image
    if (!src || typeof src !== 'string') {
      return 'https://images.unsplash.com/photo-1488085061387-422e29b40080';
    }

    // If src doesn't start with http, it's invalid
    if (!src.startsWith('http')) {
      return 'https://images.unsplash.com/photo-1488085061387-422e29b40080';
    }

    // Log the image URL for debugging
    console.log('Image URL:', src);

    // Optimize Unsplash URLs for better performance
    if (isUnsplashImage) {
      try {
        const url = new URL(src);
        // Add auto format and quality parameters
        url.searchParams.set('auto', 'format');
        url.searchParams.set('q', quality.toString());
        return url.toString();
      } catch (e) {
        console.error('Error parsing Unsplash URL:', e);
        return src;
      }
    }

    return src;
  }, [src, isUnsplashImage, quality]);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        !fill && "inline-block",
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        backgroundColor: !isLoaded ? placeholderColor : 'transparent',
        ...style
      }}
    >
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
          <span>Image not available</span>
        </div>
      ) : (
        <Image
          src={optimizedSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          className={cn(
            "transition-opacity duration-300",
            !isLoaded && "opacity-0",
            isLoaded && "opacity-100"
          )}
          style={{
            objectFit,
            objectPosition
          }}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
        />
      )}
    </div>
  );
}

interface StoryCoverImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  photographer?: Photographer;
  showAttribution?: boolean;
  quality?: number;
}

/**
 * StoryCoverImage component with photographer attribution
 */
export function StoryCoverImage({
  src,
  alt,
  priority = false,
  className = '',
  photographer,
  showAttribution = false,
  quality = 80,
}: StoryCoverImageProps) {
  // Validate the image URL
  const [validatedSrc, setValidatedSrc] = useState(() => {
    // Log the image URL for debugging
    console.log('StoryCoverImage URL:', src);

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

  // Handle image error
  const handleImageError = () => {
    // If the image fails to load, try a fallback
    if (src !== validatedSrc) {
      // We're already using a fallback, don't change again
      return;
    }

    // Try a different fallback image based on the alt text
    let fallbackSrc = 'https://images.unsplash.com/photo-1488085061387-422e29b40080';

    if (alt.toLowerCase().includes('cruise')) {
      fallbackSrc = 'https://images.unsplash.com/photo-1548574505-5e239809ee19';
    } else if (alt.toLowerCase().includes('food') || alt.toLowerCase().includes('wine')) {
      fallbackSrc = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836';
    }

    setValidatedSrc(fallbackSrc);
  };

  // Determine the platform URL and name
  const platformUrl = photographer?.platform === 'Pexels'
    ? 'https://www.pexels.com'
    : 'https://unsplash.com';

  const platformName = photographer?.platform || 'Unsplash';

  return (
    <div className="relative w-full h-full">
      <OptimizedImage
        src={validatedSrc}
        alt={alt}
        fill
        priority={priority}
        className={className}
        objectFit="cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        quality={quality}
        loading={priority ? 'eager' : 'lazy'}
        onError={handleImageError}
      />

      {showAttribution && photographer && photographer.name && (
        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs p-2 rounded-tl">
          Photo by{" "}
          {photographer.url ? (
            <a
              href={photographer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-gray-200"
            >
              {photographer.name}
            </a>
          ) : (
            <span className="font-bold">{photographer.name}</span>
          )}
          {" "}on{" "}
          <a
            href={platformUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline hover:text-gray-200"
          >
            {platformName}
          </a>
        </div>
      )}
    </div>
  );
}
