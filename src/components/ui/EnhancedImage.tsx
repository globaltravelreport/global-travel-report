'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/src/utils/cn';
import { useAccessibility } from '@/src/components/ui/AccessibilityProvider';

interface EnhancedImageProps {
  /**
   * Source URL of the image
   */
  src: string;
  
  /**
   * Alt text for the image
   */
  alt: string;
  
  /**
   * Width of the image in pixels
   */
  width?: number;
  
  /**
   * Height of the image in pixels
   */
  height?: number;
  
  /**
   * Whether to fill the container
   */
  fill?: boolean;
  
  /**
   * Whether to load the image with priority
   */
  priority?: boolean;
  
  /**
   * Quality of the image (1-100)
   */
  quality?: number;
  
  /**
   * Additional class names to apply
   */
  className?: string;
  
  /**
   * Object fit property
   */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  
  /**
   * Object position property
   */
  objectPosition?: string;
  
  /**
   * Sizes attribute for responsive images
   */
  sizes?: string;
  
  /**
   * Whether to lazy load the image
   */
  loading?: 'eager' | 'lazy';
  
  /**
   * Placeholder type
   */
  placeholder?: 'blur' | 'empty';
  
  /**
   * Blur data URL for placeholder
   */
  blurDataURL?: string;
  
  /**
   * Callback when image loads
   */
  onLoad?: () => void;
  
  /**
   * Callback when image fails to load
   */
  onError?: () => void;
  
  /**
   * Whether to show a loading skeleton
   */
  showSkeleton?: boolean;
  
  /**
   * Whether to show a caption
   */
  caption?: string;
  
  /**
   * Photographer name for attribution
   */
  photographer?: string;
  
  /**
   * Photographer URL for attribution
   */
  photographerUrl?: string;
  
  /**
   * Whether to enable high-quality images on hover
   */
  enhanceOnHover?: boolean;
}

/**
 * Enhanced image component with accessibility features, loading states, and optimizations
 */
export function EnhancedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 80,
  className,
  objectFit = 'cover',
  objectPosition = 'center',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  loading = 'lazy',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  showSkeleton = true,
  caption,
  photographer,
  photographerUrl,
  enhanceOnHover = false,
}: EnhancedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(false);
  const { highContrast } = useAccessibility();
  
  // Reset loaded state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    if (onError) onError();
  };
  
  // Optimize image URL
  const optimizedSrc = React.useMemo(() => {
    // For Unsplash images, add quality and format parameters
    if (src.includes('unsplash.com') && !src.includes('q=')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}fm=webp&q=${isHovered && enhanceOnHover ? 90 : quality}&auto=compress`;
    }
    
    // For Pexels images, add auto format and quality parameters
    if (src.includes('pexels.com') && !src.includes('auto=')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}auto=webp&q=${isHovered && enhanceOnHover ? 90 : quality}`;
    }
    
    // For Cloudinary images, add format and quality parameters
    if (src.includes('cloudinary.com') && !src.includes('f_auto')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}f_auto,q_${isHovered && enhanceOnHover ? 90 : quality}`;
    }
    
    // For Imgix images, add format and quality parameters
    if (src.includes('imgix.net') && !src.includes('fm=')) {
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}fm=webp&q=${isHovered && enhanceOnHover ? 90 : quality}&auto=compress`;
    }
    
    return src;
  }, [src, quality, isHovered, enhanceOnHover]);
  
  // If there's an error, show a fallback
  if (error) {
    return (
      <div 
        className={cn(
          "relative bg-gray-200 dark:bg-gray-800 flex items-center justify-center",
          fill ? "w-full h-full" : "",
          className
        )}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-gray-500 dark:text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }
  
  return (
    <div className={cn("relative", className)}>
      {/* Loading skeleton */}
      {showSkeleton && !isLoaded && !priority && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse",
            fill ? "w-full h-full" : ""
          )}
          style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
          aria-hidden="true"
        />
      )}
      
      {/* Image */}
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
          !isLoaded && !priority && "opacity-0",
          isLoaded || priority ? "opacity-100" : "",
          highContrast && "contrast-125 brightness-110",
          objectFit && `object-${objectFit}`,
          "rounded-md"
        )}
        style={{ objectPosition }}
        sizes={sizes}
        loading={priority ? 'eager' : loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* Caption */}
      {caption && isLoaded && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {caption}
        </div>
      )}
      
      {/* Photographer attribution */}
      {photographer && isLoaded && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
          Photo by{' '}
          {photographerUrl ? (
            <a
              href={photographerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              {photographer}
            </a>
          ) : (
            photographer
          )}
        </div>
      )}
    </div>
  );
}

export default EnhancedImage;
