'use client';

import { useState } from 'react';

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

  const getDisplayText = () => {
    switch (selectedRange) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case '90days':
        return 'Last 90 Days';
      case 'year':
        return 'Last Year';
      default:
        return 'Last 7 Days';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">Date Range:</span>
      <div className="relative">
        <select
          value={selectedRange}
          onChange={(e) => handleRangeChange(e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
          <option value="year">Last Year</option>
        </select>
      </div>
    </div>
  );
}
