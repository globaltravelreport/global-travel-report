"use client";

import * as React from "react";

interface AccordionProps {
  className?: string;
  children: React.ReactNode;
}

export function Accordion({
  className,
  children
}: AccordionProps) {
  return <div className={`space-y-1 ${className}`}>{children}</div>;
}

interface AccordionItemProps {
  children: React.ReactNode;
}

export function AccordionItem({
  children
}: AccordionItemProps) {
  return <div className="border-b">{children}</div>;
}

interface AccordionTriggerProps {
  children: React.ReactNode;
}

export function AccordionTrigger({ children }: AccordionTriggerProps) {
  return (
    <div className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline">
      {children}
      <svg
<<<<<<< HEAD
        xmlns="https://www.w3.org/2000/svg"
=======
        xmlns="http://www.w3.org/2000/svg"
>>>>>>> b700c9036c47c406994d24ce88e371e4e905cffe
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 transition-transform duration-200"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
}

export function AccordionContent({ children }: AccordionContentProps) {
  return <div className="pb-4 pt-0">{children}</div>;
}
