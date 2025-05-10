'use client';

import React from 'react';
import { differenceInDays, differenceInMonths, format, parseISO } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';
import { cn } from '@/src/utils/cn';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface FreshnessIndicatorProps {
  /**
   * The date the content was published
   */
  publishedDate: string;

  /**
   * The date the content was last updated (optional)
   */
  updatedDate?: string;

  /**
   * The CSS class name for the container
   */
  className?: string;

  /**
   * Whether to show the full date
   */
  showFullDate?: boolean;

  /**
   * Whether to show the icon
   */
  showIcon?: boolean;

  /**
   * The size of the indicator
   */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Content Freshness Indicator
 *
 * This component displays a visual indicator of how fresh the content is,
 * based on the published and updated dates.
 *
 * @example
 * ```tsx
 * <FreshnessIndicator
 *   publishedDate="2023-01-01T00:00:00Z"
 *   updatedDate="2023-06-15T00:00:00Z"
 *   showFullDate
 * />
 * ```
 */
export function FreshnessIndicator({
  publishedDate,
  updatedDate,
  className,
  showFullDate = false,
  showIcon = true,
  size = 'md',
}: FreshnessIndicatorProps) {
  // Use the updated date if available, otherwise use the published date
  const latestDate = updatedDate || publishedDate;

  // Parse the date with error handling
  let date: Date;
  let isValidDate = true;

  try {
    date = parseISO(latestDate);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      isValidDate = false;
      date = new Date(); // Use current date as fallback
    }
  } catch (error) {
    console.error('Error parsing date:', latestDate);
    isValidDate = false;
    date = new Date(); // Use current date as fallback
  }

  const now = new Date();

  // Calculate the difference in days
  let daysDiff = 0;
  let monthsDiff = 0;

  if (isValidDate) {
    try {
      daysDiff = differenceInDays(now, date);
      monthsDiff = differenceInMonths(now, date);
    } catch (error) {
      console.error('Error calculating date difference:', error);
      daysDiff = 0;
      monthsDiff = 0;
    }
  }

  // Determine the freshness level
  let freshness: 'fresh' | 'recent' | 'old' = 'fresh';
  if (daysDiff > 180) {
    freshness = 'old';
  } else if (daysDiff > 30) {
    freshness = 'recent';
  }

  // Get the appropriate color and icon based on freshness
  const getColor = () => {
    switch (freshness) {
      case 'fresh':
        return 'text-green-600 bg-green-50';
      case 'recent':
        return 'text-yellow-600 bg-yellow-50';
      case 'old':
        return 'text-red-600 bg-red-50';
    }
  };

  const getIcon = () => {
    switch (freshness) {
      case 'fresh':
        return <CheckCircle className="w-4 h-4" />;
      case 'recent':
        return <Clock className="w-4 h-4" />;
      case 'old':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Get the appropriate text based on freshness
  const getFreshnessText = () => {
    if (!isValidDate) {
      return 'Unknown date';
    }

    if (daysDiff < 7) {
      return 'New';
    } else if (daysDiff < 30) {
      return `${daysDiff} days ago`;
    } else if (monthsDiff < 12) {
      return `${monthsDiff} months ago`;
    } else {
      return `${Math.floor(monthsDiff / 12)} years ago`;
    }
  };

  // Format the date for display
  let formattedDate: string;
  try {
    formattedDate = isValidDate ? format(date, 'MMMM d, yyyy') : 'Unknown date';
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = 'Unknown date';
  }

  // Determine the size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center rounded-full font-medium',
              getColor(),
              sizeClasses[size],
              className
            )}
          >
            {showIcon && (
              <span className="mr-1">{getIcon()}</span>
            )}
            <span>
              {showFullDate ? formattedDate : getFreshnessText()}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {updatedDate ? 'Updated' : 'Published'} on {formattedDate}
            {updatedDate && publishedDate !== updatedDate && isValidDate && (
              <>
                <br />
                <span className="text-xs">
                  Originally published on {(() => {
                    try {
                      return format(parseISO(publishedDate), 'MMMM d, yyyy');
                    } catch (error) {
                      return 'Unknown date';
                    }
                  })()}
                </span>
              </>
            )}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default FreshnessIndicator;
