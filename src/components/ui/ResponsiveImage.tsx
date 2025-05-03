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
    // Always generate a deterministic image based on the alt text
    // This ensures consistent images even if the src is invalid
    const altText = alt.toLowerCase();

    // Category-specific default images with multiple options
    const defaultImages = {
      'cruise': [
        'https://images.unsplash.com/photo-1548574505-5e239809ee19',
        'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
        'https://images.unsplash.com/photo-1548690312-e3b507d8c110',
        'https://images.unsplash.com/photo-1548690396-1fae5d6a3f8a',
        'https://images.unsplash.com/photo-1548574169-47bca74f9515',
        'https://images.unsplash.com/photo-1580541631950-7282082b03fe',
        'https://images.unsplash.com/photo-1566375638485-8c4d8780ae10',
        'https://images.unsplash.com/photo-1505118380757-91f5f5632de0',
        'https://images.unsplash.com/photo-1559599746-8823b38544c6'
      ],
      'food': [
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        'https://images.unsplash.com/photo-1543352634-99a5d50ae78e',
        'https://images.unsplash.com/photo-1533777324565-a040eb52facd',
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
        'https://images.unsplash.com/photo-1481931098730-318b6f776db0',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
        'https://images.unsplash.com/photo-1515778767554-195d641642a7',
        'https://images.unsplash.com/photo-1482275548304-a58859dc31b7'
      ],
      'wine': [
        'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
        'https://images.unsplash.com/photo-1566452348683-79a64b069598',
        'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb',
        'https://images.unsplash.com/photo-1553361371-9513901d383f',
        'https://images.unsplash.com/photo-1516594798947-e65505dbb29d',
        'https://images.unsplash.com/photo-1560148218-1a83060f7b32'
      ],
      'travel': [
        'https://images.unsplash.com/photo-1488085061387-422e29b40080',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
        'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
        'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
        'https://images.unsplash.com/photo-1508672019048-805c876b67e2',
        'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a'
      ],
      'adventure': [
        'https://images.unsplash.com/photo-1551632811-561732d1e306',
        'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
        'https://images.unsplash.com/photo-1516939884455-1445c8652f83',
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd',
        'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
        'https://images.unsplash.com/photo-1533130061792-64b345e4a833',
        'https://images.unsplash.com/photo-1496080174650-637e3f22fa03',
        'https://images.unsplash.com/photo-1501555088652-021faa106b9b',
        'https://images.unsplash.com/photo-1473773508845-188df298d2d1',
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
        'https://images.unsplash.com/photo-1439853949127-fa647821eba0',
        'https://images.unsplash.com/photo-1455156218388-5e61b526818b'
      ]
    };

    // Find matching category
    let category = 'travel'; // Default
    for (const key of Object.keys(defaultImages)) {
      if (altText.includes(key)) {
        category = key;
        break;
      }
    }

    // Use the alt text to deterministically select an image from the array
    // Create a unique hash based on the alt text
    const uniqueHash = alt.split('').reduce((acc, char, index) => {
      // Use character position to create more variation
      return acc + (char.charCodeAt(0) * (index + 1));
    }, 0);

    const imageArray = defaultImages[category];
    const index = Math.abs(uniqueHash) % imageArray.length;

    // If we have a valid src, use it, otherwise use our deterministic fallback
    if (src && typeof src === 'string' && src.startsWith('http')) {
      return src;
    }

    return imageArray[index];
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
      // Generate a unique fallback based on the alt text
      const altText = alt.toLowerCase();

      // Category-specific default images with multiple options
      const defaultImages = {
        'cruise': [
          'https://images.unsplash.com/photo-1548574505-5e239809ee19',
          'https://images.unsplash.com/photo-1599640842225-85d111c60e6b',
          'https://images.unsplash.com/photo-1548690312-e3b507d8c110',
          'https://images.unsplash.com/photo-1548690396-1fae5d6a3f8a',
          'https://images.unsplash.com/photo-1548574169-47bca74f9515',
          'https://images.unsplash.com/photo-1580541631950-7282082b03fe',
          'https://images.unsplash.com/photo-1566375638485-8c4d8780ae10',
          'https://images.unsplash.com/photo-1505118380757-91f5f5632de0',
          'https://images.unsplash.com/photo-1559599746-8823b38544c6'
        ],
        'food': [
          'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
          'https://images.unsplash.com/photo-1543352634-99a5d50ae78e',
          'https://images.unsplash.com/photo-1533777324565-a040eb52facd',
          'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
          'https://images.unsplash.com/photo-1481931098730-318b6f776db0',
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
          'https://images.unsplash.com/photo-1515778767554-195d641642a7',
          'https://images.unsplash.com/photo-1482275548304-a58859dc31b7'
        ],
        'wine': [
          'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3',
          'https://images.unsplash.com/photo-1566452348683-79a64b069598',
          'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb',
          'https://images.unsplash.com/photo-1553361371-9513901d383f',
          'https://images.unsplash.com/photo-1516594798947-e65505dbb29d',
          'https://images.unsplash.com/photo-1560148218-1a83060f7b32'
        ],
        'travel': [
          'https://images.unsplash.com/photo-1488085061387-422e29b40080',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
          'https://images.unsplash.com/photo-1503220317375-aaad61436b1b',
          'https://images.unsplash.com/photo-1530521954074-e64f6810b32d',
          'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
          'https://images.unsplash.com/photo-1530789253388-582c481c54b0',
          'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
          'https://images.unsplash.com/photo-1508672019048-805c876b67e2',
          'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a'
        ],
        'adventure': [
          'https://images.unsplash.com/photo-1551632811-561732d1e306',
          'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
          'https://images.unsplash.com/photo-1516939884455-1445c8652f83',
          'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd',
          'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
          'https://images.unsplash.com/photo-1533130061792-64b345e4a833',
          'https://images.unsplash.com/photo-1496080174650-637e3f22fa03',
          'https://images.unsplash.com/photo-1501555088652-021faa106b9b',
          'https://images.unsplash.com/photo-1473773508845-188df298d2d1',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
          'https://images.unsplash.com/photo-1439853949127-fa647821eba0',
          'https://images.unsplash.com/photo-1455156218388-5e61b526818b'
        ]
      };

      // Find matching category
      let category = 'travel'; // Default
      for (const key of Object.keys(defaultImages)) {
        if (altText.includes(key)) {
          category = key;
          break;
        }
      }

      // Use the alt text to deterministically select an image from the array
      // But use a different hash function than the initial one to get a different image
      // Add a salt to ensure we get a different image than the initial one
      const salt = "fallback";
      const altHash = (alt + salt).split('').reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
      const imageArray = defaultImages[category];
      const index = Math.abs(altHash) % imageArray.length;

      setImageSrc(imageArray[index]);
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
