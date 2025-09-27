"use client";

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FormErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    // Only throw errors in development
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Form Error</AlertTitle>
          <AlertDescription>
            {process.env.NODE_ENV !== 'production'
              ? this.state.error?.message
              : 'An error occurred while submitting the form. Please try again.'}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
} 