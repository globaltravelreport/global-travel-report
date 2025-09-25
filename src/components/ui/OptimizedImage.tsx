'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

/**
 * OptimizedImage component with fallback handling for broken Unsplash images
 * Automatically converts Unsplash URLs to stable CDN format and provides fallback
 */
export default function OptimizedImage({
  src,
  alt,
  width = 800,
  height = 600,
  fill = false,
  className = '',
  priority = false,
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fallbackSrc,
  onError,
  onLoad,
  objectFit = 'cover',
  objectPosition = 'center',
  loading = 'lazy',
  unoptimized = false,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  // Initialize with the provided src so SSR renders an actual image URL.
  // This avoids opacity-0 on first paint when priority is true (e.g., home hero).
  const [imageSrc, setImageSrc] = useState<string>(src || '');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(!priority ? true : false);

  // Default fallback image
  const defaultFallback = '/images/fallback.jpg';

  // Convert Unsplash URLs to stable CDN format
  const convertToStableUrl = (url: string): string => {
    const targetWidth = fill ? 2400 : width;

    // helper to ensure required params without duplicating '?'
    const ensureParams = (base: string) => {
      let out = base;
      const hasQuery = out.includes('?');
      if (!hasQuery) {
        return `${out}?auto=format&q=${quality}&w=${targetWidth}`;
      }
      if (!/[?&]auto=/.test(out)) out += `&auto=format`;
      if (!/[?&]q=/.test(out)) out += `&q=${quality}`;
      if (!/[?&]w=/.test(out)) out += `&w=${targetWidth}`;
      return out;
    };

    // If it's already a stable images.unsplash.com URL, normalize params
    if (url.includes('images.unsplash.com/photo-')) {
      return ensureParams(url);
    }

    // If it's an unsplash.com page URL, try to extract photo ID
    if (url.includes('unsplash.com/photo/')) {
      const photoMatch = url.match(/unsplash\.com\/photo\/([^/?]+)/);
      if (photoMatch && photoMatch[1]) {
        return `https://images.unsplash.com/photo-${photoMatch[1]}?auto=format&q=${quality}&w=${targetWidth}`;
      }
    }

    // If it's a source.unsplash.com URL (deprecated), convert to images.unsplash.com
    if (url.includes('source.unsplash.com')) {
      const sourceMatch = url.match(/source\.unsplash\.com\/([^/?]+)/);
      if (sourceMatch && sourceMatch[1]) {
        return `https://images.unsplash.com/photo-${sourceMatch[1]}?auto=format&q=${quality}&w=${targetWidth}`;
      }
    }

    // Handle template URLs that might be broken
    if (url.includes('photo-${') || (url.includes('photo-') && url.includes('${'))) {
      // This is likely a template string, return a fallback
      return `https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=${targetWidth}`;
    }

    // Handle malformed template URLs
    if (url.includes('photo-${photoId}') || url.includes('photo-${photoMatch[1]}') || url.includes('photo-${sourceMatch[1]}')) {
      // This is likely a template string, return a fallback
      return `https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=${targetWidth}`;
    }

    // Return original URL if no conversion needed
    return url;
  };

  // Set up the image source with fallback logic
  useEffect(() => {
    let processedSrc = src;

    // Convert to stable URL format
    processedSrc = convertToStableUrl(processedSrc);

    // Set the image source
    setImageSrc(processedSrc);
    setHasError(false);
    setIsLoading(true);
  }, [src, quality, width]);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);

    // Try fallback source if provided
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
      return;
    }

    // Use default fallback
    if (imageSrc !== defaultFallback) {
      setImageSrc(defaultFallback);
      setHasError(false);
      setIsLoading(true);
      return;
    }

    // All fallbacks failed
    setHasError(true);
    setIsLoading(false);
    onError?.();

    // Optional logging for broken images in production
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_IMAGE_ERROR_LOGGING === 'true') {
      console.warn(`[OptimizedImage] Image failed to load: ${src}`, {
        fallbackSrc,
        alt,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  if (!imageSrc) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`${fill ? 'relative w-full h-full' : 'relative'} ${className}`}>
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10"
          style={{ width, height }}
        >
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}

      <Image
        src={imageSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes}
        unoptimized={unoptimized}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${hasError ? 'opacity-50' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        onLoadingComplete={() => {
          // Ensure image becomes visible even if native onLoad doesn't fire in some browsers
          setIsLoading(false);
          setHasError(false);
          onLoad?.();
        }}
        style={fill ? { objectFit, objectPosition } : {
          width: '100%',
          height: 'auto',
          objectFit,
          objectPosition,
        }}
      />

      {hasError && (
        <div
          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-center text-gray-500">
            <div className="text-sm">Image unavailable</div>
            <div className="text-xs mt-1">Using fallback</div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface Photographer {
  name: string;
  url?: string;
  platform?: 'Unsplash' | 'Pexels' | 'Other';
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
  const [validatedSrc, setValidatedSrc] = useState(() => {
    // IMPORTANT: Always use the exact URL provided if it's valid
    // This ensures we respect the image URLs from the story files
    if (!src || (typeof src === 'string' && !src.startsWith('http'))) {
      // Return a default image based on the alt text
      if (alt.toLowerCase().includes('cruise')) {
        return 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&q=80&w=800';
      } else if (alt.toLowerCase().includes('food') || alt.toLowerCase().includes('wine')) {
        return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&q=80&w=800';
      } else {
        return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=800';
      }
    }

    // For Unsplash images, we can optimize by adding quality and format parameters
    if (src.includes('unsplash.com') && !src.includes('q=')) {
      // Add format and quality parameters if not already present
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}auto=format&q=${quality}&w=800`;
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

    // Use a reliable fallback image
    setValidatedSrc('https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&q=80&w=800');
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
