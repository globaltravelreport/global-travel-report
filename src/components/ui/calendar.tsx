"use client";

import * as React from "react";

interface CalendarProps {
  selected?: Date | Date[] | undefined;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
}

export function Calendar({ selected, onSelect }: CalendarProps) {
  // Get current month and year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Determine if a date is selected
  const isSelected = (day: number) => {
    if (!selected) return false;

    if (Array.isArray(selected)) {
      return selected.some(date =>
        date.getDate() === day &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    }

    return selected.getDate() === day &&
           selected.getMonth() === currentMonth &&
           selected.getFullYear() === currentYear;
  };

  return (
    <div className="p-3">
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
            <div key={day} className="text-center text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              type="button"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-normal ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                isSelected(day) ? 'bg-primary text-primary-foreground' : ''
              }`}
              onClick={() => {
                const date = new Date(currentYear, currentMonth, day);
                onSelect?.(date);
              }}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
