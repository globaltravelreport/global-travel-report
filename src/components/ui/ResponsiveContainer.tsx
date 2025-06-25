'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ResponsiveContainerProps {
  /**
   * The content to be rendered inside the container
   */
  children: ReactNode;
  
  /**
   * Additional class names to apply to the container
   */
  className?: string;
  
  /**
   * Maximum width of the container
   * @default '7xl' (1280px)
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full' | 'none';
  
  /**
   * Padding to apply on small screens
   * @default '4' (1rem)
   */
  paddingX?: '0' | '2' | '4' | '6' | '8';
  
  /**
   * Padding to apply on medium screens and up
   * @default '6' (1.5rem)
   */
  paddingXMd?: '0' | '2' | '4' | '6' | '8';
  
  /**
   * Padding to apply on large screens and up
   * @default '8' (2rem)
   */
  paddingXLg?: '0' | '2' | '4' | '6' | '8';
  
  /**
   * Whether to center the container
   * @default true
   */
  center?: boolean;
  
  /**
   * HTML tag to use for the container
   * @default 'div'
   */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav';
  
  /**
   * ID for the container
   */
  id?: string;
  
  /**
   * ARIA role for the container
   */
  role?: string;
  
  /**
   * ARIA label for the container
   */
  ariaLabel?: string;
  
  /**
   * ARIA labelledby for the container
   */
  ariaLabelledby?: string;
  
  /**
   * ARIA describedby for the container
   */
  ariaDescribedby?: string;
}

/**
 * A responsive container component that provides consistent padding and max-width
 * across different screen sizes.
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = '7xl',
  paddingX = '4',
  paddingXMd = '6',
  paddingXLg = '8',
  center = true,
  as: Component = 'div',
  id,
  role,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
}: ResponsiveContainerProps) {
  // Map maxWidth to Tailwind classes
  const maxWidthClasses = {
    sm: 'max-w-sm', // 640px
    md: 'max-w-md', // 768px
    lg: 'max-w-lg', // 1024px
    xl: 'max-w-xl', // 1280px
    '2xl': 'max-w-2xl', // 1536px
    '3xl': 'max-w-3xl', // 1920px
    '4xl': 'max-w-4xl', // 2560px
    '5xl': 'max-w-5xl', // 3200px
    '6xl': 'max-w-6xl', // 4096px
    '7xl': 'max-w-7xl', // 5120px
    full: 'max-w-full',
    none: '',
  };
  
  // Map padding to Tailwind classes
  const paddingClasses = {
    '0': 'px-0',
    '2': 'px-2',
    '4': 'px-4',
    '6': 'px-6',
    '8': 'px-8',
  };
  
  return (
    <Component
      id={id}
      role={role}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      className={cn(
        // Base classes
        'w-full',
        // Max width
        maxWidthClasses[maxWidth],
        // Padding for different screen sizes
        paddingClasses[paddingX],
        `md:${paddingClasses[paddingXMd]}`,
        `lg:${paddingClasses[paddingXLg]}`,
        // Center if needed
        center && 'mx-auto',
        // Additional classes
        className
      )}
    >
      {children}
    </Component>
  );
}

export default ResponsiveContainer;
