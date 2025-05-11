'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/src/utils/cn';

interface TypographyProps {
  /**
   * The content to be rendered
   */
  children: ReactNode;
  
  /**
   * Additional class names to apply
   */
  className?: string;
  
  /**
   * HTML tag to use
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  
  /**
   * Typography variant
   */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'overline';
  
  /**
   * Font weight
   */
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  
  /**
   * Text color
   */
  color?: 'default' | 'primary' | 'secondary' | 'muted' | 'accent' | 'white';
  
  /**
   * Text alignment
   */
  align?: 'left' | 'center' | 'right' | 'justify';
  
  /**
   * Whether to truncate text with ellipsis
   */
  truncate?: boolean;
  
  /**
   * Number of lines to show before truncating
   */
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  
  /**
   * ID for the element
   */
  id?: string;
}

/**
 * A responsive typography component that provides consistent text styling
 * across different screen sizes.
 */
export function Typography({
  children,
  className,
  as: Component = 'p',
  variant = 'body1',
  weight = 'normal',
  color = 'default',
  align = 'left',
  truncate = false,
  lineClamp,
  id,
}: TypographyProps) {
  // Map variants to Tailwind classes
  const variantClasses = {
    h1: 'text-3xl md:text-4xl lg:text-5xl font-bold leading-tight',
    h2: 'text-2xl md:text-3xl lg:text-4xl font-bold leading-tight',
    h3: 'text-xl md:text-2xl lg:text-3xl font-semibold leading-tight',
    h4: 'text-lg md:text-xl lg:text-2xl font-semibold leading-tight',
    h5: 'text-base md:text-lg lg:text-xl font-semibold leading-tight',
    h6: 'text-sm md:text-base lg:text-lg font-semibold leading-tight',
    subtitle1: 'text-lg font-medium leading-relaxed',
    subtitle2: 'text-base font-medium leading-relaxed',
    body1: 'text-base leading-relaxed',
    body2: 'text-sm leading-relaxed',
    caption: 'text-xs leading-normal',
    overline: 'text-xs uppercase tracking-wider leading-normal',
  };
  
  // Map weights to Tailwind classes
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };
  
  // Map colors to Tailwind classes
  const colorClasses = {
    default: 'text-gray-900 dark:text-gray-100',
    primary: 'text-[#19273A] dark:text-[#C9A14A]',
    secondary: 'text-[#C9A14A] dark:text-[#E6C677]',
    muted: 'text-gray-600 dark:text-gray-400',
    accent: 'text-blue-600 dark:text-blue-400',
    white: 'text-white',
  };
  
  // Map alignments to Tailwind classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };
  
  // Map line clamp to Tailwind classes
  const lineClampClasses = lineClamp ? `line-clamp-${lineClamp}` : '';
  
  return (
    <Component
      id={id}
      className={cn(
        // Base variant
        variantClasses[variant],
        // Override font weight if specified
        variant.startsWith('h') ? '' : weightClasses[weight],
        // Color
        colorClasses[color],
        // Alignment
        alignClasses[align],
        // Truncation
        truncate && 'truncate',
        // Line clamping
        lineClampClasses,
        // Additional classes
        className
      )}
    >
      {children}
    </Component>
  );
}

export default Typography;
