'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function StoryNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center">
      <h2 className="text-2xl font-bold mb-4">Story Not Found</h2>
      <p className="text-muted-foreground mb-8">
        We apologize, but the story you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
