"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/src/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  onLoad?: () => void;
  fallbackSrc?: string;
  photographer?: {
    name: string;
    url: string;
  };
  showAttribution?: boolean;
  attributionPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  loading?: 'eager' | 'lazy';
}

/**
 * Optimized image component with fallback, lazy loading, blur placeholder, and attribution
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  fallbackSrc = '/images/placeholder.svg',
  photographer,
  showAttribution = true,
  attributionPosition = 'bottom-right',
  loading = 'lazy',
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  // Handle image load error
  const handleError = () => {
    setImgSrc(fallbackSrc);
    setIsError(true);
    setIsLoading(false);
  };

  // Handle image load complete
  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  // Determine if the image is a WebP image
  const isWebP = imgSrc.toLowerCase().endsWith('.webp');

  // Convert to WebP if supported and not already WebP
  const getOptimizedSrc = () => {
    // If the image is already WebP or is the fallback image, return as is
    if (isWebP || isError) {
      return imgSrc;
    }

    // If the image is from an external domain, return as is
    if (imgSrc.startsWith('http') && !imgSrc.includes(window.location.hostname)) {
      return imgSrc;
    }

    // If the image is from Unsplash or similar services that already optimize, return as is
    if (imgSrc.includes('unsplash.com') || imgSrc.includes('cloudinary.com')) {
      return imgSrc;
    }

    // For internal images, try to use WebP format if possible
    try {
      // Extract the path without extension
      const basePath = imgSrc.substring(0, imgSrc.lastIndexOf('.'));
      return `${basePath}.webp`;
    } catch (e) {
      // If there's any error in processing, return the original source
      return imgSrc;
    }
  };

  // Get the optimized source
  const optimizedSrc = getOptimizedSrc();

  // Determine if this is an Unsplash image
  const isUnsplashImage = imgSrc.includes('unsplash.com');

  // Determine if we should show attribution
  const shouldShowAttribution = showAttribution && photographer && photographer.name && photographer.url;

  // Get attribution position classes
  const getAttributionPositionClasses = () => {
    switch (attributionPosition) {
      case 'top-left':
        return 'top-2 left-2';
      case 'top-right':
        return 'top-2 right-2';
      case 'bottom-left':
        return 'bottom-2 left-2';
      case 'bottom-right':
      default:
        return 'bottom-2 right-2';
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isLoading && 'animate-pulse bg-gray-200',
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        position: fill ? 'relative' : 'relative',
      }}
    >
      <Image
        src={optimizedSrc}
        alt={photographer ? `${alt} - Photo by ${photographer.name}${isUnsplashImage ? ' on Unsplash' : ''}` : alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        onError={handleError}
        onLoad={handleLoad}
        loading={loading}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          objectFit === 'cover' && 'object-cover',
          objectFit === 'contain' && 'object-contain',
          objectFit === 'fill' && 'object-fill',
          objectFit === 'none' && 'object-none',
          objectFit === 'scale-down' && 'object-scale-down'
        )}
        style={{ objectPosition }}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLzYvLy02LjY2OjY2Njo2NjY2NjY2NjY2NjY2NjY2NjY2NjY2Njb/2wBDARUXFyAeIB4gHh4gIB4lICAgICUmJSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICb/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />

      {/* Show error message if image failed to load */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <span className="text-sm">{alt || 'Image not available'}</span>
        </div>
      )}

      {/* Image attribution */}
      {shouldShowAttribution && (
        <div
          className={cn(
            'absolute px-2 py-1 text-xs bg-black/50 text-white rounded',
            getAttributionPositionClasses()
          )}
        >
          <span>
            Photo by{' '}
            <a
              href={photographer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/80"
              onClick={(e) => e.stopPropagation()}
            >
              {photographer.name}
            </a>
            {isUnsplashImage && (
              <>
                {' '}on{' '}
                <a
                  href="https://unsplash.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  Unsplash
                </a>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Optimized image for story covers with consistent aspect ratio
 */
export function StoryCoverImage({
  src,
  alt,
  priority = false,
  className,
  photographer,
  showAttribution = true,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  photographer?: {
    name: string;
    url: string;
  };
  showAttribution?: boolean;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={cn('aspect-[16/9]', className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      photographer={photographer}
      showAttribution={showAttribution}
      attributionPosition="bottom-right"
      loading="eager"
    />
  );
}

/**
 * Optimized image for author avatars
 */
export function AuthorAvatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      sizes={`${size}px`}
    />
  );
}

/**
 * Optimized image for category thumbnails
 */
export function CategoryThumbnail({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={120}
      height={80}
      className={cn('rounded-md', className)}
      sizes="120px"
    />
  );
}
