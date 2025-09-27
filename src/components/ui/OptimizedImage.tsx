'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { getBlurDataURL, getResponsiveSizes } from '@/utils/image-optimization';
import reportWebVitals from '@/utils/web-vitals';

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
  const [loaded, setLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ioRef, entry] = useIntersectionObserver({ rootMargin: '200px' });
  const isVisible = priority || entry?.isIntersecting;

  // Blur placeholder logic
  const blurDataURL = props.blurDataURL || getBlurDataURL(src);
  const showBlur = !loaded && !!blurDataURL;

  // Responsive sizes
  const responsiveSizes = sizes || (width ? getResponsiveSizes(width) : '100vw');

  const handleError = () => {
    if (retryCount < 2) {
      setRetryCount(retryCount + 1);
      setImageSrc(src + (src.includes('?') ? '&' : '?') + 'retry=' + (retryCount + 1));
    } else if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
      onError?.();
    }
  };

  const handleLoadingComplete = (result: any) => {
    setLoaded(true);
    if (priority && typeof window !== 'undefined') {
      reportWebVitals({ name: 'LCP', value: performance.now(), id: src, delta: 0, navigationType: 'navigate' } as any);
    }
  };

  // If it's an Unsplash URL, ensure it has stable parameters
  const optimizedSrc = React.useMemo(() => {
    if (imageSrc.includes('images.unsplash.com') && !imageSrc.includes('?auto=format&q=80&w=')) {
      const separator = imageSrc.includes('?') ? '&' : '?';
      return `${imageSrc}${separator}auto=format&q=80&w=${width || 2400}`;
    }
    return imageSrc;
  }, [imageSrc, width]);

  const imageProps = {
    src: optimizedSrc,
    alt,
    className: cn('transition-opacity duration-300', className, showBlur ? 'opacity-0' : 'opacity-100'),
    priority,
    quality,
    sizes: responsiveSizes,
    onError: handleError,
    onLoadingComplete: handleLoadingComplete,
    placeholder: blurDataURL ? ('blur' as const) : undefined,
    blurDataURL,
    ...props
  };

  if (fill) {
    return (
      <div ref={el => { containerRef.current = el; ioRef.current = el; }} className={cn('relative w-full h-full')}>
        {isVisible ? (
          <Image
            {...imageProps}
            alt={alt}
            fill
            style={{ objectFit: 'cover', opacity: loaded ? 1 : 0.5, transition: 'opacity 0.3s' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div ref={el => { containerRef.current = el; ioRef.current = el; }} style={{ width, height }}>
      {isVisible ? (
        <Image
          {...imageProps}
          alt={alt}
          width={width}
          height={height}
          style={{ opacity: loaded ? 1 : 0.5, transition: 'opacity 0.3s' }}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse" style={{ width, height }} />
      )}
    </div>
  );
};

export default OptimizedImage;

// Backwards-compatible named export expected by StoryCard and others
export const StoryCoverImage = OptimizedImage;
