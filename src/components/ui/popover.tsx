"use client";

import * as React from "react";

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Popover({ children, open, onOpenChange }: PopoverProps) {
  return <div>{children}</div>;
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  return <>{children}</>;
}

interface PopoverContentProps {
  align?: "start" | "center" | "end";
  className?: string;
  children: React.ReactNode;
}

export function PopoverContent({ align = "center", className, children }: PopoverContentProps) {
  return (
    <div className={`z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${className}`}>
      {children}
    </div>
  );
}
