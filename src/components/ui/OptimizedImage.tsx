"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';

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
      return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?fm=webp&q=80&auto=compress';
    }

    // If src doesn't start with http, it's invalid
    if (!src.startsWith('http')) {
      return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?fm=webp&q=80&auto=compress';
    }

    // IMPORTANT: Always use the exact URL provided
    // This ensures we respect the image URLs from the story files

    // For Unsplash images, we can optimize by adding quality and format parameters
    if (src.includes('unsplash.com') && !src.includes('q=')) {
      // Add WebP format and quality parameters if not already present
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}fm=webp&q=${quality}&auto=compress`;
    }

    // For Pexels images, add auto format and quality parameters
    if (src.includes('pexels.com') && !src.includes('auto=')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}auto=webp&q=${quality}`;
    }

    // For Cloudinary images, add format and quality parameters
    if (src.includes('cloudinary.com') && !src.includes('f_auto')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}f_auto,q_${quality}`;
    }

    // For Imgix images, add format and quality parameters
    if (src.includes('imgix.net') && !src.includes('fm=')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}fm=webp&q=${quality}&auto=compress`;
    }

    // For local images, Next.js Image component will handle optimization automatically
    return src;
  }, [src, quality]);

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
<<<<<<< HEAD
          blurDataURL={blurDataURL || `data:image/svg+xml;charset=utf-8,<svg xmlns="https://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${encodeURIComponent(placeholderColor)}"/></svg>`}
=======
          blurDataURL={blurDataURL || `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${encodeURIComponent(placeholderColor)}"/></svg>`}
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
          unoptimized={false}
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
    // IMPORTANT: Always use the exact URL provided if it's valid
    // This ensures we respect the image URLs from the story files
    if (!src || (typeof src === 'string' && !src.startsWith('http'))) {
      // Return a default image based on the alt text
      if (alt.toLowerCase().includes('cruise')) {
        return 'https://images.unsplash.com/photo-1548574505-5e239809ee19?fm=webp&q=80&auto=compress';
      } else if (alt.toLowerCase().includes('food') || alt.toLowerCase().includes('wine')) {
        return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?fm=webp&q=80&auto=compress';
      } else {
        return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?fm=webp&q=80&auto=compress';
      }
    }

    // For Unsplash images, we can optimize by adding quality and format parameters
    if (src.includes('unsplash.com') && !src.includes('q=')) {
      // Add WebP format and quality parameters if not already present
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}fm=webp&q=${quality}&auto=compress`;
    }

    // Always use the exact URL provided
    return src;
  });

  // Handle image error
  const handleImageError = () => {
    // If the image fails to load, use a simple fallback
    if (src !== validatedSrc) {
      // We're already using a fallback, don't change again
      return;
    }

    // Use a reliable fallback image with WebP format
    setValidatedSrc('https://images.unsplash.com/photo-1488085061387-422e29b40080?fm=webp&q=80&auto=compress');
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
