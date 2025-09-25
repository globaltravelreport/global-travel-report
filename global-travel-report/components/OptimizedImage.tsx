
'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/utils/cn';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Optimized image component with Unsplash optimization and fallback handling
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 80,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Optimize Unsplash URLs
  const optimizeUnsplashUrl = (url: string, targetWidth?: number, targetHeight?: number): string => {
    if (!url.includes('unsplash.com')) {
      return url;
    }

    // Extract the base URL and photo ID
    const unsplashRegex = /https:\/\/images\.unsplash\.com\/photo-([^?]+)/;
    const match = url.match(unsplashRegex);
    
    if (!match) {
      return url;
    }

    const photoId = match[1];
    const params = new URLSearchParams();
    
    // Add optimization parameters
    if (targetWidth) {
      params.set('w', targetWidth.toString());
    }
    if (targetHeight) {
      params.set('h', targetHeight.toString());
    }
    
    // Set quality and format
    params.set('q', quality.toString());
    params.set('fm', 'webp');
    params.set('fit', 'crop');
    params.set('crop', 'entropy');
    
    return `https://images.unsplash.com/photo-${photoId}?auto=format&q=80&w=2400)}`;
  };

  // Generate blur data URL for Unsplash images
  const generateBlurDataURL = (url: string): string => {
    if (blurDataURL) {
      return blurDataURL;
    }

    if (url.includes('unsplash.com')) {
      return optimizeUnsplashUrl(url, 10, 10);
    }

    // Default blur data URL
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';
  };

  const optimizedSrc = optimizeUnsplashUrl(src, width, height);
  const blurData = generateBlurDataURL(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Fallback image component
  if (hasError) {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center text-gray-400',
          className
        )}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  const imageProps = {
    src: optimizedSrc,
    alt,
    className: cn(
      'transition-opacity duration-300',
      isLoading ? 'opacity-0' : 'opacity-100',
      className
    ),
    priority,
    quality,
    placeholder,
    blurDataURL: blurData,
    sizes: sizes || (fill ? '100vw' : undefined),
    onLoad: handleLoad,
    onError: handleError,
    style: fill ? undefined : { objectFit, objectPosition },
    loading: priority ? 'eager' : loading,
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        alt={alt}
        style={{ objectFit, objectPosition }}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      alt={alt}
    />
  );
}

export default OptimizedImage;
