"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/src/lib/utils';
import { PaginationResult } from '@/src/utils/pagination';

interface PaginationProps {
  /**
   * Pagination metadata from the pagination result
   */
  meta: PaginationResult<any>['meta'];
  
  /**
   * Base URL for pagination links
   */
  baseUrl: string;
  
  /**
   * Query parameter name for page (default: 'page')
   */
  pageParam?: string;
  
  /**
   * Additional query parameters to include in pagination links
   */
  additionalParams?: Record<string, string>;
  
  /**
   * Maximum number of page links to show
   */
  maxPageLinks?: number;
  
  /**
   * CSS class for the pagination container
   */
  className?: string;
  
  /**
   * Callback for page change
   */
  onPageChange?: (page: number) => void;
}

/**
 * Reusable pagination component
 */
export function Pagination({
  meta,
  baseUrl,
  pageParam = 'page',
  additionalParams = {},
  maxPageLinks = 5,
  className,
  onPageChange,
}: PaginationProps) {
  const { page, totalPages } = meta;
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Generate URL for a specific page
  const getPageUrl = (pageNum: number) => {
    // Start with the base URL
    const url = new URL(baseUrl, window.location.origin);
    
    // Add page parameter
    url.searchParams.set(pageParam, pageNum.toString());
    
    // Add additional parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.pathname + url.search;
  };
  
  // Calculate which page links to show
  const getPageLinks = () => {
    const links: (number | 'ellipsis')[] = [];
    
    // Always show first page
    links.push(1);
    
    // Calculate start and end of page range
    let startPage = Math.max(2, page - Math.floor(maxPageLinks / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPageLinks - 3);
    
    // Adjust if we're near the end
    if (endPage <= startPage) {
      endPage = Math.min(totalPages - 1, startPage + 1);
    }
    
    // Adjust if we're near the beginning
    if (startPage <= 2) {
      startPage = 2;
      endPage = Math.min(totalPages - 1, startPage + maxPageLinks - 3);
    }
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      links.push('ellipsis');
    }
    
    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      links.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      links.push('ellipsis');
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      links.push(totalPages);
    }
    
    return links;
  };
  
  // Handle page change
  const handlePageChange = (pageNum: number) => {
    if (onPageChange) {
      onPageChange(pageNum);
    }
  };
  
  const pageLinks = getPageLinks();
  
  return (
    <nav
      className={cn(
        'flex items-center justify-center space-x-2 py-4',
        className
      )}
      aria-label="Pagination"
    >
      {/* Previous page button */}
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'h-8 w-8 p-0',
          page <= 1 && 'opacity-50 cursor-not-allowed'
        )}
        disabled={page <= 1}
        onClick={() => handlePageChange(page - 1)}
        aria-label="Go to previous page"
      >
        {page > 1 ? (
          <Link href={getPageUrl(page - 1)} className="flex items-center justify-center w-full h-full">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      
      {/* Page links */}
      {pageLinks.map((pageNum, index) => {
        if (pageNum === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="h-8 w-8 flex items-center justify-center"
            >
              <MoreHorizontal className="h-4 w-4" />
            </span>
          );
        }
        
        const isCurrentPage = pageNum === page;
        
        return (
          <Button
            key={`page-${pageNum}`}
            variant={isCurrentPage ? 'default' : 'outline'}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(pageNum as number)}
            aria-label={`Go to page ${pageNum}`}
            aria-current={isCurrentPage ? 'page' : undefined}
          >
            {isCurrentPage ? (
              <span>{pageNum}</span>
            ) : (
              <Link href={getPageUrl(pageNum as number)} className="flex items-center justify-center w-full h-full">
                {pageNum}
              </Link>
            )}
          </Button>
        );
      })}
      
      {/* Next page button */}
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'h-8 w-8 p-0',
          page >= totalPages && 'opacity-50 cursor-not-allowed'
        )}
        disabled={page >= totalPages}
        onClick={() => handlePageChange(page + 1)}
        aria-label="Go to next page"
      >
        {page < totalPages ? (
          <Link href={getPageUrl(page + 1)} className="flex items-center justify-center w-full h-full">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>
    </nav>
  );
}
