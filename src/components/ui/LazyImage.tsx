'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function LazyImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
  sizes,
  fill = false,
  style,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <div className="text-gray-400 text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          <p className="text-sm">Image failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={style}>
      {isInView && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            quality={quality}
            priority={priority}
            placeholder={placeholder}
            blurDataURL={blurDataURL}
            onLoad={handleLoad}
            onError={handleError}
            sizes={sizes}
            fill={fill}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </motion.div>
      )}

      {/* Loading placeholder */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Intersection trigger area */}
      {!isInView && !priority && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
    </div>
  );
}

// Optimized image component with fallback
interface OptimizedImageProps extends Omit<LazyImageProps, 'onError'> {
  fallbackSrc?: string;
  fallbackAlt?: string;
}

export function OptimizedImage({
  fallbackSrc = '/images/fallback.jpg',
  fallbackAlt = 'Image not available',
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(props.src);
  const [currentAlt, setCurrentAlt] = useState(props.alt);

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setCurrentAlt(fallbackAlt);
    }
  };

  return (
    <LazyImage
      {...props}
      src={currentSrc}
      alt={currentAlt}
      onError={handleError}
    />
  );
}

// Background image component with lazy loading
interface LazyBackgroundImageProps {
  src: string;
  children: React.ReactNode;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
}

export function LazyBackgroundImage({
  src,
  children,
  className = '',
  placeholder = 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
  onLoad,
}: LazyBackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isInView || isLoaded) return;

    const img = new window.Image();
    img.onload = () => {
      setIsLoaded(true);
      onLoad?.();
    };
    img.src = src;
  }, [isInView, isLoaded, src, onLoad]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : placeholder,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        transition: 'background-image 0.3s ease-in-out',
      }}
    >
      {children}
    </div>
  );
}