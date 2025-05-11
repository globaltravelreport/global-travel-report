'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  homeHref?: string;
  showHomeIcon?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
}

/**
 * Breadcrumb component for navigation
 * 
 * @example
 * ```tsx
 * <Breadcrumb
 *   items={[
 *     { label: 'Stories', href: '/stories' },
 *     { label: 'Travel', href: '/categories/travel' },
 *     { label: 'Current Story', active: true }
 *   ]}
 * />
 * ```
 */
export function Breadcrumb({
  items,
  className,
  homeHref = '/',
  showHomeIcon = true,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />,
  maxItems = 4
}: BreadcrumbProps) {
  // If we have more items than maxItems, truncate the middle
  const displayItems = React.useMemo(() => {
    if (items.length <= maxItems) return items;
    
    // Keep first and last items, truncate the middle
    const firstItem = items[0];
    const lastItems = items.slice(-2);
    
    return [
      firstItem,
      { label: '...', href: undefined, active: false },
      ...lastItems
    ];
  }, [items, maxItems]);

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center flex-wrap">
        {showHomeIcon && (
          <li className="flex items-center">
            <Link 
              href={homeHref}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
            </Link>
            <span className="mx-1">{separator}</span>
          </li>
        )}
        
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {item.href && !item.active ? (
                <>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
                  >
                    {item.label}
                  </Link>
                  {!isLast && <span className="mx-1">{separator}</span>}
                </>
              ) : (
                <span 
                  className={cn(
                    "text-foreground font-medium",
                    item.active && "font-semibold"
                  )}
                  aria-current={item.active ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
