"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
      <p className="text-gray-600 mb-8 max-w-md">
        We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.href = "/"}>
          Return Home
        </Button>
      </div>
    </div>
  );
} 