'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/src/utils/cn';
import { useAccessibility } from '@/components/ui/AccessibilityProvider';

export interface Photographer {
  name: string;
  url?: string;
  platform?: 'Unsplash' | 'Pexels' | 'Other';
}

interface OptimizedImageV2Props {
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
  showSkeleton?: boolean;
  caption?: string;
  photographer?: Photographer;
  enhanceOnHover?: boolean;
  lazyLoadThreshold?: number;
  aspectRatio?: string;
}

/**
 * OptimizedImageV2 component with WebP support, performance optimizations, and accessibility features
 */
export function OptimizedImageV2({
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
  showSkeleton = true,
  caption,
  photographer,
  enhanceOnHover = false,
  lazyLoadThreshold = 0.1,
  aspectRatio,
}: OptimizedImageV2Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState(false);
  const { highContrast } = useAccessibility?.() || { highContrast: false };
  
  // Generate a placeholder color based on the alt text for better UX
  const placeholderColor = React.useMemo(() => {
    if (!alt) return '#f3f4f6';
    
    // Generate a light pastel color based on the alt text
    let hash = 0;
    for (let i = 0; i < alt.length; i++) {
      hash = alt.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate pastel colors (lighter and less saturated)
    const h = hash % 360;
    const s = 25 + (hash % 30); // Lower saturation (25-55%)
    const l = 85 + (hash % 10); // Higher lightness (85-95%)
    
    return `hsl(${h}, ${s}%, ${l}%)`;
  }, [alt]);

  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Handle image error event
  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Optimize image URL based on source
  const optimizedSrc = React.useMemo(() => {
    if (!src) return '';
    
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

  // Generate blur data URL if not provided
  const generatedBlurDataURL = React.useMemo(() => {
    if (blurDataURL) return blurDataURL;
    
    // Create a simple SVG placeholder with the generated color
    return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${encodeURIComponent(placeholderColor)}"/></svg>`;
  }, [blurDataURL, placeholderColor]);

  // Determine container style based on aspect ratio
  const containerStyle = React.useMemo(() => {
    const baseStyle: React.CSSProperties = {
      ...style,
      backgroundColor: !isLoaded && showSkeleton ? placeholderColor : 'transparent',
    };
    
    if (aspectRatio) {
      return {
        ...baseStyle,
        aspectRatio,
        width: '100%',
      };
    }
    
    if (!fill) {
      return {
        ...baseStyle,
        width: width,
        height: height,
      };
    }
    
    return baseStyle;
  }, [style, isLoaded, showSkeleton, placeholderColor, aspectRatio, fill, width, height]);

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        !fill && !aspectRatio && "inline-block",
        className
      )}
      style={containerStyle}
    >
      {error ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
          <span>Image not available</span>
        </div>
      ) : (
        <>
          <Image
            src={optimizedSrc}
            alt={alt}
            width={fill || aspectRatio ? undefined : width}
            height={fill || aspectRatio ? undefined : height}
            fill={fill || !!aspectRatio}
            priority={priority}
            quality={quality}
            className={cn(
              "transition-all duration-300",
              !isLoaded && !priority && showSkeleton && "opacity-0",
              isLoaded || (priority && !showSkeleton) ? "opacity-100" : "",
              highContrast && "contrast-125 brightness-110",
              `object-${objectFit}`,
              "rounded-md"
            )}
            style={{ objectPosition }}
            sizes={sizes}
            loading={priority ? 'eager' : loading}
            placeholder={placeholder}
            blurDataURL={generatedBlurDataURL}
            onLoad={handleLoad}
            onError={handleError}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          
          {/* Caption and attribution */}
          {(caption || photographer) && isLoaded && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 transition-opacity duration-300">
              {caption && <p className="mb-1">{caption}</p>}
              {photographer && (
                <p>
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
                  {photographer.platform && ` on ${photographer.platform}`}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
