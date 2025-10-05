"use client";

import { useState, useCallback } from 'react';
import { useGlobalError } from '@/components/ui/GlobalErrorHandler';
import { ErrorType } from '@/utils/enhanced-error-handler';

/**
 * Form submission state
 */
export interface FormSubmitState<T> {
  /**
   * Whether the form is currently submitting
   */
  isSubmitting: boolean;

  /**
   * Whether the form submission was successful
   */
  isSuccess: boolean;

  /**
   * Response data from the form submission
   */
  data?: T;

  /**
   * Error message from the form submission
   */
  error?: string;

  /**
   * Validation errors from the form submission
   */
  validationErrors?: Record<string, string>;
}

/**
 * Form submission options
 */
export interface FormSubmitOptions<T> {
  /**
   * Success message to display
   */
  successMessage?: string;

  /**
   * Error message to display
   */
  errorMessage?: string;

  /**
   * Callback to run on successful submission
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback to run on failed submission
   */
  onError?: (error: any) => void;

  /**
   * Whether to reset the form after successful submission
   */
  resetOnSuccess?: boolean;

  /**
   * Whether to show success message
   */
  showSuccessMessage?: boolean;

  /**
   * Whether to show error message
   */
  showErrorMessage?: boolean;
}

/**
 * Hook for handling form submissions with error handling
 * @param submitFn - Function to submit the form
 * @param options - Options for form submission
 * @returns Form submission state and submit function
 */
export function useFormSubmit<TData = any, TVariables = any>(
  submitFn: (variables: TVariables) => Promise<TData>,
  options: FormSubmitOptions<TData> = {}
) {
  const {
    successMessage = 'Form submitted successfully',
    errorMessage = 'An error occurred while submitting the form',
    onSuccess,
    onError,
    resetOnSuccess = false,
    showSuccessMessage = true,
    showErrorMessage = true,
  } = options;

  const { showError } = useGlobalError();

  const [state, setState] = useState<FormSubmitState<TData>>({
    isSubmitting: false,
    isSuccess: false,
  });

  const submit = useCallback(
    async (variables: TVariables, formReset?: () => void) => {
      setState({
        isSubmitting: true,
        isSuccess: false,
        error: undefined,
        validationErrors: undefined,
      });

      try {
        const data = await submitFn(variables);

        setState({
          isSubmitting: false,
          isSuccess: true,
          data,
        });

        if (showSuccessMessage) {
          // Use toast or other notification system
          console.log(successMessage);
        }

        if (onSuccess) {
          onSuccess(data);
        }

        if (resetOnSuccess && formReset) {
          formReset();
        }

        return data;
      } catch (error: any) {
        console.error(error);

        // Handle validation errors
        const validationErrors: Record<string, string> = {};

        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            if (err.field && err.message) {
              validationErrors[err.field] = err.message;
            }
          });
        }

        setState({
          isSubmitting: false,
          isSuccess: false,
          error: error.message || errorMessage,
          validationErrors: Object.keys(validationErrors).length > 0 ? validationErrors : undefined,
        });

        if (showErrorMessage) {
          // Create an error object with the message
          const errorObj = new Error(error.message || errorMessage);
          // Add error type as a property
          (errorObj as any).type = error.type === 'validation' ? ErrorType.VALIDATION : ErrorType.UNKNOWN;
          showError(errorObj);
        }

        if (onError) {
          onError(error);
        }

        throw error;
      }
    },
    [submitFn, successMessage, errorMessage, onSuccess, onError, resetOnSuccess, showSuccessMessage, showErrorMessage, showError]
  );

  return {
    ...state,
    submit,
  };
}
