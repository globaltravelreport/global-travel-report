'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/utils/cn';

interface LazyLoadProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  placeholder?: React.ReactNode;
  onVisible?: () => void;
  once?: boolean;
  style?: React.CSSProperties;
  disabled?: boolean;
}

/**
 * LazyLoad component for lazy loading content when it enters the viewport
 * 
 * @param children - Content to lazy load
 * @param className - Additional CSS classes
 * @param threshold - Intersection threshold (0-1)
 * @param rootMargin - Root margin for Intersection Observer
 * @param placeholder - Placeholder to show while loading
 * @param onVisible - Callback when content becomes visible
 * @param once - Whether to disconnect observer after first visibility
 * @param style - Additional CSS styles
 * @param disabled - Disable lazy loading (render children immediately)
 */
export function LazyLoad({
  children,
  className,
  threshold = 0.1,
  rootMargin = '200px 0px',
  placeholder = <div className="animate-pulse bg-gray-200 w-full h-full min-h-[100px] rounded"></div>,
  onVisible,
  once = true,
  style,
  disabled = false,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If disabled, set visible immediately
    if (disabled) {
      setIsVisible(true);
      setHasBeenVisible(true);
      if (onVisible) onVisible();
      return;
    }

    // Skip if already visible and using once mode
    if (once && hasBeenVisible) return;

    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasBeenVisible(true);
            if (onVisible) onVisible();
            
            // Disconnect after first visibility if once is true
            if (once) observer.disconnect();
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold, rootMargin, onVisible, once, hasBeenVisible, disabled]);

  return (
    <div 
      ref={ref} 
      className={cn("transition-opacity duration-500", className)}
      style={style}
    >
      {(isVisible || hasBeenVisible) ? children : placeholder}
    </div>
  );
}

export default LazyLoad;
