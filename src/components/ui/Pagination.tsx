"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PaginationProps {
  meta: PaginationMeta;
  baseUrl: string;
  additionalParams?: Record<string, string>;
}

export function Pagination({ meta, baseUrl, additionalParams = {} }: PaginationProps) {
  const { page, totalPages } = meta;
  
  // Don't render pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  // Create URL for a specific page
  const createPageUrl = (pageNum: number) => {
    const url = new URL(baseUrl, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
    
    // Add page parameter
    url.searchParams.set('page', pageNum.toString());
    
    // Add any additional parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.pathname + url.search;
  };
  
  // Calculate page range to display
  const getPageRange = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];
    
    // Always include first page
    range.push(1);
    
    // Calculate range of pages to show
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    
    // Always include last page if there are multiple pages
    if (totalPages > 1) {
      range.push(totalPages);
    }
    
    // Add dots where needed
    let l = 0;
    for (const i of range) {
      if (l > 0) {
        if (i - l === 2) {
          // If there's just one page missing, show it instead of dots
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          // If there's a gap, add dots
          rangeWithDots.push(-1); // -1 represents dots
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    
    return rangeWithDots;
  };
  
  const pageRange = getPageRange();
  
  return (
    <nav className="flex justify-center my-8" aria-label="Pagination">
      <ul className="inline-flex items-center -space-x-px">
        {/* Previous page button */}
        <li>
          {page > 1 ? (
            <Link
              href={createPageUrl(page - 1)}
              className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
              aria-label="Previous page"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
          ) : (
            <span className="block px-3 py-2 ml-0 leading-tight text-gray-300 bg-white border border-gray-300 rounded-l-lg cursor-not-allowed">
              <span className="sr-only">Previous</span>
              <ChevronLeft className="w-5 h-5" />
            </span>
          )}
        </li>
        
        {/* Page numbers */}
        {pageRange.map((pageNum, index) => (
          <li key={index}>
            {pageNum === -1 ? (
              // Dots
              <span className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300">
                &hellip;
              </span>
            ) : pageNum === page ? (
              // Current page
              <span className="px-3 py-2 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">
                {pageNum}
              </span>
            ) : (
              // Other pages
              <Link
                href={createPageUrl(pageNum)}
                className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700"
                aria-label={`Go to page ${pageNum}`}
              >
                {pageNum}
              </Link>
            )}
          </li>
        ))}
        
        {/* Next page button */}
        <li>
          {page < totalPages ? (
            <Link
              href={createPageUrl(page + 1)}
              className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
              aria-label="Next page"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          ) : (
            <span className="block px-3 py-2 leading-tight text-gray-300 bg-white border border-gray-300 rounded-r-lg cursor-not-allowed">
              <span className="sr-only">Next</span>
              <ChevronRight className="w-5 h-5" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}
