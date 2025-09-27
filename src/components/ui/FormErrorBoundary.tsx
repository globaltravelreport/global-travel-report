"use client";

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';
import type { ErrorBoundaryProps } from '@/types/error-boundary';

export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  const { error, hasError, resetError } = useErrorBoundary();

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Form Error</AlertTitle>
        <AlertDescription>
          {process.env.NODE_ENV !== 'production'
            ? error?.message
            : 'An error occurred while submitting the form. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }
  return <>{children}</>;
}