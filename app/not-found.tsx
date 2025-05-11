'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { SafeSearchParamsProvider } from "@/src/components/ui/SearchParamsProvider";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Global Travel Report",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: "noindex, follow",
};

function NotFoundContent() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4" id="main-content">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link
            href="/"
            aria-label="Return to homepage"
          >
            Return Home
          </Link>
        </Button>
        <Button
          variant="outline"
          asChild
        >
          <Link
            href="/destinations"
            aria-label="Browse destinations"
          >
            Browse Destinations
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <SafeSearchParamsProvider>
      <NotFoundContent />
    </SafeSearchParamsProvider>
  );
}