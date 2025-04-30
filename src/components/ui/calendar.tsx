"use client";

import * as React from "react";

interface CalendarProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | undefined;
  onSelect?: (date: Date | undefined) => void;
  initialFocus?: boolean;
}

export function Calendar({ mode = "single", selected, onSelect, initialFocus }: CalendarProps) {
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
              className="inline-flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-normal ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => {
                const date = new Date();
                date.setDate(day);
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
