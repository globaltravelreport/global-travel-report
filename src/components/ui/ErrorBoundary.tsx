"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    /* eslint-disable no-console */
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-8 max-w-md">
            We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => window.location.reload()}
              aria-label="Try again"
            >
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/"}
              aria-label="Return to homepage"
            >
              Return Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 