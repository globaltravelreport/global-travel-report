'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  onError?: () => void;
  fallbackSrc?: string;
  [key: string]: any;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  fill = false,
  className,
  priority = false,
  quality = 80,
  sizes,
  onError,
  fallbackSrc = '/images/fallback.jpg',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  };

  // If it's an Unsplash URL, ensure it has stable parameters
  const optimizedSrc = React.useMemo(() => {
    if (imageSrc.includes('images.unsplash.com') && !imageSrc.includes('?auto=format&q=80&w=')) {
      // Add stable parameters to Unsplash URLs
      const separator = imageSrc.includes('?') ? '&' : '?';
      return `${imageSrc}${separator}auto=format&q=80&w=${width || 2400}`;
    }
    return imageSrc;
  }, [imageSrc, width]);

  const imageProps = {
    src: optimizedSrc,
    alt,
    className: cn('transition-opacity duration-300', className),
    priority,
    quality,
    sizes: sizes || (fill ? '100vw' : undefined),
    onError: handleError,
    ...props
  };

  if (fill) {
    return (
      <div className={cn('relative', className)}>
        <Image
          {...imageProps}
          alt={alt}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      alt={alt}
      width={width}
      height={height}
    />
  );
};

export default OptimizedImage;

// Backwards-compatible named export expected by StoryCard and others
export const StoryCoverImage = OptimizedImage;
