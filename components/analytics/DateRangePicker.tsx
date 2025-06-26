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
        <Select onValueChange={handleRangeChange} value={selectedRange}>
          <SelectTrigger>
            <SelectValue placeholder={selectedRange === '7days' ? 'Last 7 Days' :
                         selectedRange === '30days' ? 'Last 30 Days' :
                         selectedRange === '90days' ? 'Last 90 Days' : 'Last Year'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
