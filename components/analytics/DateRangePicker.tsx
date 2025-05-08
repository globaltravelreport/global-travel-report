'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangePickerProps {
  onChange: (dateRange: { startDate: string; endDate: string }) => void;
}

/**
 * Date range picker component
 * @param props - Component props
 * @returns The date range picker component
 */
export function DateRangePicker({ onChange }: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState('7days');

  /**
   * Handle range change
   * @param value - The selected range value
   */
  const handleRangeChange = (value: string) => {
    setSelectedRange(value);

    let startDate: string;
    const endDate: string = 'today';

    switch (value) {
      case '7days':
        startDate = '7daysAgo';
        break;
      case '30days':
        startDate = '30daysAgo';
        break;
      case '90days':
        startDate = '90daysAgo';
        break;
      case 'year':
        startDate = '365daysAgo';
        break;
      default:
        startDate = '7daysAgo';
    }

    onChange({ startDate, endDate });
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Date Range:</span>
      <div className="relative">
        {/* Custom implementation using our simplified Select components */}
        <Select>
          <SelectTrigger>
            <SelectValue placeholder={selectedRange === '7days' ? 'Last 7 Days' :
                         selectedRange === '30days' ? 'Last 30 Days' :
                         selectedRange === '90days' ? 'Last 90 Days' : 'Last Year'} />
          </SelectTrigger>
          <SelectContent>
            <div onClick={() => handleRangeChange('7days')} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleRangeChange('7days');
              }
            }} tabIndex={0} role="button" aria-label="Last 7 Days">
              <SelectItem>Last 7 Days</SelectItem>
            </div>
            <div onClick={() => handleRangeChange('30days')} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleRangeChange('30days');
              }
            }} tabIndex={0} role="button" aria-label="Last 30 Days">
              <SelectItem>Last 30 Days</SelectItem>
            </div>
            <div onClick={() => handleRangeChange('90days')} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleRangeChange('90days');
              }
            }} tabIndex={0} role="button" aria-label="Last 90 Days">
              <SelectItem>Last 90 Days</SelectItem>
            </div>
            <div onClick={() => handleRangeChange('year')} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleRangeChange('year');
              }
            }} tabIndex={0} role="button" aria-label="Last Year">
              <SelectItem>Last Year</SelectItem>
            </div>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
